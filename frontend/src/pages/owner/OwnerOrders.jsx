import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import {
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import styles from "./OwnerOrders.module.css";

// A note up to this length sits in the 6th box of the row.
// A longer note moves to its own full-width row so the boxes stay aligned.
const NOTE_INLINE_MAX = 30;

const STATUS_LABELS = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  "NOT-COMPLETED": "Not completed",
};

// PENDING -> styles.pending, NOT-COMPLETED -> styles.notcompleted
const statusClass = (status) =>
  styles[(status || "").toLowerCase().replace(/[^a-z]/g, "")];

function Field({ label, value, wide }) {
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value || "—"}</span>
    </div>
  );
}

function InfoRow({ label, stacked, children }) {
  return (
    <div className={`${styles.infoRow} ${stacked ? styles.infoRowStacked : ""}`}>
      <span className={styles.infoLabel}>{label}</span>
      <div className={styles.infoValue}>{children}</div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className={styles.box}>
      <span className={styles.boxLabel}>{label}</span>
      <span className={styles.boxValue}>{value}</span>
    </div>
  );
}

function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [printedFiles, setPrintedFiles] = useState([]);
  const [expiredFiles, setExpiredFiles] = useState([]);

  const token = localStorage.getItem("ownerToken");

  const printPdf = async (s3Key) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/owner/pdf-url`,
        {
          params: { s3Key },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Mark this file as clicked
      setPrintedFiles((prev) =>
        prev.includes(s3Key) ? prev : [...prev, s3Key]
      );

      const printWindow = window.open(response.data.url, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      if (status === 410 || code === "FILE_EXPIRED") {
        setExpiredFiles((prev) =>
          prev.includes(s3Key) ? prev : [...prev, s3Key]
        );

        toast.error("This PDF has expired.");
      } else {
        toast.error("Unable to open PDF. Please try again.");
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/owner/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const verifyPayment = async (orderNumber, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/owner/orders/${orderNumber}/payment`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Payment ${status.toLowerCase()} successfully`);

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
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order marked as ${status.toLowerCase()}`);

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
    if (statusFilter === "COMPLETED" && order.orderStatus !== "COMPLETED") {
      return false;
    }

    if (
      statusFilter === "NOT-COMPLETED" &&
      order.orderStatus !== "NOT-COMPLETED"
    ) {
      return false;
    }

    if (statusFilter === "ALL" && order.orderStatus === "COMPLETED") {
      return false;
    }

    // Date filter
    if (selectedDate) {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-CA");

      if (orderDate !== selectedDate) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className={styles.container}>
      <Toaster position="top-right" richColors duration={3000} />

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
            <option value="ALL">Active</option>
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
          <article key={order._id} className={styles.orderCard}>
            {/* HEADER */}
            <header className={styles.orderHeader}>
              <h2 className={styles.orderTitle}>Order {order.orderNumber}</h2>
              <span className={`${styles.pill} ${statusClass(order.orderStatus)}`}>
                {STATUS_LABELS[order.orderStatus] || order.orderStatus}
              </span>
            </header>

            {/* CUSTOMER DETAILS + ORDER INFO */}
            <section className={styles.summary}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Customer details</h3>
                <div className={styles.fields}>
                  <Field label="Name" value={order.customerId?.name} />
                  <Field label="Mobile" value={order.customerId?.mobile} />
                  <Field
                    label="Department"
                    value={order.customerId?.department}
                    wide
                  />
                  <Field label="Section" value={order.customerId?.section} />
                  <Field
                    label="Payment method"
                    value={
                      order.paymentMethod === "COD" ? "Cash on Delivery" : "GPay"
                    }
                  />
                  {order.paymentMethod === "GPay" && order.transactionId && (
                    <Field
                      label="Transaction ID"
                      value={order.transactionId}
                      wide
                    />
                  )}
                </div>
              </div>

              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Order info</h3>

                <InfoRow label="Order date">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    timeZone: "Asia/Kolkata",
                  })}
                </InfoRow>

                <InfoRow label="Total amount">
                  <span className={styles.amount}>₹{order.totalAmount}</span>
                </InfoRow>

                {order.customerComment?.trim() && (
                  <InfoRow label="Customer comment" stacked>
                    <div className={styles.comment}>{order.customerComment}</div>
                  </InfoRow>
                )}

                <InfoRow label="Order status">
                  <span
                    className={`${styles.pill} ${statusClass(order.orderStatus)}`}
                  >
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </InfoRow>
              </div>
            </section>

            {/* FILES */}
            <section className={styles.filesSection}>
              <h3 className={styles.filesTitle}>
                Files <span className={styles.count}>{order.files.length}</span>
              </h3>

              {order.files.map((file, index) => {
                const note = file.note?.trim();
                const longNote =
                  note && (note.length > NOTE_INLINE_MAX || note.includes("\n"));

                return (
                  <div key={index} className={styles.fileCard}>
                    <div className={styles.fileHead}>
                      <h4 className={styles.fileName}>{file.filename}</h4>

                      {expiredFiles.includes(file.s3Key) ? (
                        <span className={styles.expiredFile}>PDF Expired</span>
                      ) : order.orderStatus !== "COMPLETED" ? (
                        <>
                          <button
                            type="button"
                            className={styles.printButton}
                            onClick={() => printPdf(file.s3Key)}
                          >
                            <Printer size={16} />
                            Print PDF
                          </button>

                          {printedFiles.includes(file.s3Key) && (
                            <span className={styles.printedCheck}>✓</span>
                          )}
                        </>
                      ) : null}
                    </div>

                    {/* THE 6 BOXES */}
                    <div
                      className={`${styles.boxes} ${longNote ? styles.boxesLong : ""
                        }`}
                    >
                      <Spec label="Pages" value={file.pageCount} />
                      <Spec label="Copies" value={file.copies} />
                      <Spec
                        label="Print"
                        value={file.colorMode === "BW" ? "B&W" : "Color"}
                      />
                      <Spec
                        label="Side"
                        value={file.side === "SINGLE" ? "Single" : "Double"}
                      />
                      <Spec label="Paper size" value={file.paperSize || "A4"} />

                      <div className={`${styles.box} ${styles.noteBox}`}>
                        <span className={styles.boxLabel}>Customer note</span>
                        {note ? (
                          <span className={styles.noteText}>{note}</span>
                        ) : (
                          <span className={styles.noteEmpty}>No note</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* PAYMENT VERIFICATION BUTTONS */}
            {order.paymentMethod === "GPay" &&
              order.paymentVerificationStatus === "PENDING" && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.reject}`}
                    onClick={() => verifyPayment(order.orderNumber, "REJECTED")}
                  >
                    <XCircle size={16} />
                    Reject payment
                  </button>

                  <button
                    type="button"
                    className={`${styles.button} ${styles.success}`}
                    onClick={() => verifyPayment(order.orderNumber, "VERIFIED")}
                  >
                    <CheckCircle size={16} />
                    Verify payment
                  </button>
                </div>
              )}

            {/* ORDER STATUS BUTTONS */}
            {order.orderStatus === "PENDING" &&
              (order.paymentMethod === "COD" ||
                order.paymentVerificationStatus === "VERIFIED") && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.warn}`}
                    onClick={() =>
                      updateOrderStatus(order.orderNumber, "NOT-COMPLETED")
                    }
                  >
                    <AlertCircle size={16} />
                    Mark not completed
                  </button>

                  <button
                    type="button"
                    className={`${styles.button} ${styles.success}`}
                    onClick={() =>
                      updateOrderStatus(order.orderNumber, "COMPLETED")
                    }
                  >
                    <CheckCircle size={16} />
                    Mark completed
                  </button>
                </div>
              )}
          </article>
        ))
      )}
    </div>
  );
}

export default OwnerOrders;