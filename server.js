const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('./models/User');
const Habit = require('./models/Habit');

const app = express();

/* ===========================
   ENV VARIABLES
=========================== */

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!JWT_SECRET || !MONGODB_URI || !GOOGLE_CLIENT_ID) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ===========================
   CORS (SAFE VERSION)
=========================== */

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://habbit-buddy.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

/* ===========================
   DATABASE CONNECTION
=========================== */

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

/* ===========================
   AUTH MIDDLEWARE
=========================== */

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

/* ===========================
   AUTH ROUTES
=========================== */

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Google Login
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        password: null
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token: jwtToken });

  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// Get current user
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

/* ===========================
   HABIT ROUTES
=========================== */

app.get("/api/habits", auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: "Error fetching habits" });
  }
});

app.post("/api/habits", auth, async (req, res) => {
  try {
    const newHabit = new Habit({ ...req.body, userId: req.userId });
    await newHabit.save();
    res.json(newHabit);
  } catch (err) {
    res.status(500).json({ message: "Error adding habit" });
  }
});

app.put("/api/habits/:id", auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: "Error updating habit" });
  }
});

app.delete("/api/habits/:id", auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting habit" });
  }
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
