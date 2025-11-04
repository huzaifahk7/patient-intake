// PatientEdit.jsx
// Purpose: Load an existing patient into a form, allow edits, and PATCH the changes.
// Now uses FormField/Input/Textarea/Button to remove repeated label+error markup.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientUpdateSchema } from "./validation/patientSchema";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";

// Reusable form atoms
import FormField from "./components/common/FormField";
import Input from "./components/common/Input";
import Textarea from "./components/common/Textarea";
import Button from "./components/common/Button";

export default function PatientEdit() {
  const { id } = useParams(); // /patients/:id/edit → read id
  const navigate = useNavigate();

  // Setup react-hook-form with Zod validation and empty defaults (we’ll fill via reset)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(patientUpdateSchema), // every field optional (partial update)
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // Local status while loading the row
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // On mount: GET one patient and prefill the form
  useEffect(() => {
    Patients.get(id)
      .then((p) => {
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

  // Submit handler: convert age string → number (or omit), then PATCH
  async function onSubmit(formData) {
    const payload = {
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age),
    };
    try {
      await Patients.update(id, payload);
      navigate("/patients", {
        state: { flash: "Patient updated successfully." },
      });
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
        <Link to="/patients">← Back to Patients</Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* First Name */}
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input
            {...register("firstName")}
            placeholder="e.g., Ada"
            aria-invalid={!!errors.firstName}
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

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Updating…" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
