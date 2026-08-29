const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type:String,
        required:true,
    },
    department:{
        type:String,
        required:true,
         
    },
    year:{
        type:Number,
        required:true,
         
    },
    section:{
        type:String,
        required:true,
         
    },
    registerNumber:{
        type:String,
        required:false,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
}, {
    collection: "customers",  // collection name in db
    timestamps: true
});

module.exports = mongoose.model("Customer", customerSchema);
