"use client"

import type React from "react"

import { useState } from "react"
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

export function UploadFilesModal({ customerName }: { customerName: string }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [emailText, setEmailText] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    // Mock behavior: show success toast
    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file(s) uploaded for ${customerName}`,
    })
    setOpen(false)
    setFiles([])
    setEmailText("")
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 && !emailText.trim()}>
            Upload {files.length > 0 && `${files.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
