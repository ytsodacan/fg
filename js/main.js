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

// Load weighted chances from JSON
function loadImageChances() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "images/imageChances.json", true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        // Compute total chance
        var total = data.reduce(function (sum, entry) {
          return sum + (entry.chance || 0);
        }, 0);
        if (total > 0) {
          var rand = Math.random() * total;
          var cumulative = 0;
          for (var i = 0; i < data.length; i++) {
            cumulative += data[i].chance;
            if (rand <= cumulative) {
              var pick = data[i];
              var bgEl = document.getElementById("heroBg");
              var captionEl = document.querySelector(".hero-caption");
              if (bgEl) bgEl.src = pick.img;
              if (captionEl) {
                captionEl.textContent = pick.text;
                captionEl.classList.add("show");
                setTimeout(function () {
                  captionEl.classList.remove("show");
                }, 4000);
              }
              break;
            }
          }
        } else {
          // Fallback to default random
          setRandomBackgroundWithText();
        }
      } catch (e) {
        console.error("Failed to parse imageChances.json", e);
        setRandomBackgroundWithText();
      }
    } else {
      console.error("Failed to load imageChances.json");
      setRandomBackgroundWithText();
    }
  };
  xhr.onerror = function () {
    console.error("Network error loading imageChances.json");
    setRandomBackgroundWithText();
  };
  xhr.send();
}

// Default random selection (fallback)
var randomImageOptions = [
  { img: "images/bg1.PNG", text: "Explore the jungle" },
  { img: "images/bg2.PNG", text: "Swing through the trees" },
  { img: "images/bg3.PNG", text: "Discover hidden treasures" }
];

function setRandomBackgroundWithText() {
  var options = randomImageOptions;
  var pick = options[Math.floor(Math.random() * options.length)];
  var bgEl = document.getElementById("heroBg");
  var captionEl = document.querySelector(".hero-caption");
  if (bgEl) bgEl.src = pick.img;
  if (captionEl) {
    captionEl.textContent = pick.text;
    captionEl.classList.add("show");
    setTimeout(function () {
      captionEl.classList.remove("show");
    }, 4000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadImageChances();
  setupNavScroll();
  setupMobileMenu();
  setupScrollReveal();
});
