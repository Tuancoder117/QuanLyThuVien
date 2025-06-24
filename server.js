const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use("/uploads", express.static("uploads")); // Truy cập ảnh tĩnh

// Tạo thư mục uploads nếu chưa có
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Cấu hình multer để xử lý multipart/form-data
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

let books = [];

app.post("/add-book", upload.single("image"), (req, res) => {
  console.log("📥 Body:", req.body);
  console.log("📷 File:", req.file);

  const { name, soLuong } = req.body;
  const imageUrl = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : null;

  books.push({
    name,
    soLuong,
    bookImg: imageUrl
  });

  res.json({ message: "Book added" });
});

app.get("/books", (req, res) => {
  const validBooks = books.filter(book => book && typeof book === "object");
  res.json(validBooks);
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
