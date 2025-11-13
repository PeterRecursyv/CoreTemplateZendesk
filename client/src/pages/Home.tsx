import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: hubVendor } = trpc.config.hubVendor.useQuery();
  const { data: spokeIntegrations } = trpc.config.spokeIntegrations.useQuery();
  const { data: branding } = trpc.config.branding.useQuery();

  const integrations = spokeIntegrations || [];

  // Filter integrations based on search
  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) return integrations;
    const query = searchQuery.toLowerCase();
    return integrations.filter(
      (integration: any) =>
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.categories?.some((cat: string) => cat.toLowerCase().includes(query))
    );
  }, [integrations, searchQuery]);

  const handleIntegrationClick = (spoke: any) => {
    setLocation(`/integration?hub=${hubVendor?.id}&spoke=${spoke.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={branding?.logo || "/assets/logos/recursyv-logo.png"}
                alt="Recursyv"
                className="h-16 w-auto object-contain"
              />
            </div>
            <nav className="flex items-center gap-8">
              <a href="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </a>
              <a href="/about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About Us
              </a>
              <a
                href={`mailto:${branding?.contactEmail || "info@recursyv.com"}`}
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex">
        {/* Left Side - Hub Vendor Showcase */}
        <div className="w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="max-w-xl">
            <div className="mb-8">
              <img
                src={hubVendor?.logo || "/assets/logos/zendesk-logo.png"}
                alt={hubVendor?.name || "Hub"}
                className="h-24 w-auto object-contain bg-white rounded-xl p-4 shadow-2xl"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              {hubVendor?.name || "Zendesk"} Integration Hub
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              {hubVendor?.description || "Customer service and engagement platform"}
            </p>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-100">Key Features:</h3>
              {hubVendor?.features?.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-50">{feature}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-50">Bidirectional data synchronization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-50">Real-time updates and notifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-50">Custom field mapping</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-50">Enterprise-grade security</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-blue-700/50 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-2">Available Integrations</p>
              <p className="text-3xl font-bold">{integrations.length}</p>
              <p className="text-sm text-blue-200 mt-2">Connect with your favorite tools</p>
            </div>
          </div>
        </div>

        {/* Right Side - Integrations List */}
        <div className="w-3/5 p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Leaders in ITSM, Service/Help Desk + CRM and Marketing Integrations
              </h2>
              <p className="text-lg text-slate-600">
                Choose an integration to get started with seamless data synchronization
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-base rounded-lg border-2 border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Integrations List */}
            <div className="space-y-3">
              {filteredIntegrations.map((integration: any) => (
                <div
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration)}
                  className="bg-white rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-6 flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <img
                          src={integration.logo}
                          alt={integration.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {integration.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {integration.categories?.map((category: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {searchQuery && filteredIntegrations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No integrations found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-slate-300">
                Email:{" "}
                <a href={`mailto:${branding?.contactEmail || "info@recursyv.com"}`} className="hover:text-blue-400">
                  {branding?.contactEmail || "info@recursyv.com"}
                </a>
              </p>
              <p className="text-slate-300">
                Phone (UK):{" "}
                <a href={`tel:${branding?.contactPhoneUK || "+44 118 380 0142"}`} className="hover:text-blue-400">
                  {branding?.contactPhoneUK || "+44 118 380 0142"}
                </a>
              </p>
              <p className="text-slate-300">
                Phone (US):{" "}
                <a href={`tel:${branding?.contactPhoneUS || "+1 833 749 3781"}`} className="hover:text-blue-400">
                  {branding?.contactPhoneUS || "+1 833 749 3781"}
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Address</h3>
              <p className="text-slate-300">
                {branding?.address || "Recursyv Limited, 400 Thames Valley Park Drive, Reading, RG6 1PT"}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://twitter.com" className="text-slate-300 hover:text-blue-400">
                  Twitter
                </a>
                <a href="https://linkedin.com" className="text-slate-300 hover:text-blue-400">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} Recursyv. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

