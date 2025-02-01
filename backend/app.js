const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');

// ... diğer middleware'ler

// Routes
app.use('/api/v1/auth', authRoutes);  // auth route'larını /api/v1/auth prefix'i ile kullan

// ... diğer route'lar 