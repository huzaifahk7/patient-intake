// client/src/PatientsList.jsx
import { useEffect, useState } from "react";
import { Patients } from "./api/patients";
import { Link } from "react-router-dom";

export default function PatientsList() {
  // 3 pieces of state: items (data), loading spinner, error message
  const [items, setItems] = useState([]); //items: the patients we get from the server
  const [loading, setLoading] = useState(true); //loading: show “Loading…” while waiting,
  const [error, setError] = useState(null); //error: show a message if something goes wrong
  const [deletingId, setDeletingId] = useState(null); //a small “deleting” state so button can disable while working:

  // When the component first shows, fetch the list
  useEffect(() => {
    Patients.list() //The actual moment call is made is when Patients.list() runs. when the page 1st shows call the server
      .then(setItems) // save the JSON array to items
      .catch((e) => setError(e.message)) // save error message if it fails
      .finally(() => setLoading(false)); // done loading in either case
  }, []);

  // simple UI states
  if (loading) return <p>Loading patients…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  async function handleDelete(id) {
    const yes = window.confirm(`Delete patient #${id}? This cannot be undone.`);
    if (!yes) return;
    try {
      setDeletingId(id);
      await Patients.remove(id); // DELETE /api/patients/:id
      // remove from local state so UI updates without full refetch:
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // render a simple table
  return (
    <div>
      <h2>All Patients</h2>
      <table
        border="1"
        cellPadding="6"
        style={{ borderCollapse: "collapse", marginTop: 8 }}
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
                <Link to={`/patients/${p.id}/edit`} style={{ marginRight: 8 }}>
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
    </div>
  );
}
