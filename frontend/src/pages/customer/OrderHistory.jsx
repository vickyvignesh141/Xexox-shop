import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./OrderHistory.module.css";

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState("CURRENT");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const customerId = localStorage.getItem("xeroxCustomerId");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/orders/customer/${customerId}`
                );
                setOrders(response.data.orders);
            } catch (error) {
                alert(
                    error.response?.data?.message ||
                    "Failed to load orders"
                );
            }
        };

        if (customerId) {
            fetchOrders();
        }
    }, [customerId]);

    const displayedOrders =
        view === "CURRENT"
            ? orders.slice(0, 1)
            : orders;

    const handleSelectView = (selectedView) => {
        setView(selectedView);
        setDropdownOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Order History</h1>
                <div className={styles.dropdownWrapper}>
                    <button
                        className={styles.dropdownBtn}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span>{view === "CURRENT" ? "Current" : "Overall"}</span>
                        <span>▼</span>
                    </button>
                    {dropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <a
                                href="#"
                                className={view === "CURRENT" ? styles.selected : ""}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelectView("CURRENT");
                                }}
                            >
                                Current
                            </a>
                            <a
                                href="#"
                                className={view === "OVERALL" ? styles.selected : ""}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelectView("OVERALL");
                                }}
                            >
                                Overall
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardsContainer}>
                {displayedOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No orders found.</p>
                    </div>
                ) : (
                    displayedOrders.map((order) => (
                        <div key={order._id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <h2>Order #{order.orderNumber}</h2>
                                <span className={styles.orderStatus}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            <div className={styles.orderDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        Payment Status
                                    </span>
                                    <span className={styles.detailValue}>
                                        {order.paymentVerificationStatus}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        Payment Method
                                    </span>
                                    <span className={styles.detailValue}>
                                        {order.paymentMethod}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        Total Amount
                                    </span>
                                    <span className={styles.detailValue}>
                                        ₹{order.totalAmount}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        Date
                                    </span>
                                    <span className={styles.detailValue}>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default OrderHistory;