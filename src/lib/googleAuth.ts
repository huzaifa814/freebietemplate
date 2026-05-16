'use client';

// Lightweight wrapper around Google Identity Services (GIS).
// Handles Sign-In and a separate access-token flow for Drive scope.

let gisLoadPromise: Promise<void> | null = null;
function loadGIS(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as unknown as { google?: { accounts?: unknown } }).google?.accounts) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
  return gisLoadPromise;
}

export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
  sub: string;
};

const PROFILE_KEY = 'freebietemplate.googleProfile';
const TOKEN_KEY = 'freebietemplate.googleAccessToken';

export function getStoredProfile(): GoogleProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearStoredProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

/** Decode a JWT payload (no verification — purely for display). */
function decodeJwt(token: string): Record<string, unknown> {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch { return {}; }
}

/** Trigger the Sign In With Google credential flow.
 *  Returns the user profile on success, throws on cancel/error. */
export async function signInWithGoogle(clientId: string): Promise<GoogleProfile> {
  await loadGIS();
  return new Promise<GoogleProfile>((resolve, reject) => {
    const google = (window as unknown as { google: { accounts: { id: { initialize: (o: unknown) => void; prompt: (cb?: (n: { isNotDisplayed?: () => boolean; isSkippedMoment?: () => boolean; getNotDisplayedReason?: () => string; getSkippedReason?: () => string }) => void) => void } } } }).google;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        const payload = decodeJwt(response.credential);
        const profile: GoogleProfile = {
          email: String(payload.email || ''),
          name: String(payload.name || ''),
          picture: payload.picture as string | undefined,
          sub: String(payload.sub || ''),
        };
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* ignore */ }
        resolve(profile);
      },
      auto_select: false,
    });
    google.accounts.id.prompt((n) => {
      if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.()) {
        reject(new Error(n.getNotDisplayedReason?.() || n.getSkippedReason?.() || 'Sign-in dismissed'));
      }
    });
  });
}

/** Request an access token for Drive scope (drive.file — only files we create). */
export async function getDriveAccessToken(clientId: string): Promise<string> {
  await loadGIS();
  return new Promise<string>((resolve, reject) => {
    const google = (window as unknown as { google: { accounts: { oauth2: { initTokenClient: (o: unknown) => { requestAccessToken: (o?: unknown) => void } } } } }).google;
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.access_token) {
          try { sessionStorage.setItem(TOKEN_KEY, resp.access_token); } catch { /* ignore */ }
          resolve(resp.access_token);
        } else {
          reject(new Error(resp.error || 'No access token'));
        }
      },
      error_callback: (err: { type?: string }) => reject(new Error(err?.type || 'Token request failed')),
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

/** Upload a Blob to the user's Google Drive (drive.file scope).
 *  Returns the new file's id + webViewLink. */
export async function uploadToDrive(accessToken: string, blob: Blob, filename: string, mimeType: string): Promise<{ id: string; webViewLink: string }> {
  const metadata = { name: filename, mimeType };
  const boundary = '-------freebietemplate-' + Math.random().toString(36).slice(2);
  const blobText = await blob.arrayBuffer().then((b) => {
    let bin = '';
    const bytes = new Uint8Array(b);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  });
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) + `\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    blobText + `\r\n` +
    `--${boundary}--`;

  const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Drive upload failed: ${resp.status} ${err.slice(0, 200)}`);
  }
  return resp.json() as Promise<{ id: string; webViewLink: string }>;
}
