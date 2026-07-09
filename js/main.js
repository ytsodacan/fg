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

function weightedPick(data, exclude) {
  var pool = data;
  if (exclude) {
    var filtered = data.filter(function (entry) {
      return entry !== exclude;
    });
    if (filtered.length) pool = filtered;
  }
  var total = pool.reduce(function (sum, entry) {
    return sum + (entry.chance || 0);
  }, 0);
  if (total <= 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  var rand = Math.random() * total;
  var cumulative = 0;
  for (var i = 0; i < pool.length; i++) {
    cumulative += pool[i].chance || 0;
    if (rand <= cumulative) {
      return pool[i];
    }
  }
  return pool[pool.length - 1];
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
  var loopLength = Math.max(18, data.length * 3);
  var sequence = [];
  var prev = null;
  for (var i = 0; i < loopLength; i++) {
    var pick = weightedPick(data, prev);
    if (prev && prev.glitch && pick.glitch) {
      pick = weightedPick(data, pick);
    }
    sequence.push(pick);
    prev = pick;
  }
  var fullSet = sequence.concat(sequence);
  track.innerHTML = fullSet
    .map(function (entry) {
      var textClass = entry.glitch ? "slide-text glitch" : "slide-text";
      var dataAttr = entry.glitch ? ' data-text="' + entry.text + '"' : "";
      return (
        '<div class="slide-item">' +
        '<img alt="' + entry.text + '">' +
        '<div class="' + textClass + '"' + dataAttr + '>' + entry.text + "</div>" +
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

  var THRESHOLD = 40;
  var MAX_PROXY = THRESHOLD * 3;
  var proxyOffset = 0;

  function apply(offset) {
    if (offset > THRESHOLD) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  function realScrollY() {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function checkRealScroll() {
    apply(Math.max(realScrollY(), proxyOffset));
  }

  // Primary path: normal scroll position, for every visitor where this
  // just works normally.
  window.addEventListener("scroll", checkRealScroll, { passive: true });
  setInterval(checkRealScroll, 250);

  // Fallback path: some environments report zero scroll movement through
  // every scroll-position API (scrollY, getBoundingClientRect,
  // IntersectionObserver) even though the page visibly scrolls just fine.
  // Wheel/touch input is the raw cause of that visual movement, so it
  // fires regardless -- track it directly as a proxy instead of relying on
  // scroll position at all.
  window.addEventListener(
    "wheel",
    function (e) {
      proxyOffset += e.deltaY;
      if (proxyOffset < 0) proxyOffset = 0;
      if (proxyOffset > MAX_PROXY) proxyOffset = MAX_PROXY;
      apply(Math.max(realScrollY(), proxyOffset));
    },
    { passive: true }
  );

  var touchStartY = null;
  window.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches && e.touches.length) touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      if (touchStartY === null || !e.touches || !e.touches.length) return;
      var currentY = e.touches[0].clientY;
      var delta = touchStartY - currentY; // finger moving up = scrolling down
      proxyOffset += delta;
      if (proxyOffset < 0) proxyOffset = 0;
      if (proxyOffset > MAX_PROXY) proxyOffset = MAX_PROXY;
      touchStartY = currentY;
      apply(Math.max(realScrollY(), proxyOffset));
    },
    { passive: true }
  );
  window.addEventListener("touchend", function () {
    touchStartY = null;
  });

  checkRealScroll();
}

function setupResizeTransitionGuard() {
  var resizeTimer;
  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      document.body.classList.remove("resize-animation-stopper");
    }, 300);
  });
}

function setupMobileMenu() {
  var toggles = document.querySelectorAll(".menu-toggle");
  var links = document.querySelector(".nav-links");
  var overlay = document.querySelector(".nav-overlay");
  if (!toggles.length || !links || !overlay) return;

  function toggleMenu() {
    links.classList.add("menu-transition");
    var isOpen = links.classList.toggle("open");
    overlay.classList.toggle("open", isOpen);
    toggles.forEach(function (btn) {
      btn.classList.toggle("is-open", isOpen);
    });
  }

  function closeMenu() {
    links.classList.add("menu-transition");
    links.classList.remove("open");
    overlay.classList.remove("open");
    toggles.forEach(function (btn) {
      btn.classList.remove("is-open");
    });
  }

  toggles.forEach(function (btn) {
    btn.addEventListener("click", toggleMenu);
  });
  overlay.addEventListener("click", closeMenu);

  // The drawer only gets its transition right before a real user-initiated
  // toggle (above). Any resize (dragging the window, rotating, devtools
  // device toggle) strips it again so crossing the breakpoint never animates.
  window.addEventListener("resize", function () {
    links.classList.remove("menu-transition");
    closeMenu();
  });
}

function setupScrollReveal() {
  var revealEls = document.querySelectorAll(".reveal, .reveal-item");
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
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

function setupPageTransitions() {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("page-loaded");
    });
  });

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest("a");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    if (link.hostname && link.hostname !== window.location.hostname) return;

    e.preventDefault();
    document.body.classList.remove("page-loaded");
    document.body.classList.add("page-leaving");
    setTimeout(function () {
      window.location.href = href;
    }, 320);
  });

  window.addEventListener("pageshow", function (event) {
    document.body.classList.remove("page-leaving");
    document.body.classList.add("page-loaded");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  fetchImageChances(function (data) {
    applyRandomHeroBackground(data);
    buildCarousel(data);
  });
  setupNavScroll();
  setupMobileMenu();
  setupResizeTransitionGuard();
  setupScrollReveal();
  setupOnlineCount();
  setupPageTransitions();
});
