const express = require('express');
const cors = require('cors');
const collegeRoutes = require('./routes/collegeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/colleges', collegeRoutes);

module.exports = app;