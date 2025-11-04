export default function Input(props) {
  return (
    <input
      {...props}
      style={{ padding: "8px", width: "100%", ...(props.style || {}) }}
    />
  );
}
