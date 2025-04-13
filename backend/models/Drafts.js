const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: String,
    rank: String,
    leaves: [String], // array of dates like "2025-04-12"
});

const DraftSchema = new mongoose.Schema({
    userId: String, // UUID
    employees: [EmployeeSchema],
    startDate: String,
    endDate: String,
}, { timestamps: true });

module.exports = mongoose.model('Draft', DraftSchema);