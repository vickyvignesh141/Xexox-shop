import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
    UploadCloud,
    FileText,
    Trash2,
    Plus,
    Calculator,
    Eye,
    Wallet,
    ArrowRight,
    Loader2,
    IndianRupee,
    CheckCircle2,
    AlertTriangle,
    ClipboardList,
    X,
    Info,
    FileCheck2,
    Ruler,
    Palette,
    Copy,
    Layers,
} from "lucide-react";
import styles from "./UploadOrder.module.css";

function UploadOrder() {
    const navigate = useNavigate();
    const [showInstructions, setShowInstructions] = useState(true);

    // Selected local files waiting to be uploaded
    const [selectedFiles, setSelectedFiles] = useState([]);
    // Track which selected PDF is being replaced
    const [replacingIndex, setReplacingIndex] = useState(null);

    // Hidden input used for replacing a selected PDF
    const replaceInputRef = useRef(null);

    // Uploaded files with print settings
    const [files, setFiles] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [paymentType, setPaymentType] = useState("COD");

    // -----------------------------------------
    // Select PDF
    // -----------------------------------------
    // -----------------------------------------
    // Select or Replace PDF
    // -----------------------------------------
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        // Validate PDF
        if (selectedFile.type !== "application/pdf") {
            toast.error("Please select a PDF file", {
                icon: <AlertTriangle size={18} />,
            });

            e.target.value = "";
            setReplacingIndex(null);
            return;
        }

        // If replacing an existing selected file
        if (replacingIndex !== null) {
            setSelectedFiles((prev) =>
                prev.map((file, index) =>
                    index === replacingIndex ? selectedFile : file
                )
            );

            toast.success("PDF replaced successfully!");

            setReplacingIndex(null);
            e.target.value = "";
            return;
        }

        // Maximum 5 files
        if (selectedFiles.length + files.length >= 5) {
            toast.warning("Maximum 5 files are allowed", {
                icon: <AlertTriangle size={18} />,
            });

            e.target.value = "";
            return;
        }

        // Add new PDF
        setSelectedFiles((prev) => [...prev, selectedFile]);

        e.target.value = "";
    };

    // -----------------------------------------
    // Open File Explorer to replace PDF
    // -----------------------------------------
    const handleReplaceClick = (index) => {
        setReplacingIndex(index);
        replaceInputRef.current?.click();
    };

    // -----------------------------------------
    // Remove selected PDF before S3 upload
    // -----------------------------------------
    const removeSelectedFile = (index) => {
        setSelectedFiles((prev) =>
            prev.filter((_, i) => i !== index)
        );

        toast.success("Selected PDF removed");
    };

    // -----------------------------------------
    // Upload selected PDF
    // -----------------------------------------
    const handleUpload = async () => {
        const customerToken = localStorage.getItem("customerToken");

        if (!customerToken) {
            toast.error("Please login before uploading PDFs", {
                icon: <AlertTriangle size={18} />,
            });
            navigate("/login");
            return;
        }

        if (selectedFiles.length === 0) {
            toast.warning("Please select a PDF", {
                icon: <AlertTriangle size={18} />,
            });
            return;
        }

        try {
            setUploading(true);

            const uploadedResults = [];

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/upload`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${customerToken}`,
                        },
                    }
                );

                uploadedResults.push({
                    ...response.data.file,
                    originalFile: file,
                    copies: 1,
                    colorMode: "BW",
                    side: "SINGLE",
                    // Backend calculated amount
                    amount: 0,
                });
            }

            setFiles((prev) => [...prev, ...uploadedResults]);

            setSelectedFiles([]);

            toast.success("PDF uploaded successfully!", {
                icon: <CheckCircle2 size={18} />,
            });
        } catch (error) {
            const status = error.response?.status;

            const message =
                status >= 500
                    ? "Server error. Please try uploading again."
                    : error.response?.data?.message ||
                    "Upload failed. Please try again.";

            toast.error(message, {
                icon: <AlertTriangle size={18} />,
                duration: 3000,
            });
        } finally {
            setUploading(false);
        }
    };

    // -----------------------------------------
    // Update file settings
    // -----------------------------------------
    const updateFile = (index, field, value) => {
        setFiles((prev) =>
            prev.map((file, i) =>
                i === index
                    ? { ...file, [field]: value, amount: 0 }
                    : file
            )
        );
    };

    // -----------------------------------------
    // Calculate price
    // -----------------------------------------
    const handleCalculatePrice = async () => {
        if (files.length === 0) {
            toast.warning("Please upload at least one PDF", {
                icon: <AlertTriangle size={18} />,
            });
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders/calculate-price`,
                {
                    files: files.map((file) => ({
                        pageCount: file.pageCount,
                        copies: file.copies,
                        colorMode: file.colorMode,
                        side: file.side,
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
                    },
                }
            );

            const calculatedFiles = response.data.files;

            setFiles((prev) =>
                prev.map((file, index) => ({
                    ...file,
                    amount: calculatedFiles[index].amount,
                }))
            );

            // Reset payment selection
            setPaymentType("COD");
        } catch (error) {
            const status = error.response?.status;

            const message =
                status >= 500
                    ? "Server error. Please try calculating the price again."
                    : error.response?.data?.message ||
                    "Price calculation failed. Please try again.";

            toast.error(message, {
                icon: <AlertTriangle size={18} />,
                duration: 3000,
            });
        }
    };

    // -----------------------------------------
    // Total amount
    // -----------------------------------------
    const totalAmount = files.reduce(
        (total, file) => total + Number(file.amount || 0),
        0
    );

    // -----------------------------------------
    // Continue based on payment type
    // -----------------------------------------

    const handlePaymentContinue = async () => {
        const customerToken = localStorage.getItem("customerToken");

        if (!customerToken) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }

        if (files.length === 0) {
            toast.warning("Please upload at least one PDF");
            return;
        }

        if (!paymentType) {
            toast.warning("Please select a payment type");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders/calculate-price`,
                {
                    files: files.map((file) => ({
                        pageCount: file.pageCount,
                        copies: file.copies,
                        colorMode: file.colorMode,
                        side: file.side,
                    })),
                },
                {
                    headers: {
                        Authorization: `Bearer ${customerToken}`,
                    },
                }
            );

            const calculatedFiles = response.data.files;

            const updatedFiles = files.map((file, index) => ({
                ...file,
                amount: calculatedFiles[index].amount,
            }));

            const updatedTotal = updatedFiles.reduce(
                (sum, file) => sum + Number(file.amount || 0),
                0
            );

            const orderData = {
                files: updatedFiles.map((file) => ({
                    filename: file.originalFilename,
                    s3Key: file.s3Key,
                    fileSize: file.fileSize,
                    pageCount: file.pageCount,
                    copies: file.copies,
                    colorMode: file.colorMode,
                    side: file.side,
                    amount: file.amount,
                })),
                totalAmount: updatedTotal,
                paymentType,
            };

            localStorage.setItem("pendingOrder", JSON.stringify(orderData));
            navigate("/payment");
        } catch (error) {
            const status = error.response?.status;

            const message =
                status >= 500
                    ? "Server error. Please try calculating the price again."
                    : error.response?.data?.message ||
                    "Price calculation failed. Please try again.";

            toast.error(message, {
                icon: <AlertTriangle size={18} />,
                duration: 3000,
            });
        }
    };


    // -----------------------------------------
    // Remove uploaded file
    // -----------------------------------------
    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));

        setPaymentType("");
    };

    return (
        <>


            <div className={styles.container}>
                <Toaster position="top-right" richColors duration={3000} />
                {showInstructions && (
                    <div className={styles.instructionOverlay}>
                        <div
                            className={styles.instructionModal}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="upload-instructions-title"
                        >
                            {/* Header */}
                            <div className={styles.instructionHeader}>
                                <div className={styles.instructionTitleWrapper}>
                                    <div className={styles.instructionIcon}>
                                        <Info size={22} />
                                    </div>

                                    <div>
                                        <h2 id="upload-instructions-title">
                                            File Upload Instructions
                                        </h2>
                                        <p>Please check these details before uploading.</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={styles.instructionClose}
                                    onClick={() => setShowInstructions(false)}
                                    aria-label="Close instructions"
                                    title="Close"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className={styles.instructionBody}>

                                <div className={styles.instructionItem}>
                                    <FileCheck2 size={18} />
                                    <span>
                                        <strong>Supported format:</strong> PDF only
                                    </span>
                                </div>

                                <div className={styles.instructionItem}>
                                    <Layers size={18} />
                                    <span>
                                        <strong>Maximum file size:</strong> 2 MB per file
                                    </span>
                                </div>

                                <div className={styles.instructionItem}>
                                    <Copy size={18} />
                                    <span>
                                        <strong>Files per order:</strong> Up to 5 files
                                    </span>
                                </div>

                                <div className={styles.instructionItem}>
                                    <FileText size={18} />
                                    <span>
                                        Enter all your <strong>printing requirements</strong> in
                                        the Description box.
                                    </span>
                                </div>

                                <div className={styles.instructionItem}>
                                    <Ruler size={18} />
                                    <span>
                                        Please mention details such as{" "}
                                        <strong>
                                            paper size, colour/B&W, number of copies,
                                            single/double-side, and binding.
                                        </strong>
                                    </span>
                                </div>

                                {/* Important warning */}
                                <div className={styles.instructionWarning}>
                                    <div className={styles.warningIcon}>
                                        <AlertTriangle size={20} />
                                    </div>

                                    <div>
                                        <strong>Important</strong>
                                        <p>
                                            Please check your uploaded files and requirements
                                            carefully before placing the order. If there are any
                                            mistakes or incorrect details from your side, changes
                                            may not be accepted after the order is processed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Continue button */}
                            <button
                                type="button"
                                className={styles.instructionContinue}
                                onClick={() => setShowInstructions(false)}
                            >
                                <CheckCircle2 size={18} />
                                I Understand
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Status (outside the card, top-right) */}
                <div className={styles.topBar}>
                    <button
                        type="button"
                        className={styles.statusButton}
                        onClick={() => navigate("/orderhistory")}
                    >
                        <ClipboardList size={16} />
                        Order Status
                    </button>
                </div>

                <div className={styles.form}>
                    {/* Title */}
                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>
                            <UploadCloud size={20} />
                            Upload PDF
                        </h1>
                    </div>

                    {/* Select PDF */}
                    {files.length === 0 && selectedFiles.length === 0 && (
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onClick={() => setReplacingIndex(null)}
                            onChange={handleFileSelect}
                            className={styles.fileInput}
                        />
                    )}

                    {/* Hidden input for replacing selected PDF */}
                    <input
                        ref={replaceInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />

                    {/* Selected files */}
                    {selectedFiles.length > 0 && (
                        <div className={styles.selectedFilesBox}>
                            <h3 className={styles.smallHeading}>Files Selected</h3>

                            {selectedFiles.map((file, index) => (
                                <div key={index} className={styles.selectedName}>
                                    <FileText size={16} />

                                    {/* Click filename to replace PDF */}
                                    <button
                                        type="button"
                                        className={styles.selectedFileName}
                                        title="Click to change PDF"
                                        onClick={() => handleReplaceClick(index)}
                                    >
                                        {file.name}
                                    </button>

                                    {/* Preview PDF */}
                                    <button
                                        type="button"
                                        title="Preview PDF"
                                        aria-label="Preview PDF"
                                        onClick={() => {
                                            const url = URL.createObjectURL(file);
                                            window.open(url, "_blank", "noopener,noreferrer");
                                        }}
                                    >
                                        <Eye size={18} />
                                    </button>

                                    {/* Delete selected PDF */}
                                    <button
                                        type="button"
                                        className={styles.selectedRemoveButton}
                                        title="Remove PDF"
                                        aria-label="Remove PDF"
                                        onClick={() => removeSelectedFile(index)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading}
                        className={styles.uploadButton}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className={styles.spin} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <UploadCloud size={18} />
                                Upload PDF
                            </>
                        )}
                    </button>

                    {/* Uploaded Files */}
                    {files.length > 0 && (
                        <div className={styles.uploadedSection}>
                            <h2 className={styles.sectionHeading}>
                                Uploaded Files
                                <span className={styles.count}>{files.length}</span>
                            </h2>

                            {files.map((file, index) => (
                                <div key={index} className={styles.fileCard}>
                                    {/* Remove (top-right corner) */}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className={styles.removeButton}
                                        aria-label="Remove file"
                                        title="Remove"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className={styles.fileTop}>
                                        <FileText size={20} className={styles.fileIcon} />

                                        <div className={styles.fileInfo}>
                                            <h3 className={styles.fileCardTitle}>
                                                {file.originalFilename}
                                            </h3>
                                            <p className={styles.pages}>
                                                Pages: {file.pageCount}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            title="View PDF"
                                            aria-label="View PDF"
                                            onClick={async () => {
                                                if (file.originalFile) {
                                                    const previewUrl = URL.createObjectURL(file.originalFile);
                                                    window.open(previewUrl, "_blank", "noopener,noreferrer");
                                                    return;
                                                }
                                                try {
                                                    const token = localStorage.getItem("customerToken");
                                                    const response = await axios.get(
                                                        `${import.meta.env.VITE_API_URL}/api/files/view-url`,
                                                        {
                                                            params: { s3Key: file.s3Key },
                                                            headers: {
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                        }
                                                    );

                                                    window.open(
                                                        response.data.url,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    );

                                                } catch (error) {
                                                    console.error("PDF preview error:", error.response?.data || error);

                                                    const status = error.response?.status;

                                                    const message =
                                                        status >= 500
                                                            ? "Server error. Unable to preview PDF. Please try again."
                                                            : error.response?.data?.message ||
                                                            "Unable to preview PDF. Please try again.";

                                                    toast.error(message, {
                                                        duration: 3000,
                                                    });
                                                }
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>

                                    <div className={styles.fieldGrid}>
                                        {/* Copies */}
                                        <div className={styles.field}>
                                            <label>Copies</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={file.copies}
                                                onChange={(e) =>
                                                    updateFile(
                                                        index,
                                                        "copies",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Color */}
                                        <div className={styles.field}>
                                            <label>Color</label>
                                            <select
                                                value={file.colorMode}
                                                onChange={(e) =>
                                                    updateFile(
                                                        index,
                                                        "colorMode",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="BW">Black & White</option>
                                                <option value="COLOR">Color</option>
                                            </select>
                                        </div>

                                        {/* Side */}
                                        <div className={`${styles.field} ${styles.fullRow}`}>
                                            <label>Side</label>
                                            <select
                                                value={file.side}
                                                onChange={(e) =>
                                                    updateFile(
                                                        index,
                                                        "side",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="SINGLE">Single Side</option>
                                                <option value="DOUBLE">Double Side</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Amount (green) */}
                                    {file.amount > 0 && (
                                        <h3 className={styles.amountBadge}>
                                            <IndianRupee size={14} />
                                            Amount: ₹{file.amount}
                                        </h3>
                                    )}
                                </div>
                            ))}

                            {/* Add More */}
                            {files.length > 0 && files.length < 5 && (
                                <>
                                    <label className={styles.addMoreLabel}>
                                        <strong>
                                            <Plus size={16} />
                                            Add Another PDF
                                        </strong>
                                    </label>

                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileSelect}
                                        className={styles.fileInput}
                                    />
                                </>
                            )}

                            {/* Calculate */}
                            <button
                                type="button"
                                onClick={handleCalculatePrice}
                                className={styles.calculateButton}
                            >
                                <Calculator size={18} />
                                Calculate Amount
                            </button>

                            {/* Grand Total */}
                            {totalAmount > 0 && (
                                <>


                                    {/* Payment Type */}
                                    <div className={styles.paymentSection}>
                                        <h3 className={styles.paymentHeading}>
                                            <Wallet size={16} />
                                            Select Payment Type
                                        </h3>

                                        <select
                                            value={paymentType}
                                            onChange={(e) => setPaymentType(e.target.value)}
                                        >
                                            <option value="COD">Cash on Delivery</option>
                                        </select>

                                        {paymentType === "COD" && (
                                            <p className={styles.paymentText}>
                                                Pay cash at the shop.
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handlePaymentContinue}
                                            className={styles.createOrderButton}
                                        >
                                            Continue to Payment
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Back to Login */}
                    {/* <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </button> */}
                </div>
            </div>
        </>
    );
}

export default UploadOrder;