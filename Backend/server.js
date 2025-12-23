require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());              // allow your HTML file to call this API
app.use(express.json());      // parse JSON body

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err.message));

// schema & model - ADDED name field
const boatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },  // NEW: Boat name field
  lat: Number,
  lon: Number,
  pH: Number,
  tds: Number,
  turbidity: Number,
  voltage: Number,
  current: Number,
  status: { type: String, enum: ['online', 'offline'], default: 'online' },
  timestamp: { type: Date, default: Date.now }
});

const Boat = mongoose.model('Boat', boatSchema);

// CRUD routes

// GET all boats
app.get('/api/boats', async (req, res) => {
  const boats = await Boat.find();
  res.json(boats);
});

// GET one boat by id (DB id)
app.get('/api/boats/:id', async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) return res.status(404).json({ message: 'Not found' });
  res.json(boat);
});

// POST create new boat
app.post('/api/boats', async (req, res) => {
  try {
    const boat = new Boat(req.body);
    await boat.save();
    res.status(201).json(boat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update boat (replace/modify)
app.put('/api/boats/:id', async (req, res) => {
  try {
    const boat = await Boat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!boat) return res.status(404).json({ message: 'Not found' });
    res.json(boat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE boat
app.delete('/api/boats/:id', async (req, res) => {
  const boat = await Boat.findByIdAndDelete(req.params.id);
  if (!boat) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` API running on port ${PORT}`);
});
