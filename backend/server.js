const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const connectDB = require('./db');
const app = express();
const port = 3001;
const cors = require('cors');

// Enable CORS for all requests
app.use(cors());

app.use(express.json());

connectDB();
const rosterRoutes = require('./routes/roster');
const { connect } = require('http2');
app.use('/api/roster', rosterRoutes);

app.listen(port, () =>{
    console.log(`Server running on http://localhost:${port}`);
});