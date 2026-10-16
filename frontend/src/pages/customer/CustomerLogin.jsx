
import styles from "./CustomerLogin.module.css";

function CustomerLogin() {
  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.h1}>WELCOME BACK</h1>

      <form>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter Your Phone Number"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter Your Password"
            required
          />
        </div>

        <button type="submit" className={styles.loginButton}>
          LOGIN
        </button>
      </form>

      <p className={styles.footerText}>
        Welcome back! Please login to continue.
      </p>
    </div>
  );
}

export default CustomerLogin;
