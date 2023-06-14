require('dotenv').config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


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
            Chat.connect();
            const result = await client.db("tiget-chat").collection("chat").insertOne({
                "_id":roomId, 
                "messages":[], 
                "user":[], 
                "timestamp": Date.now()
            });
        }catch(e){
            console.log(e);
        }finally{
            Chat.close();
        }
    },
    find:async (roomId) =>{
        try{
            Chat.connect();
            const result = await client.db("tiget-chat").collection("chat").findOne({"_id:":roomId});
            if(!result){
                Chat.create(roomId);
            }else{
                return result;
            }
        }catch(e){
            console.log(e);
        }finally{
            Chat.close();
        }
    },
    list:async () => {
        try{
            Chat.connect();
            const rooms = await client.db("tiget-chat").collection("chat").find({}).toArray();
            console.log(`Chat loaded : ${roomId}`)
            return rooms;
        }catch(e){
            console.log(e);
        }finally{
            Chat.close();
        }
    },
    join:async (roomId, username) => {
        try{
            Chat.connect();
            let result = Chat.find(roomId);
            if(!result){
                Chat.create(roomId);
            }else{
                let chatRoom = client.db("tiget-chat").collection("chat").findOne({"_id:":roomId});
                if(chatRoom.user.includes(username)){
                    return false;
                }else{
                    let userJoin = client.db("tiget-chat").collection("chat").updateOne({"_id":roomId},{
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
                }
            }
        }catch(e){
            console.log(e);
        }finally{
            Chat.close();
        }
    },
    left:async (roomId, username) => {
        let room = Chat.find(roomId);
        let userIsInRoom = room.user.includes(username);
        if(userIsInRoom){
            const userLeft = client.db("tiget-chat").collection("chat").updateOne({"_id":roomId},{
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
            Chat.connect();
            let msgPush = await client.db("tiget-chat").collection("chat").updateOne({"_id":roomId},{
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
            Chat.close();
        }
    },
    load:async (roomId) => {
        try{
            Chat.connect();
            let chat = await client.db("tiget-chat").collection("chat").findOne({"_id":roomId});
            if(!chat){
                return {
                    id:roomId,
                    msg:[
                        {
                            "sender":"admin",
                            "message":"Welcome to new chat room",
                            "timestamp": Date.now()
                        }
                    ],
                user:[]
                };
            }else{
                return chat;
            }
        }catch(e){
            console.log(e)
        }finally{
            Chat.close()
        }
    }
}


module.exports = { Chat };
