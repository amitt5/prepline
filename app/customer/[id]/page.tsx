import Link from "next/link"
import { Header } from "@/components/header"
import { UploadFilesModal } from "@/components/upload-files-modal"
import { GenerateAnalysisModal } from "@/components/generate-analysis-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, Download, Eye } from "lucide-react"

// Mock data for Acme Corp
const mockFiles = [
  {
    name: "call_dec15_discovery.mp3",
    date: "Dec 15, 2024",
    type: "audio" as const,
    size: "2.3 MB",
  },
  {
    name: "Email thread: Pricing discussion",
    date: "Dec 15, 2024",
    type: "email" as const,
  },
  {
    name: "call_dec8_demo.mp3",
    date: "Dec 8, 2024",
    type: "audio" as const,
    size: "3.1 MB",
  },
  {
    name: "Email thread: Initial inquiry",
    date: "Nov 30, 2024",
    type: "email" as const,
  },
]

const mockAnalyses = [
  {
    id: "latest",
    date: "Dec 15, 2024",
    filesCount: 4,
    preview: "Key stakeholder Eva is concerned about pricing flexibility and...",
  },
  {
    id: "dec8",
    date: "Dec 8, 2024",
    filesCount: 2,
    preview: "Initial discovery call revealed strong interest in automation...",
  },
]

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customerName = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

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
                <CardTitle>Files ({mockFiles.length})</CardTitle>
                <UploadFilesModal customerName={customerName} />
              </CardHeader>
              <CardContent className="space-y-4">
                {mockFiles.map((file, index) => (
                  <div key={index}>
                    {index === 0 || file.date !== mockFiles[index - 1].date ? (
                      <p className="text-sm font-medium text-muted-foreground mb-2">{file.date}</p>
                    ) : null}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {file.type === "audio" ? (
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        {file.type === "audio" && <p className="text-xs text-muted-foreground">{file.size}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Analyses Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Analyses ({mockAnalyses.length})</CardTitle>
                <GenerateAnalysisModal customerId={id} files={mockFiles} />
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAnalyses.map((analysis) => (
                  <div key={analysis.id} className="p-4 rounded-lg border border-border space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{analysis.date}</p>
                      <p className="text-xs text-muted-foreground">Analyzed {analysis.filesCount} files</p>
                    </div>
                    <p className="text-sm">{analysis.preview}</p>
                    <div className="flex gap-2">
                      <Link href={`/customer/${id}/analysis/${analysis.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
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
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
