// Initialize express app
const express = require("express");
const app = express();

const fs = require("fs");
const csvtojson = require("csvtojson");

//Importing cors for cross origin requests
const cors = require("cors");
app.use(cors());

// Uploaded file will be saved in uploads folder/Middleware
const multer = require("multer");
const upload = multer({ dest: "output/" });

//
app.post("/source", upload.single("file"), async (req, res) => {
    //If no file found
  if (!req.file) {
    return res.status(400).send("No files were uploaded.");
  }
//If a file is found
try {
  let data;
  if (req.file.originalname.endsWith('.csv')) {
      data = await csvtojson().fromFile(req.file.path);
  } else if (req.file.originalname.endsWith('.json')) {
      data = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
  } else {
      return res.status(400).json({ error: 'Unsupported file format' });
  }

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

  const excelFilePath = 'converted.xlsx';
  xlsx.writeFile(wb, excelFilePath);

  res.download(excelFilePath, (err) => {
      if (err) {
          console.error('Error sending Excel file:', err);
          res.status(500).json({ error: 'Internal server error' });
      }
      fs.unlinkSync(excelFilePath); // Delete the temporary file after sending
  });
} catch (error) {
  console.error('Error converting file to Excel:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});

require("dotenv").config();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

