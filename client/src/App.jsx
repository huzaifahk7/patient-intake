import { useEffect, useState } from "react"; //useState → remember values (like data, error, loading). useEffect →run some code after component shows up (good for fetching).
import { Link, Routes, Route } from "react-router-dom"; //Link → makes clickable links that change page w/o reloading. Routes/Route → define which component shows for which URL
import { http } from "./api/client";
import PatientsList from "./PatientsList";
import PatientCreate from "./PatientCreate";


function Health() {                                                                // Simple page that calls backend /health and shows JSON
  const [data, setData] = useState(null);                                         //setData is how we change it later.
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);                                  //State for loading (starts true because we haven’t fetched yet).

  useEffect(() => {
    // Our http() prefixes with /api; /health is outside /api, so escape with '/../'
    http("/../health")                                                           //Make a request to the backend’s /health route.
      .then(setData)                                                            //If the request works, save the JSON into data.
      .catch((e) => setError(e.message))                                        //If the request fails, save the error text.
      .finally(() => setLoading(false));                                        //In either case (success or error), turn off the loading state.
  }, []);

  if (loading) return <p>Loading health…</p>;                                   //While we’re waiting, show “Loading health…”.
  if (error) return <p style={{ color: "red" }}>Health error: {error}</p>;      //If there was an error, show it in red and stop here.
  return (
    //If we’re not loading and there’s no error, we must have data.
    <pre                                                                        //<pre> shows the JSON in a pretty, readable way.
      style={{ background: "#f6f8fa", padding: "12px", borderRadius: "8px" }}
    >
      {JSON.stringify(data, null, 2)}                                          
    </pre>                                                                      //JSON.stringify(data, null, 2) formats the JSON with spaces.
  );
}

export default function App() {
  return (
    <div style={{ maxWidth: 880, margin: "24px auto", padding: "0 16px" }}>
      <header                                                                     //A header bar with flex layout so title and nav sit on opposite sides.
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h1>Patient Intake (Frontend)</h1>
        <nav>
          <Link to="/" style={{ marginRight: 12 }}>
            Health
          </Link>
          <Link to="/patients">Patients</Link>
          <Link to="/patients/new">New Patients</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Health />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<PatientCreate />} />
      </Routes>
    </div>
  );
}
