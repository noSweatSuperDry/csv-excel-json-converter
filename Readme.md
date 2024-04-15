### API process followed this steps.
                        1. Initializing Multer middleware to handle file uploads.
                        2. Enabling CORS middleware to allow cross-origin requests.
                        3. Defining a route for handling file conversion via POST requests.
                        4. Checking if a file was uploaded and handling errors if not.
                        5. Determining the file format based on its extension (CSV or JSON).
                        6. Converting CSV files to JSON using csvtojson.
                        7. Reading JSON data from JSON files.
                        8. Creating a new Excel workbook using xlsx.utils.book_new().
                        9. Converting JSON data to an Excel sheet using xlsx.utils.json_to_sheet().
                        10. Appending the sheet to the workbook using xlsx.utils.book_append_sheet().
                        11. Writing the workbook to an Excel file using xlsx.writeFile().
                        12. Sending the Excel file as a downloadable attachment using res.download().
                        13. Handling errors during file sending and cleanup by deleting the temporary Excel file.


### Used libraries      
                    ´´´ multer, xlsx, csvtojson, cors ´´´
