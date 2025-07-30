import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.ObjectId , 
        ref : 'User',
        required : true,
    },
    receiver : {
        type : mongoose.Schema.ObjectId , 
        ref : 'User',
        required : true,
    },
    status : {
        type : String , 
        enum : ['pending', 'accepted', 'cancelled', 'rejected'],
        default : 'pending'
    },
   

} , {timestamps : true});

const Request = mongoose.model('Request', requestSchema);

export default Request ; 