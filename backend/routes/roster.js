const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const router = express.Router();

const draftsFile = path.join(__dirname, '../data/drafts.json');

// Helper to read draft data
function readDrafts() {
    if (!fs.existsSync(draftsFile)) return {};
    const data = fs.readFileSync(draftsFile);
    return JSON.parse(data);
}

// Helper to save draft data
function saveDrafts(drafts) {
    fs.writeFileSync(draftsFile, JSON.stringify(drafts, null, 2));
}

// Save a draft
router.post('/save-draft', (req, res) => {
    const { userId, employees, startDate, endDate } = req.body;

    if (!userId || !employees) {
        return res.status(400).send("Missing userId or employee data.");
    }

    const drafts = readDrafts();
    drafts[userId] = { employees, startDate, endDate };
    saveDrafts(drafts);

    res.send({ message: "Draft saved." });
});

// Load a draft
router.get('/load-draft/:userId', (req, res) => {
    const userId = req.params.userId;
    const drafts = readDrafts();

    if (!drafts[userId]) {
        return res.status(404).send("No draft found.");
    }

    res.send(drafts[userId]);
});

// Generate the roster
router.post('/generate', (req, res) => {
    const { employees, startDate, endDate } = req.body;

    if (!employees || employees.length === 0) {
        return res.status(400).send("No employee data provided.");
    }

    // Calculate date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const roster = [];
    const dateList = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateList.push(new Date(d));
    }

    dateList.forEach(date => {
        const day = date.getDay(); // 0=Sun, 6=Sat
        const isWeekend = (day === 0 || day === 6);

        const available = employees.filter(emp => {
            const rank = emp.rank.toLowerCase();
            const isLeave = emp.leaves?.includes(date.toISOString().split('T')[0]);
            const isSgtOrAbove = ['sgt', 'ssgt', 'msgt', 'gysgt'].includes(rank);

            if (isLeave) return false;
            return isWeekend ? isSgtOrAbove : !isSgtOrAbove;
        });

        if (available.length > 0) {
            const employee = available[date.getDate() % available.length]; // basic rotation
            roster.push({
                date: date.toISOString().split('T')[0],
                assigned: employee.name,
                rank: employee.rank.toUpperCase()
            });
        } else {
            roster.push({
                date: date.toISOString().split('T')[0],
                assigned: "No Available Staff",
                rank: "-"
            });
        }
    });

    // Export to Excel
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(roster);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Roster');

    const outputPath = path.join(__dirname, '../output/Shift_Roster.xlsx');
    xlsx.writeFile(workbook, outputPath);

    res.download(outputPath, 'Shift_Roster.xlsx', err => {
        if (err) {
            console.error("Download error:", err);
            if (!res.headersSent) {
                res.status(500).send("Error sending file.");
            }
        }

        setTimeout(() => {
            fs.unlink(outputPath, () => {});
        }, 5000);
    });
});

module.exports = router;