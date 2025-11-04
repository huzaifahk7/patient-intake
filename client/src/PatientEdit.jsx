// PatientEdit.jsx
// Purpose: Load an existing patient into a form, allow edits, and PATCH the changes.
// Uses shared form atoms (FormField/Input/Textarea/Button) to avoid repeated markup.

import { useEffect, useState } from "react"; // React hooks: side-effects + local state
import { useForm } from "react-hook-form"; // Form state/validation manager
import { zodResolver } from "@hookform/resolvers/zod"; // Bridge between react-hook-form and Zod
import { patientUpdateSchema } from "./validation/patientSchema"; // Zod schema for PATCH (all fields optional)
import { useParams, useNavigate, Link } from "react-router-dom"; // Router: read :id, navigate, and links
import { Patients } from "./api/patients"; // API wrapper for /api/patients endpoints

// Reusable form atoms (UI building blocks)
import FormField from "./components/common/FormField"; // Label + error wrapper
import Input from "./components/common/Input"; // Styled input
import Textarea from "./components/common/Textarea"; // Styled textarea
import Button from "./components/common/Button"; // Styled button

export default function PatientEdit() {
  const { id } = useParams(); // Read :id from the URL (/patients/:id/edit → id is a string)
  const navigate = useNavigate(); // Programmatic navigation after save

  // Initialize react-hook-form with Zod validation and empty defaults (we'll fill them via reset() after fetching).
  const {
    register, // Connects inputs to form state
    handleSubmit, // Wraps submit handler with validation
    reset, // Programmatically set form values after GET
    formState: { errors, isSubmitting, isValid }, // Live form status: errors, submitting flag, validity
  } = useForm({
    mode: "onBlur", // Validate a field when it loses focus (friendlier UX)
    resolver: zodResolver(patientUpdateSchema), // Run Zod rules on this form (all fields optional)
    defaultValues: {
      // Start with empty strings; we'll replace after GET
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // Local "loading/error" state while we fetch the current row
  const [loading, setLoading] = useState(true); // Show a loading message until GET finishes
  const [loadError, setLoadError] = useState(null); // Store GET error (e.g., 404 or network)

  // On first render (and if id/reset change): fetch the patient and prefill the form
  useEffect(() => {
    Patients.get(id) // Calls GET /api/patients/:id
      .then((p) => {
        // react-hook-form prefers strings for text/number inputs, so we convert as needed
        reset({
          firstName: p.firstName ?? "", // If value is null/undefined, use empty string
          lastName: p.lastName ?? "",
          // Age input is a string; if p.age is null/undefined, keep "", else convert number → string
          age: (p.age ?? "") === "" ? "" : String(p.age ?? ""),
          phoneNumber: p.phoneNumber ?? "",
          healthIssue: p.healthIssue ?? "",
        });
      })
      .catch((e) => setLoadError(e.message)) // If request fails, store the error text
      .finally(() => setLoading(false)); // Either way, stop showing "Loading…"
  }, [id, reset]); // Re-run if the id changes (or if reset function ref changes)

  // Submit handler for the form (PATCH the changes)
  async function onSubmit(formData) {
    // Convert age from string → number (or omit it entirely if the field is blank)
    const payload = {
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age),
    };
    try {
      await Patients.update(id, payload); // PATCH /api/patients/:id with partial fields
      // After successful update, go back to the list and show a "flash" message
      navigate("/patients", {
        state: { flash: "Patient updated successfully." },
      });
    } catch (e) {
      // Show a simple error popup if something goes wrong (network/server/validation)
      alert(`Update failed: ${e.message}`);
    }
  }

  // Early returns for loading/error states (simplifies the main JSX)
  if (loading) return <p>Loading patient…</p>; // While we're fetching, show a spinner/text
  if (loadError) return <p style={{ color: "red" }}>Error: {loadError}</p>; // If GET failed, show the error

  // Main form UI
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Edit Patient (ID: {id})</h2>

      {/* Convenience back link */}
      <p style={{ marginTop: 8 }}>
        <Link to="/patients">← Back to Patients</Link>
      </p>

      {/* handleSubmit(onSubmit) does:
          1) run Zod validation,
          2) if valid, call onSubmit(cleanValues) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* First Name */}
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input
            {...register("firstName")} // Connect to form state
            placeholder="e.g., Ada"
            aria-invalid={!!errors.firstName} // Accessibility hint for screen readers
          />
        </FormField>

        {/* Last Name */}
        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input
            {...register("lastName")}
            placeholder="e.g., Lovelace"
            aria-invalid={!!errors.lastName}
          />
        </FormField>

        {/* Age */}
        <FormField label="Age (optional)" error={errors.age?.message}>
          <Input
            type="number"
            {...register("age")}
            placeholder="e.g., 36"
            aria-invalid={!!errors.age}
          />
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number" error={errors.phoneNumber?.message}>
          <Input
            {...register("phoneNumber")}
            placeholder="+1 555 123 4567"
            aria-invalid={!!errors.phoneNumber}
          />
        </FormField>

        {/* Health Issue */}
        <FormField label="Health Issue (optional)">
          <Textarea
            rows="4"
            {...register("healthIssue")}
            placeholder="Short note"
          />
        </FormField>

        {/* Submit button:
            - Disabled while submitting (prevents double submits)
            - Disabled if form is currently invalid */}
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Updating…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
