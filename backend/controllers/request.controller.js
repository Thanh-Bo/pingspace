import { getReceiverSocketId , io } from "../lib/socket.js";
import User from "../models/auth.model.js";
import Request from "../models/request.model.js";
export const sendRequest = async (req, res) => {
    try {
        const {receiverId} = req.body ; 
        const senderId = req.user._id ; 
        // Validate request
        if (senderId.toString() === receiverId.toString()){
            return res.status(400).json({ error : "Cannot send request to yourself"});
        }

        const receiver = await User.findById(receiverId);
        if (!receiver){
            return res.status(404).json({ error : "Receiver not found"});
        }
        // Check for existing request (to prevent duplicates or re-sending to existing friends)
        const existingRequest = await Request.findOne({
            $or : [
                // Sender sent  to receiver
                {sender : senderId , receiver : receiverId , status : {$in : ['pending', 'accepted']}},
                // Receiver sent to sender
                {sender : receiverId ,  receiver : senderId , status: {$in : ['pending', 'accepted']}}
            ]
        });

        if (existingRequest){
            if (existingRequest.status === 'pending'){
                return res.status(400).json({ error : "Request already pending with this user"});
            }else if (existingRequest.status === 'accepted'){
                return res.status(400).json({ error : "You are already connected with this user"});
            }
        }

        // Create new request
        const newRequest = new Request({
            sender : senderId , 
            receiver : receiverId , 
            status : 'pending'
        });
        // Save request to the database
        await newRequest.save();

        await newRequest.populate('sender', 'fullName profilePic email');
        await newRequest.populate('receiver', 'fullName profilePic email'); // You can chain or call separately
        // Real-time notification to the Receiver
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverId){
            io.to(receiverSocketId).emit('newRequest', newRequest);
            console.log(`sendRequest : Emitting newRequest to ${receiverId}`);
        }
        res.status(201).json({ message : "Request sent successfully", request : newRequest});

    }
    catch(error){
        console.log("Error in sendRequest : ", error.message);
        res.status(500).json({error : "Internam server error"});
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const requestId = req.params.id ; 
        const receiverId = req.user._id ; 
        
        const request = await Request.findById(requestId);

        // Validate request
        if (!request){
            return res.status(404).json({error : "Request not found"});
        }
        if (request.status !== 'pending'){
            return res.status(400).json({error : "Request is not pending and cannot be accepted"});
        }

        if (request.receiver.toString() !== receiverId.toString()){
            return res.status(403).json({error : "Unauthorized : You are not the receiver of this request"});
        }

        request.status = "accepted";
        await request.save();

        const sender = await User.findById(request.sender) ; 
        const receiver = await User.findById(receiverId);
        if (sender && receiver){
            if (!sender.friends.includes(receiverId)){
                sender.friends.push(receiverId);
                await sender.save();
            }
            if (!receiver.friends.includes(request.sender)){
                receiver.friends.push(request.sender);
                await receiver.save();
            }
        }
        else {
            console.warn('acceptRequest : Sender or Receiver user not found');
        }

        await request.populate('sender', 'fullName profilePic email');
        await request.populate('receiver' , 'fullName profilePic email');

         const senderSocketId = getReceiverSocketId(request.sender.toString());
        if (senderSocketId) {
            // Emit a 'requestAccepted' event to the specific sender's socket
            io.to(senderSocketId).emit("requestAccepted", request);
            console.log(`acceptRequest: Emitting requestAccepted to ${request.sender} (${senderSocketId})`);
        }
        res.status(200).json({ message : "Request accepted successfully", request});

    }
    catch(error){
        console.error("Error in acceptRequest : ", error.message);
        res.status(500).json({error : "Internal server error"});
    }
}

export const cancelRequest = async (req, res) => {
    try {
        const requestId = req.params.id ; 
        const senderId = req.user._id ;  

        const request = await Request.findById(requestId);

        // Validate request
        if(!request){
            return res.status(404).json({error : "Request not found"});
        }
        if (request.status !== 'pending'){
            return res.status(404).json({error : "Request is not pending and cannot be canceled."});
        }

        // Authorize User
        if (request.sender.toString() !== senderId.toString()){
            return res.status(403).json({error : "Unauthorized : You are not the sender of this request"})
        }
        // Delete request
        await Request.findByIdAndDelete(requestId);

        const receiverSocketId = getReceiverSocketId(request.receiver.toString());
        if (receiverSocketId){
            io.to(receiverSocketId).emit("requestCanceled", { requestId: request._id, senderId: senderId });
            console.log(`cancelRequest: Emitting requestCanceled to ${request.receiver} (${receiverSocketId})`);
        }
        res.status(200).json({ message: "Request canceled successfully", requestId: request._id });

    } catch (error) {
        console.error("Error in cancelRequest:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}

export const rejectRequest = async (req, res)  => {
    try {
        const requestId = req.params.id ; 
        const receiverId = req.user._id ; 

        const request = await Request.findById(requestId);

        // Validate user 
        if (!request){
            return res.status(404).json({ error : "Request not found"});
        }
        if (request.status !== 'pending'){
            return res.status(400).json({ error : "Request is not pending and cannot be rejected"});
        }

        // Authorize user 
        if (request.receiver.toString() !== receiverId.toString()){
            return res.status(403).json({ error : "Unauthorized : You are not the receiver of this request"});
        }

        await Request.findByIdAndDelete(requestId);
         const senderSocketId = getReceiverSocketId(request.sender.toString());
        if (senderSocketId) {
            // Emit a 'requestRejected' event to the specific sender's socket
            // Send request ID and receiver ID so sender knows which request was rejected
            io.to(senderSocketId).emit("requestRejected", { requestId: request._id, receiverId: receiverId });
            console.log(`rejectRequest: Emitting requestRejected to ${request.sender} (${senderSocketId})`);
        }

        // 5. Respond to the Receiver
        res.status(200).json({ message: "Request rejected successfully", requestId: request._id });

    } catch (error) {
        console.error("Error in rejectRequest:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
} 

// User get request from somebody
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id ; 
        const pendingRequests = await Request.find({ receiver : userId , status : 'pending'})
                                                .populate('sender' , 'fullName profilePic email');
                
        res.status(200).json(pendingRequests);
    }
    catch(error){
        console.error("Error in getPending Request : ", error.message);
        res.status(500).json({ error : "Inver server error"});
    }
}
/// User sent request to somebody
export const getSentRequest = async (req, res) => {
    try {
        const userId = req.user._id ; 
        const sentRequests = await Request.find({ sender : userId , status : 'pending'})
                                        .populate('receiver' , 'fullName profilePic email');
        
        res.status(200).json(sentRequests);
    }
    catch(error){
        console.error("Error in getSentRequest : ", error.message);
        res.status(500).json({error : "Internal server erorr"});
    }

}
