import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./OrderHistory.module.css";
import Header from "../common/header.jsx"; // Import the Header component

function OrderHistory() {
    const [orders, setOrders] = useState([]);

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

    return (
        <>
      {/* ✅ Header added here */}
      <Header />
        <div className={styles.container}>
            <div className={styles.card}>

                <h1 className={styles.title}>My Orders</h1>

                {orders.length === 0 ? (
                    <p className={styles.empty}>
                        No orders found.
                    </p>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order._id}
                            className={styles.orderCard}
                        >
                            <h2>
                                Order: {order.orderNumber}
                            </h2>

                            <p>
                                Payment:{" "}
                                {order.paymentVerificationStatus}
                            </p>

                            <p>
                                Status: {order.orderStatus}
                            </p>

                            <p>
                                Total Amount: ₹{order.totalAmount}
                            </p>

                            <p>
                                Date:{" "}
                                {new Date(
                                    order.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}

            </div>
        </div>
            </>
    );
}

export default OrderHistory;