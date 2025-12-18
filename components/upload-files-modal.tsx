"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadFilesModalProps {
  customerId: string
  customerName: string
}

export function UploadFilesModal({ customerId, customerName }: UploadFilesModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [emailText, setEmailText] = useState("")
  const [occurredAt, setOccurredAt] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const resetState = () => {
    setFiles([])
    setEmailText("")
    setOccurredAt("")
    setNotes("")
  }

  const handleUpload = async () => {
    if (files.length === 0 && !emailText.trim()) return

    try {
      setIsSubmitting(true)

      // Upload audio files and trigger transcription
      const uploadedFileIds: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        if (occurredAt) formData.append("occurredAt", occurredAt)
        if (notes.trim()) formData.append("notes", notes.trim())

        const response = await fetch(`/api/customers/${customerId}/files`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Failed to upload audio file")
        }

        const fileRecord = await response.json()
        if (fileRecord?.id) {
          uploadedFileIds.push(fileRecord.id)
        }
      }

      // Trigger transcription for uploaded audio files (fire and forget)
      for (const fileId of uploadedFileIds) {
        fetch("/api/transcribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileId }),
        }).catch((err) => {
          console.error("Failed to trigger transcription:", err)
          // Don't fail the upload if transcription fails
        })
      }

      // Upload email content as a separate file record
      if (emailText.trim()) {
        const formData = new FormData()
        formData.append("emailContent", emailText.trim())
        if (occurredAt) formData.append("occurredAt", occurredAt)
        if (notes.trim()) formData.append("notes", notes.trim())

        const response = await fetch(`/api/customers/${customerId}/files`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Failed to upload email thread")
        }
      }

      toast({
        title: "Upload complete",
        description: `${files.length} audio file(s) and ${emailText.trim() ? "1 email thread" : "no emails"} uploaded for ${customerName}`,
      })

      setOpen(false)
      resetState()
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong during upload"
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Files for {customerName}</DialogTitle>
          <DialogDescription>Add call recordings and email threads to build comprehensive analysis.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occurred-at">Conversation date &amp; time</Label>
              <input
                id="occurred-at"
                type="datetime-local"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                When this call or email conversation happened (optional but recommended).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any context like 'Pricing negotiation with Eva (CFO)'..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audio Files</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept=".mp3,.wav,.m4a"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drag audio files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supported: MP3, WAV, M4A (up to 10MB each)</p>
              </label>
            </div>
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-text">Email Threads</Label>
            <Textarea
              id="email-text"
              placeholder="Paste email conversations here..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Include sender, date, and full message content</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isSubmitting || (files.length === 0 && !emailText.trim())}>
            {isSubmitting ? "Uploading..." : `Upload${files.length > 0 ? ` ${files.length} file(s)` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
