const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const User = require('./models/User');
const Chat = require('./models/Chat');
const auth = require('./middleware/auth');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    
    let user = await User.findOne({ mobile });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      mobile,
      email,
      password: hashedPassword
    });

    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

    res.status(201).json({ token, user: { name: user.name, mobile: user.mobile } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

    res.json({ token, user: { name: user.name, mobile: user.mobile } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Profile Route (GET)
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Profile Route (PUT)
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Chat History Route
app.get('/api/chat/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Chat Proxy Route
app.post('/api/chat', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    // Save user message
    const userChat = new Chat({ userId: req.user.userId, role: 'user', content: prompt });
    await userChat.save();

    // Dynamically import fetch for older Node.js versions if needed, or use global fetch
    // Node.js 18+ has native fetch.
    const aiResponse = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });

    if (!aiResponse.ok) {
        return res.status(500).json({ message: 'Failed to communicate with AI service' });
    }

    const data = await aiResponse.json();
    
    // Save bot message
    const botChat = new Chat({ userId: req.user.userId, role: 'bot', content: data.reply });
    await botChat.save();

    res.json({ reply: data.reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Auth Server running on port ${PORT}`));
