import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import type { PricingTier } from "../../../shared/config-types";

export default function Purchase() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const hubId = params.get("hub");
  const spokeId = params.get("spoke");
  const hubName = params.get("hubName");
  const spokeName = params.get("spokeName");

  // Load configuration
  const { data: hubVendor } = trpc.config.hubVendor.useQuery();
  const { data: branding } = trpc.config.branding.useQuery();
  const { data: pricingConfig } = trpc.config.pricing.useQuery();

  // Step 1 data
  const [step1Data, setStep1Data] = useState({
    customerName: "",
    customerEmail: "",
  });

  // Step 2 data
  const [step2Data, setStep2Data] = useState({
    companyName: "",
    entityType: "",
    syncFrequency: "",
    dataVolume: "",
    pricingTier: "",
    additionalNotes: "",
  });

  // Step 3 data
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Selected pricing tier
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  // Mutations
  const createPurchase = trpc.purchase.create.useMutation();
  const updatePurchase = trpc.purchase.update.useMutation();
  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation();
  const sendNotification = trpc.notification.sendPurchaseNotification.useMutation();

  // Calculate pricing tier based on sync frequency selection
  useEffect(() => {
    if (step2Data.syncFrequency && pricingConfig) {
      const tier = pricingConfig.tiers.find((t: PricingTier) => {
        if (t.criteria.syncFrequency) {
          return t.criteria.syncFrequency.includes(step2Data.syncFrequency);
        }
        return false;
      });
      
      if (tier) {
        setSelectedTier(tier);
        setStep2Data(prev => ({ ...prev, pricingTier: tier.id }));
      }
    }
  }, [step2Data.syncFrequency, pricingConfig]);

  const handleStep1Submit = async () => {
    if (!step1Data.customerName || !step1Data.customerEmail) {
      alert("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(step1Data.customerEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const result = await createPurchase.mutateAsync({
        hubVendorId: hubId || "",
        hubVendorName: hubName || "",
        spokeIntegrationId: spokeId || "",
        spokeIntegrationName: spokeName || "",
        customerName: step1Data.customerName,
        customerEmail: step1Data.customerEmail,
      });

      if (result.purchaseId) {
        setPurchaseId(result.purchaseId);
        
        // Send email notification for step 1
        await sendNotification.mutateAsync({
          purchaseId: result.purchaseId,
          step: 1,
          data: {
            hubVendor: hubName || '',
            spokeIntegration: spokeName || '',
            customerName: step1Data.customerName,
            customerEmail: step1Data.customerEmail,
          },
        });
        
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Failed to create purchase:", error);
      alert("Failed to start purchase process. Please try again.");
    }
  };

  const handleStep2Submit = async () => {
    if (!step2Data.companyName || !step2Data.entityType || !step2Data.syncFrequency || !step2Data.dataVolume) {
      alert("Please fill in all required fields");
      return;
    }

    if (!purchaseId) {
      alert("Purchase session not found. Please start over.");
      return;
    }

    try {
      await updatePurchase.mutateAsync({
        id: purchaseId,
        companyName: step2Data.companyName,
        entityType: step2Data.entityType,
        syncFrequency: step2Data.syncFrequency,
        dataVolume: step2Data.dataVolume,
        pricingTier: step2Data.pricingTier,
        additionalNotes: step2Data.additionalNotes,
        paymentAmount: selectedTier?.price.toString() || "0",
      });

      // Send email notification for step 2
      await sendNotification.mutateAsync({
        purchaseId,
        step: 2,
        data: {
          ...step1Data,
          ...step2Data,
          hubVendor: hubName || '',
          spokeIntegration: spokeName || '',
          pricingTier: selectedTier?.name || '',
          price: selectedTier?.price || 0,
        },
      });

      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to update purchase:", error);
      alert("Failed to save details. Please try again.");
    }
  };

  const handleStep3Submit = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to continue");
      return;
    }

    if (!purchaseId) {
      alert("Purchase session not found. Please start over.");
      return;
    }

    try {
      await updatePurchase.mutateAsync({
        id: purchaseId,
        termsAccepted: "true",
        termsAcceptedAt: new Date(),
      });

      // Send email notification for step 3
      await sendNotification.mutateAsync({
        purchaseId,
        step: 3,
        data: {
          ...step1Data,
          ...step2Data,
          hubVendor: hubName || '',
          spokeIntegration: spokeName || '',
          pricingTier: selectedTier?.name || '',
          price: selectedTier?.price || 0,
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
        },
      });

      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to update terms:", error);
      alert("Failed to save terms acceptance. Please try again.");
    }
  };

  const steps = [
    { number: 1, title: "Integration Details", description: "Select your integration" },
    { number: 2, title: "Business Details", description: "Tell us about your needs" },
    { number: 3, title: "Terms & Conditions", description: "Review and accept" },
    { number: 4, title: "Payment", description: "Complete your purchase" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logo && (
              <img src={branding.logo} alt={branding.companyName} className="h-8 w-auto" />
            )}
            <span className="font-semibold text-lg">{branding?.companyName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </header>

      <div className="container py-12">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.number
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Integration Selection & Contact Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
                <CardDescription>
                  You're setting up an integration between {hubName} and {spokeName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">{hubName}</div>
                    <div className="text-sm text-muted-foreground">Hub Platform</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{spokeName}</div>
                    <div className="text-sm text-muted-foreground">Integration</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="John Doe"
                      value={step1Data.customerName}
                      onChange={(e) => setStep1Data({ ...step1Data, customerName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={step1Data.customerEmail}
                      onChange={(e) => setStep1Data({ ...step1Data, customerEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleStep1Submit} disabled={createPurchase.isPending}>
                    {createPurchase.isPending ? "Processing..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Business Details & Pricing */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>Tell us about your integration requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Corporation"
                      value={step2Data.companyName}
                      onChange={(e) => setStep2Data({ ...step2Data, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="entityType">
                      Entity Type <span className="text-destructive">*</span>
                    </Label>
                    <Select value={step2Data.entityType} onValueChange={(value) => setStep2Data({ ...step2Data, entityType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="msp">Managed Service Provider (MSP)</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="smb">Small/Medium Business (SMB)</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="syncFrequency">
                      Sync Frequency <span className="text-destructive">*</span>
                    </Label>
                    <Select value={step2Data.syncFrequency} onValueChange={(value) => setStep2Data({ ...step2Data, syncFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="15min">15 Minutes</SelectItem>
                        <SelectItem value="10min">10 Minutes</SelectItem>
                        <SelectItem value="5min">5 Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dataVolume">
                      Expected Data Volume <span className="text-destructive">*</span>
                    </Label>
                    <Select value={step2Data.dataVolume} onValueChange={(value) => setStep2Data({ ...step2Data, dataVolume: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (up to 1,000 records)</SelectItem>
                        <SelectItem value="medium">Medium (1,000 - 10,000 records)</SelectItem>
                        <SelectItem value="large">Large (10,000+ records)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any specific requirements or questions?"
                      value={step2Data.additionalNotes}
                      onChange={(e) => setStep2Data({ ...step2Data, additionalNotes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Pricing Display */}
                {selectedTier && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Recommended Plan</h3>
                    <Card className="border-primary/50 bg-primary/5">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{selectedTier.name}</CardTitle>
                            <CardDescription>{selectedTier.description}</CardDescription>
                          </div>
                          <Badge variant="default">Recommended</Badge>
                        </div>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">${selectedTier.price}</span>
                          <span className="text-muted-foreground">/{selectedTier.interval}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedTier.features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStep2Submit} disabled={updatePurchase.isPending || !selectedTier}>
                    {updatePurchase.isPending ? "Saving..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Terms & Conditions */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                <CardDescription>Please review and accept our terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-muted/30">
                  <h3 className="font-semibold mb-4">Service Agreement</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      By proceeding with this purchase, you agree to the following terms and conditions for the integration service between {hubName} and {spokeName}.
                    </p>
                    
                    <h4 className="font-semibold text-foreground">1. Service Scope</h4>
                    <p>
                      {branding?.companyName} will provide fully managed integration services including setup, configuration, data mapping, testing, and ongoing support for the selected integration.
                    </p>

                    <h4 className="font-semibold text-foreground">2. Data Security</h4>
                    <p>
                      All data transmitted through our integration platform is encrypted in transit using industry-standard TLS protocols. We maintain strict security measures and comply with relevant data protection regulations.
                    </p>

                    <h4 className="font-semibold text-foreground">3. Service Level Agreement</h4>
                    <p>
                      We commit to maintaining the agreed sync frequency and providing proactive monitoring. Any issues will be addressed according to the support tier included in your selected plan.
                    </p>

                    <h4 className="font-semibold text-foreground">4. Payment Terms</h4>
                    <p>
                      Payment is processed securely through Stripe. Your subscription will renew automatically on a monthly basis unless cancelled. You may cancel at any time with 30 days notice.
                    </p>

                    <h4 className="font-semibold text-foreground">5. Support & Maintenance</h4>
                    <p>
                      Ongoing support is included as specified in your plan. We provide regular updates, bug fixes, and assistance with any integration-related issues.
                    </p>

                    <h4 className="font-semibold text-foreground">6. Cancellation Policy</h4>
                    <p>
                      You may cancel your service at any time by providing 30 days written notice. No refunds will be provided for partial months of service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the terms and conditions outlined above. I understand that this is a legally binding agreement.
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStep3Submit} disabled={!termsAccepted || updatePurchase.isPending}>
                    {updatePurchase.isPending ? "Processing..." : "Accept & Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment (Placeholder) */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your purchase securely with Stripe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Payment Integration Coming Soon</h3>
                    <p className="text-muted-foreground mb-6">
                      Stripe payment processing will be integrated in the next phase. For now, we've captured your details.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6 text-left max-w-md mx-auto">
                    <h4 className="font-semibold mb-4">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Integration:</span>
                        <span className="font-medium">{hubName} ↔ {spokeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium">{selectedTier?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{step2Data.companyName}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${selectedTier?.price}/{selectedTier?.interval}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={async () => {
                        if (!purchaseId) return;
                        
                        try {
                          // Send notification first
                          await sendNotification.mutateAsync({
                            purchaseId,
                            pricingTierName: selectedTier?.name,
                          });
                          
                          // Create Stripe checkout session
                          const result = await createCheckoutSession.mutateAsync({
                            purchaseId,
                            pricingTierName: selectedTier?.name,
                            successUrl: `${window.location.origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                            cancelUrl: `${window.location.origin}/purchase?hub=${hubId}&spoke=${spokeId}&hubName=${hubName}&spokeName=${spokeName}`,
                          });
                          
                          // Redirect to Stripe Checkout
                          if (result.url) {
                            window.location.href = result.url;
                          }
                        } catch (error) {
                          console.error('Failed to create checkout session:', error);
                          alert('Failed to start payment process. Please try again.');
                        }
                      }}
                      disabled={createCheckoutSession.isPending || sendNotification.isPending || !process.env.VITE_STRIPE_PUBLISHABLE_KEY}
                    >
                      {createCheckoutSession.isPending || sendNotification.isPending ? 'Processing...' : 'Proceed to Stripe Checkout'}
                    </Button>
                    {!process.env.VITE_STRIPE_PUBLISHABLE_KEY && (
                      <p className="text-xs text-muted-foreground text-center">
                        Stripe is not configured. Set STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY environment variables.
                      </p>
                    )}
                    <Button variant="outline" onClick={() => setLocation("/")}>
                      Return to Marketplace
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Your information has been saved. Our team will contact you at {step1Data.customerEmail} to complete the setup.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

