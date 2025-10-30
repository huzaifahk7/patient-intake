// client/src/PatientsList.jsx
import { useEffect, useState } from "react";
import { Patients } from "./api/patients";

export default function PatientsList() {
  // 3 pieces of state: items (data), loading spinner, error message
  const [items, setItems] = useState([]);                               //items: the patients we get from the server
  const [loading, setLoading] = useState(true);                         //loading: show “Loading…” while waiting,
const [error, setError] = useState(null);                               //error: show a message if something goes wrong

  // When the component first shows, fetch the list
  useEffect(() => {
    Patients.list()                                                    //The actual moment call is made is when Patients.list() runs. when the page 1st shows call the server
      .then(setItems)                                                  // save the JSON array to items
      .catch((e) => setError(e.message))                               // save error message if it fails
      .finally(() => setLoading(false));                              // done loading in either case
  }, []);

  // simple UI states
  if (loading) return <p>Loading patients…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
