document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  showMessage("login-message", "", false);

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const result = await postJSON("/auth/login", { email: email, password: password }, false);
    setSession(result.data.access_token, result.data.refresh_token);
    showMessage("login-message", "Login success. Redirecting...", false);
    window.setTimeout(function () {
      window.location.href = "/admin";
    }, 600);
  } catch (error) {
    showMessage("login-message", error.message, true);
  }
});

