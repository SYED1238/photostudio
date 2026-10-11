/**
 * GreaterPhoto &times; FRAMEHAUS — Studio Masterpiece Gallery
 * Unified Interactive Engine:
 * - First Page: GreaterPhoto Stepper Hero Masterpiece with Active Gold Indicator
 * - Other Section: Studio Masterpiece Gallery (Pure Masonry Arrangement with Natural Aspect Ratios & Squircle Curves)
 * - Fine-Art Masterpiece Media Synchronization
 * - Instant Live Search & High-Definition Lightbox Modal
 */

(function () {
  "use strict";


  /* --------------------------------------------------------------------------
     1. HERO STEPPER DATA (First Page)
     -------------------------------------------------------------------------- */
  const HERO_SLIDES = [
    {
      stepBadge: "01",
      stepText: "Be a profesional landscape photography",
      artist: "— DANIEL KORDAN —",
      title: "Majestic Mountain Light",
      price: "149 €",
      level: "ADVANCED",
      length: "34H",
      lessons: "16",
      bgUrl: "/public/images/gallery/hero_landscape.jpg"
    },
    {
      stepBadge: "02",
      stepText: "Explore top secrets of Astro Photography",
      artist: "— ARILD HEITMANN —",
      title: "Deep Celestial Skies",
      price: "179 €",
      level: "EXPERT",
      length: "24H",
      lessons: "12",
      bgUrl: "/public/images/gallery/hero_astro.jpg"
    },
    {
      stepBadge: "03",
      stepText: "Improve your composition as profesional",
      artist: "— ELIA LOCARDI —",
      title: "Perfect Composition",
      price: "129 €",
      level: "BEGINNER",
      length: "28H",
      lessons: "10",
      bgUrl: "/public/images/gallery/hero_perfect_composition.jpg"
    },
    {
      stepBadge: "04",
      stepText: "Master lighting, color & visual depth",
      artist: "— PAWEL UCHORCZAK —",
      title: "Poetic Light & Mood",
      price: "119 €",
      level: "ALL LEVELS",
      length: "18H",
      lessons: "08",
      bgUrl: "/public/images/gallery/hero_composition.jpg"
    }
  ];

  let currentSlideIndex = 2; // Step 03 active by default

  /* --------------------------------------------------------------------------
     2. DOM ELEMENTS
     -------------------------------------------------------------------------- */
  // Hero Elements
  const navbar = document.getElementById("gpNavbar");
  const heroBgSlide = document.getElementById("heroBgSlide");
  const heroArtistText = document.getElementById("heroArtistText");
  const heroTitleText = document.getElementById("heroTitleText");
  const statPriceVal = document.getElementById("statPriceVal");
  const statLevelVal = document.getElementById("statLevelVal");
  const statLengthVal = document.getElementById("statLengthVal");
  const statLessonsVal = document.getElementById("statLessonsVal");
  const stepperIndicatorBar = document.getElementById("stepperIndicatorBar");
  const stepperItems = document.querySelectorAll(".stepper-item");
  const heroPlayBtn = document.getElementById("heroPlayBtn");

  // Gallery Elements
  const galleryGrid = document.getElementById("bentoGalleryGrid");
  const driveStatusText = document.getElementById("driveStatusText");
  const driveCountPill = document.getElementById("driveCountPill");
  const searchInput = document.getElementById("gallerySearchInput");
  const bottomPhotoCount = document.getElementById("bottomPhotoCount");
  const bottomBadgeCount = document.getElementById("bottomBadgeCount");
  const btnAudioToggle = document.getElementById("btnAudioToggleGallery");

  // Lightbox Elements
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxVideo = document.getElementById("lightboxVideo");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxMeta = document.getElementById("lightboxMeta");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxClose = document.getElementById("lightboxClose");

  // Media Filter Elements
  const countAll = document.getElementById("countAll");
  const countImages = document.getElementById("countImages");
  const countVideos = document.getElementById("countVideos");

  let currentPhotos = [];
  let filteredPhotos = [];
  let currentLightboxIndex = 0;
  let currentMediaTypeFilter = "image"; // 'image' | 'video'
  let currentSearchQuery = "";
  let audioPlaying = false;
  let bgAudio = null;

  /* --------------------------------------------------------------------------
     3. HERO STEPPER LOGIC
     -------------------------------------------------------------------------- */
  function setHeroSlide(index) {
    if (index < 0 || index >= HERO_SLIDES.length) return;
    currentSlideIndex = index;
    const slide = HERO_SLIDES[index];

    if (heroBgSlide) {
      heroBgSlide.style.opacity = "0.3";
      setTimeout(() => {
        heroBgSlide.style.backgroundImage = `url('${slide.bgUrl}')`;
        heroBgSlide.style.opacity = "1";
      }, 160);
    }

    if (heroArtistText) {
      heroArtistText.style.opacity = "0";
      setTimeout(() => {
        heroArtistText.textContent = slide.artist;
        heroArtistText.style.opacity = "1";
      }, 140);
    }

    if (heroTitleText) {
      heroTitleText.style.opacity = "0";
      setTimeout(() => {
        heroTitleText.textContent = slide.title;
        heroTitleText.style.opacity = "1";
      }, 140);
    }
  }

  function initHeroStepper() {
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener("click", () => {
        const cur = HERO_SLIDES[currentSlideIndex];
        openLightboxCustom({
          title: cur.title,
          meta: `${cur.artist.replace(/—/g, "").trim()} • 4K Masterpiece`,
          url: cur.bgUrl
        });
      });
    }

    window.addEventListener("scroll", () => {
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add("nav-scrolled");
        } else {
          navbar.classList.remove("nav-scrolled");
        }
      }
    }, { passive: true });
  }

  const SAMPLE_VIDEOS = [
    {
      id: "local_video_atelier_film",
      type: "video",
      name: "FRAMEHAUS Atelier Cinema Film",
      cleanTitle: "FRAMEHAUS Atelier Cinema Film",
      url: "../public/videos/bg-video.mp4",
      streamUrl: "../public/videos/bg-video.mp4",
      thumbUrl: "../public/images/studio-dslr-bg.jpg",
      backupUrl: "../public/images/studio-dslr-bg.jpg",
      fullUrl: "../public/videos/bg-video.mp4",
      aspectRatio: 1.77,
      badge: "4K Motion Reel",
      size: "3.8 MB",
      date: "October 2026",
      isLocalVideo: true
    }
  ];

  /* --------------------------------------------------------------------------
     4. ATELIER ARCHIVE SYNC & MASONRY ARRANGEMENT
     -------------------------------------------------------------------------- */
  async function fetchDrivePhotos(forceBypassCache = false) {
    const cacheKey = "atelier_archive_v26_static";
    const cacheTimeKey = "atelier_archive_time_v26_static";

    try {
      Object.keys(sessionStorage).forEach((k) => {
        if ((k.startsWith("gdrive_cache_") || k.startsWith("atelier_archive_")) && k !== cacheKey && k !== cacheTimeKey) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (_) {}

    if (!forceBypassCache) {
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(cacheTimeKey);
      if (cached && cacheTime && Date.now() - parseInt(cacheTime, 10) < 60000) {
        try {
          const parsed = JSON.parse(cached);
          handlePhotosLoaded(parsed);
          return;
        } catch (_) {}
      }
    }

    if (driveStatusText) driveStatusText.textContent = "Synchronizing Atelier Works...";

    try {
      let res;
      try {
        res = await fetch("/public/gallery-media.json");
      } catch (_) {}
      if (!res || !res.ok) {
        try {
          res = await fetch("../public/gallery-media.json");
        } catch (_) {}
      }
      if (!res || !res.ok) {
        try {
          res = await fetch("public/gallery-media.json");
        } catch (_) {}
      }
      if (!res || !res.ok) {
        throw new Error("Unable to load static gallery media archive");
      }

      const media = await res.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(media));
      sessionStorage.setItem(cacheTimeKey, String(Date.now()));

      handlePhotosLoaded(media);
    } catch (err) {
      console.warn("Archive sync fallback:", err.message);
      createFallbackPhotos();
    }
  }

  function getPhotoCategory(filename, idx) {
    const fn = (filename || "").toLowerCase();
    if (fn.includes("wedding") || fn.includes("couple")) return "Editorial Romance";
    if (fn.includes("garden") || fn.includes("lavender") || fn.includes("flower")) return "Botanical Light";
    if (fn.includes("bridge") || fn.includes("balcony")) return "Architectural";
    if (fn.includes("trail") || fn.includes("mountain") || fn.includes("coast")) return "Landscape Session";
    const tags = ["2K Master", "Natural Daylight", "Candid Portrait", "Atmospheric RAW"];
    return tags[idx % tags.length];
  }

  function handlePhotosLoaded(media) {
    currentPhotos = media || [];
    updateMediaCounts(currentPhotos);
    applyMediaFilters();
  }

  function createFallbackPhotos() {
    const local = [
      { id: "1", type: "image", name: "Alpine Morning Mist", cleanTitle: "Alpine Morning Mist", thumbUrl: "../public/images/gallery/hero_perfect_composition.jpg", backupUrl: "../public/images/gallery/hero_perfect_composition.jpg", fullUrl: "../public/images/gallery/hero_perfect_composition.jpg", badge: "Landscape Session", size: "2K RAW", aspectRatio: 1.33 },
      { id: "2", type: "image", name: "Twilight Budapest Bridge", cleanTitle: "Twilight Budapest Bridge", thumbUrl: "../public/images/gallery/card_architecture.jpg", backupUrl: "../public/images/gallery/card_architecture.jpg", fullUrl: "../public/images/gallery/card_architecture.jpg", badge: "Architectural", size: "2K RAW", aspectRatio: 0.75 },
      { id: "3", type: "image", name: "Deep Celestial Silhouette", cleanTitle: "Deep Celestial Silhouette", thumbUrl: "../public/images/gallery/card_astro.jpg", backupUrl: "../public/images/gallery/card_astro.jpg", fullUrl: "../public/images/gallery/card_astro.jpg", badge: "Atmospheric RAW", size: "2K RAW", aspectRatio: 0.75 },
      { id: "4", type: "image", name: "Provence Lavender Dream", cleanTitle: "Provence Lavender Dream", thumbUrl: "../public/images/gallery/card_people.jpg", backupUrl: "../public/images/gallery/card_people.jpg", fullUrl: "../public/images/gallery/card_people.jpg", badge: "Botanical Light", size: "2K RAW", aspectRatio: 0.75 },
      { id: "5", type: "image", name: "Rolling Hills of Val d'Orcia", cleanTitle: "Rolling Hills of Val d'Orcia", thumbUrl: "../public/images/gallery/card_landscape.jpg", backupUrl: "../public/images/gallery/card_landscape.jpg", fullUrl: "../public/images/gallery/card_landscape.jpg", badge: "Landscape Session", size: "2K RAW", aspectRatio: 1.33 },
      { id: "6", type: "image", name: "Cascade Celestial Arch", cleanTitle: "Cascade Celestial Arch", thumbUrl: "../public/images/gallery/hero_astro.jpg", backupUrl: "../public/images/gallery/hero_astro.jpg", fullUrl: "../public/images/gallery/hero_astro.jpg", badge: "Atmospheric RAW", size: "2K RAW", aspectRatio: 1.33 },
      ...SAMPLE_VIDEOS
    ];
    handlePhotosLoaded(local);
  }

  function updateMediaCounts(media) {
    const totalCount = media.length;
    const imgCount = media.filter(m => m.type !== "video").length;
    const vidCount = media.filter(m => m.type === "video").length;

    if (countAll) countAll.textContent = String(totalCount);
    if (countImages) countImages.textContent = String(imgCount);
    if (countVideos) countVideos.textContent = String(vidCount);

    if (bottomPhotoCount) bottomPhotoCount.textContent = `${totalCount} Media Works in Studio Archive`;
    if (bottomBadgeCount) bottomBadgeCount.textContent = `+${totalCount}`;
  }

  function applyMediaFilters() {
    let result = [...currentPhotos];

    // Filter by media type ('all', 'image', 'video')
    if (currentMediaTypeFilter === "image") {
      result = result.filter(m => m.type !== "video");
    } else if (currentMediaTypeFilter === "video") {
      result = result.filter(m => m.type === "video");
    }

    // Filter by search text
    if (currentSearchQuery) {
      result = result.filter(m => {
        return (
          m.cleanTitle.toLowerCase().includes(currentSearchQuery) ||
          m.name.toLowerCase().includes(currentSearchQuery) ||
          (m.badge && m.badge.toLowerCase().includes(currentSearchQuery))
        );
      });
    }

    filteredPhotos = result;
    renderMasonry(filteredPhotos);

    if (bottomPhotoCount) {
      const typeLabel = currentMediaTypeFilter === "video" ? "Motion Reels" : "Photographs";
      bottomPhotoCount.textContent = `${filteredPhotos.length} ${typeLabel} in Studio Archive`;
    }
  }

  function initMediaFilterTabs() {
    const tabBtns = document.querySelectorAll(".filter-tab-pill");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("filter-tab-active"));
        btn.classList.add("filter-tab-active");
        currentMediaTypeFilter = btn.dataset.filter || "image";
        applyMediaFilters();
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. MASONRY COLUMN DISTRIBUTION & CARDS
     -------------------------------------------------------------------------- */
  function getColumnCount() {
    const w = window.innerWidth;
    if (w < 768) return 2; // 2-column grid view on mobile interface
    if (w < 1180) return 3;
    return 4;
  }

  function distributeIntoColumns(items, numColumns) {
    const cols = Array.from({ length: numColumns }, () => ({
      items: [],
      heightSum: 0
    }));

    items.forEach((item, originalIndex) => {
      const relHeight = item.height && item.width
        ? item.height / item.width
        : 1 / (item.aspectRatio || 1.33);

      let shortest = 0;
      for (let i = 1; i < numColumns; i++) {
        if (cols[i].heightSum < cols[shortest].heightSum) {
          shortest = i;
        }
      }

      cols[shortest].items.push({ item, originalIndex });
      cols[shortest].heightSum += relHeight;
    });

    return cols.map(c => c.items);
  }

  let activeMasonryRenderId = 0;
  function renderMasonry(photosToRender) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";

    const renderId = ++activeMasonryRenderId;
    const numCols = getColumnCount();
    const columns = distributeIntoColumns(photosToRender, numCols);

    const colElements = [];
    columns.forEach((colItems, colIdx) => {
      const colDiv = document.createElement("div");
      colDiv.className = "gallery-masonry-col";
      colDiv.setAttribute("data-col", colIdx);
      galleryGrid.appendChild(colDiv);
      colElements.push(colDiv);
    });

    // Render initial viewport batch (16 cards) instantly, stream rest smoothly across idle/animation frames
    const initialBatch = 16;
    let cardCount = 0;

    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const itemsInCol = columns[colIdx];
      const slice = itemsInCol.slice(0, Math.ceil(initialBatch / numCols));
      slice.forEach(({ item, originalIndex }) => {
        const card = createFullImageCard(item, originalIndex);
        colElements[colIdx].appendChild(card);
        cardCount++;
      });
    }

    if (cardCount < photosToRender.length) {
      const remainingByCol = columns.map(col => col.slice(Math.ceil(initialBatch / numCols)));
      let colProgress = 0;

      function renderRemaining() {
        if (renderId !== activeMasonryRenderId) return; // Discard if new render was requested

        const batchPerFrame = 6;
        let addedThisFrame = 0;

        for (let i = 0; i < batchPerFrame && colProgress < photosToRender.length; i++) {
          for (let c = 0; c < numCols; c++) {
            if (remainingByCol[c].length > 0) {
              const { item, originalIndex } = remainingByCol[c].shift();
              const card = createFullImageCard(item, originalIndex);
              colElements[c].appendChild(card);
              addedThisFrame++;
              colProgress++;
              break;
            }
          }
        }

        const hasRemaining = remainingByCol.some(col => col.length > 0);
        if (hasRemaining && renderId === activeMasonryRenderId) {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(renderRemaining, { timeout: 80 });
          } else {
            requestAnimationFrame(renderRemaining);
          }
        }
      }

      if ("requestIdleCallback" in window) {
        requestIdleCallback(renderRemaining, { timeout: 80 });
      } else {
        requestAnimationFrame(renderRemaining);
      }
    }
  }

  function createFullImageCard(photo, globalIdx) {
    const card = document.createElement("article");
    card.className = "full-image-card";
    if (photo.type === "video") {
      card.classList.add("card-type-video");
    }
    card.setAttribute("data-index", globalIdx);
    card.tabIndex = 0;
    card.style.aspectRatio = photo.aspectRatio ? String(photo.aspectRatio) : "1.33";

    const playOverlay = photo.type === "video"
      ? `<div class="video-card-play" aria-label="Play Video"><svg width="18" height="18" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg></div>`
      : "";

    card.innerHTML = `
      <img src="${photo.thumbUrl}"
           alt=""
           loading="lazy"
           decoding="async"
           referrerpolicy="no-referrer"
           onerror="if(!this.dataset.triedBackup){this.dataset.triedBackup='1';this.src='${photo.backupUrl}';}" />
      ${playOverlay}
    `;

    const imgEl = card.querySelector("img");
    imgEl.addEventListener("load", function () {
      if (this.naturalWidth && this.naturalHeight && (!photo.width || !photo.height)) {
        photo.width = this.naturalWidth;
        photo.height = this.naturalHeight;
        photo.aspectRatio = +(this.naturalWidth / this.naturalHeight).toFixed(3);
        card.style.aspectRatio = String(photo.aspectRatio);
      }
    });

    card.addEventListener("click", () => {
      openLightbox(globalIdx);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(globalIdx);
      }
    });

    return card;
  }

  /* --------------------------------------------------------------------------
     6. SEARCH FILTER
     -------------------------------------------------------------------------- */
  function initSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      applyMediaFilters();
    });
  }

  /* --------------------------------------------------------------------------
     7. LIGHTBOX MODAL
     -------------------------------------------------------------------------- */
  function openLightbox(index) {
    if (!filteredPhotos[index]) return;
    currentLightboxIndex = index;
    const item = filteredPhotos[index];

    if (item.type === "video") {
      if (lightboxImg) {
        lightboxImg.style.display = "none";
        lightboxImg.src = "";
      }

      if (lightboxVideo) {
        lightboxVideo.style.display = "block";
        const targetSrc = item.streamUrl || item.url;
        lightboxVideo.onerror = function () {
          if (item.fallbackStreamUrl && this.src !== item.fallbackStreamUrl) {
            console.warn("Retrying video playback with fallback stream...");
            this.src = item.fallbackStreamUrl;
            this.load();
            this.play().catch(() => {});
          }
        };
        if (lightboxVideo.src !== targetSrc) {
          lightboxVideo.src = targetSrc;
        }

        // Apply native video aspect ratio to player sizing
        const ar = item.aspectRatio || 1.778;
        lightboxVideo.style.aspectRatio = String(ar);
        if (ar < 0.8) {
          // Vertical 9:16 portrait reel
          lightboxVideo.style.height = "76vh";
          lightboxVideo.style.width = "auto";
          lightboxVideo.style.maxWidth = "88vw";
        } else if (ar > 1.3) {
          // Landscape 16:9 cinema
          lightboxVideo.style.width = "min(82vw, 1080px)";
          lightboxVideo.style.height = "auto";
          lightboxVideo.style.maxHeight = "78vh";
        } else {
          // Square or 4:5
          lightboxVideo.style.height = "72vh";
          lightboxVideo.style.width = "auto";
          lightboxVideo.style.maxWidth = "88vw";
        }

        lightboxVideo.onloadedmetadata = function () {
          if (this.videoWidth && this.videoHeight) {
            const naturalRatio = +(this.videoWidth / this.videoHeight).toFixed(3);
            item.aspectRatio = naturalRatio;
            item.width = this.videoWidth;
            item.height = this.videoHeight;
            this.style.aspectRatio = String(naturalRatio);
            if (naturalRatio < 0.8) {
              this.style.height = "76vh";
              this.style.width = "auto";
            } else if (naturalRatio > 1.3) {
              this.style.width = "min(82vw, 1080px)";
              this.style.height = "auto";
            } else {
              this.style.height = "72vh";
              this.style.width = "auto";
            }
            if (lightboxMeta) {
              const rat = naturalRatio < 0.8 ? "9:16 Vertical Reel" : (naturalRatio > 2.0 ? "2.39:1 Anamorphic" : (naturalRatio > 1.3 ? "16:9 Cinema" : "Motion Reel"));
              lightboxMeta.textContent = `${rat} • ${this.videoWidth}×${this.videoHeight} • ${item.size}`;
            }
          }
        };

        lightboxVideo.load();
        lightboxVideo.play().catch(() => {});
      }

      if (lightboxTitle) lightboxTitle.textContent = item.cleanTitle || item.name;
      if (lightboxMeta) {
        const rat = item.aspectRatio < 0.8 ? "9:16 Vertical Reel" : (item.aspectRatio > 2.0 ? "2.39:1 Anamorphic" : (item.aspectRatio > 1.3 ? "16:9 Cinema" : "Motion Reel"));
        const dims = (item.width && item.height) ? ` • ${item.width}×${item.height}` : "";
        lightboxMeta.textContent = `${rat}${dims} • ${item.size}`;
      }
    } else {
      if (lightboxVideo) {
        lightboxVideo.style.display = "none";
        lightboxVideo.pause();
        lightboxVideo.src = "";
        lightboxVideo.style.aspectRatio = "";
        lightboxVideo.style.width = "";
        lightboxVideo.style.height = "";
      }
      if (lightboxImg) {
        lightboxImg.style.display = "block";
        lightboxImg.onerror = function () {
          if (this.dataset.triedBackup !== "1" && item.backupUrl && this.src !== item.backupUrl) {
            this.dataset.triedBackup = "1";
            this.src = item.backupUrl;
          } else if (this.dataset.triedThumb !== "1" && item.thumbUrl && this.src !== item.thumbUrl) {
            this.dataset.triedThumb = "1";
            this.src = item.thumbUrl;
          }
        };
        lightboxImg.dataset.triedBackup = "0";
        lightboxImg.dataset.triedThumb = "0";
        lightboxImg.src = item.fullUrl || item.thumbUrl || item.backupUrl;
      }

      if (lightboxTitle) lightboxTitle.textContent = item.cleanTitle || item.name;
      if (lightboxMeta) {
        const dims = (item.width && item.height) ? ` • ${item.width}×${item.height}` : "";
        lightboxMeta.textContent = `${item.badge}${dims} • ${item.size}`;
      }
    }

    lightboxModal.classList.add("is-active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function openLightboxCustom(item) {
    if (lightboxVideo) {
      lightboxVideo.style.display = "none";
      lightboxVideo.pause();
      lightboxVideo.src = "";
    }
    if (lightboxImg) {
      lightboxImg.style.display = "block";
      lightboxImg.onerror = null;
      lightboxImg.src = item.url;
    }
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxMeta) lightboxMeta.textContent = item.meta;

    lightboxModal.classList.add("is-active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = "";
      lightboxVideo.style.aspectRatio = "";
      lightboxVideo.style.width = "";
      lightboxVideo.style.height = "";
      lightboxVideo.onloadedmetadata = null;
    }
    lightboxModal.classList.remove("is-active");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function navLightbox(direction) {
    if (!filteredPhotos.length) return;
    currentLightboxIndex = (currentLightboxIndex + direction + filteredPhotos.length) % filteredPhotos.length;
    openLightbox(currentLightboxIndex);
  }

  function initLightbox() {
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", () => navLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => navLightbox(1));

    if (lightboxModal) {
      lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (!lightboxModal.classList.contains("is-active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navLightbox(-1);
      if (e.key === "ArrowRight") navLightbox(1);
    });
  }

  /* --------------------------------------------------------------------------
     8. AMBIENCE AUDIO TOGGLE
     -------------------------------------------------------------------------- */
  function initAudioToggle() {
    if (!btnAudioToggle) return;
    btnAudioToggle.addEventListener("click", () => {
      if (!bgAudio) {
        bgAudio = new Audio();
        bgAudio.src = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b1a8d0a2.mp3?filename=ambient-piano-amp-strings-10711.mp3";
        bgAudio.loop = true;
        bgAudio.volume = 0.4;
      }

      if (audioPlaying) {
        bgAudio.pause();
        audioPlaying = false;
        btnAudioToggle.classList.remove("corner-action-active");
      } else {
        bgAudio.play().then(() => {
          audioPlaying = true;
          btnAudioToggle.classList.add("corner-action-active");
        }).catch(() => {});
      }
    });
  }

  /* --------------------------------------------------------------------------
     9. UTILITIES
     -------------------------------------------------------------------------- */
  function sanitizeTitle(str) {
    if (!str) return "Studio Masterpiece";
    return str
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b(202\d{7,14}|\d{10,16})\b/g, "")
      .replace(/\b(2k|4k|raw|master|h264|1080p|720p)\b/gi, "")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim() || "Studio Masterpiece";
  }

  function formatBytes(bytes) {
    if (!bytes) return "Studio Master";
    const b = parseInt(bytes, 10);
    if (isNaN(b) || b <= 0) return "Studio Master";
    const mb = (b / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (_) {
      return "";
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* --------------------------------------------------------------------------
     10. WINDOW RESIZE DEBOUNCE FOR MASONRY
     -------------------------------------------------------------------------- */
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (filteredPhotos.length > 0) {
        renderMasonry(filteredPhotos);
      }
    }, 200);
  });

  /* --------------------------------------------------------------------------
     11. INIT
     -------------------------------------------------------------------------- */
  function init() {
    initHeroStepper();
    initSearch();
    initMediaFilterTabs();
    initLightbox();
    initAudioToggle();
    fetchDrivePhotos();
    setHeroSlide(2); // Step 03 active by default
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
