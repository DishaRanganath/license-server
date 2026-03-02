const express =require('express');
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

module.exports = app;