const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type"));
  }
});

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const TASKS_FILE = path.join(__dirname, "tasks.json");


let tasks = [];
function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, "utf8");
      tasks = JSON.parse(data);
      console.log(`Loaded ${tasks.length} tasks from storage`);
    }
  } catch (error) {
    console.error("Error loading tasks:", error.message);
    tasks = [];
  }
}

function saveTasks() {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving tasks:", error.message);
  }
}

loadTasks();

const BASE_URL = "https://kanban-workflow-management-system.onrender.com";
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ 
    url: `${BASE_URL}/uploads/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size
  });
});

io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.emit("sync:tasks", tasks);

  socket.on("request:tasks", () => {
    socket.emit("sync:tasks", tasks);
    console.log("Tasks requested by:", socket.id);
  });

  socket.on("task:create", (task) => {
    const newTask = {
      id: task.id || Date.now(),
      title: task.title || "New Task",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "Medium",
      category: task.category || "Feature",
      attachments: task.attachments || [],
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks();
    io.emit("sync:tasks", tasks);
    console.log("Task created:", newTask.id);
  });

  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map(t =>
      t.id === updatedTask.id ? { ...t, ...updatedTask } : t
    );
    saveTasks();
    io.emit("sync:tasks", tasks);
    console.log("Task updated:", updatedTask.id);
  });

  socket.on("task:move", ({ taskId, newStatus }) => {
    tasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    saveTasks();
    io.emit("sync:tasks", tasks);
    console.log("Task moved:", taskId, "to", newStatus);
  });

  socket.on("task:delete", (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    io.emit("sync:tasks", tasks);
    console.log("Task deleted:", id);
  });


  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

function clearUploadsFolder() {
  try {
    if (fs.existsSync("uploads")) {
      const files = fs.readdirSync("uploads");
      for (const file of files) {
        fs.unlinkSync(path.join("uploads", file));
      }
      console.log("Cleared uploads directory");
    }
  } catch (err) {
    console.error("Error clearing uploads:", err.message);
  }
}

app.post("/api/test/reset", (req, res) => {
  console.log("🧹 Resetting test data store...");
  
  tasks = [];
  
  saveTasks();
  
  clearUploadsFolder();
  
  io.emit("sync:tasks", tasks);
  
  res.status(200).json({ message: "Test data storage successfully truncated." });
});

server.listen(4000, () => console.log("Server running on port 4000"));
