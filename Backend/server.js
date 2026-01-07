import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import axios from 'axios'
import cors from 'cors';
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Serve frontend build when available
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const staticDir = path.join(__dirname, '..', 'Frontend', 'dist')
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir))
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'))
  })
}

// RapidAPI configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY 
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST 

function collectMatches(node) {
  const results = []
  function walk(obj) {
    if (!obj) return
    if (Array.isArray(obj)) {
      for (const item of obj) walk(item)
      return
    }
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key === 'matches' && Array.isArray(obj[key])) {
          results.push(...obj[key])
        } else {
          walk(obj[key])
        }
      }
    }
  }
  walk(node)
  return results
}
// Routes
app.get('/api/live', async (req, res) => {
  try {
    const response = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    const raw = response.data
    const matches = collectMatches(raw)
    res.json({ matches: matches })
  } catch (error) {
    console.error('Live fetch error:', error?.response?.data || error.message || error)
    res.status(500).json({ error: 'Failed to fetch live matches', details: error?.message });
  }
});

app.get('/api/upcoming', async (req, res) => {
  try {
    const response = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    const raw = response.data
    const matches = collectMatches(raw)
    res.json({ matches: matches })
  } catch (error) {
    console.error('Upcoming fetch error:', error?.response?.data || error.message || error)
    res.status(500).json({ error: 'Failed to fetch upcoming matches', details: error?.message });
  }
});

app.get('/api/recent', async (req, res) => {
  try {
    const response = await axios.get('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    const raw = response.data
    const matches = collectMatches(raw)
    res.json({ matches: matches })
  } catch (error) {
    console.error('Recent fetch error:', error?.response?.data || error.message || error)
    res.status(500).json({ error: 'Failed to fetch recent matches', details: error?.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
