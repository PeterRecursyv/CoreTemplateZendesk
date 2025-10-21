import { notifyOwner } from './_core/notification';

export interface StepNotificationData {
  purchaseId: string;
  step: number;
  data: Record<string, any>;
}

const NOTIFICATION_EMAIL = 'peter.newman@recursyv.com';

export async function sendStepNotification(notificationData: StepNotificationData): Promise<boolean> {
  const { purchaseId, step, data } = notificationData;
  
  const stepNames = {
    1: 'Integration Details',
    2: 'Business Details',
    3: 'Terms & Conditions',
    4: 'Payment',
  };
  
  const title = `Purchase Step ${step} Completed: ${stepNames[step as keyof typeof stepNames] || 'Unknown'}`;
  
  const content = formatStepData(step, data, purchaseId);
  
  try {
    const result = await notifyOwner({ title, content });
    
    if (result) {
      console.log(`[Step Notification] Email sent to ${NOTIFICATION_EMAIL} for purchase ${purchaseId}, step ${step}`);
      return true;
    } else {
      console.warn(`[Step Notification] Failed to send email for purchase ${purchaseId}, step ${step}`);
      return false;
    }
  } catch (error) {
    console.error('[Step Notification] Error sending notification:', error);
    return false;
  }
}

function formatStepData(step: number, data: Record<string, any>, purchaseId: string): string {
  const timestamp = new Date().toISOString();
  
  let content = `
**Purchase Progress Update**

---

**Purchase ID:** ${purchaseId}
**Step:** ${step} - ${getStepName(step)}
**Timestamp:** ${timestamp}
**Notification Email:** ${NOTIFICATION_EMAIL}

---

`;

  if (step === 1) {
    content += `
**Integration Selection:**
- Hub Vendor: ${data.hubVendor || 'N/A'}
- Spoke Integration: ${data.spokeIntegration || 'N/A'}

**Customer Information:**
- Name: ${data.customerName || 'N/A'}
- Email: ${data.customerEmail || 'N/A'}
`;
  } else if (step === 2) {
    content += `
**Integration:**
- Hub Vendor: ${data.hubVendor || 'N/A'}
- Spoke Integration: ${data.spokeIntegration || 'N/A'}

**Customer Information:**
- Name: ${data.customerName || 'N/A'}
- Email: ${data.customerEmail || 'N/A'}

**Business Details:**
- Company Name: ${data.companyName || 'N/A'}
- Entity Type: ${data.entityType || 'N/A'}
- Sync Frequency: ${data.syncFrequency || 'N/A'}
- Data Volume: ${data.dataVolume || 'N/A'}

**Pricing:**
- Selected Tier: ${data.pricingTier || 'N/A'}
- Price: ${data.price ? `$${data.price}/month` : 'N/A'}

**Additional Notes:**
${data.additionalNotes || 'None'}
`;
  } else if (step === 3) {
    content += `
**Integration:**
- Hub Vendor: ${data.hubVendor || 'N/A'}
- Spoke Integration: ${data.spokeIntegration || 'N/A'}

**Customer Information:**
- Name: ${data.customerName || 'N/A'}
- Email: ${data.customerEmail || 'N/A'}
- Company: ${data.companyName || 'N/A'}

**Business Details:**
- Entity Type: ${data.entityType || 'N/A'}
- Sync Frequency: ${data.syncFrequency || 'N/A'}
- Data Volume: ${data.dataVolume || 'N/A'}

**Pricing:**
- Selected Tier: ${data.pricingTier || 'N/A'}
- Price: ${data.price ? `$${data.price}/month` : 'N/A'}

**Terms & Conditions:**
- Accepted: ${data.termsAccepted ? 'Yes' : 'No'}
- Accepted At: ${data.termsAcceptedAt || 'N/A'}

**Additional Notes:**
${data.additionalNotes || 'None'}
`;
  }

  content += `
---

**Next Steps:**
${getNextSteps(step)}
  `.trim();

  return content;
}

function getStepName(step: number): string {
  const names: Record<number, string> = {
    1: 'Integration Details',
    2: 'Business Details',
    3: 'Terms & Conditions',
    4: 'Payment',
  };
  return names[step] || 'Unknown Step';
}

function getNextSteps(step: number): string {
  if (step === 1) {
    return '- Customer will provide business details in the next step';
  } else if (step === 2) {
    return '- Customer will review and accept terms & conditions';
  } else if (step === 3) {
    return '- Customer will proceed to payment';
  }
  return '- Purchase process complete';
}

