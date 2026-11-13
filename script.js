
"use strict";

/* ==========================================
   MAMU'S BIRTHDAY WEBSITE
   For: Sangita Ghimire
   Birthday: 2041-08-01 B.S. (Mangsir 1)
   ========================================== */

/* ---------- HELPERS ---------- */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const RM = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const R = (min, max) =>
  min + Math.random() * (max - min);

const wait = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const timers = new Set();

function later(callback, delay) {
  const id = setTimeout(() => {
    timers.delete(id);
    callback();
  }, delay);

  timers.add(id);
  return id;
}

/* ---------- CANVAS ---------- */

const cv = $("#fx");
const cx = cv?.getContext("2d") || null;

let W = window.innerWidth;
let H = window.innerHeight;
let D = Math.min(window.devicePixelRatio || 1, 2);

function size() {
  W = window.innerWidth;
  H = window.innerHeight;
  D = Math.min(window.devicePixelRatio || 1, 2);

  if (!cv || !cx) return;

  cv.width = Math.round(W * D);
  cv.height = Math.round(H * D);

  cx.setTransform(D, 0, 0, D, 0, 0);
}

window.addEventListener("resize", size);
size();

/* ---------- AMBIENT PARTICLES ---------- */

const stars = Array.from(
  { length: RM ? 40 : 110 },
  () => ({
    x: R(0, 1),
    y: R(0, 1),
    r: R(0.4, 1.6),
    p: R(0, Math.PI * 2),
    s: R(0.4, 1.4)
  })
);

const dust = Array.from(
  { length: RM ? 10 : 36 },
  () => ({
    x: R(0, 1),
    y: R(0, 1),
    r: R(1, 2.6),
    v: R(0.05, 0.2)
  })
);

let petals = [];
let sparks = [];
let petalRate = 0.04;
let t = 0;
let lastFrame = 0;

function petal(burstMode = false) {
  if (petals.length >= 150) return;

  petals.push({
    x: R(0, W),
    y: burstMode ? R(-H * 0.3, -10) : -20,
    r: R(5, 11),
    vy: R(0.7, 1.8),
    vx: R(-0.4, 0.4),
    a: R(0, Math.PI * 2),
    va: R(-0.03, 0.03),
    c: Math.random() < 0.5
      ? "#b3122b"
      : "#f4b6c2"
  });
}

/* ---------- FIREWORKS ---------- */

function burst(x, y) {
  if (!cx) return;

  const hue = R(38, 52);
  const amount = RM ? 24 : 70;

  for (let i = 0; i < amount; i++) {
    const angle = (i / amount) * Math.PI * 2;
    const velocity = R(1.5, 5.2);

    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      l: 1,
      c: `hsl(${hue}, ${R(70, 95)}%, ${R(65, 85)}%)`
    });
  }

  if (sparks.length > 1200) {
    sparks = sparks.slice(-1200);
  }
}

/* ---------- ANIMATION LOOP ---------- */

function loop(timestamp = 0) {
  if (!cx) return;

  const elapsed = lastFrame
    ? Math.min((timestamp - lastFrame) / 16.667, 3)
    : 1;

  lastFrame = timestamp;
  t += elapsed * 0.016;

  cx.clearRect(0, 0, W, H);

  // Stars
  for (const s of stars) {
    cx.globalAlpha =
      0.35 + 0.65 * Math.abs(Math.sin(t * s.s + s.p));

    cx.fillStyle = "#f7e3a1";
    cx.beginPath();
    cx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    cx.fill();
  }

  // Golden dust
  cx.fillStyle = "#e8cf8f";

  for (const d of dust) {
    if (!RM) {
      d.y -= (d.v / H) * 60 * elapsed;

      if (d.y < 0) d.y = 1;
    }

    cx.globalAlpha = 0.5;
    cx.beginPath();

    cx.arc(
      d.x * W + Math.sin(t + d.y * 9) * 8,
      d.y * H,
      d.r,
      0,
      Math.PI * 2
    );

    cx.fill();
  }

  // Falling petals
  if (
    !RM &&
    Math.random() < petalRate * elapsed &&
    petals.length < 90
  ) {
    petal();
  }

  for (const p of petals) {
    p.y += p.vy * elapsed;
    p.x += (p.vx + Math.sin(p.y / 40) * 0.5) * elapsed;
    p.a += p.va * elapsed;

    cx.save();
    cx.translate(p.x, p.y);
    cx.rotate(p.a);

    cx.globalAlpha = 0.85;
    cx.fillStyle = p.c;

    cx.beginPath();
    cx.ellipse(
      0, 0,
      p.r,
      p.r * 0.55,
      0,
      0,
      Math.PI * 2
    );

    cx.fill();
    cx.restore();
  }

  petals = petals.filter(p => p.y < H + 30);

  // Firework sparks
  for (const s of sparks) {
    s.x += s.vx * elapsed;
    s.y += s.vy * elapsed;
    s.vy += 0.04 * elapsed;
    s.vx *= Math.pow(0.985, elapsed);
    s.l -= 0.012 * elapsed;

    cx.globalAlpha = Math.max(s.l, 0);
    cx.fillStyle = s.c;

    cx.beginPath();
    cx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    cx.fill();
  }

  sparks = sparks.filter(s => s.l > 0);

  cx.globalAlpha = 1;
  requestAnimationFrame(loop);
}

if (cx) requestAnimationFrame(loop);

/* ---------- CELEBRATION ---------- */

let celebrationTimeout = null;

function celebrate() {
  const amount = RM ? 2 : 9;

  for (let i = 0; i < amount; i++) {
    later(() => {
      burst(
        R(W * 0.15, W * 0.85),
        R(H * 0.12, H * 0.5)
      );
    }, i * 420);
  }

  if (!RM) {
    for (let i = 0; i < 45; i++) {
      petal(true);
    }
  }

  petalRate = RM ? 0 : 0.18;

  clearTimeout(celebrationTimeout);

  celebrationTimeout = setTimeout(() => {
    petalRate = RM ? 0 : 0.04;
  }, 6000);
}

/* ---------- SCENE REVEALS ---------- */

const scenes = $$(".scene");

scenes.forEach(scene => {
  $$(".l", scene).forEach((line, index) => {
    line.style.transitionDelay =
      `${index * (scene.id === "s1" ? 1.9 : 1.1)}s`;
  });
});

const triggeredScenes = new Set();

function revealScene(scene) {
  if (!scene) return;

  scene.classList.add("on");

  if (triggeredScenes.has(scene.id)) return;

  triggeredScenes.add(scene.id);

  if (scene.id === "s5") {
    celebrate();
  }

  if (scene.id === "s9") {
    burst(W / 2, H * 0.4);

    later(() => {
      burst(W * 0.3, H * 0.3);
    }, 700);

    later(() => {
      burst(W * 0.7, H * 0.3);
    }, 1100);
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        revealScene(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  scenes.forEach(scene => observer.observe(scene));
} else {
  scenes.forEach(revealScene);
}

/* ---------- BACKGROUND MUSIC ---------- */

let ac = null;
let gain = null;
let musicOn = false;

async function startMusic() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    if ($("#mute")) $("#mute").hidden = true;
    return;
  }

  try {
    if (ac) {
      await ac.resume();

      musicOn = true;

      gain.gain.cancelScheduledValues(ac.currentTime);
      gain.gain.setTargetAtTime(
        0.09,
        ac.currentTime,
        0.4
      );

      $("#mute")?.classList.remove("off");
      return;
    }

    ac = new AudioContextClass();

    gain = ac.createGain();
    gain.gain.value = 0;
    gain.connect(ac.destination);

    const frequencies = [
      196,
      261.6,
      329.6,
      392,
      523.3
    ];

    frequencies.forEach((frequency, index) => {
      const oscillator = ac.createOscillator();
      const volume = ac.createGain();
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      volume.gain.value = 0.22;

      lfo.frequency.value = 0.07 + index * 0.03;
      lfoGain.gain.value = 0.18;

      lfo.connect(lfoGain);
      lfoGain.connect(volume.gain);

      oscillator.connect(volume);
      volume.connect(gain);

      oscillator.start();
      lfo.start();
    });

    await ac.resume();

    gain.gain.setTargetAtTime(
      0.09,
      ac.currentTime,
      1
    );

    musicOn = true;

    $("#mute")?.classList.remove("off");

  } catch (error) {
    console.error("Audio initialization failed:", error);

    if ($("#mute")) {
      $("#mute").hidden = true;
    }
  }
}

$("#mute")?.addEventListener("click", async () => {
  if (!ac) {
    await startMusic();
    return;
  }

  try {
    await ac.resume();

    musicOn = !musicOn;

    gain.gain.cancelScheduledValues(ac.currentTime);

    gain.gain.setTargetAtTime(
      musicOn ? 0.09 : 0,
      ac.currentTime,
      0.2
    );

    $("#mute").classList.toggle("off", !musicOn);
  } catch (error) {
    console.error("Music toggle failed:", error);
  }
});

/* ---------- LOADER ---------- */

const loader = $("#loader");
const ring = $(".ring");
const enter = $("#enter");

if (loader) {
  if (enter) enter.hidden = true;

  later(() => {
    if (ring) ring.hidden = true;
    if (enter) enter.hidden = false;
  }, 1800);
}

enter?.addEventListener("click", () => {
  loader?.classList.add("gone");

  startMusic();
  revealScene($("#s1"));

  // Remove loader from interaction after fade
  later(() => {
    if (loader) {
      loader.style.pointerEvents = "none";
      loader.setAttribute("aria-hidden", "true");
    }
  }, 1000);
});

/* ---------- MAKE A WISH ---------- */

const wish = $("#wish");
const fill = $("#wishfill");
const cake = $(".cake");
const wishMessage = $("#wishmsg");

let hold = 0;
let holdRAF = null;
let holdStart = null;
let done = false;
let wishTimeout = null;

const HOLD_DURATION = 1500;

cake?.classList.add("lit");

function updateWishProgress(progress) {
  if (fill) {
    fill.style.height = `${progress * 100}%`;
  }

  if (cake && !done) {
    cake.style.filter =
      `drop-shadow(0 0 ${30 + progress * 40}px rgba(255,190,70,.5))`;
  }
}

function finishWish() {
  if (done) return;

  done = true;
  hold = 1;
  holdRAF = null;

  if (fill) fill.style.height = "100%";

  if (cake) {
    cake.classList.add("out");
    cake.style.filter = "none";
  }

  if (wishMessage) {
    wishMessage.textContent =
      "तपाईंको इच्छा पूरा होस्, मामु ❤️";
  }

  wishTimeout = setTimeout(() => {
    celebrate();

    $("#s5")?.scrollIntoView({
      behavior: RM ? "auto" : "smooth"
    });
  }, 1400);
}

function grow(timestamp) {
  if (done) return;

  if (holdStart === null) {
    holdStart = timestamp - hold * HOLD_DURATION;
  }

  hold = Math.min(
    (timestamp - holdStart) / HOLD_DURATION,
    1
  );

  updateWishProgress(hold);

  if (hold >= 1) {
    finishWish();
    return;
  }

  holdRAF = requestAnimationFrame(grow);
}

function startHold(event) {
  if (done || holdRAF !== null) return;

  event?.preventDefault();

  holdStart = null;
  holdRAF = requestAnimationFrame(grow);
}

function stopHold() {
  if (holdRAF !== null) {
    cancelAnimationFrame(holdRAF);
    holdRAF = null;
  }

  holdStart = null;

  if (!done) {
    hold = 0;
    updateWishProgress(0);
  }
}

if (wish) {
  wish.style.touchAction = "none";

  wish.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    startHold(event);
  });

  [
    "pointerup",
    "pointerleave",
    "pointercancel"
  ].forEach(eventName => {
    wish.addEventListener(eventName, stopHold);
  });

  wish.addEventListener("keydown", event => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      !event.repeat
    ) {
      startHold(event);
    }
  });

  wish.addEventListener("keyup", event => {
    if (event.key === "Enter" || event.key === " ") {
      stopHold();
    }
  });

  wish.addEventListener("blur", stopHold);
}

/* ---------- REPLAY ---------- */

$("#replay")?.addEventListener("click", () => {
  if (wishTimeout !== null) {
    clearTimeout(wishTimeout);
    wishTimeout = null;
  }

  stopHold();

  done = false;
  hold = 0;
  holdStart = null;

  if (fill) fill.style.height = "0%";

  if (cake) {
    cake.classList.remove("out");
    cake.classList.add("lit");
    cake.style.filter = "";
  }

  if (wishMessage) {
    wishMessage.textContent =
      "मनमनै इच्छा माग्दै स्क्रिन थिचिरहनुहोस्";
  }

  $("#s3")?.scrollIntoView({
    behavior: RM ? "auto" : "smooth"
  });

  later(celebrate, 900);
});

/* ---------- LETTER ---------- */

const letter = $("#letter");

function openLetter() {
  letter?.classList.add("open");
}

if (letter) {
  letter.addEventListener("click", openLetter);

  letter.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLetter();
    }
  });
}

/* ---------- PHOTO GALLERY ---------- */

const gallery = $("#gallery");
const pick = $("#pick");

let target = null;
const photoURLs = new Map();

if (gallery && pick) {
  // Prevent duplicate frames if this script runs again
  if (!gallery.dataset.initialized) {
    gallery.dataset.initialized = "true";

    const rotations = [-2, 1.5, -1, 2, -1.5, 1];

    for (let i = 0; i < 6; i++) {
      const frame = document.createElement("div");

      frame.className = "fr";
      frame.tabIndex = 0;
      frame.textContent = "🌹";

      frame.setAttribute("role", "button");
      frame.setAttribute(
        "aria-label",
        `फोटो ${i + 1} राख्नुहोस्`
      );

      frame.style.transform =
        `rotate(${rotations[i]}deg)`;

      frame.addEventListener("click", event => {
        if (event.target.tagName === "INPUT") {
          return;
        }

        target = frame;
        pick.click();
      });

      frame.addEventListener("keydown", event => {
        if (
          event.target !== frame ||
          (event.key !== "Enter" && event.key !== " ")
        ) {
          return;
        }

        event.preventDefault();
        target = frame;
        pick.click();
      });

      gallery.appendChild(frame);
    }
  }

  pick.addEventListener("change", () => {
    const file = pick.files?.[0];

    if (!file || !target) return;

    if (!file.type.startsWith("image/")) {
      alert("कृपया फोटो मात्र छान्नुहोस्।");
      pick.value = "";
      return;
    }

    const oldURL = photoURLs.get(target);

    if (oldURL) {
      URL.revokeObjectURL(oldURL);
    }

    const newURL = URL.createObjectURL(file);
    photoURLs.set(target, newURL);

    let img = target.querySelector("img");

    if (!img) {
      img = new Image();
      img.alt = "मामुको फोटो";

      target.textContent = "";
      target.appendChild(img);

      const caption = document.createElement("input");

      caption.type = "text";
      caption.placeholder = "शीर्षक (ऐच्छिक)";
      caption.maxLength = 40;

      caption.addEventListener("click", event => {
        event.stopPropagation();
      });

      target.appendChild(caption);
    }

    img.src = newURL;
    pick.value = "";
  });
}

window.addEventListener("pagehide", () => {
  for (const url of photoURLs.values()) {
    URL.revokeObjectURL(url);
  }

  photoURLs.clear();
});

/* ---------- NEPALI BIRTHDAY COUNTDOWN ---------- */

/*
  Sangita Ghimire
  Birthday: 2041-08-01 B.S.
  Month 08 = Mangsir

  The Gregorian dates below are provisional.
  Verify dates using a reliable Nepali calendar
  before publishing.

  Add more verified dates for future years.
*/

const BIRTHDAY_DATES = [
  "2026-11-17",
  "2027-11-17"
];

function toNepaliNumber(number) {
  const digits = "०१२३४५६७८९";

  return String(number).replace(
    /\d/g,
    digit => digits[Number(digit)]
  );
}

function getNextBirthday() {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const dates = BIRTHDAY_DATES
    .map(value => {
      const [year, month, day] =
        value.split("-").map(Number);

      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a - b);

  return dates.find(date => date >= today) || null;
}

function count() {
  const element = $("#count");

  if (!element) return;

  const birthday = getNextBirthday();

  if (!birthday) {
    element.textContent =
      "आगामी जन्मदिनको मिति अद्यावधिक गर्नुहोस् ❤️";
    return;
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Calendar-day difference, safe across DST changes
  const days = Math.round(
    (
      Date.UTC(
        birthday.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      ) -
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    ) / 86400000
  );

  if (days === 0) {
    element.textContent =
      "🎂 आज मंसिर १ — मेरी प्यारी मामुको जन्मदिन! ❤️";
  } else {
    element.textContent =
      `मामुको अर्को जन्मदिनसम्म ${toNepaliNumber(days)} दिन बाँकी ❤️`;
  }
}

count();

// Update countdown after midnight
setInterval(count, 60 * 1000);

/* ---------- FINAL INITIALIZATION ---------- */

console.log(
  "%c❤️ Happy Birthday, Mamu! ❤️",
  "color:#e8b85a;font-size:20px;font-weight:bold;"
);

console.log(
  "Birthday website initialized successfully."
);
