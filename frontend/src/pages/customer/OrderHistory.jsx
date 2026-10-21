import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./OrderHistory.module.css";

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState("CURRENT");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const customerToken = localStorage.getItem("customerToken");


    const customerId = localStorage.getItem("xeroxCustomerId");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${customerToken}`,
                        },
                    }
                );

                setOrders(response.data.orders);
            } catch (error) {
                const status = error.response?.status;

                const message =
                    status >= 500
                        ? "Server error. Please try again later."
                        : error.response?.data?.message ||
                        "Registration failed. Please try again.";

                toast.error(message, {
                    duration: 3000,
                });
            }
        };

        if (customerToken) {
            fetchOrders();
        } else {
            navigate("/login");
        }
    }, [customerToken, navigate]);

    const displayedOrders =
        view === "CURRENT"
            ? orders.slice(0, 1)
            : orders;

    const handleSelectView = (selectedView) => {
        setView(selectedView);
        setDropdownOpen(false);
    };


    const handleViewFile = async (s3Key) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/files/view-url`,
                {
                    params: { s3Key },
                    headers: {
                        Authorization: `Bearer ${customerToken}`,
                    },
                }
            );

            window.open(response.data.url, "_blank", "noopener,noreferrer");
        } catch (error) {
            toast.error("Unable to open PDF");
        }
    };

    const handleDeleteFile = async (orderId, s3Key) => {
        if (!window.confirm("Delete this PDF?")) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/files`,
                {
                    data: { s3Key },
                    headers: {
                        Authorization: `Bearer ${customerToken}`,
                    },
                }
            );

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId
                        ? {
                            ...order,
                            files: order.files.filter(
                                (file) => file.s3Key !== s3Key
                            ),
                        }
                        : order
                )
            );

            toast.success("PDF deleted successfully");
        } catch (error) {
            const status = error.response?.status;

            const message =
                status >= 500
                    ? "Server error. Please try again later."
                    : error.response?.data?.message ||
                    "Failed to delete PDF. Please try again.";

            toast.error(message, {
                duration: 3000,
            });
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Delete the entire order and all its PDFs?")) return;

        setDeletingOrderId(orderId);

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${customerToken}`,
                    },
                }
            );

            setOrders((prevOrders) =>
                prevOrders.filter((order) => order._id !== orderId)
            );

            toast.success("Order deleted successfully");
        } catch (error) {
            const status = error.response?.status;

            const message =
                status >= 500
                    ? "Server error. Please try again later."
                    : error.response?.data?.message ||
                    "Failed to delete order. Please try again.";

            toast.error(message, {
                duration: 3000,
            });
        } finally {
            setDeletingOrderId(null);
        }
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
                                <h2>Order : {order.orderNumber}</h2>
                                <span className={styles.orderStatus}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            <div className={styles.orderDetails}>
                                {order.paymentMethod === "GPay" && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>
                                            Payment Status
                                        </span>
                                        <span className={styles.detailValue}>
                                            {order.paymentVerificationStatus}
                                        </span>
                                    </div>
                                )}
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
                                    <span className={styles.detailLabel}>Files</span>

                                    <div>
                                        {order.files.map((file, index) => (
                                            <div key={file.s3Key || index}>
                                                <span>{file.filename}</span>

                                                <button
                                                    type="button"
                                                    onClick={() => handleViewFile(file.s3Key)}
                                                    title="View PDF"
                                                    aria-label={`View ${file.filename}`}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {order.orderStatus === "PENDING" && order.files.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFile(order._id, file.s3Key)}
                                                    >
                                                        Delete PDF
                                                    </button>
                                                )}

                                            </div>

                                        ))}
                                    </div>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                        Date
                                    </span>
                                    <span className={styles.detailValue}>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString("en-GB")}
                                    </span>
                                </div>
                            </div>
                            {order.orderStatus === "PENDING" && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order._id)}
                                    disabled={deletingOrderId === order._id}
                                >
                                    {deletingOrderId === order._id
                                        ? "Deleting..."
                                        : "Delete Entire Order"}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default OrderHistory;