let adminDevicePage = 1;
const adminDeviceLimit = 10;

function guardAdmin() {
  if (!getAccessToken()) {
    window.location.href = "/login";
  }
}

async function loadBrandOptions() {
  const result = await getJSON("/api/v1/brands?page=1&limit=100");
  const brands = (result.data && result.data.brands) || [];

  const select = document.getElementById("device-brand-id");
  select.innerHTML = brands
    .map(function (brand) {
      return "<option value='" + escapeHtml(brand.id) + "'>" + escapeHtml(brand.brand_name) + "</option>";
    })
    .join("");
}

async function renderAdminDevices(page) {
  guardAdmin();

  try {
    const result = await getJSON("/api/v1/devices?page=" + page + "&limit=" + adminDeviceLimit);
    const data = result.data || {};
    const devices = data.devices || [];
    const pagination = data.pagination || { page: 1, has_next: false, has_prev: false, total_pages: 1 };

    const tbody = document.getElementById("device-table-body");
    tbody.innerHTML = devices
      .map(function (device) {
        return "<tr class='border-b'>" +
          "<td class='p-2'>" + escapeHtml(device.id) + "</td>" +
          "<td class='p-2'>" + escapeHtml(device.brand_id) + "</td>" +
          "<td class='p-2'>" + escapeHtml(device.model_name) + "</td>" +
          "<td class='p-2 space-x-2'>" +
          "<button class='px-2 py-1 bg-amber-500 text-white rounded' onclick='editDevice(\"" + escapeHtml(device.id) + "\", \"" + escapeHtml(device.brand_id) + "\", \"" + escapeHtml(device.model_name) + "\")'>Edit</button>" +
          "<button class='px-2 py-1 bg-red-600 text-white rounded' onclick='deleteDevice(\"" + escapeHtml(device.id) + "\")'>Delete</button>" +
          "</td></tr>";
      })
      .join("");

    adminDevicePage = pagination.page || 1;
    document.getElementById("device-pagination-info").textContent =
      "Page " + adminDevicePage + " / " + (pagination.total_pages || 1);
    document.getElementById("device-prev-btn").disabled = !pagination.has_prev;
    document.getElementById("device-next-btn").disabled = !pagination.has_next;
  } catch (error) {
    showMessage("device-admin-message", error.message, true);
  }
}

async function createDevice(event) {
  event.preventDefault();

  const brandId = document.getElementById("device-brand-id").value;
  const modelName = document.getElementById("device-model-name").value.trim();
  const imageUrl = document.getElementById("device-image-url").value.trim();
  const specificationsText = document.getElementById("device-specifications").value.trim();

  let specifications = {};
  if (specificationsText) {
    try {
      specifications = JSON.parse(specificationsText);
    } catch (_) {
      showMessage("device-admin-message", "Specifications must be valid JSON", true);
      return;
    }
  }

  try {
    await postJSON(
      "/api/v1/devices",
      {
        brand_id: brandId,
        model_name: modelName,
        imageUrl: imageUrl,
        specifications: specifications
      },
      true
    );

    document.getElementById("create-device-form").reset();
    showMessage("device-admin-message", "Device created", false);
    renderAdminDevices(1);
  } catch (error) {
    showMessage("device-admin-message", error.message, true);
  }
}

async function editDevice(id, currentBrandID, currentModelName) {
  const brandId = window.prompt("Update brand ID", currentBrandID || "");
  if (!brandId) {
    return;
  }

  const modelName = window.prompt("Update model name", currentModelName || "");
  if (!modelName) {
    return;
  }

  const specsRaw = window.prompt("Update specifications JSON", "{}");
  if (specsRaw === null) {
    return;
  }

  let specs;
  try {
    specs = JSON.parse(specsRaw || "{}");
  } catch (_) {
    showMessage("device-admin-message", "Invalid specifications JSON", true);
    return;
  }

  try {
    await putJSON(
      "/api/v1/devices/" + encodeURIComponent(id),
      { brand_id: brandId, model_name: modelName, specifications: specs },
      true
    );
    showMessage("device-admin-message", "Device updated", false);
    renderAdminDevices(adminDevicePage);
  } catch (error) {
    showMessage("device-admin-message", error.message, true);
  }
}

async function deleteDevice(id) {
  const ok = window.confirm("Delete this device?");
  if (!ok) {
    return;
  }

  try {
    await deleteJSON("/api/v1/devices/" + encodeURIComponent(id), true);
    showMessage("device-admin-message", "Device deleted", false);
    renderAdminDevices(adminDevicePage);
  } catch (error) {
    showMessage("device-admin-message", error.message, true);
  }
}

document.getElementById("create-device-form").addEventListener("submit", createDevice);
document.getElementById("device-prev-btn").addEventListener("click", function () {
  renderAdminDevices(Math.max(1, adminDevicePage - 1));
});
document.getElementById("device-next-btn").addEventListener("click", function () {
  renderAdminDevices(adminDevicePage + 1);
});

document.getElementById("logout-btn").addEventListener("click", async function () {
  await logout();
  window.location.href = "/login";
});

(async function init() {
  await loadBrandOptions();
  await renderAdminDevices(1);
})();

