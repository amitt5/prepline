import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/client"

function formatDate(dateString?: string | null) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Helper to parse markdown-like sections and render them
function parseSection(content: string | null | undefined): string {
  if (!content) return ""
  // Remove section headers if they exist (## Section Name)
  return content.replace(/^##\s*[^\n]+\n?/gm, "").trim()
}

// Helper to extract bullet points from text
function extractBulletPoints(text: string): string[] {
  const lines = text.split("\n")
  const bullets: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    // Match various bullet formats: •, -, *, or numbered
    if (/^[•\-\*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[•\-\*\d\.]\s+/, ""))
    } else if (trimmed && !trimmed.startsWith("#") && trimmed.length > 10) {
      // Also include substantial non-header lines
      bullets.push(trimmed)
    }
  }
  return bullets.length > 0 ? bullets : [text]
}

export default async function AnalysisViewPage({ params }: { params: Promise<{ id: string; analysisId: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return null
  }

  const { id, analysisId } = await params

  // Load customer to verify ownership and get name
  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (customerError || !customer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Customer not found</h1>
          </div>
        </main>
      </div>
    )
  }

  const customerName = customer.name ?? "Customer"

  // Load analysis
  const { data: analysis, error: analysisError } = await supabaseAdmin
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("customer_id", id)
    .single()

  if (analysisError || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/customer/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Analysis not found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            This analysis doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </main>
      </div>
    )
  }

  const analysisDate = formatDate(analysis.created_at)
  const filesCount = Array.isArray(analysis.files_analyzed) ? analysis.files_analyzed.length : 0
  const content = analysis.content || {}

  // Extract sections from content
  const tldr = parseSection(content.tldr || "")
  // const tldr = parseSection(content.tldr || content.fullText?.split("##")[0] || "")
  const stakeholders = parseSection(content.stakeholders || "")
  const dealStatus = parseSection(content.dealStatus || "")
  const nextCallStrategy = parseSection(content.nextCallStrategy || "")
  const competitiveContext = parseSection(content.competitiveContext || "")
  const risks = parseSection(content.risks || "")
  const fullText = content.fullText || ""

  // If we have fullText but no parsed sections, try to extract from fullText
  const hasParsedSections = !!(content.tldr || content.stakeholders || content.dealStatus)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/customer/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to {customerName}</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Analysis · {analysisDate || "Unknown date"}</h1>
                <p className="text-sm text-muted-foreground">Analyzed {filesCount} file{filesCount !== 1 ? "s" : ""}</p>
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
                {tldr && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">TL;DR</h2>
                    <ul className="space-y-2 list-none pl-0">
                      {extractBulletPoints(tldr).map((point, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Stakeholder Map Section */}
                {stakeholders && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Stakeholder Map</h2>
                    <div className="space-y-6 whitespace-pre-wrap text-sm">{stakeholders}</div>
                  </section>
                )}

                {/* Deal Status & Blockers */}
                {dealStatus && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Deal Status & Blockers</h2>
                    <div className="space-y-4 whitespace-pre-wrap text-sm">{dealStatus}</div>
                  </section>
                )}

                {/* Next Call Strategy */}
                {nextCallStrategy && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Next Call Strategy</h2>
                    <div className="space-y-4 whitespace-pre-wrap text-sm">{nextCallStrategy}</div>
                  </section>
                )}

                {/* Competitive Context */}
                {competitiveContext && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Competitive Context</h2>
                    <div className="space-y-4 whitespace-pre-wrap text-sm">{competitiveContext}</div>
                  </section>
                )}

                {/* Key Risks */}
                {risks && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4 border-b border-border pb-2">Key Risks</h2>
                    <div className="whitespace-pre-wrap text-sm">
                      {risks.split("\n").map((line, idx) => {
                        const trimmed = line.trim()
                        if (!trimmed) return null
                        if (/^[•\-\*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
                          return (
                            <div key={idx} className="flex gap-2 mb-1">
                              <span className="text-primary">•</span>
                              <span>{trimmed.replace(/^[•\-\*\d\.]\s+/, "")}</span>
                            </div>
                          )
                        }
                        return <div key={idx}>{line}</div>
                      })}
                    </div>
                  </section>
                )}

                {/* Fallback: If no parsed sections, show full text */}
                {!hasParsedSections && fullText && (
                  <section>
                    <div className="whitespace-pre-wrap text-sm">{fullText}</div>
                  </section>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
