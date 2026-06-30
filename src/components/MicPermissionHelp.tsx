interface MicPermissionHelpProps {
  onRequestMic: () => void;
  isListening: boolean;
  error: string | null;
}

export function MicPermissionHelp({ onRequestMic, isListening, error }: MicPermissionHelpProps) {
  if (isListening) return null;

  return (
    <div className="permission-help">
      <p className="permission-title">Microphone required</p>
      <p className="permission-desc">
        Piano Coach listens to your piano — it does not play audio through your iPad. When you
        tap the button below, Safari should ask: <strong>"Allow microphone?"</strong> — tap Allow.
      </p>
      <p className="permission-desc permission-desc--small">
        If you don't see a prompt: Settings → Safari → Microphone → Allow, then reload this page.
      </p>
      <button type="button" className="btn-primary btn-large" onClick={onRequestMic}>
        Enable microphone & start
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
