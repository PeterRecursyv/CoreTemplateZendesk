import { useState, useEffect, useMemo } from "react";
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

        {/* Search Bar - Static */}
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

        {/* Animated Hub and Spoke Visualization */}
        <HubSpokeVisualization 
          hubVendor={hubVendor} 
          spokeIntegrations={filteredIntegrations}
          searchActive={searchQuery.trim().length > 0}
        />

        {/* Hub Vendor Details Card */}
        {hubVendor && (
          <Card className="max-w-4xl mx-auto mt-12 border-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center p-4">
                    <img src={hubVendor.logo} alt={hubVendor.name} className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{hubVendor.name}</h2>
                    <p className="text-muted-foreground">{hubVendor.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hubVendor.categories.map((category: string) => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Available Data Points
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      {hubVendor.dataPoints.map((point: string) => (
                        <div key={point} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Integration Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hubVendor.features.map((feature: string) => (
                        <Badge key={feature} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Integrations Grid - Fallback for search results */}
        {searchQuery.trim().length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">
              {filteredIntegrations.length > 0 
                ? `Found ${filteredIntegrations.length} integration${filteredIntegrations.length !== 1 ? 's' : ''}`
                : 'No integrations found'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredIntegrations.map((integration: SpokeIntegration) => (
                <IntegrationCard key={integration.id} integration={integration} hubVendor={hubVendor} />
              ))}
            </div>
          </div>
        )}
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

// Animated Hub and Spoke Visualization Component
function HubSpokeVisualization({ 
  hubVendor, 
  spokeIntegrations,
  searchActive 
}: { 
  hubVendor: HubVendor | undefined; 
  spokeIntegrations: SpokeIntegration[];
  searchActive: boolean;
}) {
  if (!hubVendor || spokeIntegrations.length === 0) return null;

  // Don't show animation when searching
  if (searchActive) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto" style={{ height: '600px' }}>
      {/* Central Hub */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center p-6 border-4 border-primary/30">
            <img src={hubVendor.logo} alt={hubVendor.name} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Orbiting Spokes */}
      {spokeIntegrations.map((integration: SpokeIntegration, index: number) => (
        <OrbitingIntegration
          key={integration.id}
          integration={integration}
          hubVendor={hubVendor}
          index={index}
          total={spokeIntegrations.length}
        />
      ))}

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {spokeIntegrations.map((integration: SpokeIntegration, index: number) => {
          const angle = (index / spokeIntegrations.length) * 2 * Math.PI;
          const radius = 250;
          const x = 50 + Math.cos(angle) * (radius / 6); // Percentage-based
          const y = 50 + Math.sin(angle) * (radius / 6);
          
          return (
            <line
              key={integration.id}
              x1="50%"
              y1="50%"
              x2={`${x}%`}
              y2={`${y}%`}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="text-muted-foreground/20"
              style={{
                animation: `fadeInOut ${3 + (index % 3)}s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Orbiting Integration Component
function OrbitingIntegration({ 
  integration, 
  hubVendor,
  index, 
  total 
}: { 
  integration: SpokeIntegration;
  hubVendor: HubVendor;
  index: number; 
  total: number;
}) {
  const angle = (index / total) * 360;
  const radius = 250; // pixels from center
  const duration = 60 + (index % 3) * 10; // Varying orbit speeds

  return (
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        animation: `orbit ${duration}s linear infinite`,
        animationDelay: `${-index * (duration / total)}s`,
        '--orbit-radius': `${radius}px`,
        '--orbit-angle': `${angle}deg`,
      } as React.CSSProperties}
    >
      <div 
        className="relative group cursor-pointer"
        style={{
          animation: `counterRotate ${duration}s linear infinite`,
          animationDelay: `${-index * (duration / total)}s`,
        }}
      >
        {/* Integration Bubble */}
        <a
          href={`/purchase?hub=${hubVendor.id}&spoke=${integration.id}&hubName=${encodeURIComponent(hubVendor.name)}&spokeName=${encodeURIComponent(integration.name)}`}
          className="block"
        >
          <div className="w-20 h-20 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-3 border-2 border-transparent hover:border-primary/50 hover:scale-110">
            <img 
              src={integration.logo} 
              alt={integration.name} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12">' + integration.name.substring(0, 2).toUpperCase() + '</text></svg>';
              }}
            />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
            <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg text-sm border">
              <div className="font-semibold">{integration.name}</div>
              <div className="text-xs text-muted-foreground">{integration.description}</div>
              <Badge variant="secondary" className="mt-1 text-xs">Available</Badge>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// Integration Card Component (for search results)
function IntegrationCard({ integration, hubVendor }: { integration: SpokeIntegration; hubVendor: HubVendor | undefined }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
              <img 
                src={integration.logo} 
                alt={integration.name} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12">' + integration.name.substring(0, 2).toUpperCase() + '</text></svg>';
                }}
              />
            </div>
            <Badge>Available</Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">{integration.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {integration.categories.map((category: string) => (
              <Badge key={category} variant="outline" className="text-xs">{category}</Badge>
            ))}
          </div>
          
          <Button className="w-full" asChild>
            <a href={`/purchase?hub=${hubVendor?.id}&spoke=${integration.id}&hubName=${encodeURIComponent(hubVendor?.name || '')}&spokeName=${encodeURIComponent(integration.name)}`}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

