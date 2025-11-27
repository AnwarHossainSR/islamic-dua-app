export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         'navigator' in window && 
         'credentials' in navigator &&
         'create' in navigator.credentials &&
         'get' in navigator.credentials
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function authenticateCredential(options: any) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser')
  }

  const publicKeyCredentialRequestOptions = {
    ...options,
    challenge: base64ToArrayBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map((cred: any) => ({
      ...cred,
      id: base64ToArrayBuffer(cred.id)
    }))
  }

  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions
  }) as PublicKeyCredential

  if (!credential) {
    throw new Error('Failed to authenticate')
  }

  const response = credential.response as AuthenticatorAssertionResponse

  return {
    id: credential.id,
    rawId: arrayBufferToBase64(credential.rawId),
    response: {
      authenticatorData: arrayBufferToBase64(response.authenticatorData),
      clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
      signature: arrayBufferToBase64(response.signature),
      userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : null
    },
    type: credential.type
  }
}
