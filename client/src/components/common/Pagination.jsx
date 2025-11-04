export default function Pagination({ page, pageCount, onPrev, onNext }) {
  return (
    <div>
      <button onClick={onPrev} disabled={page <= 1}>
        Prev
      </button>
      <span style={{ margin: "0 8px" }}>
        Page {page} of {pageCount}
      </span>
      <button onClick={onNext} disabled={page >= pageCount}>
        Next
      </button>
    </div>
  );
}
