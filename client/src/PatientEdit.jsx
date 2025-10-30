// client/src/PatientEdit.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";

export default function PatientEdit() {
  const { id } = useParams(); // read :id from the URL
  const navigate = useNavigate();

  // 1) form setup with empty defaults; we'll fill them after we fetch
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
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

  // 3) when page opens, load the patient by id and push values into the form
  useEffect(() => {
    Patients.get(id)
      .then((p) => {
        // react-hook-form prefers strings for inputs; ensure age is string or empty
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

  // 4) submit handler (sends PATCH)
  async function onSubmit(formData) {
    const payload = {
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age),
    };
    try {
      await Patients.update(id, payload); // PATCH /api/patients/:id
      navigate("/patients"); // go back to the list
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
        <label>
          First Name
          <br />
          <input
            {...register("firstName", { required: "First name is required" })}
            placeholder="e.g., Ada"
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
            {...register("lastName", { required: "Last name is required" })}
            placeholder="e.g., Lovelace"
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
            {...register("age", {
              validate: (v) =>
                v === "" || Number(v) >= 0 || "Age must be 0 or more",
            })}
            placeholder="e.g., 36"
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
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9+\-() ]+$/,
                message: "Use digits, spaces, + - ( ) only",
              },
            })}
            placeholder="+1 555 123 4567"
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

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
