'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import duaJsonFormat from '@/data/challenge-json-format.json'
import { useToast } from '@/hooks/use-toast'
import { FileJson, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

export default function JsonImportClient() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(duaJsonFormat, null, 2))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleJsonPaste = () => {
    try {
      if (!jsonInput) return
      setLoading(true)
      const parsed = JSON.parse(jsonInput)

      Object.keys(parsed).forEach(key => {
        const element = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement
        if (element) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = String(parsed[key] || '')
            const event = new Event('input', { bubbles: true })
            element.dispatchEvent(event)
          }
        }

        const selectTrigger = document.querySelector(`[name="${key}"]`)
        if (selectTrigger && parsed[key]) {
          const selectButton = selectTrigger.closest('button')
          if (selectButton) {
            selectButton.click()
            setTimeout(() => {
              const option = document.querySelector(`[data-value="${parsed[key]}"]`) as HTMLElement
              if (option) option.click()
            }, 100)
          }
        }

        if (key === 'is_featured' || key === 'is_active') {
          const checkbox = document.getElementById(key) as HTMLInputElement
          if (checkbox) {
            checkbox.checked = Boolean(parsed[key])
            const event = new Event('change', { bubbles: true })
            checkbox.dispatchEvent(event)
          }
        }
      })

      toast({ title: 'Success', description: 'JSON data loaded successfully! ✅' })
      setLoading(false)
    } catch (error) {
      console.log(error)
      toast({ title: 'Error', description: 'Invalid JSON format. Please check and try again. ❌' })
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setLoading(true)
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const content = e.target?.result as string
          setJsonInput(content)

          setTimeout(() => {
            const parsed = JSON.parse(content)
            Object.keys(parsed).forEach(key => {
              const element = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement
              if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                  element.value = String(parsed[key] || '')
                  const event = new Event('input', { bubbles: true })
                  element.dispatchEvent(event)
                }
              }

              if (key === 'is_featured' || key === 'is_active') {
                const checkbox = document.getElementById(key) as HTMLInputElement
                if (checkbox) {
                  checkbox.checked = Boolean(parsed[key])
                  const event = new Event('change', { bubbles: true })
                  checkbox.dispatchEvent(event)
                }
              }
            })

            alert('JSON file loaded successfully! ✅')
          }, 100)
        } catch (error) {
          alert('Invalid JSON file. Please check and try again. ❌')
        }
      }
      reader.readAsText(file)
    }
    setLoading(false)
  }

  return (
    <Card className="border-dashed border-2 bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Import from JSON
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jsonInput">Paste or Edit JSON Data</Label>
          <Textarea
            id="jsonInput"
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button type="button" onClick={handleJsonPaste} disabled={!jsonInput} className="w-full">
            Load JSON Data
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jsonFile">Upload JSON File</Label>
          <div className="flex gap-2">
            <Input
              id="jsonFile"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose JSON File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
