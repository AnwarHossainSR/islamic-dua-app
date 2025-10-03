import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButtons } from "@/components/admin/export-buttons"
import { ImportForm } from "@/components/admin/import-form"
import { Download, Upload } from "lucide-react"

export default function ImportExportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Import/Export</h1>
        <p className="text-muted-foreground">Bulk manage your content with import and export tools</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle>Export Data</CardTitle>
            </div>
            <CardDescription>Download your content in JSON or CSV format</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportButtons />
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Import Data</CardTitle>
            </div>
            <CardDescription>Upload JSON files to bulk import duas</CardDescription>
          </CardHeader>
          <CardContent>
            <ImportForm />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import/Export Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Export Formats</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>JSON: Complete data with all relationships (recommended for backup and import)</li>
              <li>CSV: Simplified format for spreadsheet editing (duas only)</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Import Requirements</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Only JSON format is supported for imports</li>
              <li>Ensure category IDs exist before importing duas</li>
              <li>Duplicate entries will be rejected by the database</li>
              <li>Large imports may take several seconds to process</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
