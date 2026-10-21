
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import styles from "./header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("customerToken"));

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("xeroxCustomerId");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.line}></span>
        <div className={styles.logoIcon}>X</div>

        <h1 className={styles.brandName}>
          Print<span>Caffe</span>
        </h1>

        <span className={styles.line}></span>
      </div>

      {isLoggedIn && (
      <button
        type="button"
        className={styles.logoutBtn}
        onClick={handleLogout}
        title="Logout"
        aria-label="Logout"
      >
        <LogOut size={20} />
      </button>
      )}
    </header>
  );
};

export default Header;