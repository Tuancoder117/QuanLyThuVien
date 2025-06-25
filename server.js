const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;
const BOOKS_FILE = path.join(__dirname, "books.json");

// Tạo thư mục uploads nếu chưa có
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Cấu hình Multer để lưu ảnh upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 📚 Đọc danh sách sách từ books.json
function readBooks() {
  try {
    if (!fs.existsSync(BOOKS_FILE)) return [];
    const data = fs.readFileSync(BOOKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Lỗi khi đọc books.json:", err);
    return [];
  }
}

// 📝 Ghi danh sách sách vào books.json
function writeBooks(books) {
  try {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), "utf-8");
  } catch (err) {
    console.error("Lỗi khi ghi books.json:", err);
  }
}

// ✅ API: Lấy danh sách sách
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});

// ✅ API: Sửa sách
app.put("/edit-book/:index", upload.single("image"), (req, res) => {
  const index = parseInt(req.params.index);
  const { name, soLuong } = req.body;

  const books = readBooks();

  if (isNaN(index) || !books[index]) {
    return res.status(404).json({ message: "Không tìm thấy sách để sửa" });
  }

  const book = books[index];

  // Cập nhật thông tin
  if (name) book.name = name;
  if (soLuong) book.soLuong = soLuong;

  // Nếu có ảnh mới
  if (req.file) {
    const oldImagePath = book.bookImg?.replace(`http://localhost:${PORT}/`, "");
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath); // Xoá ảnh cũ
    }

    book.bookImg = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  }

  books[index] = book;
  writeBooks(books);

  res.json({ message: "Đã sửa sách thành công", book });
});

// ✅ API: Thêm sách mới (nếu cần)
app.post("/add-book", upload.single("image"), (req, res) => {
  const { name, soLuong } = req.body;
  const books = readBooks();

  const book = {
    name,
    soLuong,
    bookImg: req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : null,
  };

  books.push(book);
  writeBooks(books);

  res.json({ message: "Đã thêm sách", book });
});

// ✅ Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
