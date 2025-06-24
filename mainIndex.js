window.addEventListener("DOMContentLoaded", () => {
fetch("http://localhost:3000/books")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("danhSachSach");
    container.innerHTML = ""; // Xóa cũ trước khi render mới

    data.forEach((book, index) => {
      if (!book || typeof book !== "object") return;

      const imageUrl = book.bookImg || "https://placehold.co/150x150";
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <img src="${imageUrl}" style="max-width:150px;" />
        <h3>${book.name}</h3>
        <p>Số lượng: ${book.soLuong}</p>
        <button class="edit-btn" data-index="${index}">Sửa</button>
        <button class="delete-btn" data-index="${index}">Xóa</button>
      `;
      container.appendChild(div);
    });

    // Gán sự kiện cho nút Xóa
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", function () {
        const index = this.dataset.index;
        fetch(`http://localhost:3000/delete-book/${index}`, {
          method: "DELETE"
        })
        .then(() => {
          alert("Đã xóa sách");
          location.reload();
        });
      });
    });

    // Gán sự kiện cho nút Sửa
    document.querySelectorAll(".edit-btn").forEach(button => {
  button.addEventListener("click", async function () {
    const index = this.dataset.index;
    const newName = prompt("Tên mới:");
    const newQuantity = prompt("Số lượng mới:");

    if (newName && newQuantity) {
      const newImageFile = await selectImageFile(); // ← Hàm cho người dùng chọn ảnh

      const formData = new FormData();
      formData.append("name", newName);
      formData.append("soLuong", newQuantity);
      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      fetch(`http://localhost:3000/edit-book/${index}`, {
        method: "PUT",
        body: formData
      })
      .then(() => {
        alert("Đã sửa sách");
        location.reload();
      });
    }
  });
});

  });
});

function selectImageFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      resolve(input.files[0]);
    };
    input.click();
  });
}

// Gọi Wikipedia API để lấy gợi ý
async function fetchSuggestions(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[1]; // mảng gợi ý
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    return [];
  }
}

// Hiển thị gợi ý
function showSuggestions(results) {
  suggestionsBox.innerHTML = "";
  if (results.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  results.forEach(result => {
    const div = document.createElement("div");
    div.textContent = result;
    div.onclick = () => {
      searchInput.value = result;
      suggestionsBox.style.display = "none";
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
}

// Sự kiện khi click vào ô input
searchInput.addEventListener("focus", async () => {
  const results = await fetchSuggestions("a"); // Gợi ý mặc định khi click
  showSuggestions(results);
});

// Sự kiện khi gõ chữ
searchInput.addEventListener("input", async () => {
  const query = searchInput.value;
  if (query.trim() === "") {
    suggestionsBox.style.display = "none";
    return;
  }
  const results = await fetchSuggestions(query);
  showSuggestions(results);
});

// Ẩn gợi ý khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!document.querySelector(".Menu_nav").contains(e.target)) {
    suggestions.style.display = "none";
  }
});
