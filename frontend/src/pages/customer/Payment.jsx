import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
    Check,
    Banknote,
    QrCode,
    Hash,
    Loader2,
    ArrowLeft,
    PackageX
} from "lucide-react";
import styles from "./Payment.module.css";
import shopQR from "../../assets/QR.jpeg";
import Header from "../common/header.jsx"; // Import the Header component


function Payment() {
    const navigate = useNavigate();

    const [transactionId, setTransactionId] = useState("");
    const [customerComment, setCustomerComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const pendingOrder = JSON.parse(
        localStorage.getItem("pendingOrder")
    );

    // -----------------------------------------
    // No pending order
    // -----------------------------------------

    if (!pendingOrder) {
        return (
            <>
                {/* ✅ Header added here */}
                <Header />
                <div className={styles.container}>
                    <div className={styles.form}>

                        <div className={styles.emptyCard}>

                            <div className={styles.emptyIcon}>
                                <PackageX size={30} />
                            </div>

                            <h2>No pending order found</h2>

                            <button
                                className={styles.backButton}
                                onClick={() =>
                                    navigate("/upload")
                                }
                            >
                                <ArrowLeft size={18} />
                                Back to Upload
                            </button>

                        </div>

                    </div>
                </div>
            </>
        );
    }


    // -----------------------------------------
    // Create COD order
    // -----------------------------------------

    const handleCODOrder = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                {
                    customerId: pendingOrder.customerId,
                    files: pendingOrder.files,
                    paymentMethod: "COD",
                    customerComment: customerComment.trim()
    ? customerComment.trim()
    : undefined,    
                }
            );

            toast.success(
                `Order created: ${response.data.order.orderNumber}`,
                {
                    duration: 3000
                }
            );

            localStorage.removeItem("pendingOrder");

            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Order creation failed"
            );
        } finally {
            setIsLoading(false);
        }
    };


    // -----------------------------------------
    // Create UPI order
    // -----------------------------------------

    const handleUPIOrder = async () => {
        if (isLoading) return;

        if (!transactionId.trim()) {
            toast.error("Please enter transaction ID");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                {
                    customerId: pendingOrder.customerId,
                    files: pendingOrder.files,
                    paymentMethod: "GPay",
                    transactionId: transactionId.trim(),
                    customerComment: customerComment.trim()
    ? customerComment.trim()
    : undefined,
                }
            );

            toast.success(
                `Order created: ${response.data.order.orderNumber}`,
                {
                    duration: 3000
                }
            );

            localStorage.removeItem("pendingOrder");

            setTimeout(() => {
                navigate("/");
            }, 3000);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Order creation failed"
            );
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {/* ✅ Header added here */}
            <Header />
            <div className={styles.container}>
                <Toaster position="top-right" richColors />


                <div className={styles.form}>

                    <h1 className={styles.visuallyHidden}>Payment</h1>


                    {/* Steps (visual only) */}

                    {/* <div className={styles.steps}>
                    <span className={styles.stepDone}>
                        <i><Check size={12} strokeWidth={3} /></i>
                        Upload
                    </span>
                    <u></u>
                    <span className={styles.stepCurrent}>
                        <i>2</i>
                        Payment
                    </span>
                    <u></u>
                    <span>
                        <i>3</i>
                        Tracking
                    </span>
                </div> */}


                    {/* Total */}

                    <div className={styles.hero}>
                        <small>Total Amount</small>
                        <h2>
                            ₹
                            {pendingOrder.totalAmount}
                        </h2>
                        <p>Review and confirm your order</p>
                    </div>


                    {/* -------------------------------- */}
                    {/* COD */}
                    {/* -------------------------------- */}

                    {pendingOrder.paymentType === "COD" && (
                        <div className={styles.card}>

                            <div className={styles.method}>
                                <div className={styles.methodIcon}>
                                    <Banknote size={22} />
                                </div>

                                <div>
                                    <h3>Cash on Delivery</h3>
                                    <span>Pay at the shop</span>
                                </div>

                                <div className={styles.tick}>
                                    <Check size={13} strokeWidth={3.5} />
                                </div>
                            </div>

                            <ul className={styles.list}>
                                <li>
                                    <em>1</em>
                                    Confirm your order below.
                                </li>
                                <li>
                                    <em>2</em>
                                    Collect your printouts from the shop.
                                </li>
                                <li>
                                    <em>3</em>
                                    You can pay cash when you
                                    collect your order.
                                </li>
                            </ul>

                            <div className={styles.actionBar}>
                                <button
                                    type="button"
                                    onClick={handleCODOrder}
                                    disabled={isLoading}
                                    className={styles.confirmButton}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className={styles.spin} />
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} strokeWidth={2.5} />
                                            Confirm Order
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}


                    {/* -------------------------------- */}
                    {/* UPI */}
                    {/* -------------------------------- */}

                    {pendingOrder.paymentType === "UPI" && (
                        <div className={styles.card}>

                            <div className={styles.method}>
                                <div className={styles.methodIcon}>
                                    <QrCode size={22} />
                                </div>

                                <div>
                                    <h3>Scan & Pay</h3>
                                    <span>UPI / QR payment</span>
                                </div>

                                <div className={styles.tick}>
                                    <Check size={13} strokeWidth={3.5} />
                                </div>
                            </div>

                            <div className={styles.qr}>
                                <div className={styles.qrBox}>
                                    <img
                                        src={shopQR}
                                        alt="Shop UPI QR Code"
                                        width="200"
                                        className={styles.qrImage}
                                    />
                                </div>
                            </div>

                            <ul className={styles.list}>
                                <li>
                                    <em>1</em>
                                    Scan the QR code and complete
                                    payment.
                                </li>
                                <li>
                                    <em>2</em>
                                    Copy the transaction ID from your UPI app.
                                </li>
                            </ul>


                            <label
                                htmlFor="transactionId"
                                className={styles.fieldLabel}
                            >
                                Transaction ID
                            </label>

                            <div className={styles.inputWrap}>
                                <Hash size={18} />

                                <input
                                    id="transactionId"
                                    type="text"
                                    placeholder="Enter transaction ID"
                                    value={transactionId}
                                    onChange={(e) =>
                                        setTransactionId(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>


                            <div className={styles.actionBar}>
                                <button
                                    type="button"
                                    onClick={handleUPIOrder}
                                    disabled={isLoading}
                                    className={styles.confirmButton}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className={styles.spin} />
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} strokeWidth={2.5} />
                                            Confirm Payment & Create Order
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}

                    <div className={styles.commentSection}>
                        <label
                            htmlFor="customerComment"
                            className={styles.fieldLabel}
                        >
                            Comment <span>(Optional)</span>
                        </label>

                        <textarea
                            id="customerComment"
                            value={customerComment}
                            onChange={(e) => setCustomerComment(e.target.value)}
                            placeholder="Any special instructions for the shop..."
                            rows={4}
                            className={styles.commentBox}
                        />
                    </div>


                    {/* <button
                    type="button"
                    onClick={() =>
                        navigate("/upload")
                    }
                >
                    Back to Upload
                </button> */}

                </div>

            </div>
        </>
    );
}

export default Payment;