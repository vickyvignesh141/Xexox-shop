import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./OwnerOrders.module.css";


function OwnerOrders() {
    const [orders, setOrders] = useState([]);

    const token = localStorage.getItem("ownerToken");

 const openPdf = async (s3Key) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/owner/pdf-url`,
            {
                params: { s3Key },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        window.open(response.data.url, "_blank");

    } catch (error) {
        console.error("Open PDF error:", error);
        alert("Unable to open PDF");
    }
};

    const printPdf = async (s3Key) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/owner/pdf-url`,
            {
                params: { s3Key },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const printWindow = window.open(response.data.url, "_blank");

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        }

    } catch (error) {
        console.error("Print PDF error:", error);
        alert("Unable to print PDF");
    }
};
    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/owner/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrders(response.data.orders);

        } catch (error) {
            console.error("Fetch orders error:", error);
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);

            alert(
                error.response?.data?.message ||
                "Failed to load orders"
            );
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const verifyPayment = async (orderNumber, status) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/owner/orders/${orderNumber}/payment`,
                {
                    status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                `Payment ${status.toLowerCase()} successfully`
            );

            fetchOrders();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Payment update failed"
            );
        }
    };

    const updateOrderStatus = async (orderNumber, status) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/owner/orders/${orderNumber}/status`,
                {
                    status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                `Order marked as ${status.toLowerCase()}`
            );

            fetchOrders();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Order status update failed"
            );
        }
    };

    return (
        <div className={styles.container}>

            <h1 className={styles.title}>
                Owner Orders
            </h1>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order._id}
                        className={styles.orderCard}
                    >

                        <h2 className={styles.orderTitle}>
                            Order: {order.orderNumber}
                        </h2>

                        <p className={styles.orderInfo}>
                            Transaction ID: {order.transactionId}
                        </p>

                        <p className={styles.orderInfo}>
                            Order Date:{" "}
                            {new Date(order.createdAt).toLocaleString()}
                        </p>

                        <p className={styles.orderInfo}>
                            Payment: {order.paymentVerificationStatus}
                        </p>

                        <p className={styles.orderInfo}>
                            Status: {order.orderStatus}
                        </p>

                        <p className={styles.orderInfo}>
                            Total Amount: ₹{order.totalAmount}
                        </p>

                        <h3 className={styles.filesTitle}>
                            Files
                        </h3>

                        {order.files.map((file, index) => (
                            <div
                                key={index}
                                className={styles.fileCard}
                            >

                                <p className={styles.fileName}>
                                    {file.filename}
                                </p>

                                <p>
                                    Pages: {file.pageCount}
                                </p>

                                <p>
                                    Copies: {file.copies}
                                </p>

                                <p>
                                    Print:{" "}
                                    {file.colorMode === "BW"
                                        ? "Black & White"
                                        : "Color"}
                                </p>

                                <p>
                                    Side:{" "}
                                    {file.side === "SINGLE"
                                        ? "Single Side"
                                        : "Double Side"}
                                </p>

                                <div className={styles.buttonGroup}>

                                    <button
                                        className={`${styles.button} ${styles.viewButton}`}
                                        onClick={() =>
                                            openPdf(file.s3Key)
                                        }
                                    >
                                        View PDF
                                    </button>

                                    <button
                                        className={`${styles.button} ${styles.printButton}`}
                                        onClick={() =>
                                            printPdf(file.s3Key)
                                        }
                                    >
                                        Print PDF
                                    </button>

                                </div>

                            </div>
                        ))}

                        {/* Payment buttons */}

                        {order.paymentVerificationStatus === "PENDING" && (
                            <div className={styles.buttonGroup}>

                                <button
                                    className={`${styles.button} ${styles.verifyButton}`}
                                    onClick={() =>
                                        verifyPayment(
                                            order.orderNumber,
                                            "VERIFIED"
                                        )
                                    }
                                >
                                    Verify Payment
                                </button>

                                <button
                                    className={`${styles.button} ${styles.rejectButton}`}
                                    onClick={() =>
                                        verifyPayment(
                                            order.orderNumber,
                                            "REJECTED"
                                        )
                                    }
                                >
                                    Reject Payment
                                </button>

                            </div>
                        )}

                        {/* Xerox status buttons */}

                        {order.paymentVerificationStatus === "VERIFIED" &&
                            order.orderStatus === "PENDING" && (
                                <div className={styles.buttonGroup}>

                                    <button
                                        className={`${styles.button} ${styles.completeButton}`}
                                        onClick={() =>
                                            updateOrderStatus(
                                                order.orderNumber,
                                                "COMPLETED"
                                            )
                                        }
                                    >
                                        Mark Completed
                                    </button>

                                    <button
                                        className={`${styles.button} ${styles.notCompleteButton}`}
                                        onClick={() =>
                                            updateOrderStatus(
                                                order.orderNumber,
                                                "NOT_COMPLETED"
                                            )
                                        }
                                    >
                                        Mark Not Completed
                                    </button>

                                </div>
                            )}

                    </div>
                ))
            )}

        </div>
    );
}

export default OwnerOrders;