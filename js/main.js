var imageChancesCache = null;

function fetchImageChances(callback) {
  if (imageChancesCache) {
    callback(imageChancesCache);
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "images/imageChances.json", true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        imageChancesCache = data;
        callback(data);
      } catch (e) {
        callback(fallbackImageChances());
      }
    } else {
      callback(fallbackImageChances());
    }
  };
  xhr.onerror = function () {
    callback(fallbackImageChances());
  };
  xhr.send();
}

function fallbackImageChances() {
  return [
    { img: "images/bg1.PNG", text: "Explore the jungle", chance: 1 },
    { img: "images/bg2.PNG", text: "Swing through the trees", chance: 1 },
    { img: "images/bg3.PNG", text: "Discover hidden treasures", chance: 1 }
  ];
}

function weightedPick(data) {
  var total = data.reduce(function (sum, entry) {
    return sum + (entry.chance || 0);
  }, 0);
  if (total <= 0) {
    return data[Math.floor(Math.random() * data.length)];
  }
  var rand = Math.random() * total;
  var cumulative = 0;
  for (var i = 0; i < data.length; i++) {
    cumulative += data[i].chance || 0;
    if (rand <= cumulative) {
      return data[i];
    }
  }
  return data[data.length - 1];
}

function applyRandomHeroBackground(data) {
  var pick = weightedPick(data);
  var bgEl = document.getElementById("heroBg");
  if (!bgEl) return;
  bgEl.classList.remove("loaded");
  bgEl.onload = function () {
    bgEl.classList.add("loaded");
  };
  bgEl.onerror = function () {
    bgEl.classList.remove("loaded");
    bgEl.removeAttribute("src");
  };
  bgEl.src = pick.img;
}

function buildCarousel(data) {
  var track = document.getElementById("sliderTrack");
  if (!track || !data.length) return;
  var minItems = 6;
  var repeatCount = Math.max(2, Math.ceil(minItems / data.length));
  var baseSet = [];
  for (var r = 0; r < repeatCount; r++) {
    baseSet = baseSet.concat(data);
  }
  var fullSet = baseSet.concat(baseSet);
  track.innerHTML = fullSet
    .map(function (entry) {
      return (
        '<div class="slide-item">' +
        '<img alt="' + entry.text + '">' +
        '<div class="slide-text">' + entry.text + "</div>" +
        "</div>"
      );
    })
    .join("");
  var imgs = track.querySelectorAll("img");
  imgs.forEach(function (imgEl, i) {
    var entry = fullSet[i];
    imgEl.onload = function () {
      imgEl.classList.add("loaded");
    };
    imgEl.onerror = function () {
      imgEl.classList.remove("loaded");
      imgEl.removeAttribute("src");
    };
    imgEl.src = entry.img;
  });
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

function getMockConcurrentUsers() {
  return Math.floor(Math.random() * 80) + 20;
}

function getConcurrentUsers(callback) {
  callback(getMockConcurrentUsers());
}

function refreshOnlineCount() {
  var el = document.getElementById("onlineCount");
  if (!el) return;
  getConcurrentUsers(function (count) {
    el.textContent = count + " Online";
  });
}

function setupOnlineCount() {
  var el = document.getElementById("onlineCount");
  if (!el) return;
  refreshOnlineCount();
  setInterval(refreshOnlineCount, 8000);
}

document.addEventListener("DOMContentLoaded", function () {
  fetchImageChances(function (data) {
    applyRandomHeroBackground(data);
    buildCarousel(data);
  });
  setupNavScroll();
  setupMobileMenu();
  setupScrollReveal();
  setupOnlineCount();
});
