import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Payment.module.css";
import shopQR from "../../assets/QR.jpeg";

function Payment() {
    const navigate = useNavigate();

    const [transactionId, setTransactionId] = useState("");

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
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/orders`,
            {
                customerId: pendingOrder.customerId,
                files: pendingOrder.files,
                paymentMethod: "COD"
            }
        );

        alert(
            `Order created: ${response.data.order.orderNumber}`
        );

        localStorage.removeItem("pendingOrder");

        navigate("/tracking");

    } catch (error) {
        alert(
            error.response?.data?.message ||
            "Order creation failed"
        );
    }
};


    // -----------------------------------------
    // Create UPI order
    // -----------------------------------------

    const handleUPIOrder = async () => {
    if (!transactionId.trim()) {
        alert("Please enter transaction ID");
        return;
    }

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

        alert(
            `Order created: ${response.data.order.orderNumber}`
        );

        localStorage.removeItem("pendingOrder");

        navigate("/tracking");

    } catch (error) {
        alert(
            error.response?.data?.message ||
            "Order creation failed"
        );
    }
};


    return (
        <div className={styles.container}>

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
                        >
                            Confirm Order
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
                        >
                            Confirm Payment & Create Order
                        </button>

                    </div>
                )}


                <button
                    type="button"
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

export default Payment;