export default function FormField({ label, error, children }) {
  return (
    <label style={{ display: "block" }}>
      {label}
      <br />
      {children}
      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
    </label>
  );
}
