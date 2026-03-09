const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize with default tasks if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const defaultTasks = [
    { id: 1, name: 'Q4 2025 Planning', start: '2025-11-11', end: '2025-12-31', color: '#3b82f6' },
    { id: 2, name: 'Q1 2026 Goals', start: '2026-01-01', end: '2026-03-31', color: '#10b981' },
    { id: 3, name: 'Q2 2026 Projects', start: '2026-04-01', end: '2026-06-30', color: '#f59e0b' },
    { id: 4, name: 'Q3 2026 Initiatives', start: '2026-07-01', end: '2026-09-30', color: '#8b5cf6' },
    { id: 5, name: 'Q4 2026 Review', start: '2026-10-01', end: '2026-12-31', color: '#ec4899' },
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultTasks, null, 2));
}

// GET - Load tasks
app.get('/api/tasks', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// POST - Save tasks
app.post('/api/tasks', (req, res) => {
  try {
    const tasks = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    res.json({ success: true, message: 'Tasks saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save tasks' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Tasks will be saved to: ${DATA_FILE}`);
});
