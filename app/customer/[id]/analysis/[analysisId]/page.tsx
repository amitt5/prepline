import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

export default function AnalysisViewPage({ params }: { params: { id: string; analysisId: string } }) {
  const customerName = params.id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/customer/${params.id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to {customerName}</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Analysis · Dec 15, 2024</h1>
                <p className="text-sm text-muted-foreground">Analyzed 4 files</p>
              </div>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 prose prose-invert max-w-none">
              <div className="space-y-8">
                {/* TL;DR Section */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">TL;DR</h2>
                  <ul className="space-y-2 list-none pl-0">
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
                </section>

                {/* Stakeholder Map Section */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Stakeholder Map</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Eva Chen - CFO</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Authority:</strong> Final decision maker
                        </p>
                        <p>
                          <strong>Cares about:</strong> ROI, pricing predictability, integration costs
                        </p>
                        <p>
                          <strong>Quote:</strong>{" "}
                          <span className="italic">
                            "We need to understand the total cost of ownership" [Call Dec 15, 18:32]
                          </span>
                        </p>
                        <p>
                          <strong>Concerns:</strong>
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Unclear pricing for enterprise tier</li>
                          <li>Implementation timeline risks</li>
                        </ul>
                        <p>
                          <strong>Engagement strategy:</strong> Prepare detailed ROI analysis, offer phased rollout
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">Sarah Kim - VP Engineering</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Authority:</strong> Technical champion, high influence
                        </p>
                        <p>
                          <strong>Cares about:</strong> API capabilities, security, developer experience
                        </p>
                        <p>
                          <strong>Quote:</strong>{" "}
                          <span className="italic">
                            "The API docs look solid, but we need to test SSO" [Call Dec 8, 22:15]
                          </span>
                        </p>
                        <p>
                          <strong>Status:</strong> Internally advocating for solution
                        </p>
                        <p>
                          <strong>Engagement strategy:</strong> Provide SSO implementation guide, offer technical
                          deep-dive
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">Michael Torres - Director of Sales Operations</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Authority:</strong> End user, influences decision
                        </p>
                        <p>
                          <strong>Cares about:</strong> Ease of use, team adoption, reporting capabilities
                        </p>
                        <p>
                          <strong>Quote:</strong>{" "}
                          <span className="italic">"My team needs something they can use day one" [Email Dec 12]</span>
                        </p>
                        <p>
                          <strong>Status:</strong> Cautiously optimistic, wants to see demos
                        </p>
                        <p>
                          <strong>Engagement strategy:</strong> Schedule hands-on demo with sales team, share onboarding
                          timeline
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Deal Status & Blockers */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Deal Status & Blockers</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">What's working:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Strong technical fit confirmed</li>
                        <li>Champion actively selling internally</li>
                        <li>Timeline aligns with their Q1 goals</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">What's stalling:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>CFO hasn't seen pricing justification</li>
                        <li>Custom Salesforce integration not scoped</li>
                        <li>Security review pending</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Unanswered questions:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>"Can you support our custom SSO provider?" [Email Dec 14]</li>
                        <li>"What's your SLA for enterprise?" [Call Dec 15, 31:20]</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Next Call Strategy */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Next Call Strategy</h2>
                  <div className="space-y-4">
                    <p>
                      <strong>Primary objective:</strong> Get CFO comfortable with pricing and secure commitment to
                      security review
                    </p>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Key questions to ask:</h3>
                      <ol className="list-decimal pl-6 space-y-1">
                        <li>"What specific ROI metrics matter most for your Q1 budget approval?"</li>
                        <li>"Who needs to sign off on the security review, and what's their timeline?"</li>
                        <li>"If we can solve the Salesforce integration, what's your ideal go-live date?"</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Proof points to provide:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Case study: Similar company reduced sales cycle by 40%</li>
                        <li>Integration timeline: 2-week standard implementation</li>
                        <li>Security: SOC 2 Type II compliance documentation</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Objections to pre-empt:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>"Pricing seems high" → Show 6-month ROI calculation</li>
                        <li>"Implementation takes too long" → Offer dedicated onboarding engineer</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Competitive Context */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Competitive Context</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Alternatives being considered:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>CompetitorCo (mentioned in email Dec 12)</li>
                        <li>Building in-house (Sarah mentioned "we could build this" [Call Dec 8, 45:10])</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Your differentiation:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>10x faster implementation than CompetitorCo</li>
                        <li>Purpose-built for their use case vs. general-purpose tool</li>
                        <li>Dedicated customer success vs. self-service only</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Key Risks */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Key Risks</h2>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>CFO may need more financial justification</li>
                    <li>Security review could delay by 2-3 weeks</li>
                    <li>Champion Sarah is supportive but doesn't control budget</li>
                  </ul>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
