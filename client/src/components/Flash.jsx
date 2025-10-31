// client/src/components/Flash.jsx
import { useEffect, useState } from "react";

export default function Flash({ message, duration = 2500 }) {
  const [show, setShow] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [message, duration]);

  if (!show || !message) return null;
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
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
