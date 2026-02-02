require('dotenv').config();
const express  = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const {Server} = require('socket.io');
const feedbackRoutes = require('./routes/feedbackRoutes');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{cors: {origin: "*"}});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedbacks', feedbackRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  //join room
  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size === 2) {
      io.to(roomId).emit("ready"); 
    }
  });

  //WebRTC offer
  socket.on("offer",({roomId, offer}) => {
    socket.to(roomId).emit("offer", offer);
  });

  //WebRTC Answer
  socket.on("answer",({roomId,answer}) => {
    socket.to(roomId).emit("answer", answer); 
  });

  //ICE candidates
  socket.on("ice-candidate", ({roomId, candidate}) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) { // ignore own room
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    }); 
  });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});
