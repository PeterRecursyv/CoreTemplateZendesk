import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function PurchaseSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const [sessionData, setSessionData] = useState<any>(null);

  const { data: branding } = trpc.config.branding.useQuery();
  const { data: session, isLoading } = trpc.stripe.getSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (session) {
      setSessionData(session);
    }
  }, [session]);

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
        </div>
      </header>

      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verifying your payment...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Payment Successful!</CardTitle>
                <CardDescription className="text-base">
                  Thank you for your purchase. Your integration is being set up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold">What Happens Next?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                      <div>
                        <div className="font-medium">Confirmation Email</div>
                        <div className="text-muted-foreground">
                          You'll receive a confirmation email with your purchase details shortly.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <div>
                        <div className="font-medium">Team Contact</div>
                        <div className="text-muted-foreground">
                          Our integration team will reach out within 24 hours to begin the setup process.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        3
                      </div>
                      <div>
                        <div className="font-medium">Integration Setup</div>
                        <div className="text-muted-foreground">
                          We'll configure your integration, test it thoroughly, and ensure everything works perfectly.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        4
                      </div>
                      <div>
                        <div className="font-medium">Go Live</div>
                        <div className="text-muted-foreground">
                          Once testing is complete, we'll activate your integration and provide ongoing support.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {sessionData && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session ID:</span>
                        <span className="font-mono text-xs">{sessionData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Email:</span>
                        <span>{sessionData.customer_email || sessionData.customer_details?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Status:</span>
                        <span className="capitalize">{sessionData.payment_status}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>
                      Questions? Contact us at{" "}
                      <a href={`mailto:${branding?.contactEmail}`} className="text-primary hover:underline">
                        {branding?.contactEmail}
                      </a>
                    </span>
                  </div>
                  <Button className="w-full" asChild>
                    <a href="/">
                      Return to Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

