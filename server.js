const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");

const httpServer = require("http").createServer(app);

app.use(cors());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("views"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/joinorcreate", (req, res) => {
    res.render("joinorcreate");
});

app.get("/chatroom", (req, res) => {
    const username = req.query.username;
    const roomId = req.query.roomcode;
    res.render("chatroom", { username: username, roomId: roomId });
});

httpServer.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at ${httpServer.address().address}:${httpServer.address().port}`);
});

const io = require("socket.io")(httpServer, {
    cors: {
      origins: ["http://localhost:8000"]
      
    },
  handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
  });

io.on("connection", (socket) => {
    socket.on("new-user", (name) => {
        socket.emit("user-connected", name);
    }
    );
    socket.on("message", (data) => {
        io.sockets.emit("message", {
            sender: data.sender,
            message: data.message
        });
        
    }
    );
    socket.on("disconnect", () => {
        socket.emit("user-disconnected");
    }
    );

    socket.on("create-room", (data) => {
        const roomId = Math.random().toString(36).substring(2, 7);
        socket.emit("room-created", roomId);
        socket.emit("join-room", roomId, data.username);
    });
    
    socket.on("join-room", (data) => {
        socket.join(data.roomId);
        socket.to(data.roomId).broadcast.emit("user-connected", { username: data.username, roomId: data.roomId });
        socket.on("disconnect", () => {
            socket.to(data.roomId).broadcast.emit("user-disconnected", data.username);
        }
        );
    });

    socket.on("send-chat-message", (data) => {
        socket.to(roomId).broadcast.emit("chat-message", data);
    }
    );

    
});
