// client/src/PatientsList.jsx
// Purpose: Show a paginated, searchable table of patients with Edit/Delete actions.
// Data flow: UI state → Patients.list({ page, pageSize, q }) → render table.

import { useEffect, useMemo, useState } from "react"; // React state/effects/memo tools
import { useLocation, Link } from "react-router-dom"; // Read flash message, build links to pages
import { Patients } from "./api/patients"; // Patients API wrapper
import Flash from "./components/Flash"; // Small green success box

export default function PatientsList() {
  // Read optional "flash" message (e.g., "Created!" from Create/Edit page)
  const location = useLocation();
  const flash = location.state?.flash || null;

  // ------- Table & controls state -------
  const [items, setItems] = useState([]); // Current page of rows
  const [total, setTotal] = useState(0); // Total matching rows for pagination
  const [page, setPage] = useState(1); // Current page (1-based)
  const [pageSize, setPageSize] = useState(10); // Rows per page
  const [q, setQ] = useState(""); // Search text

  // ------- Status flags -------
  const [loading, setLoading] = useState(true); // Show "Loading…" while fetching
  const [error, setError] = useState(null); // Error text if API call fails
  const [deletingId, setDeletingId] = useState(null); // Row currently being deleted

  // Core fetcher: pulls data from server based on page/pageSize/q
  function load() {
    setLoading(true);
    setError(null);
    Patients.list({ page, pageSize, q })
      .then(({ items, total, page, pageSize }) => {
        setItems(items);
        setTotal(total);
        // Keep page/pageSize in sync with server (server may clamp invalid values)
        setPage(page);
        setPageSize(pageSize);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Fetch whenever page/pageSize/q change (and once on mount)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  // Compute pagination info for "Showing X–Y of Z" and page count
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  // Delete one row (with confirm). Option: reload list to keep counts correct.
  async function handleDelete(id) {
    const yes = window.confirm(`Delete patient #${id}? This cannot be undone.`);
    if (!yes) return;
    try {
      setDeletingId(id);
      await Patients.remove(id);
      load(); // refresh table and counts
      // Alternative: setItems(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1)
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // Start a new search: update q and jump back to page 1
  function onSearchChange(e) {
    setQ(e.target.value);
    setPage(1);
  }

  // Change page size: update value and jump back to page 1
  function onPageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  return (
    <div>
      {/* Header bar */}
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

      {/* Success flash message (e.g., after create/update) */}
      <Flash message={flash} />

      {/* Controls: search, page size, pager */}
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

      {/* Status: loading / error / empty / table */}
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
