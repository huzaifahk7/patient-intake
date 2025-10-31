// On load → GET /api/patients/:id to fill the form. On save → PATCH /api/patients/:id with changed fields. Then navigate back to the list.
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Brings in the form helper. It manages inputs, validation, and submit.
import { zodResolver } from "@hookform/resolvers/zod"; // Connects react-hook-form to Zod (runs Zod rules automatically).
import { patientUpdateSchema } from "./validation/patientSchema"; // Frontend Zod schema (partial update rules).
import { useParams, useNavigate, Link } from "react-router-dom"; // useParams → read URL parts like :id (e.g., /patients/4/edit gives id = "4").
import { Patients } from "./api/patients";

export default function PatientEdit() {
  const { id } = useParams(); // read :id from the URL
  const navigate = useNavigate();

  // 1) form setup with empty defaults; we'll fill them after we fetch
  const {
    register, // attach an input to the form (and define rules).
    handleSubmit, // wraps our submit function and gives us validated values
    reset, // programmatically set the form values later (after we fetch).
    formState: { errors, isSubmitting, isValid }, // isValid tells us if the form currently passes validation.
  } = useForm({
    // useForm initializes a form.
    mode: "onBlur", // validate each field when you leave it (friendlier UX).
    resolver: zodResolver(patientUpdateSchema), // use Zod rules on the frontend (same logic as backend).
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // 2) local loading/error while fetching the current row
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 3) when page opens, load the patient by id and push values into the form - React page opens → fetch row by id → pre-fill the form.
  useEffect(() => {
    Patients.get(id) // Patients.get(id) calls GET /api/patients/:id on your backend.
      .then((p) => {
        // react-hook-form prefers strings for inputs; ensure age is string or empty
        reset({
          // We call reset({...}) to fill the form with the patient’s values.
          firstName: p.firstName ?? "",
          lastName: p.lastName ?? "",
          age: (p.age ?? "") === "" ? "" : String(p.age ?? ""), // String(...) so the number shows in the input; empty if missing.
          phoneNumber: p.phoneNumber ?? "",
          healthIssue: p.healthIssue ?? "",
        });
      })
      .catch((e) => setLoadError(e.message)) // Save the error message into loadError
      .finally(() => setLoading(false)); // setLoading(false) so the UI stops showing “Loading…”
  }, [id, reset]);

  // 4) submit handler (sends PATCH)
  async function onSubmit(formData) {
    // onSubmit is called by handleSubmit with validated form data
    const payload = {
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age), // age from string → number (Number(...)) or leave undefined if empty.
    };
    try {
      await Patients.update(id, payload); // Patients.update(id, payload) calls PATCH /api/patients/:id on the backend.
      navigate("/patients", {
        state: { flash: "Patient updated successfully." },
      }); // Navigate back with a small success message (flash).
    } catch (e) {
      alert(`Update failed: ${e.message}`);
    }
  }

  if (loading) return <p>Loading patient…</p>;
  if (loadError) return <p style={{ color: "red" }}>Error: {loadError}</p>;

  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Edit Patient (ID: {id})</h2>
      <p style={{ marginTop: 8 }}>
        <Link to="/patients">← Back to Patients</Link>{" "}
        {/* The Link lets the user go back without saving. */}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)} // handleSubmit(onSubmit) validates and passes clean values to onSubmit.
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* First Name */}
        <label>
          First Name
          <br />
          <input
            {...register("firstName")} // Connected to form via register (Zod will enforce required).
            placeholder="e.g., Ada"
            aria-invalid={!!errors.firstName} // Accessibility: indicate invalid state to screen readers.
          />
        </label>
        {errors.firstName && ( // If Zod says it's invalid, show the error text.
          <span style={{ color: "red" }}>{errors.firstName.message}</span>
        )}

        {/* Last Name */}
        <label>
          Last Name
          <br />
          <input
            {...register("lastName")}
            placeholder="e.g., Lovelace"
            aria-invalid={!!errors.lastName}
          />
        </label>
        {errors.lastName && (
          <span style={{ color: "red" }}>{errors.lastName.message}</span>
        )}

        {/* Age */}
        <label>
          Age (optional)
          <br />
          <input
            type="number"
            {...register("age")}
            placeholder="e.g., 36"
            aria-invalid={!!errors.age}
          />
        </label>
        {errors.age && (
          <span style={{ color: "red" }}>{errors.age.message}</span>
        )}

        {/* Phone */}
        <label>
          Phone Number
          <br />
          <input
            {...register("phoneNumber")}
            placeholder="+1 555 123 4567"
            aria-invalid={!!errors.phoneNumber}
          />
        </label>
        {errors.phoneNumber && (
          <span style={{ color: "red" }}>{errors.phoneNumber.message}</span>
        )}

        {/* Health Issue */}
        <label>
          Health Issue (optional)
          <br />
          <textarea
            rows="4"
            {...register("healthIssue")}
            placeholder="Short note"
          />
        </label>

        <button type="submit" disabled={isSubmitting || !isValid}>
          {" "}
          {/* Disable when submitting OR invalid (prevents bad submits). */}
          {isSubmitting ? "Updating…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
