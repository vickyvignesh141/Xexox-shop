import { useState } from "react";
import axios from "axios";
import styles from "./OrderTracking.module.css";


function OrderTracking() {
    const [orderNumber, setOrderNumber] = useState("");
    const [order, setOrder] = useState(null);

    const handleTrackOrder = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderNumber}`
            );

            setOrder(response.data.order);
        } catch (error) {
            alert(
                error.response?.data?.message || "Order not found"
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>

                <h1>Order Tracking</h1>

                <input
                    type="text"
                    placeholder="Enter Order Number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className={styles.input}
                />

                <button onClick={handleTrackOrder} className={styles.trackButton}>
                    Track Order
                </button>

                {order && (
                    <div className={styles.resultCard}>

                        <h2>Order: {order.orderNumber}</h2>

                        <p className={styles.statusPill}>
                            💳 Payment: {order.paymentVerificationStatus}
                        </p>

                        <p className={styles.statusPill}>
                            📦 Status: {order.orderStatus}
                        </p>

                        <p>Total Amount: ₹{order.totalAmount}</p>

                        <p>Transaction ID: {order.transactionId}</p>

                        <h3>Files</h3>

                        {order.files.map((file, index) => (
                            <div key={index}>
                                <p>File: {file.filename}</p>
                                <p>Pages: {file.pageCount}</p>
                                <p>Copies: {file.copies}</p>
                                <p>
                                    Print: {file.colorMode === "BW"
                                        ? "Black & White"
                                        : "Color"}
                                </p>
                                <p>
                                    Side: {file.side === "SINGLE"
                                        ? "Single Side"
                                        : "Double Side"}
                                </p>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default OrderTracking;