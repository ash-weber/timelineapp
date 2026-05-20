const express = require('express');
const cors = require('cors');
require('dotenv').config();

const timelineRoutes = require('./routes/Timeline.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-mac'] 
}));

app.options(/.*/, cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Timeline Project Backend is Running successfully!');
});

app.use('/api/timeline', timelineRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});