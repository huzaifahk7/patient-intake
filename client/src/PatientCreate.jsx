// Purpose: Create a new patient via a form with client-side validation.
// Talking points (say out loud):
// - “I use react-hook-form to control the form and Zod to validate fields on blur.”
// - “On submit, I convert age (a string from the input) into a number, or omit it if left empty.”
// - “I send the payload to the backend with Patients.create(...). If it succeeds, I reset the form and navigate
//    back to /patients with a green flash message.”

import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientCreateSchema } from "./validation/patientSchema";

// Reusable form atoms (consistent styling/markup)
import FormField from "./components/common/FormField";
import Input from "./components/common/Input";
import Textarea from "./components/common/Textarea";
import Button from "./components/common/Button";

export default function PatientCreate() {
  const navigate = useNavigate(); // For redirecting after success

  // Set up the form: validate onBlur, use Zod rules, and start with empty fields
  const {
    register, // Connect inputs to the form
    handleSubmit, // Wraps onSubmit with validation
    formState: { errors, isSubmitting, isValid }, // Live info: errors, submit state, validity
    reset, // Clear/reset the form after success
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(patientCreateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // Submit handler (only called if validation passes)
  async function onSubmit(data) {
    // Convert number-like fields: react-hook-form gives you strings from inputs
    const payload = {
      ...data,
      age: data.age === "" ? undefined : Number(data.age), // empty string → omit; else number
    };

    try {
      await Patients.create(payload); // POST /api/patients
      reset(); // Clear the form
      navigate("/patients", {
        // Go back to list with a “flash” success
        state: { flash: "Patient created successfully." },
      });
    } catch (e) {
      alert(`Create failed: ${e.message}`); // Show readable error
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2>New Patient</h2>

      {/* Convenience back link */}
      <p style={{ marginTop: 8 }}>
        <Link to="/patients">← Back to Patients</Link>
      </p>

      {/* handleSubmit runs Zod validation first; if valid, calls onSubmit(cleanData) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* First Name */}
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input
            {...register("firstName")}
            placeholder="e.g., Grace"
            aria-invalid={!!errors.firstName}
          />
        </FormField>

        {/* Last Name */}
        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input
            {...register("lastName")}
            placeholder="e.g., Hopper"
            aria-invalid={!!errors.lastName}
          />
        </FormField>

        {/* Age */}
        <FormField label="Age (optional)" error={errors.age?.message}>
          <Input
            type="number"
            {...register("age")}
            placeholder="e.g., 85"
            aria-invalid={!!errors.age}
          />
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number" error={errors.phoneNumber?.message}>
          <Input
            {...register("phoneNumber")}
            placeholder="+1 555 222 3333"
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

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creating…" : "Create Patient"}
        </Button>
      </form>
    </div>
  );
}
