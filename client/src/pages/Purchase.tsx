import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TermsOfServiceContent } from "@/components/TermsOfService";
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

  // Step 2 data (Data Types Included)
  const [step2Data, setStep2Data] = useState({
    otherDataTypes: "",
  });

  // Step 3 data (Tariff Details)
  const [step3Data, setStep3Data] = useState({
    selectedPlan: "",
  });

  // Step 3 data
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Selected pricing tier/plan
  const [selectedTier, setSelectedTier] = useState<any>(null);

  // Mutations
  const createPurchase = trpc.purchase.create.useMutation();
  const updatePurchase = trpc.purchase.update.useMutation();
  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation();
  const sendNotification = trpc.notification.sendPurchaseNotification.useMutation();

  // Set selected tier based on plan selection
  useEffect(() => {
    if (step3Data.selectedPlan && pricingConfig) {
      const plan = pricingConfig.plans?.find((p: any) => p.id === step3Data.selectedPlan);
      if (plan) {
        setSelectedTier(plan);
      }
    }
  }, [step3Data.selectedPlan, pricingConfig]);

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
    if (!purchaseId) {
      alert("Purchase ID not found. Please start over.");
      return;
    }

    try {
      await updatePurchase.mutateAsync({
        id: purchaseId,
        otherDataTypes: step2Data.otherDataTypes,
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
          dataPointsIncluded: hubVendor?.dataPoints || [],
        },
      });

      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to update purchase:", error);
      alert("Failed to save details. Please try again.");
    }
  };

  const handleStep3Submit = async () => {
    if (!step3Data.selectedPlan) {
      alert("Please select a plan");
      return;
    }

    if (!purchaseId) {
      alert("Purchase ID not found. Please start over.");
      return;
    }

    try {
      await updatePurchase.mutateAsync({
        id: purchaseId,
        selectedPlan: step3Data.selectedPlan,
        pricingTier: step3Data.selectedPlan,
        paymentAmount: selectedTier?.price.toString() || "0",
      });

      // Send email notification for step 3
      await sendNotification.mutateAsync({
        purchaseId,
        step: 3,
        data: {
          ...step1Data,
          ...step2Data,
          ...step3Data,
          hubVendor: hubName || '',
          spokeIntegration: spokeName || '',
          pricingTier: selectedTier?.name || '',
          price: selectedTier?.price || 0,
        },
      });

      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to update purchase:", error);
      alert("Failed to save details. Please try again.");
    }
  };

  const handleStep4Submit = async () => {
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

      // Send email notification for step 4
      await sendNotification.mutateAsync({
        purchaseId,
        step: 4,
        data: {
          ...step1Data,
          ...step2Data,
          ...step3Data,
          hubVendor: hubName || '',
          spokeIntegration: spokeName || '',
          pricingTier: selectedTier?.name || '',
          price: selectedTier?.price || 0,
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
        },
      });

      setCurrentStep(5);
    } catch (error) {
      console.error("Failed to update terms:", error);
      alert("Failed to save terms acceptance. Please try again.");
    }
  };

  const steps = [
    { number: 1, title: "Integration Details", description: "Select your integration" },
    { number: 2, title: "Data Types Included", description: "Review included entities" },
    { number: 3, title: "Tariff Details", description: "Select your plan" },
    { number: 4, title: "Terms & Conditions", description: "Review and accept" },
    { number: 5, title: "Payment", description: "Complete your purchase" },
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

          {/* Step 2: Data Types Included */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Types Included</CardTitle>
                <CardDescription>
                  The following data types are included in your {hubName} ↔ {spokeName} integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Data Points Included */}
                <div>
                  <h3 className="text-base font-semibold mb-4">Standard Data Types Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hubVendor?.dataPoints?.map((dataPoint: string) => (
                      <div key={dataPoint} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">{dataPoint}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Data Types Field */}
                <div className="space-y-2">
                  <Label htmlFor="otherDataTypes" className="text-base font-semibold">
                    Other Data Types to Include in this Integration
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Please specify any additional data types or entities you would like to include in this integration.
                  </p>
                  <Textarea
                    id="otherDataTypes"
                    placeholder="e.g., Custom fields, additional modules, specific data sets..."
                    value={step2Data.otherDataTypes}
                    onChange={(e) => setStep2Data({ ...step2Data, otherDataTypes: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Our team will review your requirements and confirm the feasibility of including additional data types during the setup process.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStep2Submit} disabled={updatePurchase.isPending}>
                    {updatePurchase.isPending ? "Saving..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Tariff Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Tariff Details</CardTitle>
                <CardDescription>Select your integration plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      Plan Required <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your sync interval. Sync intervals may be changed during the contract period (12 months).
                    </p>
                  </div>

                  {/* Plan Options */}
                  <div className="space-y-3">
                    {pricingConfig?.plans?.map((plan: any) => (
                      <div
                        key={plan.id}
                        onClick={() => setStep3Data({ selectedPlan: plan.id })}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          step3Data.selectedPlan === plan.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{plan.name}</h3>
                              {plan.popular && (
                                <Badge variant="default">Popular</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                            <ul className="space-y-1.5">
                              {plan.features?.slice(0, 3).map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold">${plan.price}</div>
                            <div className="text-sm text-muted-foreground">per month</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Contract Terms:</strong> 12-month minimum contract period. Sync intervals may be adjusted during the contract period to meet your changing business needs.
                    </p>
                  </div>
                </div>

                {/* Selected Plan Summary */}
                {selectedTier && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Selected Plan</h3>
                    <Card className="border-primary/50 bg-primary/5">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{selectedTier.name}</CardTitle>
                            <CardDescription>{selectedTier.description}</CardDescription>
                          </div>
                          <Badge variant="default">Selected</Badge>
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
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStep3Submit} disabled={updatePurchase.isPending || !selectedTier}>
                    {updatePurchase.isPending ? "Saving..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Terms & Conditions */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
                <CardDescription>Please review and accept our terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-muted/30">
                  <TermsOfServiceContent />
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
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleStep4Submit} disabled={!termsAccepted || updatePurchase.isPending}>
                    {updatePurchase.isPending ? "Processing..." : "Accept & Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Payment (Placeholder) */}
          {currentStep === 5 && (
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
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{step1Data.customerName}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${selectedTier?.price}/{selectedTier?.interval}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Select Payment Method</h3>
                      
                      {/* Stripe Payment Option */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium">Pay with Stripe</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Secure online payment via credit card or bank transfer
                            </p>
                          </div>
                        </div>
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
                          disabled={createCheckoutSession.isPending || sendNotification.isPending || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
                        >
                          {createCheckoutSession.isPending || sendNotification.isPending ? 'Processing...' : 'Proceed to Stripe Checkout'}
                        </Button>
                        {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
                          <p className="text-xs text-muted-foreground text-center">
                            Stripe is not configured. Set STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY environment variables.
                          </p>
                        )}
                      </div>

                      {/* Manual Process Option */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium">Bespoke Proposal Process</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Recursyv shall contact you to confirm requirements, provide a bespoke proposal (which may include a Setup) for signature. A project kick-off call shall then be scheduled.
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            if (!purchaseId) return;
                            
                            try {
                              // Send notification for manual process
                              await sendNotification.mutateAsync({
                                purchaseId,
                                pricingTierName: selectedTier?.name,
                              });
                              
                              // Redirect to success page
                              setLocation(`/purchase-success?purchaseId=${purchaseId}&manual=true`);
                            } catch (error) {
                              console.error('Failed to submit request:', error);
                              alert('Failed to submit request. Please try again.');
                            }
                          }}
                          disabled={sendNotification.isPending}
                        >
                          {sendNotification.isPending ? 'Submitting...' : 'Request Bespoke Proposal'}
                        </Button>
                      </div>
                    </div>

                    <Button variant="ghost" onClick={() => setLocation("/")} className="w-full">
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

