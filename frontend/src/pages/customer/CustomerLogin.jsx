import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import styles from "./CustomerLogin.module.css";

function CustomerLogin() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customers/login`,
        {
          mobile: mobile.trim(),
          password,
        }
      );

      // Save JWT token for protected customer APIs
      localStorage.setItem("customerToken", response.data.token);

      // Save customer ID if other frontend pages need it
      if (response.data.customer?._id) {
        localStorage.setItem("xeroxCustomerId", response.data.customer._id);
      }

      toast.success("Login successful!");

      setTimeout(() => {
        navigate("/upload");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Toaster position="top-right" richColors />

      <h1 className={styles.h1}>WELCOME BACK</h1>

      <form onSubmit={handleLogin} autoComplete="on">
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="username"
            type="tel"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Enter Your Phone Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
  id="password"
  name="password"
  type={showPassword ? "text" : "password"}
  autoComplete="current-password"
  placeholder="Enter Your Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              LOGGING IN...
            </>
          ) : (
            "LOGIN"
          )}
        </button>
      </form>

      <p className={styles.footerText}>
        Welcome back! Please login to continue.
      </p>

      <p className={styles.registerRow}>
        No account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className={styles.registerButton}
        >
          Register
        </button>
      </p>
    </div>
  );
}

export default CustomerLogin;