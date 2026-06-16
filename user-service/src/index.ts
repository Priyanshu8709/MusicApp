import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.DB_URI;
if (!mongoUri) {
  throw new Error('Environment variable DB_URI is required to connect to MongoDB');
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('User Service is running');
}); 
app.use('/api/v1', (await import('./routes.js')).default);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});