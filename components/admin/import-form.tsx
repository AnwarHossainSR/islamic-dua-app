"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importDuasFromJSON } from "@/lib/actions/import-export"
import { Upload } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a JSON file to import",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const content = await file.text()
      const result = await importDuasFromJSON(content)

      if (result.error) {
        toast({
          title: "Import Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.count} duas`,
        })
        setFile(null)
        // Reset file input
        const input = document.getElementById("file-upload") as HTMLInputElement
        if (input) input.value = ""
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to read file",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleImport} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Select JSON File</Label>
        <Input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={!file || loading} className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {loading ? "Importing..." : "Import Duas"}
      </Button>
    </form>
  )
}
