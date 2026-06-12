const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.json({
      message: "Hello world",
  });
});


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });


io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  // TODO: Implement WebSocket events for task management

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
