"use client"

import { Button } from "@/components/ui/button"
import {
  exportDuasToJSON,
  exportDuasToCSV,
  exportCategoriesToJSON,
  exportTagsToJSON,
} from "@/lib/actions/import-export"
import { Download } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ExportButtons() {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleExport(type: "duas-json" | "duas-csv" | "categories" | "tags") {
    setLoading(type)

    try {
      let result
      let filename
      let mimeType

      switch (type) {
        case "duas-json":
          result = await exportDuasToJSON()
          filename = `duas-${new Date().toISOString().split("T")[0]}.json`
          mimeType = "application/json"
          break
        case "duas-csv":
          result = await exportDuasToCSV()
          filename = `duas-${new Date().toISOString().split("T")[0]}.csv`
          mimeType = "text/csv"
          break
        case "categories":
          result = await exportCategoriesToJSON()
          filename = `categories-${new Date().toISOString().split("T")[0]}.json`
          mimeType = "application/json"
          break
        case "tags":
          result = await exportTagsToJSON()
          filename = `tags-${new Date().toISOString().split("T")[0]}.json`
          mimeType = "application/json"
          break
      }

      if (result.error) {
        toast({
          title: "Export Failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Create and download file
      const content = type === "duas-csv" ? result.data : JSON.stringify(result.data, null, 2)
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Downloaded ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start bg-transparent"
        onClick={() => handleExport("duas-json")}
        disabled={loading === "duas-json"}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading === "duas-json" ? "Exporting..." : "Export Duas (JSON)"}
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start bg-transparent"
        onClick={() => handleExport("duas-csv")}
        disabled={loading === "duas-csv"}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading === "duas-csv" ? "Exporting..." : "Export Duas (CSV)"}
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start bg-transparent"
        onClick={() => handleExport("categories")}
        disabled={loading === "categories"}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading === "categories" ? "Exporting..." : "Export Categories (JSON)"}
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start bg-transparent"
        onClick={() => handleExport("tags")}
        disabled={loading === "tags"}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading === "tags" ? "Exporting..." : "Export Tags (JSON)"}
      </Button>
    </div>
  )
}
