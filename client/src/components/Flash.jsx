// client/src/components/Flash.jsx
// Purpose: Show a small, temporary success/info message ("flash") that fades away after a short time.
// Typical use: after creating/updating a patient, you navigate back with { state: { flash: "..." } } and render <Flash message={flash} />

import { useEffect, useState } from "react";

export default function Flash({ message, duration = 2500 }) {
  // show = whether the flash box is currently visible
  // Initialize using the presence of a message (Boolean(...) converts to true/false)
  const [show, setShow] = useState(Boolean(message));

  useEffect(() => {
    // If there is no message, do nothing (keeps it hidden)
    if (!message) return;

    // New message arrived → show the flash
    setShow(true);

    // After "duration" ms, hide it again
    const t = setTimeout(() => setShow(false), duration);

    // Cleanup: if the component unmounts or message/duration changes, clear the timer
    return () => clearTimeout(t);
  }, [message, duration]);

  // If nothing to show, render nothing
  if (!show || !message) return null;

  // The actual visible flash UI
  return (
    <div
      style={{
        background: "#e6ffed",
        border: "1px solid #a6f4c5",
        color: "#065f46",
        padding: "10px 12px",
        borderRadius: 8,
        margin: "8px 0",
      }}
      role="status" // Accessibility: screen readers treat this as a status message
      aria-live="polite" // Don't interrupt the user; announce politely when it appears
    >
      {message}
    </div>
  );
}

/*
Why this component is useful:
- Centralizes the logic for temporary messages so every page behaves consistently.
- You can change style/duration in one place and the whole app updates.
- Accessible: announces changes to assistive tech without being disruptive.

Common patterns:
- Navigate with a flash:
    navigate('/patients', { state: { flash: 'Patient saved.' } })
- On the list page:
    const flash = location.state?.flash || null
    <Flash message={flash} />
*/
