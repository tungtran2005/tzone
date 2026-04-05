async function apiRequest(path, options, requiresAuth) {
  const requestOptions = options || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, requestOptions.headers || {});

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }

  let response = await fetch(path, Object.assign({}, requestOptions, { headers: headers }));

  if (response.status === 401 && requiresAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const nextHeaders = Object.assign({}, headers, { Authorization: "Bearer " + getAccessToken() });
      response = await fetch(path, Object.assign({}, requestOptions, { headers: nextHeaders }));
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok || (body && body.success === false)) {
    const errorMessage = (body && body.message) || "Request failed";
    throw new Error(errorMessage);
  }

  return body;
}

async function getJSON(path) {
  return apiRequest(path, { method: "GET" }, false);
}

async function postJSON(path, payload, requiresAuth) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(payload) }, Boolean(requiresAuth));
}

async function putJSON(path, payload, requiresAuth) {
  return apiRequest(path, { method: "PUT", body: JSON.stringify(payload) }, Boolean(requiresAuth));
}

async function deleteJSON(path, requiresAuth) {
  return apiRequest(path, { method: "DELETE" }, Boolean(requiresAuth));
}

