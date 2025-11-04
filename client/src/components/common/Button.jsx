export default function Button({ children, variant = "primary", ...props }) {
  const style = {
    primary: { background: "#111", color: "#fff" },
    danger: { background: "#b91c1c", color: "#fff" },
    ghost: {
      background: "transparent",
      color: "#111",
      border: "1px solid #ddd",
    },
  }[variant];
  return (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        ...style,
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}
