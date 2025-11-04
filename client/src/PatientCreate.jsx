// --------------------------- IMPORTS ---------------------------

// Import form handling utilities from react-hook-form
import { useForm } from "react-hook-form";

// Import navigation helpers from React Router
// - useNavigate → programmatically go to another page (e.g., after saving)
// - Link → clickable link for normal navigation
import { useNavigate, Link } from "react-router-dom";

// Import the Patients API wrapper that talks to our backend
import { Patients } from "./api/patients";

// Import the connector that lets react-hook-form use Zod for validation
import { zodResolver } from "@hookform/resolvers/zod";

// Import the validation schema (rules) for creating a patient
import { patientCreateSchema } from "./validation/patientSchema";

// Import reusable form UI components to keep layout consistent and clean
import FormField from "./components/common/FormField";
import Input from "./components/common/Input";
import Textarea from "./components/common/Textarea";
import Button from "./components/common/Button";

// --------------------------- COMPONENT ---------------------------

export default function PatientCreate() {
  // useNavigate gives us a function to move to another page (like redirect)
  const navigate = useNavigate();

  // Initialize react-hook-form
  const {
    register, // connects <input> elements to the form system
    handleSubmit, // wraps our custom onSubmit handler
    formState: { errors, isSubmitting, isValid }, // live form status & errors
    reset, // resets form fields (used after successful save)
  } = useForm({
    mode: "onBlur", // validates each field when the user leaves it
    resolver: zodResolver(patientCreateSchema), // link validation rules
    defaultValues: {
      // start with empty fields
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  // --------------------------- HANDLER ---------------------------

  // Called when the user submits the form
  async function onSubmit(data) {
    // react-hook-form gives numbers as strings, so we convert age properly
    const payload = {
      ...data,
      age: data.age === "" ? undefined : Number(data.age), // empty string → undefined, otherwise number
    };

    try {
      // Send POST /api/patients with form data to backend
      await Patients.create(payload);

      // Clear form fields after success
      reset();

      // Go back to patients list with a "flash" message shown there
      navigate("/patients", {
        state: { flash: "Patient created successfully." },
      });
    } catch (e) {
      // If the API fails (like network/server error), show a popup alert
      alert(`Create failed: ${e.message}`);
    }
  }

  // --------------------------- RENDER ---------------------------

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Page title */}
      <h2>New Patient</h2>

      {/* Back link for user convenience */}
      <p style={{ marginTop: 8 }}>
        <Link to="/patients">← Back to Patients</Link>
      </p>

      {/* The actual form. handleSubmit wraps onSubmit and handles validation first. */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        {/* ---------- First Name ---------- */}
        <FormField label="First Name" error={errors.firstName?.message}>
          <Input
            {...register("firstName")} // Connect input to form system
            placeholder="e.g., Grace"
            aria-invalid={!!errors.firstName} // Accessibility: marks invalid if there's an error
          />
        </FormField>

        {/* ---------- Last Name ---------- */}
        <FormField label="Last Name" error={errors.lastName?.message}>
          <Input
            {...register("lastName")}
            placeholder="e.g., Hopper"
            aria-invalid={!!errors.lastName}
          />
        </FormField>

        {/* ---------- Age ---------- */}
        <FormField label="Age (optional)" error={errors.age?.message}>
          <Input
            type="number"
            {...register("age")}
            placeholder="e.g., 85"
            aria-invalid={!!errors.age}
          />
        </FormField>

        {/* ---------- Phone Number ---------- */}
        <FormField label="Phone Number" error={errors.phoneNumber?.message}>
          <Input
            {...register("phoneNumber")}
            placeholder="+1 555 222 3333"
            aria-invalid={!!errors.phoneNumber}
          />
        </FormField>

        {/* ---------- Health Issue ---------- */}
        <FormField label="Health Issue (optional)">
          <Textarea
            rows="4"
            {...register("healthIssue")}
            placeholder="Short note"
          />
        </FormField>

        {/* ---------- Submit Button ---------- */}
        <Button
          type="submit"
          disabled={isSubmitting || !isValid} // disable while saving or invalid
        >
          {isSubmitting ? "Creating…" : "Create Patient"} // text changes while
          submitting
        </Button>
      </form>
    </div>
  );
}
