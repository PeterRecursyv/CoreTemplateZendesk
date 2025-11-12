import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function About() {
  const { data: branding } = trpc.config.branding.useQuery();

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
            <a href="/about" className="text-sm font-medium text-primary transition-colors">
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

      {/* Main Content */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">

          {/* About Us Content */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Who We Are</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {branding?.aboutUs}
              </p>
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Fully Managed Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We handle all aspects of your integration, from initial setup to ongoing maintenance and support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  No Coding Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our platform eliminates the need for technical expertise or time-intensive mapping exercises.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Secure & Reliable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Data is securely encrypted in transit with proactive monitoring and built-in resilience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Expert Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our professional team supports hundreds of IT service providers globally with proven expertise.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
              <CardDescription>
                Ready to streamline your integrations? Contact us today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <a 
                    href={`mailto:${branding?.contactEmail}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {branding?.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>UK: {branding?.contactPhoneUK}</div>
                    <div>US: {branding?.contactPhoneUS}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">
                    {branding?.address}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" asChild>
                  <a href={`mailto:${branding?.contactEmail}`}>
                    Contact Us Today
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
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

