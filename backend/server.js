const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS for all requests
app.use(cors());

app.use(express.json());

const rosterRoutes = require('./routes/roster');
app.use('/api/roster');

app.listen(port, () =>{
    console.log(`Server running on http://localhost:${port}`);
});