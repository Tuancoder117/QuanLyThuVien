const container = document.getElementById("danhSachSach");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestionsBox");

// Form sửa
const editForm = document.getElementById("editForm");
const editContainer = document.getElementById("editContainer");
const editName = document.getElementById("editName");
const editQty = document.getElementById("editQty");
const editImage = document.getElementById("editImage");
let currentEditIndex = null;

// ==== Gợi ý Wikipedia ====
async function fetchSuggestions(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data[1];
  } catch (err) {
    console.error("Lỗi gọi Wikipedia API:", err);
    return [];
  }
}

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

searchInput.addEventListener("focus", async () => {
  const results = await fetchSuggestions("a");
  showSuggestions(results);
});

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }
  const results = await fetchSuggestions(query);
  showSuggestions(results);
});

document.addEventListener("click", (e) => {
  if (!suggestions.contains(e.target) && e.target !== searchInput) {
    suggestions.style.display = "none";
  }
});

async function loadBooks() {
  const res = await fetch("http://localhost:3000/books");
  const data = await res.json();

  container.innerHTML = "";

  data.forEach((book, index) => {
    if (!book || typeof book !== "object") return;

    const imageUrl = book.bookImg || book.image || "https://placehold.co/150x150";

    const div = document.createElement("div");
    div.className = "book-card";
    div.innerHTML = `
      <img src="${imageUrl}" style="max-width:150px;" />
      <h3>${book.name}</h3>
      <p>Số lượng: ${book.soLuong}</p>
      <button class="edit-btn" data-index="${index}" data-name="${book.name}" data-qty="${book.soLuong}">Sửa</button>
      <button class="delete-btn" data-index="${index}">Xóa</button>
    `;
    container.appendChild(div);
  });

  attachEvents();
}

function attachEvents() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", function () {
      const index = this.dataset.index;
      const name = this.dataset.name;
      const qty = this.dataset.qty;

      // Mở form và đổ dữ liệu vào input
      currentEditIndex = index;
      editName.value = name;
      editQty.value = qty;
      editImage.value = null;
      editContainer.style.display = "block";
    });
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      const index = this.dataset.index;
      fetch(`http://localhost:3000/delete-book/${index}`, {
        method: "DELETE"
      }).then(() => {
        alert("Đã xóa sách");
        loadBooks();
      });
    });
  });
}

editForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (currentEditIndex === null) return;

  const formData = new FormData();
  formData.append("name", editName.value);
  formData.append("soLuong", editQty.value);

  const imageFile = editImage.files[0];
  if (imageFile) formData.append("image", imageFile);

  fetch(`http://localhost:3000/edit-book/${currentEditIndex}`, {
    method: "PUT",
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      alert("Đã sửa sách thành công");
      editForm.reset();
      editContainer.style.display = "none";
      currentEditIndex = null;
      loadBooks();
    });
});

window.addEventListener("DOMContentLoaded", loadBooks);
