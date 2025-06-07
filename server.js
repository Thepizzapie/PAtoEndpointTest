const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// In-memory storage for records
let records = [];
let nextId = 1;

// API key validation middleware (optional)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['api-key'];
  // For demo purposes, accept any API key or no API key
  if (apiKey && apiKey !== 'demo-api-key-123') {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'Power Automate Review API'
  });
});

// Submit a new record for review (this is what Power Automate will call)
app.post('/api/submit', validateApiKey, (req, res) => {
  const recordData = req.body;
  
  if (!recordData || Object.keys(recordData).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No data provided'
    });
  }

  const newRecord = {
    id: nextId++,
    status: 'To review',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    originalData: recordData,
    currentData: recordData, // This can be edited before approval
    notes: ''
  };

  records.push(newRecord);
  
  res.status(201).json({
    success: true,
    data: newRecord,
    message: 'Record submitted for review successfully'
  });
});

// Get all records (with optional status filter)
app.get('/api/records', (req, res) => {
  const { status } = req.query;
  let filteredRecords = records;
  
  if (status) {
    filteredRecords = records.filter(record => record.status.toLowerCase() === status.toLowerCase());
  }
  
  res.json({
    success: true,
    data: filteredRecords,
    count: filteredRecords.length
  });
});

// Get a specific record by ID
app.get('/api/records/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const record = records.find(r => r.id === id);
  
  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  res.json({
    success: true,
    data: record
  });
});

// Update a record (for editing before approval)
app.put('/api/records/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const recordIndex = records.findIndex(r => r.id === id);
  
  if (recordIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  const { currentData, notes } = req.body;
  
  // Only allow editing if status is "To review"
  if (records[recordIndex].status !== 'To review') {
    return res.status(400).json({
      success: false,
      error: 'Can only edit records that are pending review'
    });
  }
  
  if (currentData) {
    records[recordIndex].currentData = currentData;
  }
  
  if (notes !== undefined) {
    records[recordIndex].notes = notes;
  }
  
  res.json({
    success: true,
    data: records[recordIndex],
    message: 'Record updated successfully'
  });
});

// Approve a record
app.post('/api/records/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  const recordIndex = records.findIndex(r => r.id === id);
  
  if (recordIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  if (records[recordIndex].status !== 'To review') {
    return res.status(400).json({
      success: false,
      error: 'Record is not pending review'
    });
  }
  
  records[recordIndex].status = 'Approved';
  records[recordIndex].reviewedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: records[recordIndex],
    message: 'Record approved successfully'
  });
});

// Reject a record
app.post('/api/records/:id/reject', (req, res) => {
  const id = parseInt(req.params.id);
  const recordIndex = records.findIndex(r => r.id === id);
  
  if (recordIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  if (records[recordIndex].status !== 'To review') {
    return res.status(400).json({
      success: false,
      error: 'Record is not pending review'
    });
  }
  
  const { reason } = req.body;
  
  records[recordIndex].status = 'Rejected';
  records[recordIndex].reviewedAt = new Date().toISOString();
  records[recordIndex].notes = reason || records[recordIndex].notes;
  
  res.json({
    success: true,
    data: records[recordIndex],
    message: 'Record rejected successfully'
  });
});

// Delete a record
app.delete('/api/records/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const recordIndex = records.findIndex(r => r.id === id);
  
  if (recordIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  const deletedRecord = records.splice(recordIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedRecord,
    message: 'Record deleted successfully'
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`Use API key: demo-api-key-123 (optional for testing)`);
  console.log(`Submit data to: POST http://localhost:${PORT}/api/submit`);
});

module.exports = app; 