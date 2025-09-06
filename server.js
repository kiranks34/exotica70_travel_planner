import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
const generateItineraryHandler = (await import('./api/generate-itinerary.js')).default;
const tripHandler = (await import('./api/trip/[id].js')).default;

// API Routes
app.post('/api/generate-itinerary', (req, res) => {
  generateItineraryHandler(req, res);
});

app.get('/api/trip/:id', (req, res) => {
  tripHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});