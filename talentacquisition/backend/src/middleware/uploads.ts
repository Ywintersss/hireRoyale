import multer from "multer";
import path from "path";
import fs from "fs";
import { __dirname } from "../lib/pathHelper.js";

// ensure the folder exists
// __dirname = backend/src/controllers (for example)
// ../.. gets you out of src/
const resumesDir = path.join(__dirname, "..", "..", "assets", "resumes");

if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
}


// configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resumesDir);
    },
    filename: (req, file, cb) => {
        // example: userId_timestamp_originalName.pdf
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

export const upload = multer({ storage });
