import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Target, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Never walk into a sales call unprepared
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Upload your call recordings and emails. Get a strategic brief in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                <a href="#example">See Example</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Upload</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Add call recordings and email threads for each customer
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Analyze</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI analyzes stakeholders, objections, and strategic context
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Prepare</h3>
                <p className="text-muted-foreground leading-relaxed">Download your prep doc before every call</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Output Section */}
      <section id="example" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">See what you get</h2>

            <Card className="border-2">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b border-border pb-2">TL;DR</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Key decision maker Eva (CFO) is concerned about pricing flexibility</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Technical champion Sarah is sold, but needs exec buy-in</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Deal is stalled on custom integration requirements</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Competitor "CompetitorCo" is also being evaluated</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Next call objective: Address CFO concerns, present integration timeline</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b border-border pb-2">Stakeholder Map</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Eva Chen - CFO</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Authority:</span> Final decision maker
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Cares about:</span> ROI, pricing predictability, integration costs
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah Kim - VP Engineering</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Authority:</span> Technical champion, high influence
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Status:</span> Internally advocating for solution
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold border-b border-border pb-2">Next Call Strategy</h3>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Primary objective:</span> Get CFO comfortable with
                    pricing and secure commitment to security review
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center pt-4">
              <Button asChild size="lg">
                <Link href="/signup">Sign up to create your own</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">Built by Alex Chen & Jordan Smith</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
