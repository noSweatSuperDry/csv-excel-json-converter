const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

app.use(cors());

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Recursive function to flatten nested JSON object
function flattenObject(obj, parentKey = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const propName = parentKey ? `${parentKey}_${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], propName));
    } else {
      acc[propName] = obj[key];
    }
    return acc;
  }, {});
}

app.post("/source", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    let data;
    if (req.file.originalname.endsWith(".json")) {
      data = JSON.parse(req.file.buffer.toString());
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    // Flatten the nested JSON data
    const flattenedData = [];
    data.forEach((item) => {
      const flattenedItem = flattenObject(item);
      item.shots.forEach((shot, index) => {
        const shotKeys = Object.keys(shot).map((key) => `shots_${index}_${key}`);
        shotKeys.forEach((shotKey) => {
          flattenedItem[shotKey] = shot[shotKey.substring(`shots_${index}_`.length)];
        });
      });
      flattenedData.push(flattenedItem);
    });

    // Extract unique keys from flattened data
    const keys = flattenedData.reduce((acc, item) => {
      Object.keys(item).forEach((key) => {
        if (!acc.includes(key)) {
          acc.push(key);
        }
      });
      return acc;
    }, []);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(flattenedData, { header: keys });
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelFilePath = path.join(__dirname,"converted.xlsx");
    xlsx.writeFile(wb, excelFilePath);

    res.sendFile(excelFilePath, (err) => {
      if (err) {
        console.error("Error sending Excel file:", err);
        res.status(500).json({ error: "Internal server error" });
      }
      // Cleanup: Delete the temporary Excel file
      // fs.unlinkSync(excelFilePath);
    });
  } catch (error) {
    console.error("Error converting file to Excel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
