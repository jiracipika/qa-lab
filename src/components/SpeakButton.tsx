/** Read-aloud button: click to hear a section, click again to stop. Hidden when the browser has no speech synthesis. */

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSpeechSupported, speak, stopSpeaking } from "../lib/speech";

export function SpeakButton({ text, label }: { text: string; label: string }) {
  const [speaking, setSpeaking] = useState(false);

  // Leaving the page (or unmounting the section) stops playback.
  useEffect(() => {
    if (!speaking) return;
    return () => {
      stopSpeaking();
      setSpeaking(false);
    };
  }, [speaking]);

  if (!isSpeechSupported()) return null;
  if (!text.trim()) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(text, () => setSpeaking(false));
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost speak-btn"
      aria-pressed={speaking}
      aria-label={speaking ? `Stop reading ${label}` : `Read ${label} aloud`}
      onClick={toggle}
    >
      {speaking ? <VolumeX size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
}
