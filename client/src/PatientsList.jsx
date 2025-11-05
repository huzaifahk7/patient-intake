//Purpose: Show a paginated, searchable table of patients with Edit/Delete actions.
// Talking points (say out loud):
// - “This page keeps track of the table rows (items), total count, current page, page size, and the search text q.
//    It also tracks loading/error so the UI can show a spinner or an error if something breaks.”
// - “Whenever page, pageSize, or q change, it calls Patients.list(...) to fetch from the server.
//    The server returns { items, total, page, pageSize } and I sync my local state with that.”
// - “Typing in the search input updates q and jumps back to page 1. Pagination under the hood uses SQL LIMIT/OFFSET.”
// - “Deleting a row calls Patients.remove(id), then I reload the list.”
// - “If I just created or updated a patient, a small green flash message appears at the top.”

import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Patients } from "./api/patients";

// Reusable UI atoms
import Input from "./components/common/Input";
import Button from "./components/common/Button";
import Loading from "./components/common/Loading";
import ErrorBlock from "./components/common/ErrorBlock";
import Pagination from "./components/common/Pagination";
import ConfirmButton from "./components/common/ConfirmButton";
import Flash from "./components/Flash";

export default function PatientsList() {
  // Read optional “flash” text sent from Create/Edit pages (e.g., “Patient created successfully.”)
  const location = useLocation();
  const flash = location.state?.flash || null;

  // ---------- Table state ----------
  const [items, setItems] = useState([]); // Rows for the current page
  const [total, setTotal] = useState(0); // Total matching rows (for pager + “Showing X–Y of Z”)
  const [page, setPage] = useState(1); // Current page number (1-based)
  const [pageSize, setPageSize] = useState(10); // Rows per page
  const [q, setQ] = useState(""); // Search text (“name/phone/issue”)

  // ---------- Status flags ----------
  const [loading, setLoading] = useState(true); // True while fetching
  const [error, setError] = useState(null); // Error message if fetch fails
  const [deletingId, setDeletingId] = useState(null); // Row currently being deleted (disables its button)

  // Core loader: call the backend using current page/pageSize/q
  function load() {
    setLoading(true);
    setError(null);
    Patients.list({ page, pageSize, q })
      .then(({ items, total, page, pageSize }) => {
        // Keep local state in sync with server (server may clamp invalid inputs)
        setItems(items);
        setTotal(total);
        setPage(page);
        setPageSize(pageSize);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Fetch on first render and whenever page/pageSize/q change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  // Helpers for pager + “Showing X–Y of Z”
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1; // First row number on this page
  const end = Math.min(total, page * pageSize); // Last row number on this page

  // Delete flow: confirm → DELETE → reload list so counts stay correct
  async function handleDelete(id) {
    try {
      setDeletingId(id);
      await Patients.remove(id);
      load();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // Search flow: update q and jump back to page 1 (fresh results)
  function onSearchChange(e) {
    setQ(e.target.value);
    setPage(1);
  }

  // Page-size change: update size and reset to page 1 (avoid empty tail pages)
  function onPageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  return (
    <div>
      {/* Header row: title + “New” link */}
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

      {/* Optional green “flash” message (e.g., after create/edit) */}
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
        {/* Live search input */}
        <Input
          value={q}
          onChange={onSearchChange}
          placeholder="Search name, phone, issue…"
          aria-label="Search patients"
          style={{ maxWidth: 300 }}
        />
        {/* Optional manual search button (not required for live search) */}
        <Button variant="ghost" onClick={() => setPage(1)}>
          Search
        </Button>

        {/* Page size dropdown */}
        <label style={{ marginLeft: 8 }}>
          Page size:{" "}
          <select value={pageSize} onChange={onPageSizeChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </label>

        {/* Pager aligned right */}
        <div style={{ marginLeft: "auto" }}>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
          />
        </div>
      </div>

      {/* Status blocks */}
      {loading && <Loading text="Loading patients…" />}
      {error && <ErrorBlock message={error} onRetry={load} />}

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <p style={{ marginTop: 8 }}>
          No matching patients. Try a different search.
        </p>
      )}

      {/* Table (only when we have rows) */}
      {!loading && !error && total > 0 && (
        <>
          {/* “Showing X–Y of Z” summary */}
          <p style={{ margin: "4px 0" }}>
            Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
            <strong>{total}</strong>
          </p>

          {/* Basic table (could be swapped for a reusable <DataTable/>) */}
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

                    {/* ConfirmButton wraps window.confirm() so you don’t repeat that code */}
                    <ConfirmButton
                      confirmText={`Delete patient #${p.id}? This cannot be undone.`}
                      onConfirm={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </ConfirmButton>
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
