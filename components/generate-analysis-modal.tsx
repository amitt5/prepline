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

interface FileItem {
  name: string
  date: string
  type: "audio" | "email"
}

export function GenerateAnalysisModal({ customerId, files }: { customerId: string; files: FileItem[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Mock behavior: show loading for 2-3 seconds then navigate
    setTimeout(() => {
      setIsGenerating(false)
      setOpen(false)
      router.push(`/customer/${customerId}/analysis/latest`)
    }, 2500)
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
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
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
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">Note: This may take 1-2 minutes depending on file size</p>
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
