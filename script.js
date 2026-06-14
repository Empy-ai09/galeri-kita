/* =============================================
   SCRIPT.JS — Birthday Gallery for Nadyaa
   =============================================
   Struktur:
   1. Array foto (ganti sesuai kebutuhan)
   2. Sistem partikel melayang
   3. Logika tombol intro → transisi → galeri
   4. Rendering memory wall (scrapbook layout)
   5. Lazy loading gambar
   6. Reveal footer ulang tahun
   7. Touch / hover photo cards
   ============================================= */

/* ──────────────────────────────────────────────
   1. ARRAY FOTO
   Ganti src dengan path foto asli kamu.
   caption bersifat opsional.
   ─────────────────────────────────────────── */
const photos = [
  { src: "https://picsum.photos/seed/nad01/400/500", caption: "momen pertama ✨" },
  { src: "https://picsum.photos/seed/nad02/360/480", caption: "senyummu indah 💕" },
  { src: "https://picsum.photos/seed/nad03/420/320", caption: "kenangan bersama" },
  { src: "https://picsum.photos/seed/nad04/300/400", caption: "tertawa lepas 🌸" },
  { src: "https://picsum.photos/seed/nad05/380/500", caption: "momen kita" },
  { src: "https://picsum.photos/seed/nad06/460/340", caption: "selalu bahagia ☀️" },
  { src: "https://picsum.photos/seed/nad07/320/420", caption: "cerita kita" },
  { src: "https://picsum.photos/seed/nad08/400/300", caption: "hari yang indah" },
  { src: "https://picsum.photos/seed/nad09/360/460", caption: "kamu cantik 🌺" },
  { src: "https://picsum.photos/seed/nad10/440/360", caption: "selalu bersama 💖" },
  { src: "https://picsum.photos/seed/nad11/300/380", caption: "momen manis" },
  { src: "https://picsum.photos/seed/nad12/400/440", caption: "terima kasih 🌷" },
];

/* ──────────────────────────────────────────────
   2. SISTEM PARTIKEL
   Membuat hati & bintang mengambang lembut
   ─────────────────────────────────────────── */
const PARTICLE_SYMBOLS = ["❤️", "🌸", "✦", "💕", "✿", "♡", "·"];

function createParticles(containerId, count = 18) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "particle";
    el.textContent = PARTICLE_SYMBOLS[Math.floor(Math.random() * PARTICLE_SYMBOLS.length)];

    // Posisi horizontal acak
    const left = Math.random() * 95; // %
    const bottom = Math.random() * 30; // mulai dari bawah

    // Variabel CSS untuk animasi individual
    const duration   = 7 + Math.random() * 9;      // 7–16 detik
    const delay      = -(Math.random() * duration); // langsung aktif
    const drift      = (Math.random() - 0.5) * 60; // -30 s.d. 30px
    const spin       = (Math.random() - 0.5) * 60; // deg
    const maxOpacity = 0.2 + Math.random() * 0.3;  // 0.2–0.5
    const fontSize   = 0.55 + Math.random() * 0.6; // rem

    el.style.cssText = `
      left: ${left}%;
      bottom: ${bottom}%;
      font-size: ${fontSize}rem;
      --duration:    ${duration}s;
      --delay:       ${delay}s;
      --drift:       ${drift}px;
      --spin:        ${spin}deg;
      --max-opacity: ${maxOpacity};
    `;

    container.appendChild(el);
  }
}

/* ──────────────────────────────────────────────
   3. LOGIKA INTRO → TRANSISI → GALERI
   ─────────────────────────────────────────── */
function handleEnter() {
  const btn         = document.getElementById("btn-enter");
  const introScreen = document.getElementById("intro-screen");
  const fadeOverlay = document.getElementById("fade-overlay");
  const gallerySc   = document.getElementById("gallery-screen");

  // Cegah double-click
  btn.disabled = true;
  btn.style.pointerEvents = "none";

  // Hapus animasi ripple (agar tidak aneh saat fade)
  btn.querySelector(".btn-ripple").style.animation = "none";

  // Fase 1: Fade to dark (0.8 detik)
  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.opacity = "1";

  setTimeout(() => {
    // Fase 2: Sembunyikan intro, tampilkan galeri
    introScreen.style.display = "none";
    gallerySc.classList.remove("hidden");

    // Bangun galeri
    initGallery();

    // Fase 3: Fade kembali terang (0.8 detik)
    requestAnimationFrame(() => {
      setTimeout(() => {
        fadeOverlay.style.opacity = "0";
        setTimeout(() => {
          fadeOverlay.style.pointerEvents = "none";
        }, 800);
      }, 50); // sedikit jeda agar browser repaint
    });
  }, 800);
}

/* ──────────────────────────────────────────────
   4. RENDERING MEMORY WALL (Scrapbook Layout)
   ─────────────────────────────────────────── */
function initGallery() {
  // Buat partikel galeri
  createParticles("particles-gallery", 22);

  const wall = document.getElementById("memory-wall");
  const vw   = window.innerWidth;

  // Konfigurasi ukuran kartu berdasarkan layar
  const isMobile = vw < 480;

  // Tiap foto akan ditempatkan secara organik
  // Gunakan kolom "zone" agar tidak terlalu rapi
  const cards = layoutCards(photos, vw, isMobile);

  // Total tinggi wall
  let maxBottom = 0;
  cards.forEach(c => {
    maxBottom = Math.max(maxBottom, c.top + c.height + 40);
  });
  wall.style.height = maxBottom + "px";

  // Render kartu dengan delay bertahap
  cards.forEach((card, index) => {
    const el = buildPhotoCard(card, index);
    wall.appendChild(el);

    // Animasi muncul satu per satu
    setTimeout(() => {
      el.classList.add("appeared");
      el.style.transform = `var(--card-rotate)`;

      // Setelah animasi selesai, set ke "settled" agar hover bekerja
      setTimeout(() => {
        el.classList.remove("appeared");
        el.classList.add("settled");
      }, 700);
    }, 200 + index * 180);
  });

  // Reveal footer setelah semua foto muncul
  const totalDelay = 200 + photos.length * 180 + 900;
  setTimeout(revealFooter, totalDelay);
}

/* ── Layout organik (scrapbook) ── */
function layoutCards(photoList, vw, isMobile) {
  const margin  = isMobile ? 10 : 16; // margin tepi layar
  const usable  = vw - margin * 2;

  // Pool rotasi: sedikit miring agar natural
  const rotations = [-6, -4, -2.5, -1.5, 0, 1.5, 2.5, 4, 6, -3, 3];

  const cards = [];
  let cursorY = 0; // posisi Y saat ini

  photoList.forEach((photo, i) => {
    // Variasi ukuran: besar / sedang / kecil
    const sizeGroup = i % 4;
    let cardW, cardH;

    if (sizeGroup === 0) {
      // Besar
      cardW = isMobile ? usable * 0.72 : Math.min(usable * 0.55, 280);
      cardH = cardW * 1.28;
    } else if (sizeGroup === 1) {
      // Landscape
      cardW = isMobile ? usable * 0.64 : Math.min(usable * 0.5, 260);
      cardH = cardW * 0.78;
    } else if (sizeGroup === 2) {
      // Sedang portrait
      cardW = isMobile ? usable * 0.54 : Math.min(usable * 0.42, 210);
      cardH = cardW * 1.18;
    } else {
      // Kecil
      cardW = isMobile ? usable * 0.46 : Math.min(usable * 0.38, 190);
      cardH = cardW * 1.05;
    }

    // Posisi X: bergantian kiri / tengah / kanan dengan sedikit acak
    const zones   = ["left", "center", "right", "left", "right", "center"];
    const zone    = zones[i % zones.length];
    let cardX;

    const randOffset = (Math.random() - 0.5) * (usable * 0.08);

    if (zone === "left") {
      cardX = margin + randOffset;
    } else if (zone === "right") {
      cardX = margin + usable - cardW + randOffset;
    } else {
      cardX = margin + (usable - cardW) / 2 + randOffset;
    }

    // Clamp agar tidak keluar layar
    cardX = Math.max(margin, Math.min(cardX, margin + usable - cardW));

    // Posisi Y: tumpang tindih sedikit dengan foto sebelumnya
    const overlapFactor = i === 0 ? 0 : -(Math.random() * 20 + 5);
    const cardY = cursorY + overlapFactor + (Math.random() * 12);

    // Rotasi
    const rot = rotations[i % rotations.length];

    cards.push({
      ...photo,
      left:   Math.round(cardX),
      top:    Math.round(cardY),
      width:  Math.round(cardW),
      height: Math.round(cardH),
      rotate: rot,
    });

    // Geser cursor ke bawah (dengan sedikit acak)
    cursorY = cardY + cardH * 0.82 + (Math.random() * 20 + 8);
  });

  return cards;
}

/* ── Membangun elemen kartu foto ── */
function buildPhotoCard(card, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "photo-card";

  // Posisi & ukuran
  wrapper.style.cssText = `
    left:   ${card.left}px;
    top:    ${card.top}px;
    width:  ${card.width}px;
    height: ${card.height + (card.caption ? 34 : 0)}px;
    z-index: ${10 + index};
    --card-rotate: rotate(${card.rotate}deg);
  `;

  // Gambar (lazy loading via IntersectionObserver)
  const img = document.createElement("img");
  img.alt = card.caption || `foto ${index + 1}`;
  img.width  = card.width;
  img.height = card.height;
  img.className = "loading";

  // Simpan src di data-src, muat hanya ketika masuk viewport
  img.dataset.src = card.src;

  // Caption
  if (card.caption) {
    const cap = document.createElement("div");
    cap.className = "photo-caption";
    cap.textContent = card.caption;
    wrapper.appendChild(img);
    wrapper.appendChild(cap);
  } else {
    wrapper.style.height = card.height + "px"; // tanpa caption
    wrapper.appendChild(img);
  }

  // Touch event untuk mobile
  wrapper.addEventListener("touchstart", () => {
    wrapper.classList.add("tapped");
  }, { passive: true });
  wrapper.addEventListener("touchend", () => {
    setTimeout(() => wrapper.classList.remove("tapped"), 350);
  }, { passive: true });

  return wrapper;
}

/* ──────────────────────────────────────────────
   5. LAZY LOADING GAMBAR
   ─────────────────────────────────────────── */
function initLazyLoad() {
  const images = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.remove("loading");
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "200px 0px" }); // pre-load 200px sebelum masuk layar

    images.forEach(img => observer.observe(img));
  } else {
    // Fallback: muat semua
    images.forEach(img => {
      img.src = img.dataset.src;
      img.onload = () => img.classList.remove("loading");
    });
  }
}

// Lazy load juga berjalan saat foto baru ditambahkan
const originalInitGallery = initGallery;
// Panggil initLazyLoad setelah semua kartu dirender
const _initGallery = initGallery;
window.initGallery = function () {
  _initGallery();
  // Tunggu sebentar agar DOM ter-render, baru pasang observer
  setTimeout(initLazyLoad, 100);
};
// Override global
window.handleEnter = handleEnter;

/* ──────────────────────────────────────────────
   6. REVEAL FOOTER ULANG TAHUN
   ─────────────────────────────────────────── */
function revealFooter() {
  const footer = document.getElementById("birthday-footer");
  footer.classList.remove("hidden");

  // Gunakan IntersectionObserver agar reveal saat elemen terlihat
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add("visible");
          obs.unobserve(footer);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(footer);
  } else {
    // Fallback langsung tampil
    footer.classList.add("visible");
  }
}

/* ──────────────────────────────────────────────
   7. INISIALISASI HALAMAN
   ─────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Partikel di intro
  createParticles("particles-intro", 16);

  // Smooth scroll global (iOS fix)
  document.documentElement.style.scrollBehavior = "smooth";
});
