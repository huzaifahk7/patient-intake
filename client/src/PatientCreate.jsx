// client/src/PatientCreate.jsx
// Purpose: Create a new patient with client-side validation.
// Flow: user fills form → Zod validates → POST /api/patients → navigate back with a flash.

import { useForm } from "react-hook-form"; // Form state/validation controller
import { useNavigate, Link } from "react-router-dom"; // Navigate on success; link back to list
import { Patients } from "./api/patients"; // Patients API
import { zodResolver } from "@hookform/resolvers/zod"; // Connect react-hook-form and Zod
import { patientCreateSchema } from "./validation/patientSchema"; // Frontend validation rules

export default function PatientCreate() {
  const navigate = useNavigate();

  // Set up controlled form with defaults + validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    mode: "onBlur", // validate each field when it loses focus
    resolver: zodResolver(patientCreateSchema), // run Zod schema automatically
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // Submit handler (POST)
  async function onSubmit(data) {
    try {
      await Patients.create(data); // POST /api/patients
      reset(); // Clear the form after success
      navigate("/patients", {
        state: { flash: "Patient created successfully." },
      });
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  }

  // UI
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>New Patient</h2>
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
            placeholder="e.g., Grace"
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
            placeholder="e.g., Hopper"
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
            placeholder="e.g., 85"
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
            placeholder="+1 555 222 3333"
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
          {isSubmitting ? "Creating…" : "Create Patient"}
        </button>
      </form>
    </div>
  );
}
