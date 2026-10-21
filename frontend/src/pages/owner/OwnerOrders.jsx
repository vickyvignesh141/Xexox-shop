import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import {
  FileText,
  User,
  Phone,
  Building2,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck
} from "lucide-react";
import styles from "./OwnerOrders.module.css";


function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");

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
toast.error("Unable to open PDF. Please try again.", {
  duration: 3000,
});    }
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
toast.error("Unable to open PDF. Please try again.", {
  duration: 3000,
});    }
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

      const status = error.response?.status;

      const message =
        status >= 500
          ? "Server error. Please try again later."
          : error.response?.data?.message ||
          "Failed to load orders. Please try again.";

      toast.error(message);
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

    toast.success(
      `Payment ${status.toLowerCase()} successfully`
    );

    fetchOrders();

  } catch (error) {
    const status = error.response?.status;

    const message =
      status >= 500
        ? "Server error. Please try again later."
        : error.response?.data?.message ||
        "Payment update failed. Please try again.";

    toast.error(message);
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

    toast.success(
      `Order marked as ${status.toLowerCase()}`
    );

    fetchOrders();

  } catch (error) {
    const status = error.response?.status;

    const message =
      status >= 500
        ? "Server error. Please try again later."
        : error.response?.data?.message ||
        "Order status update failed. Please try again.";

    toast.error(message);
  }
};


const filteredOrders = orders.filter((order) => {
  // Status filter
  if (
    statusFilter === "COMPLETED" &&
    order.orderStatus !== "COMPLETED"
  ) {
    return false;
  }

  if (
    statusFilter === "NOT-COMPLETED" &&
    order.orderStatus !== "NOT-COMPLETED"
  ) {
    return false;
  }

  if (
    statusFilter === "ALL" &&
    order.orderStatus === "COMPLETED"
  ) {
    return false;
  }

  // Date filter
  if (selectedDate) {
    const orderDate = new Date(order.createdAt)
      .toLocaleDateString("en-CA");

    if (orderDate !== selectedDate) {
      return false;
    }
  }

  return true;
});


return (
  <>

    <div className={styles.container}>
      <Toaster position="top-right" richColors duration={3000}/>


      <h1 className={styles.title}>
        <FileCheck size={28} className={styles.titleIcon} />
        Owner Orders
      </h1>


      <div className={styles.filters}>
        <label className={styles.filterGroup}>
          <span>Date</span>
          <input
            className={styles.filterInput}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>

        <label className={styles.filterGroup}>
          <span>Status</span>
          <select
            className={styles.filterInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="NOT-COMPLETED">Not Completed</option>
          </select>
        </label>

        <button
          type="button"
          className={styles.resetButton}
          onClick={() => {
            setSelectedDate("");
            setStatusFilter("ALL");
          }}
        >
          Reset Filters
        </button>
      </div>


      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <AlertCircle size={48} />
          <p>No active orders found.</p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            className={styles.orderCard}
          >

            <div className={styles.orderHeader}>
              <h2 className={styles.orderTitle}>
                Order: {order.orderNumber}
              </h2>
              <span className={`${styles.statusBadge} ${styles[`status_${order.orderStatus}`]}`}>
                {order.orderStatus}
              </span>
            </div>

            <div className={styles.mainGrid}>
              {/* LEFT SECTION: CUSTOMER DETAILS */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <User size={16} />
                  Customer Details
                </h3>

                <div className={styles.infoRow}>
                  <User size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Name</div>
                    <div className={styles.value}>{order.customerId?.name}</div>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Phone size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Mobile</div>
                    <div className={styles.value}>{order.customerId?.mobile}</div>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Building2 size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Department</div>
                    <div className={styles.value}>{order.customerId?.department}</div>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <MapPin size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Section</div>
                    <div className={styles.value}>{order.customerId?.section}</div>
                  </div>
                </div>

                {order.paymentMethod === "GPay" && order.transactionId && (
                  <div className={styles.infoRow}>
                    <CreditCard size={18} className={styles.icon} />
                    <div>
                      <div className={styles.label}>Transaction ID</div>
                      <div className={styles.value}>{order.transactionId}</div>
                    </div>
                  </div>
                )}

                <div className={styles.infoRow}>
                  <CreditCard size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Payment Method</div>
                    <div className={styles.value}>
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "GPay"}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION: ORDER INFO */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <Calendar size={16} />
                  Order Info
                </h3>

                <div className={styles.infoRow}>
                  <Calendar size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Order Date</div>
                    <div className={styles.value}>
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <DollarSign size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Total Amount</div>
                    <div className={styles.value}>₹{order.totalAmount}</div>
                  </div>
                </div>

                {order.customerComment?.trim() && (
                  <div className={styles.infoRow}>
                    <FileText size={18} className={styles.icon} />

                    <div>
                      <div className={styles.label}>
                        Customer Comment
                      </div>

                      <div className={styles.value}>
                        {order.customerComment}
                      </div>
                    </div>
                  </div>
                )}

                {/* <div className={styles.infoRow}>
                  <AlertCircle size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Payment Status</div>
                    <div className={`${styles.value} ${styles[`paymentStatus_${order.paymentVerificationStatus}`]}`}>
                      {order.paymentVerificationStatus}
                    </div>
                  </div>
                </div> */}

                <div className={styles.infoRow}>
                  <FileCheck size={18} className={styles.icon} />
                  <div>
                    <div className={styles.label}>Order Status</div>
                    <div className={`${styles.value} ${styles[`orderStatus_${order.orderStatus}`]}`}>
                      {order.orderStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FILES SECTION */}
            <div className={styles.filesSection}>
              <h3 className={styles.sectionTitle}>
                <FileText size={16} />
                Files
              </h3>

              {order.files.map((file, index) => (
                <div
                  key={index}
                  className={styles.fileCard}
                >

                  <div className={styles.fileName}>
                    <FileText size={16} />
                    {file.filename}
                  </div>

                  <div className={styles.fileSpecs}>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Pages</span>
                      <span className={styles.specValue}>{file.pageCount}</span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Copies</span>
                      <span className={styles.specValue}>{file.copies}</span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Print</span>
                      <span className={styles.specValue}>
                        {file.colorMode === "BW" ? "B&W" : "Color"}
                      </span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Side</span>
                      <span className={styles.specValue}>
                        {file.side === "SINGLE" ? "Single" : "Double"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.fileButtons}>
                    {/* <button
                      className={`${styles.button} ${styles.viewButton}`}
                      onClick={() => openPdf(file.s3Key)}
                    >
                      <Eye size={16} />
                      View PDF
                    </button> */}

                    <button
                      className={`${styles.button} ${styles.printButton}`}
                      onClick={() => printPdf(file.s3Key)}
                    >
                      <Printer size={16} />
                      Print PDF
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* PAYMENT VERIFICATION BUTTONS */}
            {order.paymentMethod === "GPay" &&
              order.paymentVerificationStatus === "PENDING" && (
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
                    <CheckCircle size={16} />
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
                    <XCircle size={16} />
                    Reject Payment
                  </button>

                </div>
              )
            }

            {/* ORDER STATUS BUTTONS */}
            {order.orderStatus === "PENDING" &&
              (
                order.paymentMethod === "COD" ||
                order.paymentVerificationStatus === "VERIFIED"
              ) && (
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
                    <CheckCircle size={16} />
                    Mark Completed
                  </button>

                  <button
                    className={`${styles.button} ${styles.notCompleteButton}`}
                    onClick={() =>
                      updateOrderStatus(
                        order.orderNumber,
                        "NOT-COMPLETED"
                      )
                    }
                  >
                    <AlertCircle size={16} />
                    Mark Not Completed
                  </button>

                </div>
              )}

          </div>
        ))
      )}

    </div>
  </>
);
}

export default OwnerOrders;