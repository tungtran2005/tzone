async function loadBrandDetails() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const brandId = parts[1] || "";

  if (!brandId) {
    showMessage("page-message", "Missing brand ID", true);
    return;
  }

  try {
    const brandRes = await getJSON("/api/v1/brands/" + encodeURIComponent(brandId));
    document.getElementById("brand-title").textContent =
      (brandRes.data && brandRes.data.brand_name) || "Brand";

    const devices = [];
    let page = 1;
    const limit = 100;
    let hasNext = true;

    // Iterate through paginated devices and filter by current brand id.
    while (hasNext) {
      const deviceRes = await getJSON("/api/v1/devices?page=" + page + "&limit=" + limit);
      const data = deviceRes.data || {};
      const items = data.devices || [];
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].brand_id === brandId) {
          devices.push(items[i]);
        }
      }
      hasNext = Boolean(data.pagination && data.pagination.has_next);
      page += 1;
    }

    const list = document.getElementById("device-list");
    list.innerHTML = devices
      .map(function (device) {
        return "<div class='bg-white rounded border p-4'>" +
          "<h3 class='font-semibold'>" + escapeHtml(device.model_name) + "</h3>" +
          "<p class='text-sm text-gray-600 mt-1'>Device ID: " + escapeHtml(device.id) + "</p>" +
          "<pre class='mt-3 bg-gray-100 p-3 rounded text-xs overflow-auto'>" +
          escapeHtml(formatJson(device.specifications || {})) +
          "</pre></div>";
      })
      .join("");

    if (devices.length === 0) {
      list.innerHTML = "<div class='text-gray-500'>No devices found for this brand.</div>";
    }
  } catch (error) {
    showMessage("page-message", error.message, true);
  }
}

loadBrandDetails();

