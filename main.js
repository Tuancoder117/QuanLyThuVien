document.getElementById("bookForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("bookImg", document.getElementById("bookImage").files[0]);
  formData.append("name", document.getElementById("bookName").value);
  formData.append("soLuong", document.getElementById("quantity").value);
  fetch("http://localhost:3000/add-book", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert("Đã thêm sách");
    window.location.href = "index.html";
  });
});
