// client/src/PatientsList.jsx
import { useEffect, useState } from "react";
import { Patients } from "./api/patients";
import { useLocation, Link } from "react-router-dom";
import Flash from "./components/Flash";

export default function PatientsList() {
  const location = useLocation();
  const flash = location.state?.flash || null;
  // 3 pieces of state: items (data), loading spinner, error message
  const [items, setItems] = useState([]); //items: the patients we get from the server
  const [loading, setLoading] = useState(true); //loading: show “Loading…” while waiting,
  const [error, setError] = useState(null); //error: show a message if something goes wrong
  const [deletingId, setDeletingId] = useState(null); //a small “deleting” state so button can disable while working:

  function load() {
    setLoading(true);
    setError(null);
    Patients.list() //The actual moment call is made is when Patients.list() runs. when the page 1st shows call the server
      .then(setItems) // save the JSON array to items
      .catch((e) => setError(e.message)) // save error message if it fails
      .finally(() => setLoading(false)); // done loading in either case
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    //A function that deletes a patient by id.
    const yes = window.confirm(`Delete patient #${id}? This cannot be undone.`); //Shows a confirmation popup. If the user clicks Cancel, we stop.
    if (!yes) return;
    try {
      setDeletingId(id);
      await Patients.remove(id); // Calls the backend DELETE endpoint. If the server succeeds, the row is gone in the database.
      // remove from local state so UI updates without full refetch:
      setItems((prev) => prev.filter((p) => p.id !== id)); //Update the React state to remove that patient from table immediately.avoids GET call; UI updates right away.
    } catch (e) {
      alert(`Delete failed: ${e.message}`); //If the server fails (e.g., network error), show a simple error.
    } finally {
      setDeletingId(null); //Whether it worked or failed, clear the deletingId so the button re-enables.
    }
  }

  // render a simple table
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

      {loading && <p>Loading patients…</p>}

      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          <p>Error: {error}</p>
          <button onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 8 }}>
          No patients yet. Click “+ New” to add one.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
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
      )}
    </div>
  );
}
