'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';
import { signInWithGoogle, getStoredProfile, clearStoredProfile, getDriveAccessToken, uploadToDrive, GoogleProfile } from '@/lib/googleAuth';

/** Sign-In with Google chip — shows current account or a prompt to sign in.
 *  Hidden entirely when googleClientId is not configured. */
export function SignInBadge() {
  const clientId = siteConfig.googleClientId;
  const [profile, setProfile] = useState<GoogleProfile | null>(null);

  useEffect(() => { setProfile(getStoredProfile()); }, []);

  if (!clientId) return null;

  async function onSignIn() {
    try {
      const p = await signInWithGoogle(clientId);
      setProfile(p);
    } catch (e) {
      console.error(e);
      alert('Sign-in cancelled or blocked. Try again, or check pop-up blockers.');
    }
  }
  function onSignOut() {
    clearStoredProfile();
    setProfile(null);
  }

  if (profile) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {profile.picture && <img src={profile.picture} alt="" className="w-6 h-6 rounded-full" />}
        <span className="text-gray-700 dark:text-gray-300">{profile.email}</span>
        <button onClick={onSignOut} className="text-xs text-gray-500 hover:underline">Sign out</button>
      </div>
    );
  }
  return (
    <button onClick={onSignIn} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm">
      <svg viewBox="0 0 48 48" className="w-4 h-4"><path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.6z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-5c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-.8 2.2-2.1 4-3.8 5.4l6 5c-.4.4 6.5-4.8 6.5-14.4 0-1.3-.1-2.4-.4-3.6z"/></svg>
      Sign in with Google
    </button>
  );
}

/** Save-to-Drive button. Triggers sign-in + Drive scope grant on first click. */
export function DriveSaveButton({ getBlob, filename, mimeType, disabled }: { getBlob: () => Promise<Blob>; filename: string; mimeType: string; disabled?: boolean }) {
  const clientId = siteConfig.googleClientId;
  const [busy, setBusy] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  if (!clientId) return null;

  async function onSave() {
    setBusy(true);
    setSavedUrl(null);
    try {
      // Ensure sign-in (we don't require it but it improves UX consistency)
      if (!getStoredProfile()) {
        try { await signInWithGoogle(clientId); } catch { /* fall through to token request */ }
      }
      const token = await getDriveAccessToken(clientId);
      const blob = await getBlob();
      const result = await uploadToDrive(token, blob, filename, mimeType);
      setSavedUrl(result.webViewLink);
    } catch (e) {
      alert('Save to Drive failed: ' + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onSave}
        disabled={busy || disabled}
        className="px-4 py-3 rounded-lg border-2 border-blue-500 text-blue-600 font-semibold disabled:opacity-50 transition hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center gap-2"
      >
        {busy ? 'Saving…' : (<><span>📁</span><span>Save to Google Drive</span></>)}
      </button>
      {savedUrl && (
        <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline text-center">
          ✓ Saved — open in Drive
        </a>
      )}
    </div>
  );
}
