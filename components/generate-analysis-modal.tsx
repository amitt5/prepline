"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  id?: string
  name: string
  date: string
  type: "audio" | "email"
  content?: string | null
}

export function GenerateAnalysisModal({ customerId, files }: { customerId: string; files: FileItem[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    // Filter to only email files for now (since we're skipping Whisper transcription)
    const emailFiles = files.filter((f) => f.type === "email" && f.id)
    const fileIds = emailFiles.map((f) => f.id!).filter(Boolean)

    if (fileIds.length === 0) {
      toast({
        title: "No email files available",
        description: "Please upload email threads before generating an analysis.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          fileIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate analysis")
      }

      const analysis = await response.json()

      setIsGenerating(false)
      setOpen(false)

      toast({
        title: "Analysis generated successfully",
        description: "Your preparation document is ready.",
      })

      // Navigate to the analysis detail page
      router.push(`/customer/${customerId}/analysis/${analysis.id}`)
      router.refresh()
    } catch (error) {
      setIsGenerating(false)
      toast({
        title: "Failed to generate analysis",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Analysis</DialogTitle>
          <DialogDescription>This analysis will include all files for this customer.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No files available. Upload email threads first.
              </p>
            ) : (
              files.map((file, index) => (
                <div key={file.id || index} className="flex items-center gap-3 text-sm">
                  {file.type === "audio" ? (
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Analysis will include email threads and transcribed audio files.
          </p>
          {files.filter((f) => f.type === "audio" && !f.content).length > 0 && (
            <p className="text-sm text-amber-500 mt-2">
              ⚠️ Some audio files are still being transcribed. They will be included once transcription completes.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
