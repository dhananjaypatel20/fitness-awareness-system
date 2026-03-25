function goToLogin() {
  window.location.href = "login.html";
}

/* SCROLL TO TOP – FONT AWESOME */
const scrollUp = document.querySelector(".scroll_up");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    scrollUp.style.display = "flex";
  } else {
    scrollUp.style.display = "none";
  }
});

scrollUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});



