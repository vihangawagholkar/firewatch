const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const port = 4000;

// Enable CORS for all requests
app.use(cors());

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

// Handle file upload and shift roster generation
app.post('/upload', upload.single('file'), (req, res) => {
//     if(!req.file){
//         return res.status(400).send('No file uploaded.');
//     }

//     //Process the uploaded excel file
//     // const workbook = xlsx.read(req.file.buffer, {type: 'buffer'});
//     // const sheet = workbook.Sheets['Employees'];
//     // const data = xlsx.utils.sheet_to_json(sheet);
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
// console.log("Sheets in file:", workbook.SheetNames); // Check if "Employees" exists

// const sheet = workbook.Sheets['Employees'];
// if (!sheet) {
//     return res.status(400).send('No "Employees" sheet found in the file.');
// }

// const data = xlsx.utils.sheet_to_json(sheet);
// console.log("Extracted Employees Data:", data); // Debugging output
//     console.log(data);
    // const leaveSheet = workbook.Sheets['Leave'];
    // const leaveData = leaveSheet ? xlsx.utils.sheet_to_json(leaveSheet) : [];
console.log("File received:", req.file ? req.file.originalname : "No file uploaded");

if (!req.file) {
    return res.status(400).send('No file uploaded.');
}

try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    console.log("Sheets in file:", workbook.SheetNames);

    if (!workbook.SheetNames.includes('Employees')) {
        return res.status(400).send('No "Employees" sheet found in the file.');
    }

    const employeeSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('employee'));

        if (!employeeSheetName) {
            return res.status(400).send(`No "Employees" sheet found. Found sheets: ${workbook.SheetNames.join(', ')}`);
        }

        console.log("Using sheet:", employeeSheetName);

        const sheet = workbook.Sheets[employeeSheetName];

    const data = xlsx.utils.sheet_to_json(sheet);
    console.log("Extracted Employees Data:", data);
    const leaveSheet = workbook.SheetNames.find(name => name.toLowerCase().includes('leave'));
    console.log(leaveSheet);
    const leaveData = leaveSheet ? xlsx.utils.sheet_to_json(leaveSheet) : [];
    const roster = generateShiftRoster(data, leaveData);
    res.json({roster});

    return res.json({ message: 'File processed successfully', employees: data });
} catch (error) {
    console.error('Error processing file:', error);
    if (!res.headersSent) {
        return res.status(500).send('Error processing file');
    }
}
    // Generate shift roster
    // console.log(data);
    

    
});

// Function generate shift roster
const generateShiftRoster= (employees, leaveData = []) => {
    const roster = [];
    const numDays = 30;

    for(let day=1; day<=numDays; day++){
        const date= `2025-04-${String(day).padStart(2,'0')}`;
        // const availableEmployees = employees.filter((e) => 
        //     !leaveData.some((l) => l.Date === date && l['Employee Name'] === e['Employee Name'])
        // );
        // const assignedEmployee = availableEmployees.length 
        //     ? availableEmployees[Math.floor(Math.random() * availableEmployees.length)]
        //     : 'No available staff';
        
        // roster.push({Date: date , 'Assigned Employee': assignedEmployee});

        // Convert leaveData dates to string format (YYYY-MM-DD) if leaveData exists
        const formattedLeaveData = leaveData.length
            ? leaveData.map(l => ({
                Date: new Date(l.Date).toISOString().split('T')[0],
                "Employee Name": l["Employee Name"]
            }))
            : [];

        // Filter employees who are NOT on leave for this date
        const availableEmployees = employees.filter(e => 
            !formattedLeaveData.some(l => l.Date === date && l["Employee Name"] === e["Employee Name"])
        );
            // console.log(availableEmployees);
        // Assign an employee (if available)
        const assignedEmployee = availableEmployees.length 
            ? availableEmployees[Math.floor(Math.random() * availableEmployees.length)]["Employee Name"] 
            : "No available staff";

        roster.push({ Date: date, "Assigned Employee": assignedEmployee });
    }

    return roster;
    
};

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});