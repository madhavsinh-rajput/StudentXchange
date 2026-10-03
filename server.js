const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'An unexpected server error occurred.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to your .env file.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(port, () => console.log(`StudentXchange API listening on port ${port}`));
}

start().catch((error) => {
  console.error('Unable to start StudentXchange:', error.message);
  process.exit(1);
});
