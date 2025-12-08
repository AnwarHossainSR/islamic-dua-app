import { Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { authenticateCredential, isWebAuthnSupported } from "@/lib/webauthn/client";

interface BiometricLoginProps {
  onError: (error: string) => void;
  onSuccess: () => void;
}

export function BiometricLogin({ onError, onSuccess }: BiometricLoginProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSupported(isWebAuthnSupported());
  }, []);

  const handleBiometricLogin = async () => {
    if (!isSupported) {
      onError("Biometric authentication is not supported in this browser");
      return;
    }

    setIsLoading(true);

    try {
      const optionsResponse = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!optionsResponse.ok) {
        throw new Error("Failed to get authentication options");
      }

      const options = await optionsResponse.json();
      const credential = await authenticateCredential(options);

      const authResponse = await fetch("/api/webauthn/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || "Authentication failed");
      }

      const result = await authResponse.json();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.user.email,
        password: result.user.id,
      });

      if (signInError) throw signInError;

      onSuccess();
      navigate("/");
    } catch (error) {
      console.error("Biometric login error:", error);
      onError(error instanceof Error ? error.message : "Biometric authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleBiometricLogin}
      disabled={isLoading}
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {isLoading ? "Authenticating..." : "Sign in with Fingerprint"}
    </Button>
  );
}
