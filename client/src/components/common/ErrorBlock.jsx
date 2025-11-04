export default function ErrorBlock({ message, onRetry }) {
  return (
    <div style={{ color: "red", marginTop: 8 }}>
      <p>Error: {message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
