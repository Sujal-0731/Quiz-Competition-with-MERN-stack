const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Configure CORS properly
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Test auth route
app.get("/api/auth/test", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Auth API is working",
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/competition_db")
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    // Create default admin if doesn't exist
    const Admin = require("./models/Admin");
    const bcrypt = require("bcryptjs");
    
    const createDefaultAdmin = async () => {
      try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await Admin.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
          });
          console.log('✅ Default admin created: username="admin", password="admin123"');
        } else {
          console.log('✅ Admin already exists');
        }
      } catch (error) {
        console.error('Error creating default admin:', error);
      }
    };
    
    createDefaultAdmin();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Make sure MongoDB is running");
  });

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teamRoutes = require("./routes/teamRoutes");
app.use("/api/teams", teamRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err.message);
  }
});