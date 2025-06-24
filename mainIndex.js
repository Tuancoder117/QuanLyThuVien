fetch("http://localhost:3000/books")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("danhSachSach");

   data.forEach(book => {
  if (!book || typeof book !== "object") return;

  const imageUrl = book.bookImg || "https://placehold.co/150x150";
  const div = document.createElement("div");
  div.className = "book-card";
  div.innerHTML = `
    <img src="${imageUrl}" style="max-width:150px;" />
    <h3>${book.name}</h3>
    <p>Số lượng: ${book.soLuong}</p>
  `;
  container.appendChild(div);
});
  })
  .catch(error => {
    console.error("Lỗi khi lấy danh sách sách:", error);
  }); 

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
