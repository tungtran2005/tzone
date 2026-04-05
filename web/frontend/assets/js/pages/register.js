document.getElementById("register-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  showMessage("register-message", "", false);

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await postJSON("/auth/register", { email: email, password: password }, false);
    showMessage("register-message", "Register success. Redirecting to login...", false);
    window.setTimeout(function () {
      window.location.href = "/login";
    }, 700);
  } catch (error) {
    showMessage("register-message", error.message, true);
  }
});

