import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Check, Mail, Phone } from "lucide-react";

export default function Home() {
  const { data: hubVendor, isLoading: hubLoading } = trpc.config.hubVendor.useQuery();
  const { data: spokeIntegrations, isLoading: spokesLoading } = trpc.config.spokeIntegrations.useQuery();
  const { data: branding } = trpc.config.branding.useQuery();
  const [, setLocation] = useLocation();

  if (hubLoading || spokesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  const handleIntegrationSelect = (spokeId: string, spokeName: string) => {
    setLocation(`/purchase?hub=${hubVendor?.id}&spoke=${spokeId}&hubName=${encodeURIComponent(hubVendor?.name || '')}&spokeName=${encodeURIComponent(spokeName)}`);
  };

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
          <nav className="flex items-center gap-6">
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About Us
            </a>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${branding?.contactEmail}`}>
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {branding?.tagline || "Integration Marketplace"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect <span className="font-semibold text-foreground">{hubVendor?.name}</span> with your favorite tools. 
            Streamline your workflow with seamless, bidirectional integrations.
          </p>
        </div>

        {/* Hub Vendor Showcase */}
        {hubVendor && (
          <Card className="max-w-4xl mx-auto mb-16 border-2 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
                  <img 
                    src={hubVendor.logo} 
                    alt={hubVendor.name}
                    className="relative h-24 w-auto object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-3xl">{hubVendor.name}</CardTitle>
              <CardDescription className="text-base">{hubVendor.description}</CardDescription>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {hubVendor.categories.map((cat: string) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Available Data Points
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {hubVendor.dataPoints.map((point: string) => (
                    <div key={point} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Integration Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {hubVendor.features.map((feature: string) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spoke Integrations Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Available Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spokeIntegrations?.map((spoke: any) => (
              <Card 
                key={spoke.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleIntegrationSelect(spoke.id, spoke.name)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <img 
                      src={spoke.logo} 
                      alt={spoke.name}
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {spoke.available && (
                      <Badge variant="default" className="text-xs">Available</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{spoke.name}</CardTitle>
                  <CardDescription>{spoke.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {spoke.categories.map((cat: string) => (
                      <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-24">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${branding?.contactEmail}`} className="hover:text-foreground">
                    {branding?.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>UK: {branding?.contactPhoneUK}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>US: {branding?.contactPhoneUS}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Address</h3>
              <p className="text-sm text-muted-foreground">{branding?.address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {branding?.social.twitter && (
                  <a href={branding.social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    Twitter
                  </a>
                )}
                {branding?.social.linkedin && (
                  <a href={branding.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {branding?.companyName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

