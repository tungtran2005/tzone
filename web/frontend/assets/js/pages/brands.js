let currentPage = 1;
const pageSize = 10;

async function loadBrands(page) {
  try {
    const result = await getJSON("/api/v1/brands?page=" + page + "&limit=" + pageSize);
    const data = result.data || {};
    const brands = data.brands || [];
    const pagination = data.pagination || { page: 1, total_pages: 1, has_next: false, has_prev: false };

    const list = document.getElementById("brand-list");
    list.innerHTML = brands
      .map(function (brand) {
        return "<a class='block bg-white p-4 rounded border hover:border-blue-400' href='/brands/" +
          encodeURIComponent(brand.id) +
          "'><h3 class='font-semibold text-lg'>" +
          escapeHtml(brand.brand_name) +
          "</h3><p class='text-gray-600 text-sm'>ID: " +
          escapeHtml(brand.id) +
          "</p></a>";
      })
      .join("");

    if (brands.length === 0) {
      list.innerHTML = "<div class='text-gray-500'>No brands found.</div>";
    }

    currentPage = pagination.page || 1;
    document.getElementById("pagination-info").textContent =
      "Page " + (pagination.page || 1) + " / " + (pagination.total_pages || 1);
    document.getElementById("prev-btn").disabled = !pagination.has_prev;
    document.getElementById("next-btn").disabled = !pagination.has_next;
  } catch (error) {
    showMessage("page-message", error.message, true);
  }
}

document.getElementById("prev-btn").addEventListener("click", function () {
  loadBrands(Math.max(1, currentPage - 1));
});

document.getElementById("next-btn").addEventListener("click", function () {
  loadBrands(currentPage + 1);
});

loadBrands(1);

