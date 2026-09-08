const multer =require("multer")

const storage =multer.diskStorage({
    destination:(req,File,cb) => {
        cb(null,"uploads/")
    },

    filename:(req,file,cb) =>{
        cb(null,Date.now()+ "-" + file.originalname);
    }
});

const upload = multer({
    storage:storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
    const isPdf =
        file.mimetype === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdf) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
}
    
});

module.exports = upload;