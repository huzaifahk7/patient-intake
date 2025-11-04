export default function Textarea(props) {
  return (
    <textarea
      {...props}
      style={{ padding: "8px", width: "100%", ...(props.style || {}) }}
    />
  );
}
