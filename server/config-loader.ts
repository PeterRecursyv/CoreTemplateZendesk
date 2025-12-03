import fs from 'fs';
import path from 'path';
import type { HubVendor, SpokeIntegration, BrandingConfig, PricingConfig } from '../shared/config-types';

const CONFIG_DIR = path.join(process.cwd(), 'config');

export function loadHubVendor(vendorId: string): HubVendor {
  const filePath = path.join(CONFIG_DIR, 'hub-vendors', `${vendorId}.json`);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function loadSpokeIntegrations(): SpokeIntegration[] {
  const filePath = path.join(CONFIG_DIR, 'spoke-integrations.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function loadBranding(): BrandingConfig {
  const filePath = path.join(CONFIG_DIR, 'branding.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export function loadPricing(): PricingConfig {
  const filePath = path.join(CONFIG_DIR, 'pricing.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Get the current hub vendor from environment or default to hubspot
export function getCurrentHubVendorId(): string {
  return process.env.TEMPLATE_HUB_VENDOR || 'hubspot';
}

// Get filtered spoke integrations for the current hub vendor
export function getHubSpokeIntegrations(hubVendor: HubVendor): SpokeIntegration[] {
  const allSpokes = loadSpokeIntegrations();
  return allSpokes.filter(spoke => hubVendor.spokeIntegrations.includes(spoke.id));
}

