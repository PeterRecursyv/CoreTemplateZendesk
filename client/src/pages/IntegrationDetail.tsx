import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock, Shield, Zap, Database, RefreshCw, TrendingUp } from "lucide-react";

export default function IntegrationDetail() {
  const [, setLocation] = useLocation();
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const hubId = params.get("hub");
  const spokeId = params.get("spoke");

  // Load configuration
  const { data: hubVendor } = trpc.config.hubVendor.useQuery();
  const { data: spokeIntegrations } = trpc.config.spokeIntegrations.useQuery();
  const { data: branding } = trpc.config.branding.useQuery();

  const spoke = spokeIntegrations?.find(s => s.id === spokeId);
  
  if (!hubVendor || !spoke) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Integration Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested integration could not be loaded.</p>
          <Button onClick={() => setLocation("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    setLocation(`/purchase?hub=${hubId}&spoke=${spokeId}&hubName=${encodeURIComponent(hubVendor.name)}&spokeName=${encodeURIComponent(spoke.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={branding?.logo} alt={branding?.companyName} className="h-12" />
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
              <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
              <a href={`mailto:${branding?.contactEmail}`} className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Integrations
        </Button>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-4">
              <img src={hubVendor.logo} alt={hubVendor.name} className="h-20 w-20 object-contain" />
              <div className="text-4xl font-bold text-muted-foreground">↔</div>
              <img src={spoke.logo} alt={spoke.name} className="h-20 w-20 object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {hubVendor.name} + {spoke.name} Integration
              </h1>
              <p className="text-xl text-muted-foreground">
                Seamless data synchronization between {hubVendor.name} and {spoke.name}
              </p>
              <div className="flex gap-2 mt-4">
                {spoke.categories.map(cat => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>
          </div>
          <Button size="lg" onClick={handleGetStarted} className="mt-4">
            Get Started with This Integration
          </Button>
        </div>

        {/* Key Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Benefits</CardTitle>
            <CardDescription>Why integrate {hubVendor.name} with {spoke.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Real-Time Synchronization</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your data consistent across both platforms with automatic, real-time updates. Changes made in {hubVendor.name} instantly reflect in {spoke.name} and vice versa.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Time Savings</h3>
                  <p className="text-sm text-muted-foreground">
                    Eliminate manual data entry and reduce administrative overhead. Our integration automates workflows, saving your team hours of repetitive work every week.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Accuracy</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce errors from manual data transfer. Automated synchronization ensures data integrity and consistency across your entire technology stack.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Improved Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Gain comprehensive insights by connecting data from multiple sources. Make better decisions with unified reporting and analytics.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
            <CardDescription>What's included in this integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Bi-Directional Sync</h4>
                  <p className="text-sm text-muted-foreground">Data flows seamlessly in both directions between platforms</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Custom Field Mapping</h4>
                  <p className="text-sm text-muted-foreground">Map any field from {hubVendor.name} to {spoke.name} fields</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Automated Workflows</h4>
                  <p className="text-sm text-muted-foreground">Trigger actions based on data changes and business rules</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Conflict Resolution</h4>
                  <p className="text-sm text-muted-foreground">Intelligent handling of data conflicts and duplicates</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Historical Data Migration</h4>
                  <p className="text-sm text-muted-foreground">Import existing data from both systems during setup</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Real-Time Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Dashboard to track sync status and integration health</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Error Notifications</h4>
                  <p className="text-sm text-muted-foreground">Instant alerts when sync issues occur</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Data Transformation</h4>
                  <p className="text-sm text-muted-foreground">Convert and format data to match each platform's requirements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Common Use Cases</CardTitle>
            <CardDescription>How organizations use this integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Unified Customer Data
                </h3>
                <p className="text-sm text-muted-foreground ml-7">
                  Maintain a single source of truth for customer information. When a customer record is updated in {spoke.name}, the changes automatically sync to {hubVendor.name}, ensuring your support and sales teams always have the latest information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Automated Ticket Creation
                </h3>
                <p className="text-sm text-muted-foreground ml-7">
                  Automatically create tickets in {hubVendor.name} when specific events occur in {spoke.name}. For example, when a deal closes in your CRM, automatically generate an onboarding ticket for your support team.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Enhanced Reporting
                </h3>
                <p className="text-sm text-muted-foreground ml-7">
                  Combine data from both platforms to create comprehensive reports. Track how support interactions in {hubVendor.name} correlate with sales activities in {spoke.name}, enabling data-driven decision making.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Compliance and Audit Trail
                </h3>
                <p className="text-sm text-muted-foreground ml-7">
                  Maintain detailed audit logs of all data changes across both systems. Perfect for organizations with strict compliance requirements who need to track every modification to customer or project data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>Integration capabilities and requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Sync Frequency Options</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Real-time (2-5 minute intervals)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Near real-time (10-15 minute intervals)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Hourly synchronization
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Data Objects Supported</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Contacts and Organizations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Tickets and Cases
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Custom Fields and Metadata
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Attachments and Documents
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Security Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    AES-256Bit Encryption in Transit
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    No data held at rest
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    OAuth 2.0 authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    GDPR and SOC 2 compliant
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Setup Requirements</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Admin access to {hubVendor.name}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Admin access to {spoke.name}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    API access enabled on both platforms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Typical setup time: 2-5 business days
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Connect {hubVendor.name} and {spoke.name}?</h2>
              <p className="text-lg mb-6 opacity-90">
                Start your integration journey today. Our team will guide you through setup and ensure a smooth deployment.
              </p>
              <Button size="lg" variant="secondary" onClick={handleGetStarted}>
                Get Started Now
              </Button>
              <p className="text-sm mt-4 opacity-75">
                Questions? Contact us at {branding?.contactEmail} or call {branding?.contactPhoneUK}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <p className="text-sm text-muted-foreground">Email: {branding?.contactEmail}</p>
              <p className="text-sm text-muted-foreground">Phone: {branding?.contactPhoneUK}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Address</h3>
              <p className="text-sm text-muted-foreground">{branding?.address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href={branding?.social?.twitter} className="text-sm text-muted-foreground hover:text-primary">Twitter</a>
                <a href={branding?.social?.linkedin} className="text-sm text-muted-foreground hover:text-primary">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {branding?.companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

