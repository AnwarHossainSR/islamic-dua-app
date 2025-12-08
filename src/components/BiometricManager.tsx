import { Fingerprint, Monitor, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { settingsApi } from "@/api/settings.api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Credential {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string;
}

export function BiometricManager() {
  const [isSupported] = useState(
    () => "credentials" in navigator && "PublicKeyCredential" in window
  );
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [loading] = useState(false);

  const fetchCredentials = async () => {
    try {
      const data = await settingsApi.getCredentials();
      setCredentials(data);
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadCredentials = async () => {
      try {
        const data = await settingsApi.getCredentials();
        if (mounted) setCredentials(data);
      } catch (error) {
        console.error("Failed to fetch credentials:", error);
      }
    };
    loadCredentials();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm("Are you sure you want to remove this device?")) return;

    try {
      await settingsApi.deleteCredential(credentialId);
      toast.success("Device removed successfully");
      fetchCredentials();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove device");
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Biometric authentication is not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Devices ({credentials.length})
        </CardTitle>
        <CardDescription>
          Manage your registered fingerprint and face recognition devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding ? (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                placeholder="e.g., iPhone, MacBook, Windows PC"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => toast.info("WebAuthn registration not implemented")}
                disabled={loading}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Add Device"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Device
          </Button>
        )}

        {credentials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Registered Devices</h4>
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{credential.device_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Added {new Date(credential.created_at).toLocaleDateString()}
                      {credential.last_used_at && (
                        <span>
                          {" "}
                          • Last used {new Date(credential.last_used_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCredential(credential.credential_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
