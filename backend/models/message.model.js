import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId : {
        type :mongoose.Schema.Types.ObjectId , 
        ref : "User",
        required : true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null, 
        required : false,
      },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : "User",   
        required : false,
        default : null,
    },

    text : {
        type : String , 
        default : ""
    },
    image : {
        type : String , 
        default : "",
    },
    video : {
        type : String , 
        default : "" ,
    },
    isLastInGroup : {
        type : Boolean ,
        default : false 
    },
    isLastInOneToOne : {
        type : Boolean , 
        default : false
    }

}, {timestamps : true});

const Message = mongoose.model("Message" , messageSchema);

export default Message;