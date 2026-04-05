function guardAdminPage() {
  if (!getAccessToken()) {
    window.location.href = "/login";
  }
}

async function loadAdminSummary() {
  guardAdminPage();

  try {
    const brandRes = await getJSON("/api/v1/brands?page=1&limit=1");
    const deviceRes = await getJSON("/api/v1/devices?page=1&limit=1");

    const brandTotal = (brandRes.data && brandRes.data.pagination && brandRes.data.pagination.total) || 0;
    const deviceTotal = (deviceRes.data && deviceRes.data.pagination && deviceRes.data.pagination.total) || 0;

    document.getElementById("brand-total").textContent = String(brandTotal);
    document.getElementById("device-total").textContent = String(deviceTotal);
  } catch (error) {
    showMessage("admin-message", error.message, true);
  }
}

document.getElementById("logout-btn").addEventListener("click", async function () {
  await logout();
  window.location.href = "/login";
});

loadAdminSummary();

