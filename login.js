function login(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  // Basic mobile validation (India)
  const mobileRegex = /^[6-9]\d{9}$/;

  if (!mobileRegex.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number 🇮🇳");
    return;
  }

  // Save data (optional)
  localStorage.setItem("userName", name);
  localStorage.setItem("userMobile", mobile);

  // Redirect after login
  window.location.href = "dashboard.html";
}
