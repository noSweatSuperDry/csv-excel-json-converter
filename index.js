//=======Initialize express app=======//
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

//import xlsx
const xlsx = require("xlsx");
//
app.post("/source", upload.single("file"), async (req, res) => {
  // when req. is received, the file is uploaded and the file is converted to JSON and then to Excel
  try {
    //If no file found
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }
    //If a file is found
    try {
      let data;
      // Check the file extension to determine the file format
      if (req.file.originalname.endsWith(".csv")) {
        // Convert CSV file to JSON
        data = await csvtojson().fromFile(req.file.path);
      } else if (req.file.originalname.endsWith(".json")) {
        // Read JSON data from the file
        data = JSON.parse(fs.readFileSync(req.file.path, "utf-8"));
      } else {
        // Unsupported file format
        return res.status(400).json({ error: "Unsupported file format" });
      }

      // Create a new Excel workbook
      const wb = xlsx.utils.book_new();
      // Convert JSON data to Excel sheet
      const ws = xlsx.utils.json_to_sheet(data);
      // Append the sheet to the workbook
      xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

      // Define the path for the converted Excel file
      const excelFilePath = "converted.xlsx";
      // Write the workbook to an Excel file
      xlsx.writeFile(wb, excelFilePath);

      // Send the Excel file as a downloadable attachment
      res.download(excelFilePath, (err) => {
        if (err) {
          console.error("Error sending Excel file:", err);
          res.status(500).json({ error: "Internal server error" });
        }
        // Delete the temporary Excel file after sending
        fs.unlinkSync(excelFilePath);
      });
    } catch (error) {
      console.error("Error converting file to Excel:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error converting file to Excel:", error);
    res.status(500).json({ error: "Request can not be fullfilled" });
  }
});

require("dotenv").config();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
