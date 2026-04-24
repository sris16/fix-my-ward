async function login() {

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("error").textContent = data.message;
      return;
    }

    localStorage.setItem("adminToken", data.token);

    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
  }
}