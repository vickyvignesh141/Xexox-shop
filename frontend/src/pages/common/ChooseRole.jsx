import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, ShieldCheck, Printer } from "lucide-react";
import styles from "./ChooseRole.module.css";


function ChooseRole() {
    const navigate = useNavigate();
    const selectrole = (role) => {
        localStorage.setItem("selectrole", role)
        if (role === "customer") {
            navigate("/register");
        } else {
            navigate("/owner-login");
        }

    }

    useEffect(() => {
  const savedRole = localStorage.getItem("selectrole");

  if (savedRole === "customer") {
    navigate("/register", { replace: true });
  } else if (savedRole === "owner") {
    navigate("/owner-login", { replace: true });
  }
}, [navigate]);



    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.logo}>
                    <Printer size={30} />
                </div>

                <h1>Xexox Shop</h1>

                <p className={styles.subtitle}>
                    Welcome! Choose how you want to continue.
                </p>

                <button
                    className={styles.customer}
                    onClick={() => selectrole("customer")}
                >
                    <UserRound size={24} />
                    <span>
                        <strong>Continue as Customer</strong>
                        <small>Register and place print orders</small>
                    </span>
                </button>

                <button
                    className={styles.owner}
                    onClick={() => selectrole("owner")}
                >
                    <ShieldCheck size={24} />
                    <span>
                        <strong>Continue as Owner</strong>
                        <small>Login and manage orders</small>
                    </span>
                </button>
                <p className={styles.footer}>
  Fast • Simple • Reliable printing
</p>
            </section>
        </main>
    )
}

export default ChooseRole;