import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock context for testing
const createMockContext = (): Context => ({
  req: {} as any,
  res: {} as any,
  user: null,
});

describe('Config Router - Performance Optimizations', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('spokeIntegrationsList', () => {
    it('should return lightweight integration list with only essential fields', async () => {
      const result = await caller.config.spokeIntegrationsList();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check that each integration has only essential fields
      const firstIntegration = result[0];
      expect(firstIntegration).toHaveProperty('id');
      expect(firstIntegration).toHaveProperty('name');
      expect(firstIntegration).toHaveProperty('logo');
      expect(firstIntegration).toHaveProperty('description');
      expect(firstIntegration).toHaveProperty('categories');
      expect(firstIntegration).toHaveProperty('available');

      // Verify it's a lightweight response (only 6 fields)
      const fieldCount = Object.keys(firstIntegration).length;
      expect(fieldCount).toBe(6);
    });

    it('should return all 28 integrations (including Zendesk-to-Zendesk)', async () => {
      const result = await caller.config.spokeIntegrationsList();
      expect(result.length).toBe(28);
    });

    it('should have valid categories array', async () => {
      const result = await caller.config.spokeIntegrationsList();
      
      result.forEach(integration => {
        expect(Array.isArray(integration.categories)).toBe(true);
        expect(integration.categories.length).toBeGreaterThan(0);
      });
    });
  });

  describe('spokeIntegrationDetail', () => {
    it('should return full details for a specific integration', async () => {
      const result = await caller.config.spokeIntegrationDetail({ id: 'servicenow' });

      expect(result).toBeDefined();
      expect(result?.id).toBe('servicenow');
      expect(result?.name).toBe('ServiceNow');
      expect(result?.description).toBeDefined();
      expect(result?.logo).toBeDefined();
      expect(result?.categories).toBeDefined();
    });

    it('should return undefined for non-existent integration', async () => {
      const result = await caller.config.spokeIntegrationDetail({ id: 'nonexistent' });
      expect(result).toBeUndefined();
    });

    it('should load different integrations correctly', async () => {
      const salesforce = await caller.config.spokeIntegrationDetail({ id: 'salesforce' });
      const jira = await caller.config.spokeIntegrationDetail({ id: 'jira' });

      expect(salesforce?.name).toBe('Salesforce');
      expect(jira?.name).toBe('Jira');
      expect(salesforce?.id).not.toBe(jira?.id);
    });
  });

  describe('relatedIntegrations', () => {
    it('should return related integrations based on category matching', async () => {
      // Salesforce is in CRM category, should find other CRM tools
      const result = await caller.config.relatedIntegrations({ 
        spokeId: 'salesforce',
        limit: 3 
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

      // Should not include the current integration
      const hasSalesforce = result.some(r => r.id === 'salesforce');
      expect(hasSalesforce).toBe(false);

      // Should have at least one matching category
      const salesforce = await caller.config.spokeIntegrationDetail({ id: 'salesforce' });
      result.forEach(related => {
        const hasMatchingCategory = related.categories.some(cat => 
          salesforce?.categories.includes(cat)
        );
        expect(hasMatchingCategory).toBe(true);
      });
    });

    it('should respect the limit parameter', async () => {
      const result = await caller.config.relatedIntegrations({ 
        spokeId: 'servicenow',
        limit: 2 
      });

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for non-existent integration', async () => {
      const result = await caller.config.relatedIntegrations({ 
        spokeId: 'nonexistent',
        limit: 3 
      });

      expect(result).toEqual([]);
    });

    it('should return lightweight data (not full integration objects)', async () => {
      const result = await caller.config.relatedIntegrations({ 
        spokeId: 'jira',
        limit: 3 
      });

      if (result.length > 0) {
        const firstRelated = result[0];
        expect(firstRelated).toHaveProperty('id');
        expect(firstRelated).toHaveProperty('name');
        expect(firstRelated).toHaveProperty('logo');
        expect(firstRelated).toHaveProperty('description');
        expect(firstRelated).toHaveProperty('categories');

        // Should only have 5 fields (lightweight)
        const fieldCount = Object.keys(firstRelated).length;
        expect(fieldCount).toBe(5);
      }
    });
  });

  describe('hubVendor', () => {
    it('should return Zendesk hub vendor configuration', async () => {
      const result = await caller.config.hubVendor();

      expect(result).toBeDefined();
      expect(result.id).toBe('zendesk');
      expect(result.name).toBe('Zendesk');
      expect(result.logo).toBeDefined();
      expect(result.spokeIntegrations).toBeDefined();
      expect(Array.isArray(result.spokeIntegrations)).toBe(true);
      expect(result.spokeIntegrations.length).toBe(28);
    });
  });

  describe('branding', () => {
    it('should return Recursyv branding configuration', async () => {
      const result = await caller.config.branding();

      expect(result).toBeDefined();
      expect(result.companyName).toBe('Recursyv');
      expect(result.logo).toBeDefined();
      expect(result.contactEmail).toBeDefined();
      expect(result.contactPhoneUK).toBeDefined();
      expect(result.contactPhoneUS).toBeDefined();
    });
  });

  describe('Legacy endpoint compatibility', () => {
    it('spokeIntegrations should still work for backward compatibility', async () => {
      const result = await caller.config.spokeIntegrations();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(28);
    });
  });
});
