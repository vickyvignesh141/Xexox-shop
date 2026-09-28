import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./UploadOrder.module.css";

function UploadOrder() {
    const navigate = useNavigate();

    // Selected local files waiting to be uploaded
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Uploaded files with print settings
    const [files, setFiles] = useState([]);

    const [uploading, setUploading] = useState(false);

    const [paymentType, setPaymentType] = useState("");

    // -----------------------------------------
    // Select PDF
    // -----------------------------------------
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            alert("Please select a PDF file");
            return;
        }

        if (selectedFiles.length + files.length >= 2) {
            alert("Maximum 2 files are allowed");
            e.target.value = "";
            return;
        }

        setSelectedFiles((prev) => [
            ...prev,
            selectedFile
        ]);

        e.target.value = "";
    };

    // -----------------------------------------
    // Upload selected PDF
    // -----------------------------------------
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select a PDF");
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
                    formData
                );

                uploadedResults.push({
                    ...response.data.file,

                    copies: 1,
                    colorMode: "BW",
                    side: "SINGLE",

                    // Backend calculated amount
                    amount: 0
                });
            }

            setFiles((prev) => [
                ...prev,
                ...uploadedResults
            ]);

            setSelectedFiles([]);

            alert("PDF uploaded successfully!");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Upload failed"
            );
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
                    ? {
                        ...file,
                        [field]: value,
                        amount: 0
                    }
                    : file
            )
        );
    };

    // -----------------------------------------
    // Calculate price
    // -----------------------------------------
    const handleCalculatePrice = async () => {
        if (files.length === 0) {
            alert("Please upload at least one PDF");
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
                        side: file.side
                    }))
                }
            );

            const calculatedFiles = response.data.files;

            setFiles((prev) =>
                prev.map((file, index) => ({
                    ...file,
                    amount: calculatedFiles[index].amount
                }))
            );

            // Reset payment selection
            setPaymentType("");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Price calculation failed"
            );
        }
    };

    // -----------------------------------------
    // Total amount
    // -----------------------------------------
    const totalAmount = files.reduce(
        (total, file) =>
            total + Number(file.amount || 0),
        0
    );

    // -----------------------------------------
    // Continue based on payment type
    // -----------------------------------------
    const handlePaymentContinue = () => {
        if (files.length === 0) {
            alert("Please upload at least one PDF");
            return;
        }

        if (totalAmount <= 0) {
            alert("Please calculate the amount first");
            return;
        }

        if (!paymentType) {
            alert("Please select a payment type");
            return;
        }

        const orderData = {
            customerId:
                localStorage.getItem("xeroxCustomerId"),

            files: files.map((file) => ({
                filename: file.originalFilename,
                fileUrl: file.fileUrl,
                fileSize: file.fileSize,
                pageCount: file.pageCount,
                copies: file.copies,
                colorMode: file.colorMode,
                side: file.side
            })),

            totalAmount,
            paymentType
        };

        // Save temporarily for Payment page
        localStorage.setItem(
            "pendingOrder",
            JSON.stringify(orderData)
        );

        if (paymentType === "COD") {
            navigate("/payment");
        } else if (paymentType === "UPI") {
            navigate("/payment");
        }
    };

    // -----------------------------------------
    // Remove uploaded file
    // -----------------------------------------
    const removeFile = (index) => {
        setFiles((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setPaymentType("");
    };

    return (
        <div className={styles.container}>

            <div className={styles.form}>

                <h1>Upload PDF</h1>

                {/* Select PDF */}

                {files.length === 0 && selectedFiles.length === 0 && (
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                    />
                )}

                {/* Selected files */}

                {selectedFiles.length > 0 && (
                    <div className={styles.selectedFilesBox}>

                        <h3>Files Selected</h3>

                        {selectedFiles.map((file, index) => (
                            <p key={index}>
                                📄 {file.name}
                            </p>
                        ))}

                    </div>
                )}

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className={styles.uploadButton}
                >
                    {uploading
                        ? "Uploading..."
                        : "Upload PDF"}
                </button>


                {/* Uploaded Files */}

                {files.length > 0 && (
                    <div className={styles.uploadedSection}>

                        <h2 className={styles.sectionHeading}>
                            Uploaded Files
                        </h2>

                        {files.map((file, index) => (

                            <div
                                key={index}
                                className={styles.fileCard}
                            >

                                <h3 className={styles.fileCardTitle}>
                                    📄 {file.originalFilename}
                                </h3>

                                <p>
                                    Pages: {file.pageCount}
                                </p>


                                {/* Copies */}

                                <label>
                                    Copies
                                </label>

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


                                {/* Color */}

                                <label>
                                    Color
                                </label>

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
                                    <option value="BW">
                                        Black & White
                                    </option>

                                    <option value="COLOR">
                                        Color
                                    </option>
                                </select>


                                {/* Side */}

                                <label>
                                    Side
                                </label>

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
                                    <option value="SINGLE">
                                        Single Side
                                    </option>

                                    <option value="DOUBLE">
                                        Double Side
                                    </option>
                                </select>


                                {/* Amount */}

                                {file.amount > 0 && (
                                    <h3 className={styles.amountBadge}>
                                        Amount: ₹{file.amount}
                                    </h3>
                                )}


                                {/* Remove */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeFile(index)
                                    }
                                    className={styles.removeButton}
                                >
                                    Remove
                                </button>

                            </div>
                        ))}


                        {/* Add More */}

                        {files.length > 0 && files.length < 2 && (
                            <>
                                <label className={styles.addMoreLabel}>
                                    <strong>+ Add Another PDF</strong>
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
                            Calculate Amount
                        </button>


                        {/* Grand Total */}

                        {totalAmount > 0 && (
                            <>
                                <h2 className={styles.totalAmount}>
                                    Total Amount: ₹{totalAmount}
                                </h2>

                                {/* Payment Type */}

                                <div className={styles.paymentSection}>

                                    <h3>
                                        Select Payment Type
                                    </h3>

                                    <select
                                        value={paymentType}
                                        onChange={(e) =>
                                            setPaymentType(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select Payment Type
                                        </option>

                                        <option value="COD">
                                            Cash on Delivery
                                        </option>

                                        <option value="UPI">
                                            UPI / QR Payment
                                        </option>
                                    </select>


                                    {paymentType === "COD" && (
                                        <p>
                                            Pay cash at the shop.
                                        </p>
                                    )}

                                    {paymentType === "UPI" && (
                                        <p>
                                            You will be taken to the
                                            payment page.
                                        </p>
                                    )}


                                    <button
                                        type="button"
                                        onClick={
                                            handlePaymentContinue
                                        }
                                        className={
                                            styles.createOrderButton
                                        }
                                    >
                                        Continue to Payment
                                    </button>

                                </div>
                            </>
                        )}

                    </div>
                )}


                {/* Back */}

                <button
                    type="button"
                    onClick={() =>
                        window.location.href = "/"
                    }
                    className={styles.backButton}
                >
                    Back to Register
                </button>

            </div>

        </div>
    );
}

export default UploadOrder;