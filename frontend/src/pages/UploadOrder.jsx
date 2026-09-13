import { useState } from "react";
import axios from "axios";
import styles from "./UploadOrder.module.css";

function UploadOrder() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const [copies, setCopies] = useState(1);
    const [colorMode, setColorMode] = useState("BW");
    const [side, setSide] = useState("SINGLE");

    const [transactionId, setTransactionId] = useState("");



    const handleUpload = async () => {
        if (!file) {
            alert("Please select a PDF");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/upload`,
                formData
            );

            setUploadedFile(response.data.file);
            alert("PDF uploaded successfully!");
        } catch (error) {
            alert(
                error.response?.data?.message || "Upload failed"
            );
        } finally {
            setUploading(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!uploadedFile) {
            alert("Please upload a PDF first");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders`,
                {
                    customerId: localStorage.getItem("xeroxCustomerId"),
                    files: [
                        {
                            filename: uploadedFile.originalFilename,
                            fileUrl: uploadedFile.fileUrl,
                            fileSize: uploadedFile.fileSize,
                            pageCount: uploadedFile.pageCount,
                            copies,
                            colorMode,
                            side
                        }
                    ],
                    transactionId: "xeroxtransactionId"
                }
            );

            alert(`Order created: ${response.data.order.orderNumber}`);
        } catch (error) {
            alert(
                error.response?.data?.message || "Order creation failed"
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <h1>Upload PDF</h1>

                <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload PDF"}
                </button>

                {uploadedFile && (
                    <>
                        <label>Copies</label>

                        <input
                            type="number"
                            min="1"
                            value={copies}
                            onChange={(e) => setCopies(Number(e.target.value))}
                        />

                        <label>Color</label>

                        <select
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value)}
                        >
                            <option value="BW">Black & White</option>
                            <option value="COLOR">Color</option>
                        </select>

                        <label>Side</label>

                        <select
                            value={side}
                            onChange={(e) => setSide(e.target.value)}
                        >
                            <option value="SINGLE">Single Side</option>
                            <option value="DOUBLE">Double Side</option>
                        </select>

                        <label>Transaction ID</label>

                        <input
                            type="text"
                            placeholder="Enter transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleCreateOrder}
                        >
                            Create Order
                        </button>
                    </>
                )}
                <button
                    type="button"
                    onClick={() => window.location.href = "/"}
                >
                    Back to Register
                </button>
            </div>
        </div>
    );
}

export default UploadOrder;