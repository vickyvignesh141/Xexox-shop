import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import styles from "./CustomerRegister.module.css";

// Password rules shown under both password fields
const getPasswordRules = (value) => [
  { label: "One capital letter", ok: /[A-Z]/.test(value) },
  { label: "One special character", ok: /[^A-Za-z0-9]/.test(value) },
  { label: "Exactly 6 characters", ok: value.length === 6 },
];

function PasswordRules({ value }) {
  return (
    <ul className={styles.rules}>
      {getPasswordRules(value).map((rule) => (
        <li key={rule.label} className={rule.ok ? styles.ruleOk : styles.rule}>
          <Check size={14} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}

function CustomerRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    department: "",
    year: "",
    section: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mobile: digits only, max 10
    const cleaned =
      name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setForm((prev) => ({ ...prev, [name]: cleaned }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{1,6}$/.test(form.password)) {
      toast.error(
        "Password must be max 6 characters with one capital letter and one special character"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = form;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        registrationData
      );

      localStorage.setItem("xeroxCustomerId", response.data.customer._id);

      toast.success("Registration successful!");
      navigate("/upload");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>

      <div className={styles.container}>
        <Toaster position="top-right" richColors />

        <form className={styles.form} onSubmit={handleSubmit}>
          <h1>Customer Registration</h1>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Numeric keypad on phones; Chrome saves this as the username */}
          <input
            id="mobile"
            type="tel"
            name="mobile"
            placeholder="10-digit Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="username"
            required
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Department</option>
            <option>Artificial Intelligence & Data Science Engineering</option>
            <option>Automobile Engineering</option>
            <option>Civil Engineering</option>
            <option>Electrical and Electronics Engineering</option>
            <option>Electronics and Communication Engineering</option>
            <option>Information Technology</option>
            <option>Computer Science and Engineering (Cyber Security)</option>
            <option>Computer Science and Engineering</option>
            <option>Mechanical Engineering</option>
            <option>Electronics and Instrumentation Engineering</option>
            <option>Master of Business Administration</option>
          </select>

          <div className={styles.row}>
            <select name="year" value={form.year} onChange={handleChange} required>
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <select name="section" value={form.section} onChange={handleChange} required>
              <option value="">Select Section</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              maxLength={6}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <PasswordRules value={form.password} />

          {/* Confirm Password */}
          <div className={styles.passwordField}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              maxLength={6}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <PasswordRules value={form.confirmPassword} />

          <button type="submit">Register</button>

          <p className={styles.signInText}>
            Already have an account?{" "}
            <button
              type="button"
              className={styles.signInButton}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </>
  );
}

export default CustomerRegister;