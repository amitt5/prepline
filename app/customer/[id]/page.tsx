import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Header } from "@/components/header"
import { UploadFilesModal } from "@/components/upload-files-modal"
import { GenerateAnalysisModal } from "@/components/generate-analysis-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, Download, Eye } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/client"

type FileRecord = {
  id: string
  name: string
  type: "audio" | "email"
  file_size?: number | null
  occurred_at?: string | null
  created_at?: string | null
  content?: string | null
}

type AnalysisRecord = {
  id: string
  created_at?: string | null
  files_analyzed?: string[] | null
  content?: any
}

function formatDate(dateString?: string | null) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString()
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return null
  }

  const { id } = await params

  // Load customer and make sure it belongs to the current user
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
                <span className="sr-only">Back to customers</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Customer not found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            This customer doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </main>
      </div>
    )
  }

  const customerName: string = customer.name ?? "Customer"

  // Load files for this customer
  const { data: files, error: filesError } = await supabaseAdmin
    .from("files")
    .select("*")
    .eq("customer_id", id)
    .order("occurred_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  const typedFiles = ((files ?? []) as FileRecord[]).map((file) => {
    const date = file.occurred_at ?? file.created_at ?? null
    return {
      ...file,
      displayDate: formatDate(date),
      sizeLabel: file.file_size ? `${(file.file_size / (1024 * 1024)).toFixed(1)} MB` : null,
      // For GenerateAnalysisModal compatibility
      date: formatDate(date),
    }
  })

  // Load analyses for this customer
  const { data: analyses, error: analysesError } = await supabaseAdmin
    .from("analyses")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })

  const typedAnalyses = ((analyses ?? []) as AnalysisRecord[]).map((analysis) => {
    const date = formatDate(analysis.created_at ?? null)
    const filesCount = Array.isArray(analysis.files_analyzed) ? analysis.files_analyzed.length : 0
    const rawContent = analysis.content
    const previewSource =
      (rawContent && (rawContent.tldr || rawContent.summary || rawContent.fullText)) || ""
    const preview =
      typeof previewSource === "string"
        ? `${previewSource.slice(0, 120)}${previewSource.length > 120 ? "..." : ""}`
        : ""

    return {
      ...analysis,
      displayDate: date,
      filesCount,
      preview,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to customers</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{customerName}</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Files Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Files ({typedFiles.length})</CardTitle>
                <UploadFilesModal customerId={id} customerName={customerName} />
              </CardHeader>
              <CardContent className="space-y-4">
                {typedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
                ) : (
                  typedFiles.map((file, index) => (
                    <div key={file.id ?? index}>
                      {index === 0 ||
                      file.displayDate !== typedFiles[index - 1]?.displayDate ? (
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {file.displayDate || "Unknown date"}
                        </p>
                      ) : null}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        {file.type === "audio" ? (
                          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.type === "audio" && file.sizeLabel && (
                            <p className="text-xs text-muted-foreground">{file.sizeLabel}</p>
                          )}
                          {file.type === "audio" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {file.content ? "✓ Transcribed" : "⏳ Transcribing..."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Analyses Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Analyses ({typedAnalyses.length})</CardTitle>
                <GenerateAnalysisModal customerId={id} files={typedFiles} />
              </CardHeader>
              <CardContent className="space-y-4">
                {analysesError && (
                  <p className="text-sm text-red-500">Failed to load analyses. Please try again.</p>
                )}
                {typedAnalyses.length === 0 && !analysesError ? (
                  <p className="text-sm text-muted-foreground">
                    No analyses yet. Generate your first one once you have email threads uploaded.
                  </p>
                ) : (
                  typedAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-4 rounded-lg border border-border space-y-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {analysis.displayDate || "Unknown date"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Analyzed {analysis.filesCount} files
                        </p>
                      </div>
                      {analysis.preview && <p className="text-sm">{analysis.preview}</p>}
                      <div className="flex gap-2">
                        <Link
                          href={`/customer/${id}/analysis/${analysis.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Analysis
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
