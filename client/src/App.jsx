// client/src/App.jsx

/**
 * Purpose:
 * - Defines the top-level layout (header/nav) and the client-side routes.
 * - Includes a small "Health" page that calls the backend /health and prints the server time.
 *
 * How it connects:
 * - Uses the shared http() helper for API calls elsewhere (Patients pages).
 * - <Routes> map URLs to components (Health, PatientsList, PatientCreate, PatientEdit).
 */

import { useEffect, useState } from "react"; // useState: hold data/error/loading. useEffect: run side-effects (like fetch) after first render.
import { Link, Routes, Route } from "react-router-dom"; // Link: SPA navigation; Routes/Route: match paths to components.
import { http } from "./api/client"; // (Not used in Health here; used by other pages. Kept for clarity.)
import PatientsList from "./PatientsList";
import PatientCreate from "./PatientCreate";
import PatientEdit from "./PatientEdit"; // Edit page for /patients/:id/edit

function Health() {
  /**
   * Health page:
   * Calls the backend /health endpoint and shows the JSON result.
   * Useful to quickly verify that frontend ↔ backend are connected.
   */
  const [data, setData] = useState(null); // The successful JSON result
  const [error, setError] = useState(null); // Error text if fetch fails
  const [loading, setLoading] = useState(true); // Show "Loading..." while waiting

  useEffect(() => {
    // Note:
    //   Here we call the server's health route directly via full URL.
    //   This works fine locally. (Alternatively, you could use http('/health') if your API exposes /api/health.)
    fetch("http://localhost:4000/health")
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText); // Convert non-2xx responses into thrown Errors
        return r.json();
      })
      .then(setData) // Save JSON into state
      .catch((e) => setError(e.message)) // Save error message
      .finally(() => setLoading(false)) // Stop loading in all cases

      // The extra .catch/.finally below duplicates the ones above.
      // It doesn't break anything, but it's redundant (can be removed).
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Render states: loading → error → success JSON
  if (loading) return <p>Loading health…</p>;
  if (error) return <p style={{ color: "red" }}>Health error: {error}</p>;

  return (
    // <pre> formats JSON nicely for readability.
    <pre
      style={{ background: "#f6f8fa", padding: "12px", borderRadius: "8px" }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function App() {
  return (
    <div style={{ maxWidth: 880, margin: "24px auto", padding: "0 16px" }}>
      {/* Simple header with a title and navigation links */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1>Patient Intake</h1>
        <nav>
          {/* <Link> updates the URL without a full page reload (SPA) */}
          <Link to="/" style={{ marginRight: 12 }}>
            Health
          </Link>
          <Link to="/patients" style={{ marginRight: 12 }}>
            Patients
          </Link>
          <Link to="/patients/new">New Patient</Link>
        </nav>
      </header>

      {/* Route table: which component should render for each path */}
      <Routes>
        <Route path="/" element={<Health />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<PatientCreate />} />
        <Route path="/patients/:id/edit" element={<PatientEdit />} />
      </Routes>
    </div>
  );
}
