import { FileJson, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export default function JsonImportClient() {
  const [jsonInput, setJsonInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/data/challenge-json-format.json")
      .then((res) => res.json())
      .then((data) => setJsonInput(JSON.stringify(data, null, 2)))
      .catch(() => {});
  }, []);

  const handleJsonPaste = () => {
    try {
      if (!jsonInput) return;
      const parsed = JSON.parse(jsonInput);

      Object.keys(parsed).forEach((key) => {
        const element = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement;
        if (element) {
          if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.value = String(parsed[key] || "");
            const event = new Event("input", { bubbles: true });
            element.dispatchEvent(event);
          }
        }

        if (key === "is_featured" || key === "is_active") {
          const checkbox = document.getElementById(key) as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = Boolean(parsed[key]);
            const event = new Event("change", { bubbles: true });
            checkbox.dispatchEvent(event);
          }
        }
      });

      toast.success("JSON data loaded successfully! ✅");
    } catch (_error) {
      toast.error("Invalid JSON format. Please check and try again. ❌");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setJsonInput(content);

          setTimeout(() => {
            const parsed = JSON.parse(content);
            Object.keys(parsed).forEach((key) => {
              const element = document.getElementById(key) as
                | HTMLInputElement
                | HTMLTextAreaElement;
              if (element) {
                if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                  element.value = String(parsed[key] || "");
                  const event = new Event("input", { bubbles: true });
                  element.dispatchEvent(event);
                }
              }

              if (key === "is_featured" || key === "is_active") {
                const checkbox = document.getElementById(key) as HTMLInputElement;
                if (checkbox) {
                  checkbox.checked = Boolean(parsed[key]);
                  const event = new Event("change", { bubbles: true });
                  checkbox.dispatchEvent(event);
                }
              }
            });

            toast.success("JSON file loaded successfully! ✅");
          }, 100);
        } catch (_error) {
          toast.error("Invalid JSON file. Please check and try again. ❌");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="border-dashed border-2 bg-muted/50">
      <CardHeader>
        <h3 className="font-semibold flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Import from JSON
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jsonInput">Paste or Edit JSON Data</Label>
          <Textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
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
  );
}
