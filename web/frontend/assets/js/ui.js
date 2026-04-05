function showMessage(targetId, message, isError) {
  const element = document.getElementById(targetId);
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.className = "mt-3 text-sm " + (isError ? "text-red-600" : "text-green-600");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatJson(value) {
  try {
    return JSON.stringify(value || {}, null, 2);
  } catch (_) {
    return "{}";
  }
}

