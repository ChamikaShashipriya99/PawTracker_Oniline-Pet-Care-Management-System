import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../project_images");

// Ensure upload directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create upload directory:", error.message);
  throw new Error("Server setup error: Unable to create upload directory");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and GIF images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024) }, // Default 5MB
});

// Error-handling middleware for Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).send({ message: `Multer error: ${err.message}` });
  }
  if (err.message.includes("Only JPEG, PNG, and GIF images are allowed")) {
    return res.status(400).send({ message: err.message });
  }
  next(err); // Pass other errors to global error handler
};

const requirePhoto = (req, res, next) => {
  // Image is optional, no validation required
  next();
};

export default requirePhoto;