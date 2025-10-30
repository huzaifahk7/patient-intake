// client/src/PatientCreate.jsx
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Patients } from "./api/patients";

export default function PatientCreate() {

  const {                                                                                  // 1) setup the form with default empty values
    register,                                                                              //connects the input to the form and adds a simple rule.
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({                                                                           //useForm({...}): sets up the form; we get helpers like register, handleSubmit
    defaultValues: {
      firstName: "",
      lastName: "",
      age: "",
      phoneNumber: "",
      healthIssue: "",
    },
  });

  const navigate = useNavigate();                                                         // 2) navigation helper (go back to /patients after success)

  async function onSubmit(formData) {                                                     // 3) what happens when the user submits
    
    const payload = {                                                                      // react-hook-form gives age as string; convert to number or undefined
      ...formData,
      age: formData.age === "" ? undefined : Number(formData.age),                        //turns age from text → number (or undefined), then calls Patients.create(payload)
    };

    try {
      await Patients.create(payload);                                                       // calls POST /api/patients
      navigate("/patients");                                                                // go back to the list
    } catch (e) {
      alert(`Create failed: ${e.message}`);                                                 // quick/simple error surface
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
        <label>
          First Name
          <br />
          <input
            {...register("firstName", { required: "First name is required" })}
            placeholder="e.g., Grace"
          />
        </label>
        {errors.firstName && (
          <span style={{ color: "red" }}>{errors.firstName.message}</span>              //shows a friendly error if the rule is broken.
        )}

        {/* Last Name */}
        <label>
          Last Name
          <br />
          <input
            {...register("lastName", { required: "Last name is required" })}
            placeholder="e.g., Hopper"
          />
        </label>
        {errors.lastName && (
          <span style={{ color: "red" }}>{errors.lastName.message}</span>
        )}

        {/* Age (optional, must be >= 0 if provided) */}
        <label>
          Age (optional)
          <br />
          <input
            type="number"
            {...register("age", {
              validate: (v) =>
                v === "" || Number(v) >= 0 || "Age must be 0 or more",
            })}
            placeholder="e.g., 85"
          />
        </label>
        {errors.age && (
          <span style={{ color: "red" }}>{errors.age.message}</span>
        )}

        {/* Phone number (required, simple pattern) */}
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
            placeholder="+1 555 222 3333"
          />
        </label>
        {errors.phoneNumber && (
          <span style={{ color: "red" }}>{errors.phoneNumber.message}</span>
        )}

        {/* Health Issue (optional) */}
        <label>
          Health Issue (optional)
          <br />
          <textarea
            rows="4"
            {...register("healthIssue")}
            placeholder="Short note (e.g., Back pain)"
          />
        </label>
        
        <button type="submit" disabled={isSubmitting}>                                                  
          {isSubmitting ? "Creating…" : "Create Patient"}      {/* isSubmitting flips true while the POST in progress; disable button then.*/}                              
        </button>
      </form>
    </div>
  );
}
