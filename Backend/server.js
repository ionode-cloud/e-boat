// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());              // Allow frontend to call this API
app.use(express.json());      // Parse JSON bodies

// Debug: check env (optional, remove later)
// console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err.message));

// Schema & model
const boatSchema = new mongoose.Schema({
  id: { type: String, required: true },        // Your custom boat id
  name: { type: String, required: true },      // Boat name
  lat: Number,
  lon: Number,
  pH: Number,
  tds: Number,
  turbidity: Number,
  voltage: Number,
  current: Number,
  status: { type: String, enum: ['online', 'offline'], default: 'online' },
  timestamp: { type: Date, default: Date.now },
});

const Boat = mongoose.model('Boat', boatSchema);

// Routes

// GET all boats
app.get('/boats', async (req, res) => {
  try {
    const boats = await Boat.find();
    res.json(boats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new boat
app.post('/boats', async (req, res) => {
  try {
    // Expect at least: { id, name, ... }
    const boat = new Boat(req.body);
    await boat.save();
    res.status(201).json(boat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update boat by custom id (NOT _id)
app.put('/boats/:id', async (req, res) => {
  try {
    const boat = await Boat.findOneAndUpdate(
      { id: req.params.id },      // match your custom id field
      req.body,
      { new: true, runValidators: true }
    );
    if (!boat) return res.status(404).json({ message: 'Not found' });
    res.json(boat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE boat by custom id
app.delete('/boats/:id', async (req, res) => {
  try {
    const boat = await Boat.findOneAndDelete({ id: req.params.id });
    if (!boat) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('EV Boats API is running');
});

// Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
