export interface HubVendor {
  id: string;
  name: string;
  description: string;
  logo: string;
  categories: string[];
  dataPoints: string[];
  features: string[];
  spokeIntegrations: string[];
}

export interface SpokeIntegration {
  id: string;
  name: string;
  description: string;
  logo: string;
  categories: string[];
  available: boolean;
}

export interface BrandingConfig {
  companyName: string;
  logo: string;
  contactEmail: string;
  contactPhoneUK: string;
  contactPhoneUS: string;
  address: string;
  aboutUs: string;
  tagline: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
  social: {
    twitter: string;
    linkedin: string;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  criteria: {
    dataVolume?: string;
    syncFrequency?: string[];
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  syncInterval: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface PricingConfig {
  tiers?: PricingTier[];
  plans?: PricingPlan[];
  contractTerms?: {
    minimumPeriod: string;
    syncIntervalChanges: string;
    notes: string;
  };
}

export interface PurchaseFlowStep1 {
  hubVendorId: string;
  hubVendorName: string;
  spokeIntegrationId: string;
  spokeIntegrationName: string;
  customerName: string;
  customerEmail: string;
}

export interface PurchaseFlowStep2 {
  companyName: string;
  entityType: string;
  syncFrequency: string;
  dataVolume: string;
  pricingTier: string;
  additionalNotes?: string;
}

export interface PurchaseFlowStep3 {
  termsAccepted: boolean;
}

export interface PurchaseFlowComplete {
  step1: PurchaseFlowStep1;
  step2: PurchaseFlowStep2;
  step3: PurchaseFlowStep3;
  stripeSessionId?: string;
}

