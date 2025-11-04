// client/src/PatientEdit.jsx
// Purpose: Load one patient into a form, let the user edit, and PATCH the changes.
// Data flow: read :id from URL → GET one → reset form → user edits → PATCH → navigate back with a flash.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Form state/validation handler
import { zodResolver } from "@hookform/resolvers/zod"; // Connect react-hook-form to Zod rules
import { patientUpdateSchema } from "./validation/patientSchema"; // Frontend validation rules (partial)
import { useParams, useNavigate, Link } from "react-router-dom"; // Read URL params + navigate + link
import { Patients } from "./api/patients"; // API wrapper

export default function PatientEdit() {
  const { id } = useParams(); // URL param (string). Backend expects a number; model handles it.
  const navigate = useNavigate();

  // Set up the form with empty defaults; we'll fill them after fetching the patient.
  const {
    register,
    handleSubmit, // wraps your onSubmit and gives you validated values
    reset, // programmatically set form values (after GET)
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onBlur", // validate when a field loses focus (friendly UX)
    resolver: zodResolver(patientUpdateSchema), // run Zod rules automatically
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // Local fetch status
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // On first render: fetch the row and prefill the form.
  useEffect(() => {
    Patients.get(id) // GET /api/patients/:id
      .then((p) => {
        // react-hook-form prefers strings for text/number inputs
        reset({
          firstName: p.firstName ?? "",
          lastName: p.lastName ?? "",
          age: (p.age ?? "") === "" ? "" : String(p.age ?? ""),
          phoneNumber: p.phoneNumber ?? "",
          healthIssue: p.healthIssue ?? "",
        });
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [id, reset]);

  // Submit handler: convert age (string→number or undefined), then PATCH.
  async function onSubmit(formData) {
    const payload = {
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age),
    };
    try {
      await Patients.update(id, payload); // PATCH /api/patients/:id
      navigate("/patients", {
        state: { flash: "Patient updated successfully." },
      });
    } catch (e) {
      alert(`Update failed: ${e.message}`);
    }
  }

  // Render status
  if (loading) return <p>Loading patient…</p>;
  if (loadError) return <p style={{ color: "red" }}>Error: {loadError}</p>;

  // Form UI
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Edit Patient (ID: {id})</h2>
      <p style={{ marginTop: 8 }}>
        <Link to="/patients">← Back to Patients</Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* First Name */}
        <label>
          First Name
          <br />
          <input
            {...register("firstName")}
            placeholder="e.g., Ada"
            aria-invalid={!!errors.firstName}
          />
        </label>
        {errors.firstName && (
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
          {isSubmitting ? "Updating…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
