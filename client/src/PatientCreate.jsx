// client/src/PatientCreate.jsx
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientCreateSchema } from "./validation/patientSchema";

export default function PatientCreate() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    mode: "onBlur", // validate when leaving a field
    resolver: zodResolver(patientCreateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });
  // 2) navigation helper (go back to /patients after success)

  const payload = {
    // react-hook-form gives age as string; convert to number or undefined
    ...formData,
    age: formData.age === "" ? undefined : Number(formData.age), //turns age from text → number (or undefined), then calls Patients.create(payload)
  };

  async function onSubmit(data) {
    try {
      await Patients.create(data);
      reset(); // clear form
      navigate("/patients", {
        state: { flash: "Patient created successfully." },
      });
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  }
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
