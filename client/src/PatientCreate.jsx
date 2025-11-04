// PatientCreate.jsx
// Purpose: Create a new patient using the same reusable form atoms as Edit.

import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientCreateSchema } from "./validation/patientSchema";

// Reusable form atoms
import FormField from "./components/common/FormField";
import Input from "./components/common/Input";
import Textarea from "./components/common/Textarea";
import Button from "./components/common/Button";

export default function PatientCreate() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
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

  async function onSubmit(data) {
    // react-hook-form gives age as string for number inputs; convert only if not empty
    const payload = {
      ...data,
      age: data.age === "" ? undefined : Number(data.age),
    };
    try {
      await Patients.create(payload);
      reset();
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

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creating…" : "Create Patient"}
        </Button>
      </form>
    </div>
  );
}
