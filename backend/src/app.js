const express = require('express');
const cors = require('cors');
const collegeRoutes = require('./routes/collegeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);


module.exports = app;