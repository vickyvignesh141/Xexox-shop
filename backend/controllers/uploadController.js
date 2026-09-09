const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const uploadFile = async (req,res) =>{
    try{
        if(!req.file){
            return res.status(400).json({
                message:"File is required"
            });
        }

        const pdfBytes = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pageCount = pdfDoc.getPageCount();


        return res.status(201).json({
            message:"File uploaded successfully",
            file:{
                filename:req.file.filename,
                originalFilename:req.file.originalname,
                fileSize: req.file.size,
                pageCount: pageCount,
                fileUrl: `/uploads/${req.file.filename}`   
            }
        })

        
    } catch (error) {
    console.error("File upload error:", error.message);

    return res.status(400).json({
        message: "Invalid or corrupted PDF file"
    });
}
};

module.exports ={uploadFile};