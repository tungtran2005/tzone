let adminBrandPage = 1;
const adminBrandLimit = 10;

function guardAdmin() {
  if (!getAccessToken()) {
    window.location.href = "/login";
  }
}

async function fetchAdminBrands(page) {
  const result = await getJSON("/api/v1/brands?page=" + page + "&limit=" + adminBrandLimit);
  return result.data || {};
}

async function renderAdminBrands(page) {
  guardAdmin();

  try {
    const data = await fetchAdminBrands(page);
    const brands = data.brands || [];
    const pagination = data.pagination || { page: 1, has_next: false, has_prev: false, total_pages: 1 };

    const tbody = document.getElementById("brand-table-body");
    tbody.innerHTML = brands
      .map(function (brand) {
        return "<tr class='border-b'>" +
          "<td class='p-2'>" + escapeHtml(brand.id) + "</td>" +
          "<td class='p-2'>" + escapeHtml(brand.brand_name) + "</td>" +
          "<td class='p-2 space-x-2'>" +
          "<button class='px-2 py-1 bg-amber-500 text-white rounded' onclick='editBrand(\"" + escapeHtml(brand.id) + "\", \"" + escapeHtml(brand.brand_name) + "\")'>Edit</button>" +
          "<button class='px-2 py-1 bg-red-600 text-white rounded' onclick='deleteBrand(\"" + escapeHtml(brand.id) + "\")'>Delete</button>" +
          "</td></tr>";
      })
      .join("");

    adminBrandPage = pagination.page || 1;
    document.getElementById("brand-pagination-info").textContent =
      "Page " + adminBrandPage + " / " + (pagination.total_pages || 1);
    document.getElementById("brand-prev-btn").disabled = !pagination.has_prev;
    document.getElementById("brand-next-btn").disabled = !pagination.has_next;
  } catch (error) {
    showMessage("brand-admin-message", error.message, true);
  }
}

async function createBrand(event) {
  event.preventDefault();
  const name = document.getElementById("brand-name").value.trim();
  if (!name) {
    showMessage("brand-admin-message", "Brand name is required", true);
    return;
  }

  try {
    await postJSON("/api/v1/brands", { brand_name: name }, true);
    document.getElementById("create-brand-form").reset();
    showMessage("brand-admin-message", "Brand created", false);
    renderAdminBrands(1);
  } catch (error) {
    showMessage("brand-admin-message", error.message, true);
  }
}

async function editBrand(id, currentName) {
  const nextName = window.prompt("Update brand name", currentName || "");
  if (!nextName) {
    return;
  }

  try {
    await putJSON("/api/v1/brands/" + encodeURIComponent(id), { brand_name: nextName }, true);
    showMessage("brand-admin-message", "Brand updated", false);
    renderAdminBrands(adminBrandPage);
  } catch (error) {
    showMessage("brand-admin-message", error.message, true);
  }
}

async function deleteBrand(id) {
  const ok = window.confirm("Delete this brand?");
  if (!ok) {
    return;
  }

  try {
    await deleteJSON("/api/v1/brands/" + encodeURIComponent(id), true);
    showMessage("brand-admin-message", "Brand deleted", false);
    renderAdminBrands(adminBrandPage);
  } catch (error) {
    showMessage("brand-admin-message", error.message, true);
  }
}

document.getElementById("create-brand-form").addEventListener("submit", createBrand);
document.getElementById("brand-prev-btn").addEventListener("click", function () {
  renderAdminBrands(Math.max(1, adminBrandPage - 1));
});
document.getElementById("brand-next-btn").addEventListener("click", function () {
  renderAdminBrands(adminBrandPage + 1);
});

document.getElementById("logout-btn").addEventListener("click", async function () {
  await logout();
  window.location.href = "/login";
});

renderAdminBrands(1);

