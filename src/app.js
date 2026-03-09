const express =require('express');
const path = require('path');
const app=express();


app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('License Server is running');
});
const licenseRoutes = require('./routes/licenseroutes');
app.use('/api', licenseRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Serve static admin dashboard
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

module.exports = app;