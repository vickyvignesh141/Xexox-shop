import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import styles from "./CustomerRegister.module.css";
import Header from "../common/header";

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (
      !/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{1,6}$/.test(form.password)
    ) {
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

      localStorage.setItem(
        "xeroxCustomerId",
        response.data.customer._id
      );

      toast.success("Registration successful!");
      navigate("/upload");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <>
      <Header />

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

          <input
            type="tel"
            name="mobile"
            placeholder="10-digit Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
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

          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            name="section"
            value={form.section}
            onChange={handleChange}
            required
          >
            <option value="">Select Section</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

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

          <small className={styles.passwordHint}>
            Maximum 6 characters, including one capital letter and one special character.
          </small>

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
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

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