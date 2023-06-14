require('dotenv').config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

try{
    client.connect( () =>{
        console.log("Connected to MongoDB");
    })
}catch(e){
    console.log(e);
}

const Chat = {
    onReady:()=>{
        console.log("MSG IS READY");
    },
    connect:async () => {
        try {
            await client.connect();
        } catch (e) {
            console.error(e);
        }
    },
    close:async () => {
        try {
            await client.close();
        } catch (e) {
            console.error(e);
        }
    },
    create:async (roomId) => {
        try{
            
            const result = await client.db("tiget-chat").collection("chat").insertOne({
                "_id": parseInt(roomId), 
                "messages":[], 
                "user":[], 
                "timestamp": Date.now()
            });
        }catch(e){
            console.log(e);
        }finally{
            console.log("Mongo Action success");
        }
    },
    find:async (roomId) =>{
        try{
            
            const result = await client.db("tiget-chat").collection("chat").findOne({"_id:":roomId});
            if(!result){
                Chat.create(roomId);
            }else{
                console.log("Chat loaded", roomId)
                return result;
            }
        }catch(e){
            console.log(e);
        }finally{
            console.log("Mongo Action success");
        }
    },
    list:async () => {
        try{
            const rooms = await client.db("tiget-chat").collection("chat").find({}).toArray();
            console.log(`Chat loaded : ${roomId}`)
            return rooms;
        }catch(e){
            console.log(e);
        }finally{
            console.log("Mongo Action success");
        }
    },
    join:async (roomId, username) => {
        try{
            
            let result = await client.db("tiget-chat").collection("chat").findOne({"_id":parseInt(roomId)});
            if(!result){
                Chat.create(roomId);
            }else{
                let chatRoom = client.db("tiget-chat").collection("chat").findOne({"_id:":roomId});
                console.log("user in room",chatRoom.user)
                if(!chatRoom.user.includes(username)){
                    let userJoin = client.db("tiget-chat").collection("chat").updateOne({"_id":parseInt(roomId)},{
                        $push:{
                            "messages": {
                                "sender":"admin",
                                "operation":"join",
                                "message":`${username} has joined the chat!`,
                                "timestamp": Date.now()
                            },
                            "user":username
                        }
                    });
                    console.log(`${username} Join to ${roomId}`)
                    return true;
                    
                }else{
                    return false;
                }
            }
        }catch(e){
            console.log(e);
        }finally{
            console.log("Mongo Action success");
        }
    },
    leave:async (roomId, username) => {
        let room = await client.db("tiget-chat").collection("chat").findOne({"_id":parseInt(roomId)});
        console.log("USER IN ROOM ", room.user)
        let userIsInRoom = room.user.includes(username);
        if(userIsInRoom){
            const userLeft = client.db("tiget-chat").collection("chat").updateOne({"_id":parseInt(roomId)},{
                $pull:{
                    "user":username
                },
                $push:{
                    "messages": {
                        "sender":"admin",
                        "operation":"left",
                        "message":`${username} has left the chat!`,
                        "timestamp": Date.now()
                    }
                }
            //console.log(`${username} : has left ${roomId}`);
            });
        }
    },
    new:async (roomId, username, msg) => {
        try{
            let msgPush = await client.db("tiget-chat").collection("chat").updateOne({"_id":parseInt(roomId)},{
                $push:{
                    "messages": {
                        "sender":username,
                        "message":msg,
                        "timestamp": Date.now()
                    }
                }
            });
            console.log(`${roomId} -> %c${username} : %c${msg}`,"color:black; background-color:white;" ,"color:blue; background-color:#ffc107");
        }catch(err){
            console.log(err);
        }finally{
            console.log("Mongo Action success");
        }
    },
    load:async (roomId) => {
        try{
            console.log("Chat load call");
            let chat = await client.db("tiget-chat").collection("chat").findOne({"_id":parseInt(roomId)});
            console.log("chat status", chat);
            if(chat == null){
                return {
                    id:roomId,
                    messages:[
                        {
                            "sender":"admin",
                            "message":"Welcome to new chat room",
                            "timestamp": Date.now()
                        }
                    ],
                user:[]
                };
            }else{
                console.log("Chat msg =>", chat)
                return chat;
            }
        }catch(e){
            console.log(e)
        }finally{
            console.log("Mongo Action success");
        }
    }
}


module.exports = { Chat };