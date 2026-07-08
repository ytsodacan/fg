var backgrounds = ["images/bg1.PNG", "images/bg2.PNG", "images/bg3.PNG"];

function setRandomBackground() {
  var el = document.getElementById("heroBg");
  if (!el) return;
  var pick = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  el.src = pick;
}

function setupNavScroll() {
  var navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function setupMobileMenu() {
  var toggle = document.querySelector(".menu-toggle");
  var links = document.querySelector(".nav-links");
  var overlay = document.querySelector(".nav-overlay");
  if (!toggle || !links || !overlay) return;
  toggle.addEventListener("click", function () {
    links.classList.toggle("open");
    overlay.classList.toggle("open");
  });
  overlay.addEventListener("click", function () {
    links.classList.remove("open");
    overlay.classList.remove("open");
  });
}

function setupScrollReveal() {
  var revealEls = document.querySelectorAll(".reveal, .reveal-item");
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) {
    observer.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setRandomBackground();
  setupNavScroll();
  setupMobileMenu();
  setupScrollReveal();
});
