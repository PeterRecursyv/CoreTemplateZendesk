import { notifyOwner } from './_core/notification';
import type { Purchase } from '../drizzle/schema';
import { loadBranding } from './config-loader';
import fs from 'fs/promises';
import path from 'path';

export interface PurchaseNotificationData {
  purchase: Purchase;
  pricingTierName?: string;
}

export async function sendPurchaseNotification(data: PurchaseNotificationData): Promise<boolean> {
  const { purchase, pricingTierName } = data;
  const branding = loadBranding();
  
  // Create log file
  const logContent = generatePurchaseLog(purchase, pricingTierName);
  const logDir = path.join(process.cwd(), 'logs', 'purchases');
  
  try {
    await fs.mkdir(logDir, { recursive: true });
    const logFileName = `purchase-${purchase.id}-${Date.now()}.txt`;
    const logFilePath = path.join(logDir, logFileName);
    await fs.writeFile(logFilePath, logContent, 'utf-8');
    
    console.log(`[Email] Purchase log created: ${logFilePath}`);
  } catch (error) {
    console.error('[Email] Failed to create log file:', error);
  }
  
  // Send notification to owner
  const title = `New Integration Purchase: ${purchase.hubVendorName} ↔ ${purchase.spokeIntegrationName}`;
  
  const content = `
**New Purchase Notification**

---

**Integration Details:**
- Hub Vendor: ${purchase.hubVendorName}
- Spoke Integration: ${purchase.spokeIntegrationName}
- Purchase ID: ${purchase.id}

**Customer Information:**
- Name: ${purchase.customerName}
- Email: ${purchase.customerEmail}
- Company: ${purchase.companyName || 'N/A'}

**Business Details:**
- Entity Type: ${purchase.entityType || 'N/A'}
- Sync Frequency: ${purchase.syncFrequency || 'N/A'}
- Data Volume: ${purchase.dataVolume || 'N/A'}
- Pricing Tier: ${pricingTierName || purchase.pricingTier || 'N/A'}

**Payment Information:**
- Amount: ${purchase.paymentCurrency} ${purchase.paymentAmount}
- Status: ${purchase.paymentStatus}
- Stripe Session: ${purchase.stripeSessionId || 'Pending'}

**Additional Notes:**
${purchase.additionalNotes || 'None'}

**Terms Accepted:** ${purchase.termsAccepted === 'true' ? 'Yes' : 'No'}
${purchase.termsAcceptedAt ? `Accepted At: ${purchase.termsAcceptedAt}` : ''}

---

**Next Steps:**
1. Review the customer requirements
2. Set up the integration environment
3. Contact the customer at ${purchase.customerEmail}
4. Schedule onboarding call

Template ID: ${purchase.templateId}
Timestamp: ${purchase.timestamp}
  `.trim();
  
  try {
    const result = await notifyOwner({ title, content });
    
    if (result) {
      console.log(`[Email] Notification sent successfully for purchase ${purchase.id}`);
      return true;
    } else {
      console.warn(`[Email] Failed to send notification for purchase ${purchase.id}`);
      return false;
    }
  } catch (error) {
    console.error('[Email] Error sending notification:', error);
    return false;
  }
}

function generatePurchaseLog(purchase: Purchase, pricingTierName?: string): string {
  return `
================================================================================
PURCHASE LOG
================================================================================

Purchase ID: ${purchase.id}
Template ID: ${purchase.templateId}
Timestamp: ${purchase.timestamp}

--------------------------------------------------------------------------------
INTEGRATION DETAILS
--------------------------------------------------------------------------------
Hub Vendor: ${purchase.hubVendorName} (${purchase.hubVendorId})
Spoke Integration: ${purchase.spokeIntegrationName} (${purchase.spokeIntegrationId})

--------------------------------------------------------------------------------
CUSTOMER INFORMATION
--------------------------------------------------------------------------------
Name: ${purchase.customerName}
Email: ${purchase.customerEmail}
Company: ${purchase.companyName || 'N/A'}

--------------------------------------------------------------------------------
BUSINESS DETAILS
--------------------------------------------------------------------------------
Entity Type: ${purchase.entityType || 'N/A'}
Sync Frequency: ${purchase.syncFrequency || 'N/A'}
Data Volume: ${purchase.dataVolume || 'N/A'}
Pricing Tier: ${pricingTierName || purchase.pricingTier || 'N/A'}

--------------------------------------------------------------------------------
PAYMENT INFORMATION
--------------------------------------------------------------------------------
Amount: ${purchase.paymentCurrency} ${purchase.paymentAmount}
Status: ${purchase.paymentStatus}
Stripe Session ID: ${purchase.stripeSessionId || 'Pending'}
Paid At: ${purchase.paidAt || 'Pending'}

--------------------------------------------------------------------------------
TERMS & CONDITIONS
--------------------------------------------------------------------------------
Terms Accepted: ${purchase.termsAccepted === 'true' ? 'Yes' : 'No'}
Accepted At: ${purchase.termsAcceptedAt || 'N/A'}

--------------------------------------------------------------------------------
ADDITIONAL NOTES
--------------------------------------------------------------------------------
${purchase.additionalNotes || 'None'}

--------------------------------------------------------------------------------
METADATA
--------------------------------------------------------------------------------
Created At: ${purchase.createdAt}
Updated At: ${purchase.updatedAt}
Notification Sent: ${purchase.notificationEmailSent === 'true' ? 'Yes' : 'No'}

================================================================================
END OF LOG
================================================================================
  `.trim();
}

// Helper to get notification email based on template
export function getNotificationEmail(templateId: string): string {
  // In a real implementation, this could be configured per template
  // For now, always use info@recursyv.com as specified
  return process.env.NOTIFICATION_EMAIL || 'info@recursyv.com';
}

