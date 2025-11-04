// PatientsList.jsx
// Purpose: Show a paginated, searchable table of patients with Edit/Delete actions.
// Now uses reusable UI atoms: Input, Button, Loading, ErrorBlock, Pagination, ConfirmButton.

import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Patients } from "./api/patients";

// Reusable UI components (your new common atoms)
import Input from "./components/common/Input";
import Button from "./components/common/Button";
import Loading from "./components/common/Loading";
import ErrorBlock from "./components/common/ErrorBlock";
import Pagination from "./components/common/Pagination";
import ConfirmButton from "./components/common/ConfirmButton";
import Flash from "./components/Flash"; // your existing flash box (you can also move it under components/common)

export default function PatientsList() {
  // Read optional flash message (e.g., “Created successfully”) passed via navigation state
  const location = useLocation();
  const flash = location.state?.flash || null;

  // ------ Table state ------
  const [items, setItems] = useState([]); // Current rows
  const [total, setTotal] = useState(0); // Total matches (for pagination)
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Rows per page
  const [q, setQ] = useState(""); // Search text

  // ------ Status flags ------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // disable a row’s delete button while in-flight

  // Core loader: fetch page of rows from the server
  function load() {
    setLoading(true);
    setError(null);
    Patients.list({ page, pageSize, q })
      .then(({ items, total, page, pageSize }) => {
        // Keep local state in sync with server (server clamps invalid inputs)
        setItems(items);
        setTotal(total);
        setPage(page);
        setPageSize(pageSize);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Load when page/pageSize/q change (and on first render)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  // Compute pagination helpers for “Showing X–Y of Z” and button disabling
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  // Delete a row with confirm (reload for accurate counts)
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

  // When user types in search, update q and jump to page 1
  function onSearchChange(e) {
    setQ(e.target.value);
    setPage(1);
  }

  // When user changes page size, update and jump to page 1 to avoid empties
  function onPageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  return (
    <div>
      {/* Header row: title on the left, +New link on the right */}
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

      {/* Optional green success message (e.g., after create/edit) */}
      <Flash message={flash} />

      {/* Controls row: search box, page size selector, and pager */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        {/* Search input (controlled) */}
        <Input
          value={q}
          onChange={onSearchChange}
          placeholder="Search name, phone, issue…"
          aria-label="Search patients"
          style={{ maxWidth: 300 }}
        />
        {/* You can keep this button if you want an explicit “Search” action; not required for live search */}
        <Button variant="ghost" onClick={() => setPage(1)}>
          Search
        </Button>

        <label style={{ marginLeft: 8 }}>
          Page size:{" "}
          <select value={pageSize} onChange={onPageSizeChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </label>

        {/* Pager pushed to the right */}
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

      {!loading && !error && total === 0 && (
        <p style={{ marginTop: 8 }}>
          No matching patients. Try a different search.
        </p>
      )}

      {/* Table */}
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
