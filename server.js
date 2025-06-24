const fs = require("fs");
const fsPromises = require("fs/promises");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;
const BOOKS_FILE = "books.json";
let books = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Tạo thư mục uploads nếu chưa có
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Load dữ liệu từ file
async function loadBooksFromFile() {
  try {
    const data = await fsPromises.readFile(BOOKS_FILE, "utf-8");
    books = JSON.parse(data);
    console.log("📚 Đã load dữ liệu từ books.json");
  } catch (err) {
    console.log("📂 Chưa có books.json, sẽ tạo mới sau");
    books = [];
  }
}

// Lưu dữ liệu ra file
function saveBooksToFile() {
  fsPromises.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2))
    .then(() => console.log("💾 Đã lưu books vào books.json"))
    .catch(err => console.error("❌ Lỗi ghi file:", err));
}

// ROUTES

// Thêm sách
app.post("/add-book", upload.single("image"), (req, res) => {
  const { name, soLuong } = req.body;
  const imageUrl = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : null;

  books.push({ name, soLuong, bookImg: imageUrl });

  saveBooksToFile();

  res.json({ message: "Book added" });
});

// Lấy danh sách sách
app.get("/books", (req, res) => {
  res.json(books);
});

// Xóa sách
app.delete("/delete-book/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (!isNaN(index) && books[index]) {
    books.splice(index, 1);
    saveBooksToFile(); // << QUAN TRỌNG
    res.json({ message: "Đã xóa sách" });
  } else {
    res.status(404).json({ message: "Không tìm thấy sách để xóa" });
  }
});

// Sửa sách
app.put("/edit-book/:index", upload.single("image"), (req, res) => {
  const index = parseInt(req.params.index);
  const { name, soLuong } = req.body;

  if (!isNaN(index) && books[index]) {
    const book = books[index];

    // Cập nhật tên và số lượng nếu có
    if (name) book.name = name;
    if (soLuong) book.soLuong = soLuong;

    // Nếu người dùng gửi ảnh mới
    if (req.file) {
      const oldImagePath = book.bookImg?.replace(`http://localhost:${PORT}/`, ""); // đường dẫn cũ
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // xóa ảnh cũ khỏi thư mục uploads/
      }

      // Gán ảnh mới
      book.bookImg = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    saveBooksToFile(); // ghi lại vào books.json
    res.json({ message: "Đã sửa sách" });
  } else {
    res.status(404).json({ message: "Không tìm thấy sách để sửa" });
  }
});


// Khởi động server
loadBooksFromFile().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  });
});
