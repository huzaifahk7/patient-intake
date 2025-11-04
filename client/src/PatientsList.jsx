// client/src/PatientsList.jsx
import { useEffect, useMemo, useState } from "react";    // State, effects, and memo helpers from React
import { useLocation, Link } from "react-router-dom";    // Read route state (flash) + navigate links
import { Patients } from "./api/patients";               // API wrapper for patients endpoints
import Flash from "./components/Flash";                  // Tiny success message box

export default function PatientsList() {
  const location = useLocation();                        // Access navigation state (e.g., flash messages)
  const flash = location.state?.flash || null;           // Read optional "flash" message (e.g., after create/update)

  // Table state
  const [items, setItems] = useState([]);                // Current page of patients
  const [total, setTotal] = useState(0);                 // Total matching rows (for pagination)
  const [page, setPage] = useState(1);                   // Current page number (1-based)
  const [pageSize, setPageSize] = useState(10);          // Rows per page
  const [q, setQ] = useState("");                        // Search query string

  const [loading, setLoading] = useState(true);          // Show spinner/text while fetching
  const [error, setError] = useState(null);              // Store error message if fetch fails
  const [deletingId, setDeletingId] = useState(null);    // Track row being deleted to disable its button

  function load() {                                      // Fetch data based on current page/pageSize/q
    setLoading(true);
    setError(null);
    Patients.list({ page, pageSize, q })                 // Call backend with query params
      .then(({ items, total, page, pageSize }) => {      // Destructure server response
        setItems(items);                                 // Update table rows
        setTotal(total);                                 // Update total for pagination
        setPage(page);                                   // Keep page in sync (server may clamp invalid values)
        setPageSize(pageSize);                           // Keep page size in sync (server may clamp invalid values)
      })
      .catch((e) => setError(e.message))                 // Show a readable error
      .finally(() => setLoading(false));                 // Stop loading state
  }

  // Load when page/pageSize/q changes
  useEffect(() => {
    load();                                              // Fetch on first render and whenever deps change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);                               // Re-run load when these change

  // Paging helpers
  const pageCount = useMemo(                             // Compute total pages (at least 1)
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1; // Start index for "Showing X–Y of Z"
  const end = Math.min(total, page * pageSize);              // End index for "Showing X–Y of Z"

  async function handleDelete(id) {                      // Delete a patient by id
    const yes = window.confirm(`Delete patient #${id}? This cannot be undone.`); // Confirm destructive action
    if (!yes) return;
    try {
      setDeletingId(id);                                 // Disable the clicked Delete button
      await Patients.remove(id);                         // Call DELETE /api/patients/:id
      // Option 1: reload the page to refresh items & total
      load();
      // Option 2 (faster): setItems(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1);
    } catch (e) {
      alert(`Delete failed: ${e.message}`);              // Show simple error if request fails
    } finally {
      setDeletingId(null);                               // Re-enable Delete button
    }
  }

  // Reset to first page when query changes (user starts a new search)
  function onSearchChange(e) {
    setQ(e.target.value);                                // Update search term
    setPage(1);                                          // Always jump back to page 1 for new searches
  }

  function onPageSizeChange(e) {
    setPageSize(Number(e.target.value));                 // Update page size
    setPage(1);                                          // Reset to first page to avoid empty tails
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
        <h2>All Patients</h2>                            {/* Page title */}
        <Link to="/patients/new">+ New</Link>            {/* Create new patient link */}
      </div>

      <Flash message={flash} />                          {/* Green success message if present */}

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
          value={q}                                      // Controlled input for search term
          onChange={onSearchChange}                      // Update q and reset page
          placeholder="Search name, phone, issue…"
          aria-label="Search patients"
        />
        <label>
          Page size:{" "}
          <select value={pageSize} onChange={onPageSizeChange}>  {/* Page size selector */}
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </label>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}   // Go to previous page (min 1)
            disabled={page <= 1}
          >
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>
            Page {page} of {pageCount}                           {/* Page indicator */}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))} // Next page (max pageCount)
            disabled={page >= pageCount}
          >
            Next
          </button>
        </div>
      </div>

      {/* Status blocks */}
      {loading && <p>Loading patients…</p>}             {/* Loading state */}

      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          <p>Error: {error}</p>                          {/* Error message */}
          <button onClick={load}>Retry</button>          {/* Retry fetch */}
        </div>
      )}

      {!loading && !error && total === 0 && (            // Empty state (no matches)
        <p style={{ marginTop: 8 }}>
          No matching patients. Try a different search.
        </p>
      )}

      {!loading && !error && total > 0 && (              // Table when we have rows
        <>
          <p style={{ margin: "4px 0" }}>
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
            <strong>{total}</strong>                      {/* Range summary */}
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
              {items.map((p) => (                         // Render each patient row
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td>{p.age ?? "-"}</td>
                  <td>{p.phoneNumber}</td>
                  <td>
                    <Link
                      to={`/patients/${p.id}/edit`}       // Edit link navigates to edit page
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}  // Delete action
                      disabled={deletingId === p.id}      // Disable if this row is being deleted
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
