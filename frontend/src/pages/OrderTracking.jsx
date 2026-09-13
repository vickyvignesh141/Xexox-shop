import { useState } from "react";
import axios from "axios";

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
        <div>
            <h1>Order Tracking</h1>

            <input
                type="text"
                placeholder="Enter Order Number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
            />

            <button onClick={handleTrackOrder}>
                Track Order
            </button>

            {order && (
                <div>
                    <h2>Order: {order.orderNumber}</h2>

                    <p>
                        Payment: {order.paymentVerificationStatus}
                    </p>

                    <p>
                        Status: {order.orderStatus}
                    </p>
                </div>
            )}
        </div>
    );
}

export default OrderTracking;