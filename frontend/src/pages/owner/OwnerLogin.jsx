import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import styles from "./Ownerlogin.module.css";

function OwnerLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/owner/login`,
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "ownerToken",
                response.data.token
            );

            toast.success("Owner login successful!");
            navigate("/owner-orders");

        } catch (error) {
            setError(
                error.response?.data?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Toaster position="top-right" richColors />
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <div className={styles.headerIcon}>
                        <LogIn size={32} />
                    </div>
                    <h1>Owner Login</h1>
                    <p>Access your xerox shop orders</p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleLogin}>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                id="email"
                                type="email"
                                placeholder="owner@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.button}
                        disabled={loading}
                    >
                        <LogIn size={18} />
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className={styles.footer}>
                    <p>Need help? <a href="#support">Contact Support</a></p>
                </div>
            </div>
        </div>
    );
}

export default OwnerLogin;