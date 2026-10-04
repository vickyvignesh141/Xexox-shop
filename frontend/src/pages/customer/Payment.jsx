import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import styles from "./Payment.module.css";
import shopQR from "../../assets/QR.jpeg";


function Payment() {
    const navigate = useNavigate();

    const [transactionId, setTransactionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const pendingOrder = JSON.parse(
        localStorage.getItem("pendingOrder")
    );

    // -----------------------------------------
    // No pending order
    // -----------------------------------------

    if (!pendingOrder) {
        return (
            <div className={styles.container}>
                <div className={styles.form}>

                    <h2>No pending order found</h2>

                    <button
                        onClick={() =>
                            navigate("/upload")
                        }
                    >
                        Back to Upload
                    </button>

                </div>
            </div>
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
                    paymentMethod: "COD"
                }
            );

            toast.success(
                `Order created: ${response.data.order.orderNumber}`
            );

            localStorage.removeItem("pendingOrder");

            navigate("/tracking");

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
                transactionId: transactionId.trim()
            }
        );

        toast.success(
            `Order created: ${response.data.order.orderNumber}`
        );

        localStorage.removeItem("pendingOrder");

        navigate("/tracking");

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
        <div className={styles.container}>
            <Toaster position="top-right" richColors />


            <div className={styles.form}>

                <h1>Payment</h1>


                <h2>
                    Total Amount: ₹
                    {pendingOrder.totalAmount}
                </h2>


                {/* -------------------------------- */}
                {/* COD */}
                {/* -------------------------------- */}

                {pendingOrder.paymentType === "COD" && (
                    <div>

                        <h3>Cash on Delivery</h3>

                        <p>
                            You can pay cash when you
                            collect your order.
                        </p>

                        <button
                            type="button"
                            onClick={handleCODOrder}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Order..." : "Confirm Order"}
                        </button>

                    </div>
                )}


                {/* -------------------------------- */}
                {/* UPI */}
                {/* -------------------------------- */}

                {pendingOrder.paymentType === "UPI" && (
                    <div>

                        <h3>Scan & Pay</h3>

                        <img
                            src={shopQR}
                            alt="Shop UPI QR Code"
                            width="200"
                        />

                        <p>
                            Scan the QR code and complete
                            payment.
                        </p>


                        <label>
                            Transaction ID
                        </label>

                        <input
                            type="text"
                            placeholder="Enter transaction ID"
                            value={transactionId}
                            onChange={(e) =>
                                setTransactionId(
                                    e.target.value
                                )
                            }
                        />


                        <button
                            type="button"
                            onClick={handleUPIOrder}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Creating Order..."
                                : "Confirm Payment & Create Order"
                            }
                        </button>

                    </div>
                )}


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
    );
}

export default Payment;