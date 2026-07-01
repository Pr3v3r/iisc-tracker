const express = require('express');
const cors = require('cors');
const collegeRoutes = require('./routes/collegeRoutes');
const authRoutes = require('./routes/authRoutes');
const importRoutes = require('./routes/importRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

app.use(cors({
    origin: '*'
  }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/import', importRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/audit', auditRoutes);

module.exports = app;