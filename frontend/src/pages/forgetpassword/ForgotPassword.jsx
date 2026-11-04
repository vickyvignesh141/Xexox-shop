
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
    Mail,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    Loader2
} from "lucide-react";

import styles from "./ForgotPassword.module.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // STEP 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            return toast.error("Please enter your registered email");
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API}/api/customers/forgot-password`,
                { email: email.trim().toLowerCase() }
            );

            toast.success(response.data.message);
            setStep(2);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(otp)) {
            return toast.error("Enter a valid 6-digit OTP");
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API}/api/customers/verify-reset-otp`,
                {
                    email: email.trim().toLowerCase(),
                    otp
                }
            );

            setResetToken(response.data.resetToken);

            toast.success("OTP verified successfully!");
            setStep(3);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "OTP verification failed"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,12}$/;

        if (!passwordPattern.test(newPassword)) {
            return toast.error(
                "Password must be 6-12 characters with an uppercase letter and special character"
            );
        }

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API}/api/customers/reset-password`,
                {
                    email: email.trim().toLowerCase(),
                    resetToken,
                    newPassword,
                    confirmPassword
                }
            );

            toast.success(
                response.data.message || "Password reset successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Toaster position="top-right" richColors />

            <div className={styles.card}>

                <div className={styles.brand}>
                    <div className={styles.logo}>PC</div>
                    <h2>Print <span>Cafe</span></h2>
                </div>

                <div className={styles.iconWrapper}>
                    {step === 1 && <Mail />}
                    {step === 2 && <ShieldCheck />}
                    {step === 3 && <Lock />}
                </div>

                <div className={styles.heading}>
                    <h1>
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Create New Password"}
                    </h1>

                    <p>
                        {step === 1 &&
                            "Enter your registered email address to receive a verification code."}

                        {step === 2 &&
                            `We've sent a 6-digit OTP to ${email}.`}

                        {step === 3 &&
                            "Create a strong password for your account."}
                    </p>
                </div>

                <div className={styles.progress}>
                    {[1, 2, 3].map((number) => (
                        <div
                            key={number}
                            className={`${styles.progressStep} ${
                                step >= number ? styles.active : ""
                            }`}
                        />
                    ))}
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp}>

                        <label>Email Address</label>

                        <div className={styles.inputWrapper}>
                            <Mail />
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className={styles.spinner} />
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    Send OTP <ArrowRight />
                                </>
                            )}
                        </button>

                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>

                        <label>6-Digit OTP</label>

                        <div className={styles.inputWrapper}>
                            <ShieldCheck />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter OTP"
                                maxLength={6}
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value.replace(/\D/g, ""))
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className={styles.spinner} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify OTP <ArrowRight />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                            }}
                        >
                            <ArrowLeft /> Change Email
                        </button>

                    </form>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>

                        <label>New Password</label>

                        <div className={styles.inputWrapper}>
                            <Lock />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <label>Confirm Password</label>

                        <div className={styles.inputWrapper}>
                            <Lock />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <p className={styles.passwordHint}>
                            6–12 characters, at least one uppercase letter
                            and one special character.
                        </p>

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className={styles.spinner} />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    Reset Password <ArrowRight />
                                </>
                            )}
                        </button>

                    </form>
                )}

                <button
                    type="button"
                    className={styles.loginLink}
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeft /> Back to Login
                </button>

                <div className={styles.footer}>
                    © {new Date().getFullYear()} Print Cafe. All rights reserved.
                </div>

            </div>
        </div>
    );
}

export default ForgotPassword;
