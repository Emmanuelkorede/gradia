
function parseCSVLine(text) {
  const result = [];
  let insideQuote = false;
  let entry = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      insideQuote = !insideQuote; // Toggle quote state
    } else if (char === ',' && !insideQuote) {
      result.push(entry.trim());
      entry = "";
    } else {
      entry += char;
    }
  }
  result.push(entry.trim());
  return result;
}

/**
 * Parses an uploaded CSV file, validates columns and row content,
 * and prepares an array of objects structured for the questions table.
 * * @param {File} file - The raw file object from an HTML input selector.
 * @returns {Promise<Array>} Resolves to an array of validated objects ready for database insertion.
 */
export function parseQuestionsCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Split by lines and filter out empty trailing lines
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

        if (lines.length < 2) {
          throw new Error("The uploaded CSV file is empty or missing data rows.");
        }

        // 1. Parse and extract system headers from the first row
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ""));
        
        // Define standard required headers map
        const requiredHeaders = [
          "school", "subject", "question_text", 
          "option_a", "option_b", "option_c", "option_d", 
          "correct_option"
        ];

        // Ensure all vital structural parameters exist
        const missing = requiredHeaders.filter(req => !headers.includes(req));
        if (missing.length > 0) {
          throw new Error(`Invalid layout template! Missing required columns: ${missing.join(", ")}`);
        }

        const parsedQuestions = [];

        // 2. Loop through every single remaining data line
        for (let i = 1; i < lines.length; i++) {
          const rawRow = parseCSVLine(lines[i]);
          
          // Skip entirely empty rows
          if (rawRow.length === 1 && rawRow[0] === "") continue;

          // Build a structural key-value pairing map for the row
          const rowData = {};
          headers.forEach((header, index) => {
            // Strip wrapping quotes from the cell values if present
            let value = rawRow[index] || "";
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            }
            rowData[header] = value;
          });

          const rowNumber = i + 1;

          // 3. STRICT RULE ENFORCEMENT & VALIDATION
          if (!rowData["school"] || !rowData["subject"] || !rowData["question_text"]) {
            throw new Error(`Row ${rowNumber}: 'school', 'subject', and 'question_text' cannot be blank.`);
          }

          if (!rowData["option_a"] || !rowData["option_b"] || !rowData["option_c"] || !rowData["option_d"]) {
            throw new Error(`Row ${rowNumber}: All four multiple choice options (A down to D) must be filled.`);
          }

          // Force upper-case check and restrict to letters A, B, C, or D precisely
          const correctOpt = rowData["correct_option"]?.trim();
          const validOptions = ["A", "B", "C", "D"];
          
          if (!validOptions.includes(correctOpt)) {
            throw new Error(`Row ${rowNumber}: Invalid correct_option value "${correctOpt}". The database will only accept a single capital letter (A, B, C, or D).`);
          }

          // 4. Construct payload (Notice 'is_free' is dropped entirely to use database defaults)
          parsedQuestions.push({
            school: rowData["school"].trim(),
            subject: rowData["subject"].trim(),
            question_text: rowData["question_text"].trim(),
            option_a: rowData["option_a"].trim(),
            option_b: rowData["option_b"].trim(),
            option_c: rowData["option_c"].trim(),
            option_d: rowData["option_d"].trim(),
            correct_option: correctOpt,
            explanation: rowData["explanation"] ? rowData["explanation"].trim() : null
          });
        }

        resolve(parsedQuestions);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("File tracking system failed to read the template payload."));
    reader.readAsText(file);
  });
}