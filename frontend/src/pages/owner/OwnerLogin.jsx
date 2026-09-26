import { useState } from "react";
import axios from "axios";
import styles from "./OwnerLogin.module.css";


function OwnerLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

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

            alert("Owner login successful!");

        } catch (error) {
            alert(
                error.response?.data?.message || "Login failed"
            );
        }
    };

   return (
    <div className={styles.container}>
        <form className={styles.form} onSubmit={handleLogin}>

            <h1>Owner Login</h1>

            <input
                type="email"
                placeholder="Owner Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit">
                Login
            </button>

        </form>
    </div>
);
}

export default OwnerLogin;