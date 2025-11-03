// client/src/PatientsList.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Patients } from "./api/patients";
import Flash from "./components/Flash";

export default function PatientsList() {
  const location = useLocation();
  const flash = location.state?.flash || null;

  // Table state
  const [items, setItems] = useState([]); //items: the patients we get from the server
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true); //loading: show “Loading…” while waiting,
  const [error, setError] = useState(null); //error: show a message if something goes wrong
  const [deletingId, setDeletingId] = useState(null); //a small “deleting” state so button can disable while working:

  function load() {
    setLoading(true);
    setError(null);
    Patients.list({ page, pageSize, q })
      .then(({ items, total, page, pageSize }) => {
        setItems(items);
        setTotal(total);
        setPage(page);
        setPageSize(pageSize);
      })
      .catch((e) => setError(e.message)) // save error message if it fails
      .finally(() => setLoading(false)); // done loading in either case
  }

  // Load when page/pageSize/q changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  // Paging helpers
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  async function handleDelete(id) {  //A function that deletes a patient by id.
    const yes = window.confirm(`Delete patient #${id}? This cannot be undone.`); //Shows a confirmation popup. If the user clicks Cancel, we stop.
    if (!yes) return;
    try {
      setDeletingId(id);
      await Patients.remove(id); //// Calls the backend DELETE endpoint. If the server succeeds, the row is gone in the database.
      // Option 1: reload the page
      load();
      // Option 2 (faster): setItems(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1);
    } catch (e) {
      alert(`Delete failed: ${e.message}`); //If the server fails (e.g., network error), show a simple error.
    } finally {
      setDeletingId(null); //Whether it worked or failed, clear the deletingId so the button re-enables.
    }
  }

  // Reset to first page when query changes (user starts a new search)
  function onSearchChange(e) {
    setQ(e.target.value);
    setPage(1);
  }

  function onPageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>All Patients</h2>
        <Link to="/patients/new">+ New</Link>
      </div>

      <Flash message={flash} />

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <input
          value={q}
          onChange={onSearchChange}
          placeholder="Search name, phone, issue…"
          aria-label="Search patients"
        />
        <label>
          Page size:{" "}
          <select value={pageSize} onChange={onPageSizeChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </label>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>
            Page {page} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
          >
            Next
          </button>
        </div>
      </div>

      {/* Status blocks */}
      {loading && <p>Loading patients…</p>}

      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          <p>Error: {error}</p>
          <button onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && total === 0 && (
        <p style={{ marginTop: 8 }}>
          No matching patients. Try a different search.
        </p>
      )}

      {!loading && !error && total > 0 && (
        <>
          <p style={{ margin: "4px 0" }}>
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
            <strong>{total}</strong>
          </p>
          <table
            border="1"
            cellPadding="6"
            style={{ borderCollapse: "collapse", marginTop: 8, width: "100%" }}
          >
            <thead>
              <tr>
                <th align="left">ID</th>
                <th align="left">Name</th>
                <th align="left">Age</th>
                <th align="left">Phone</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td>{p.age ?? "-"}</td>
                  <td>{p.phoneNumber}</td>
                  <td>
                    <Link
                      to={`/patients/${p.id}/edit`}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
