import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, Mail, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import type { HubVendor, SpokeIntegration } from "@shared/config-types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: hubVendor, isLoading: hubLoading } = trpc.config.hubVendor.useQuery();
  const { data: spokeIntegrations, isLoading: spokesLoading } = trpc.config.spokeIntegrations.useQuery();
  const { data: branding } = trpc.config.branding.useQuery();

  // Filter integrations based on search
  const filteredIntegrations = useMemo(() => {
    if (!spokeIntegrations) return [];
    if (!searchQuery.trim()) return spokeIntegrations;
    
    const query = searchQuery.toLowerCase();
    return spokeIntegrations.filter(
      (integration: SpokeIntegration) =>
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.categories.some((cat: string) => cat.toLowerCase().includes(query))
    );
  }, [spokeIntegrations, searchQuery]);

  if (hubLoading || spokesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logo && (
              <img src={branding.logo} alt={branding.companyName} className="h-12 w-auto" />
            )}
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
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Leaders in ITSM, Service/Help Desk + CRM and Marketing Integrations
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect <span className="font-semibold text-foreground">{hubVendor?.name}</span> with your favorite tools. 
            Streamline your workflow with seamless, bidirectional integrations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Hub Vendor Showcase */}
        {hubVendor && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Hub Platform</h2>
              <p className="text-muted-foreground">Your central integration platform</p>
            </div>
            
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                  <div className="w-32 h-32 bg-white rounded-xl shadow-lg flex items-center justify-center p-6 mb-6">
                    <img src={hubVendor.logo} alt={hubVendor.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-3">{hubVendor.name}</h3>
                  <p className="text-lg text-muted-foreground mb-4">{hubVendor.description}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {hubVendor.categories.map((category: string) => (
                      <Badge key={category} variant="secondary" className="text-sm">{category}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Available Data Points
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {hubVendor.dataPoints.slice(0, 6).map((point: string) => (
                          <div key={point} className="flex items-center gap-2 justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <span>{point}</span>
                          </div>
                        ))}
                        {hubVendor.dataPoints.length > 6 && (
                          <span className="text-muted-foreground text-xs">+ {hubVendor.dataPoints.length - 6} more</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Integration Features
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {hubVendor.features.map((feature: string) => (
                          <Badge key={feature} variant="outline" className="text-xs">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Integrations Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {searchQuery.trim() 
                ? `Found ${filteredIntegrations.length} Integration${filteredIntegrations.length !== 1 ? 's' : ''}`
                : 'Available Integrations'}
            </h2>
            <p className="text-muted-foreground">
              Click any integration to view details and get started
            </p>
          </div>

          {filteredIntegrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No integrations found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredIntegrations.map((integration: SpokeIntegration) => (
                <IntegrationCard key={integration.id} integration={integration} hubVendor={hubVendor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-20">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${branding?.contactEmail}`} className="hover:text-primary">
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
              <p className="text-sm text-muted-foreground whitespace-pre-line">{branding?.address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {branding?.social?.twitter && (
                  <a href={branding.social.twitter} className="text-muted-foreground hover:text-primary">
                    Twitter
                  </a>
                )}
                {branding?.social?.linkedin && (
                  <a href={branding.social.linkedin} className="text-muted-foreground hover:text-primary">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 {branding?.companyName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Integration Card Component
function IntegrationCard({ integration, hubVendor }: { integration: SpokeIntegration; hubVendor: HubVendor | undefined }) {
  return (
    <a
      href={`/purchase?hub=${hubVendor?.id}&spoke=${integration.id}&hubName=${encodeURIComponent(hubVendor?.name || '')}&spokeName=${encodeURIComponent(integration.name)}`}
      className="block group"
    >
      <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer">
        <CardContent className="p-4 flex flex-col items-center text-center h-full">
          <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center p-3 mb-3 group-hover:scale-110 transition-transform duration-300">
            <img 
              src={integration.logo} 
              alt={integration.name} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12">' + integration.name.substring(0, 2).toUpperCase() + '</text></svg>';
              }}
            />
          </div>
          
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{integration.name}</h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{integration.description}</p>
          
          <Badge variant="secondary" className="text-xs">Available</Badge>
        </CardContent>
      </Card>
    </a>
  );
}

