/**
 * FRAMEHAUS — Premium Photography Studio
 * Interactive Controller & Particle Engine
 */

(function () {
  "use strict";

  // Elements
  const heroVideo = document.getElementById("heroVideo");
  const ambientCanvas = document.getElementById("ambientCanvas");
  const dragDropOverlay = document.getElementById("dragDropOverlay");
  const videoFileInput = document.getElementById("videoFileInput");
  const btnUploadVideo = document.getElementById("btnUploadVideo");
  const btnVideoSettings = document.getElementById("btnVideoSettings");
  const btnAmbientAudio = document.getElementById("btnAmbientAudio");
  const audioIconOff = document.getElementById("audioIconOff");
  const audioIconOn = document.getElementById("audioIconOn");
  const toastContainer = document.getElementById("toastContainer");

  // Navigation elements
  const navPillItems = document.querySelectorAll(".nav-pill-item");
  const mobileToggleBtn = document.getElementById("mobileToggleBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Buttons & Modals
  const btnExploreProducts = document.getElementById("btnExploreProducts");
  const btnBuyNow = document.getElementById("btnBuyNow");
  const btnRegister = document.getElementById("btnRegister");
  const mobileBtnBuyNow = document.getElementById("mobileBtnBuyNow");
  const mobileBtnRegister = document.getElementById("mobileBtnRegister");

  const modalProducts = document.getElementById("modalProducts");
  const modalCheckout = document.getElementById("modalCheckout");
  const modalRegister = document.getElementById("modalRegister");
  const modalVideoInfo = document.getElementById("modalVideoInfo");

  /* ==========================================================================
     1. Navigation Pill Switching & Modals
     ========================================================================== */
  function setActiveNav(target) {
    navPillItems.forEach((btn) => {
      if (btn.getAttribute("data-target") === target) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    mobileLinks.forEach((btn) => {
      if (btn.getAttribute("data-target") === target) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    if (mobileDrawer.classList.contains("open")) {
      mobileDrawer.classList.remove("open");
    }

    if (target === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (target === "journal" || target === "portfolio") {
      const gallery = document.getElementById("journalGallery");
      if (gallery) gallery.scrollIntoView({ behavior: "smooth" });
    } else if (target === "section3" || target === "services") {
      const s3 = document.getElementById("section3");
      if (s3) s3.scrollIntoView({ behavior: "smooth" });
    } else if (target === "clients" || target === "section4" || target === "disciplines") {
      const s4 = document.getElementById("section4");
      if (s4) s4.scrollIntoView({ behavior: "smooth" });
    } else if (target === "experiences" || target === "section5") {
      const s5 = document.getElementById("section5");
      if (s5) s5.scrollIntoView({ behavior: "smooth" });
    } else if (target === "about" || target === "booking" || target === "section6" || target === "contact") {
      const s6 = document.getElementById("section6");
      if (s6) s6.scrollIntoView({ behavior: "smooth" });
    }
  }

  navPillItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      setActiveNav(target);
    });
  });

  mobileLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      setActiveNav(target);
    });
  });

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener("click", () => {
      mobileDrawer.classList.toggle("open");
    });
  }

  /* ==========================================================================
     2. Modals System
     ========================================================================== */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      const targetModal = document.getElementById(modalId);
      closeModal(targetModal);
    });
  });

  // Close when clicking modal backdrop
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // ESC key listener
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.open").forEach((m) => closeModal(m));
    }
  });

  if (btnExploreProducts) {
    btnExploreProducts.addEventListener("click", () => {
      const s5 = document.getElementById("section5");
      if (s5) s5.scrollIntoView({ behavior: "smooth" });
      else openModal(modalProducts);
    });
  }
  if (btnBuyNow) {
    btnBuyNow.addEventListener("click", () => {
      const s6 = document.getElementById("section6");
      if (s6) s6.scrollIntoView({ behavior: "smooth" });
      else openModal(modalCheckout);
    });
  }
  if (mobileBtnBuyNow) {
    mobileBtnBuyNow.addEventListener("click", () => {
      if (mobileDrawer.classList.contains("open")) {
        mobileDrawer.classList.remove("open");
      }
      const s6 = document.getElementById("section6");
      if (s6) s6.scrollIntoView({ behavior: "smooth" });
      else openModal(modalCheckout);
    });
  }
  if (btnRegister) {
    btnRegister.addEventListener("click", () => {
      const s6 = document.getElementById("section6");
      if (s6) s6.scrollIntoView({ behavior: "smooth" });
      else openModal(modalRegister);
    });
  }
  if (mobileBtnRegister) {
    mobileBtnRegister.addEventListener("click", () => {
      if (mobileDrawer.classList.contains("open")) {
        mobileDrawer.classList.remove("open");
      }
      const s6 = document.getElementById("section6");
      if (s6) s6.scrollIntoView({ behavior: "smooth" });
      else openModal(modalRegister);
    });
  }
  if (btnVideoSettings) {
    btnVideoSettings.addEventListener("click", () => openModal(modalVideoInfo));
  }

  // Quick Add from portfolio sheet
  document.querySelectorAll(".btn-quick-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.getAttribute("data-item");
      closeModal(modalProducts);
      openModal(modalCheckout);
      showToast(`Selected "${item}" — Session inquiry ready`);
    });
  });

  /* ==========================================================================
     3. Media Integration & Drag-and-Drop
     ========================================================================== */
  function loadVideoBlob(file) {
    if (!file) return;

    const bgImage = document.getElementById("heroBgImage");
    const heroVideo = document.getElementById("heroVideo");

    if (file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      if (bgImage) bgImage.src = fileUrl;
      const label = document.getElementById("videoStatusLabel");
      if (label) label.textContent = `Custom: ${file.name.slice(0, 14)}...`;
      showToast(`📸 Background Image "${file.name}" Active!`);
      return;
    }

    if (file.type.startsWith("video/")) {
      const fileUrl = URL.createObjectURL(file);
      if (heroVideo) {
        heroVideo.src = fileUrl;
        heroVideo.load();
        heroVideo.play().catch(() => { });
      }
      const label = document.getElementById("videoStatusLabel");
      if (label) label.textContent = `Custom: ${file.name.slice(0, 14)}...`;
      showToast(`🎬 Animated Video "${file.name}" Active!`);
      return;
    }

    showToast("Please provide an image (.jpg, .webp, .png) or video (.mp4)");
  }

  /* ==========================================================================
     4. Cinema Hero Background Parallax & Progressive Optical Scroll Blur Engine
     (Dynamic scale zoom-in and progressive optical blur on scroll)
     ========================================================================== */
  function initHeroScrollBlurEffect() {
    const bgImage = document.getElementById("heroBgImage");
    if (!bgImage) return;

    let ticking = false;
    let lastScrollY = -1;

    function updateParallax() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrollY === lastScrollY) {
        ticking = false;
        return;
      }
      lastScrollY = scrollY;

      // Responsive viewport height
      const vh = window.innerHeight || 850;
      // Normalizes scroll progress across the hero section (0 at top, 1.0 when scrolled past hero)
      const progress = Math.min(1.5, Math.max(0, scrollY / (vh * 0.75)));

      const isLowRam = document.documentElement.classList.contains("low-ram-mode");

      if (isLowRam) {
        // Low-RAM / Eco Mode: hardware scale & gentle optical blur without leaving viewport
        if (scrollY <= 8) {
          bgImage.style.transform = "scale(1.02) translate3d(0, 0, 0)";
          bgImage.style.filter = "blur(0px) brightness(1) contrast(1.02)";
          bgImage.style.opacity = "1";
        } else {
          const scale = (1.02 + Math.min(progress, 1) * 0.06).toFixed(3);
          const blurAmount = (Math.min(progress, 1) * 8).toFixed(1);
          bgImage.style.transform = `scale(${scale}) translate3d(0, 0, 0)`;
          bgImage.style.filter = `blur(${blurAmount}px) brightness(1) contrast(1.02)`;
          bgImage.style.opacity = "1";
        }
      } else {
        // High-Fidelity Mode: Smooth optical depth blur & subtle cinematic zoom-in
        if (scrollY <= 8) {
          bgImage.style.transform = "scale(1.02) translate3d(0, 0, 0)";
          bgImage.style.filter = "blur(0px) brightness(1) contrast(1.02)";
          bgImage.style.opacity = "1";
        } else {
          // Subtle zoom into the Canon DSLR camera body and lens
          const scale = (1.02 + progress * 0.1).toFixed(3);
          // Progressive creamy optical blur: 0px at top up to 16px as user scrolls down
          const blurAmount = (Math.min(progress, 1) * 16).toFixed(1);

          bgImage.style.transform = `scale(${scale}) translate3d(0, 0, 0)`;
          bgImage.style.filter = `blur(${blurAmount}px) brightness(1) contrast(1.02)`;
          bgImage.style.opacity = "1";
        }
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Also re-check when low-ram mode is toggled
    const btnLowRam = document.getElementById("btnLowRamToggle");
    if (btnLowRam) {
      btnLowRam.addEventListener("click", () => {
        lastScrollY = -1;
        onScroll();
      });
    }

    // Initial render
    updateParallax();
  }

  /* ==========================================================================
     Robust Background Video Autoplay Engine (Fallback when video is active)
     ========================================================================== */
  function initHeroVideoAutoplay() {
    const heroVideo = document.getElementById("heroVideo");
    if (!heroVideo) return;

    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute("muted", "");
    heroVideo.setAttribute("playsinline", "");
    heroVideo.setAttribute("webkit-playsinline", "");

    const attemptPlay = () => {
      if (!heroVideo.paused) return;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const unlock = () => {
            heroVideo.play().catch(() => {});
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("click", unlock);
            window.removeEventListener("scroll", unlock);
          };
          window.addEventListener("touchstart", unlock, { passive: true, once: true });
          window.addEventListener("click", unlock, { passive: true, once: true });
          window.addEventListener("scroll", unlock, { passive: true, once: true });
        });
      }
    };

    attemptPlay();
    heroVideo.addEventListener("canplay", attemptPlay, { once: true });
    heroVideo.addEventListener("loadeddata", attemptPlay, { once: true });

    // Auto-pause video when scrolled away from hero section to save phone battery & GPU
    const heroSection = document.getElementById("section1");
    if (heroSection && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (heroVideo.paused && !document.hidden) {
              attemptPlay();
            }
          } else {
            if (!heroVideo.paused) {
              heroVideo.pause();
            }
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }
  }

  if (btnUploadVideo && videoFileInput) {
    btnUploadVideo.addEventListener("click", () => videoFileInput.click());
    videoFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        loadVideoBlob(e.target.files[0]);
      }
    });
  }

  // Drag and Drop Fullscreen Listener
  let dragCounter = 0;

  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragDropOverlay) dragDropOverlay.classList.add("active");
  });

  window.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0 && dragDropOverlay) {
      dragDropOverlay.classList.remove("active");
      dragCounter = 0;
    }
  });

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  window.addEventListener("drop", (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (dragDropOverlay) dragDropOverlay.classList.remove("active");

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      loadVideoBlob(file);
    }
  });

  /* ==========================================================================
     4. Ambient Forest Canvas Spore Particle Engine
     ========================================================================== */
  function initAmbientCanvas() {
    if (!ambientCanvas) return;
    const ctx = ambientCanvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let animationFrameId = null;
    let isCanvasActive = true;

    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = ambientCanvas.width = window.innerWidth;
        height = ambientCanvas.height = window.innerHeight;
      }, 150);
    }, { passive: true });

    // Pre-render glowing spore sprites on tiny offscreen canvases (eliminates 100% of expensive shadowBlur Gaussian filters!)
    function createGlowSprite(r, g, b) {
      const off = document.createElement("canvas");
      off.width = 28;
      off.height = 28;
      const octx = off.getContext("2d");
      const grad = octx.createRadialGradient(14, 14, 0, 14, 14, 14);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.65)`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.18)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(14, 14, 14, 0, Math.PI * 2);
      octx.fill();
      return off;
    }

    const goldSprite = createGlowSprite(216, 190, 151);
    const whiteSprite = createGlowSprite(255, 255, 255);

    // Responsive particle count: disabled on mobile (< 768px) to eliminate 100% of GPU/CPU lag
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 0 : 22;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const isGold = Math.random() > 0.35;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.35 - 0.1,
        radius: Math.random() * 2.0 + 1.0,
        alpha: Math.random() * 0.55 + 0.2,
        baseAlpha: Math.random() * 0.55 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
        sprite: isGold ? goldSprite : whiteSprite
      });
    }

    function renderParticles() {
      if (!isCanvasActive || particleCount === 0) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseOffset += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseOffset) * 0.2;

        // Wrap around boundaries
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.globalAlpha = Math.max(0.08, Math.min(0.85, p.alpha));
        const size = p.radius * 3.2;
        ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size);
      }

      animationFrameId = requestAnimationFrame(renderParticles);
    }

    function startCanvas() {
      if (particleCount === 0) return;
      if (!isCanvasActive) {
        isCanvasActive = true;
        if (!animationFrameId) animationFrameId = requestAnimationFrame(renderParticles);
      }
    }

    function stopCanvas() {
      if (isCanvasActive) {
        isCanvasActive = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    }

    // Zero-overhead IntersectionObserver replaces scroll event listeners
    const heroObserver = new IntersectionObserver((entries) => {
      const isVisible = entries[0].isIntersecting;
      if (isVisible && !document.hidden) {
        startCanvas();
      } else {
        stopCanvas();
      }
    }, { threshold: 0.02, rootMargin: "100px 0px" });

    const heroTarget = document.querySelector(".landing-container") || document.getElementById("heroMain");
    if (heroTarget) {
      heroObserver.observe(heroTarget);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopCanvas();
      } else {
        startCanvas();
      }
    });

    startCanvas();
  }

  /* ==========================================================================
     5. Organic Web Audio Synth Ambience (Optional Calm Atmosphere)
     ========================================================================== */
  let audioContext = null;
  let isAudioPlaying = false;
  let ambientOscillators = [];

  function toggleAmbientAudio() {
    if (!isAudioPlaying) {
      startAmbientAudio();
      isAudioPlaying = true;
      audioIconOff.style.display = "none";
      audioIconOn.style.display = "block";
      showToast("📸 Studio Ambient Soundscape Active");
    } else {
      stopAmbientAudio();
      isAudioPlaying = false;
      audioIconOff.style.display = "block";
      audioIconOn.style.display = "none";
      showToast("Studio Soundscape Muted");
    }
  }

  function startAmbientAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.035, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    // Warm cinematic drone chords (A2, E3, C#4)
    const freqs = [110, 164.81, 277.18];
    ambientOscillators = freqs.map((f) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, audioContext.currentTime);

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      return { osc, gain };
    });
  }

  function stopAmbientAudio() {
    if (ambientOscillators) {
      ambientOscillators.forEach(({ osc }) => {
        try {
          osc.stop();
        } catch (_) { }
      });
      ambientOscillators = [];
    }
  }

  if (btnAmbientAudio) {
    btnAmbientAudio.addEventListener("click", toggleAmbientAudio);
  }

  /* ==========================================================================
     6. Toast Helper & App API
     ========================================================================== */
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s ease";
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  window.FramehausApp = {
    handleCheckoutSuccess() {
      closeModal(modalCheckout);
      showToast("✨ Shoot Request Received! FRAMEHAUS concierge will contact you within 24 hours.");
    },
    handleRegisterSuccess() {
      closeModal(modalRegister);
      showToast("✨ Inquiry Sent! Thank you for contacting FRAMEHAUS.");
    },
    showToast,
  };
  window.GlowinnApp = window.FramehausApp;

  /* ==========================================================================
     7. SECTION 2: 3D CYLINDRICAL JOURNAL GALLERY ENGINE
     (Recreated faithfully after video reference @public/video_ecf35468ab21.mp4)
     ========================================================================== */
  function initJournalGallery() {
    const stageWrap = document.getElementById("journalStageWrap");
    const carousel = document.getElementById("journal3DCarousel");
    if (!stageWrap || !carousel) return;

    // Elements
    const gridStage = document.getElementById("journalGridStage");
    const gridItems = document.getElementById("journalGridItems");
    const btnViewCarousel = document.getElementById("btnViewCarousel");
    const btnViewGrid = document.getElementById("btnViewGrid");
    const btnJournalPrev = document.getElementById("btnJournalPrev");
    const btnJournalNext = document.getElementById("btnJournalNext");
    const btnJournalAutoPlay = document.getElementById("btnJournalAutoPlay");
    const journalAutoPlayIcon = document.getElementById("journalAutoPlayIcon");
    const btnJournalSound = document.getElementById("btnJournalSound");
    const journalSoundIcon = document.getElementById("journalSoundIcon");
    const btnJournalSearch = document.getElementById("btnJournalSearch");

    // Dock action buttons
    const btnSpreadInfo = document.getElementById("btnSpreadInfo");
    const btnSpreadShare = document.getElementById("btnSpreadShare");
    const btnSpreadFavorite = document.getElementById("btnSpreadFavorite");
    const dockHeartIcon = document.getElementById("dockHeartIcon");
    const btnSpreadAdd = document.getElementById("btnSpreadAdd");

    // Meta pill & badge
    const activeEntryNum = document.getElementById("activeEntryNum");
    const activeEntryTitle = document.getElementById("activeEntryTitle");
    const dotsTrack = document.getElementById("journalDotsTrack");
    const journalPagesBadge = document.getElementById("journalPagesBadge");
    const journalPageCountText = document.getElementById("journalPageCountText");

    // Modals
    const modalSpreadDetail = document.getElementById("modalSpreadDetail");
    const modalAddMemory = document.getElementById("modalAddMemory");
    const modalJournalSearch = document.getElementById("modalJournalSearch");
    const readerBadge = document.getElementById("readerBadge");
    const readerTitle = document.getElementById("readerTitle");
    const readerSpreadImg = document.getElementById("readerSpreadImg");
    const readerLocation = document.getElementById("readerLocation");
    const readerDate = document.getElementById("readerDate");
    const readerTranscript = document.getElementById("readerTranscript");
    const readerTags = document.getElementById("readerTags");
    const btnDownloadSpread = document.getElementById("btnDownloadSpread");
    const btnReaderPrevSpread = document.getElementById("btnReaderPrevSpread");
    const btnReaderNextSpread = document.getElementById("btnReaderNextSpread");
    const journalSearchInput = document.getElementById("journalSearchInput");
    const journalSearchResults = document.getElementById("journalSearchResults");

    // Spreads Database
    const spreads = [
      {
        id: 1,
        title: "18 Year Old Dream Life: Spain Edition",
        location: "📍 Seville & Andalusia, Spain",
        date: "Summer Solstice 2026",
        badge: "Spain Edition · Vol. 01",
        img: "public/spread_1.webp",
        backupImg: "public/spread_1.jpg",
        transcript:
          "\"Sunsets, sangria (mom approved), and enough wrong turns to make Google Maps cry. Moving to Spain with the family was a full-on adventure—proof that even fluent Spanish can't save you from tourist brain.\"",
        tags: ["#TravelJournal", "#SpainMemories", "#Editorial", "#RooftopSunsets"],
      },
      {
        id: 2,
        title: "Exploring Historical Sites Like True Adventurers",
        location: "📍 Costa Brava & Tossa de Mar Castle",
        date: "July 14, 2026",
        badge: "Coastal Expedition · Vol. 02",
        img: "public/spread_2.webp",
        backupImg: "public/spread_2.jpg",
        transcript:
          "\"35mm Photobooth strips and sea breeze. Except one castle was my pick: cue a 2-hour hike in the blazing sun, with my entire family questioning my life choices—only to find out there was a direct bus.\"",
        tags: ["#CastleHike", "#35mmFilm", "#Photobooth", "#Mediterranean"],
      },
      {
        id: 3,
        title: "Camcorder Memories in the Park",
        location: "📍 Parque de María Luisa, Seville",
        date: "July 20, 2026",
        badge: "Nostalgia · Vol. 03",
        img: "public/spread_3.webp",
        backupImg: "public/spread_3.jpg",
        transcript:
          "\"Golden afternoon shade under blooming jacaranda trees. Filming family laughter on the vintage handycam monitor. Golden hour light filtering through purple petals.\"",
        tags: ["#Handycam", "#FamilyPortraits", "#Jacaranda", "#GoldenHour"],
      },
      {
        id: 4,
        title: "Cathedral Arches & Solitude",
        location: "📍 Málaga Cathedral Courtyard",
        date: "July 28, 2026",
        badge: "Sanctuary · Vol. 04",
        img: "public/spread_4.webp",
        backupImg: "public/spread_4.jpg",
        transcript:
          "\"A sundress, a cathedral, and maybe a hint of sunstroke! Soaring limestone arches whispering centuries of Andalusian history.\"",
        tags: ["#CathedralArches", "#Málaga", "#GothicArchitecture", "#SundressSeason"],
      },
      {
        id: 5,
        title: "Looking Out Dramatically from a Castle",
        location: "📍 Castillo de Colomares",
        date: "August 3, 2026",
        badge: "High Altitude · Vol. 05",
        img: "public/spread_5.webp",
        backupImg: "public/spread_5.jpg",
        transcript:
          "\"Leaning on mom... because even sightseeing has a stamina limit! Looking out dramatically from a castle tower, because main character energy requires altitude.\"",
        tags: ["#MainCharacterEnergy", "#Colomares", "#CastleViews", "#Wanderlust"],
      },
      {
        id: 6,
        title: "Olive Fields & Ancient Groves",
        location: "📍 Sierra Nevada Foothills",
        date: "August 11, 2026",
        badge: "Terra · Vol. 06",
        img: "public/spread_6.webp",
        backupImg: "public/spread_6.jpg",
        transcript:
          "\"Lord, I'm here in an olive field, sweaty and sunburnt. If this doesn't impress someone's mom, I don't know what will. 200-year-old olive trees stretching toward the Mediterranean horizon.\"",
        tags: ["#OliveGroves", "#Andalusia", "#BotanicalEarth", "#SummerHeat"],
      },
      {
        id: 7,
        title: "Sun Doodles & Seaside Terrace",
        location: "📍 Nerja Balcón de Europa",
        date: "August 19, 2026",
        badge: "Coastline · Vol. 07",
        img: "public/spread_7.webp",
        backupImg: "public/spread_7.jpg",
        transcript:
          "\"Scaled the cliffs, conquered the castle... now where's my gelato? Sitting on the sun-warmed whitewashed terrace watching turquoise waves crash.\"",
        tags: ["#Nerja", "#BalconDeEuropa", "#TurquoiseSea", "#GelatoHunt"],
      },
      {
        id: 8,
        title: "Streets of Seville & Flamenco Soul",
        location: "📍 Barrio Santa Cruz, Seville",
        date: "August 26, 2026",
        badge: "Duende · Vol. 08",
        img: "public/spread_8.webp",
        backupImg: "public/spread_8.jpg",
        transcript:
          "\"Cobblestone alleys scented with sweet orange blossoms. Floating polaroid prints, rhythmic flamenco heels echoing in the plaza, and tapas till midnight.\"",
        tags: ["#Flamenco", "#SevilleNights", "#Polaroids", "#OrangeBlossom"],
      },
    ];

    let currentOffset = 0;
    let targetOffset = 0;
    let isDragging = false;
    let startX = 0;
    let dragStartOffset = 0;
    let lastDragX = 0;
    let dragVelocity = 0;
    let isAutoPlaying = true;
    let autoPlayInterval = null;
    let isSoundEnabled = true;
    let favoriteState = {};
    let lastSoundIndex = 0;

    // Responsive Geometry parameters
    function getGeometry() {
      const w = window.innerWidth;
      if (w <= 480) {
        return {
          cardWidth: 275,
          spacing: Math.min(235, Math.max(195, w * 0.62)),
          depthZ: 140,
          rotateAngle: 12
        };
      } else if (w <= 768) {
        return {
          cardWidth: 320,
          spacing: 285,
          depthZ: 155,
          rotateAngle: 14
        };
      } else if (w <= 1024) {
        return {
          cardWidth: 380,
          spacing: 340,
          depthZ: 170,
          rotateAngle: 16
        };
      } else {
        return {
          cardWidth: 440,
          spacing: 395,
          depthZ: 190,
          rotateAngle: 18
        };
      }
    }

    // Gentle tactile paper flip sound generator using Web Audio API (reused AudioCtx & cached buffer for 0 RAM leak)
    let sharedAudioCtx = null;
    let sharedNoiseBuffer = null;

    function getSharedAudioCtx() {
      if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          sharedAudioCtx = new AudioCtx();
        }
      }
      if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
        sharedAudioCtx.resume().catch(() => {});
      }
      return sharedAudioCtx;
    }

    function playPaperFlipSound() {
      if (!isSoundEnabled) return;
      try {
        const ctx = getSharedAudioCtx();
        if (!ctx) return;
        if (!sharedNoiseBuffer) {
          const bufferSize = Math.floor(ctx.sampleRate * 0.08);
          sharedNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = sharedNoiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
          }
        }
        const noise = ctx.createBufferSource();
        noise.buffer = sharedNoiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.08);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch (_) { }
    }

    // Build dots in meta pill
    function renderDots() {
      if (!dotsTrack) return;
      dotsTrack.innerHTML = "";
      spreads.forEach((_, idx) => {
        const dot = document.createElement("span");
        dot.className = `journal-dot ${idx === 0 ? "active" : ""}`;
        dot.addEventListener("click", () => {
          jumpToIndex(idx);
        });
        dotsTrack.appendChild(dot);
      });
    }

    // Build Grid View items
    function renderGridView() {
      if (!gridItems) return;
      gridItems.innerHTML = "";
      spreads.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "journal-grid-card";
        card.innerHTML = `
          <img src="${item.img}" alt="${item.title}" loading="lazy" />
          <div class="journal-grid-card-overlay">
            <span class="journal-grid-card-tag">${item.badge}</span>
            <h4 class="journal-grid-card-title">${item.title}</h4>
          </div>
        `;
        card.addEventListener("click", () => {
          switchView("carousel");
          jumpToIndex(idx);
          openSpreadModal(idx);
        });
        gridItems.appendChild(card);
      });
    }

    // Switch between Carousel and Grid view
    function switchView(view) {
      if (view === "carousel") {
        btnViewCarousel.classList.add("active");
        btnViewGrid.classList.remove("active");
        stageWrap.classList.add("active");
        gridStage.classList.remove("active");
      } else {
        btnViewGrid.classList.add("active");
        btnViewCarousel.classList.remove("active");
        gridStage.classList.add("active");
        stageWrap.classList.remove("active");
        renderGridView();
      }
    }

    if (btnViewCarousel) btnViewCarousel.addEventListener("click", () => switchView("carousel"));
    if (btnViewGrid) btnViewGrid.addEventListener("click", () => switchView("grid"));
    if (journalPagesBadge) journalPagesBadge.addEventListener("click", () => switchView("grid"));

    // Sound toggle
    if (btnJournalSound) {
      btnJournalSound.addEventListener("click", () => {
        isSoundEnabled = !isSoundEnabled;
        if (isSoundEnabled) {
          journalSoundIcon.textContent = "🔊";
          showToast("📖 Journal Page Flip Sound Enabled");
          playPaperFlipSound();
        } else {
          journalSoundIcon.textContent = "🔇";
          showToast("Sound Muted");
        }
      });
    }

    // Auto Play / Auto Orbit
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(() => {
        if (!isDragging && isAutoPlaying && isGalleryInView && !document.hidden) {
          targetOffset += 1;
          requestCarouselUpdate();
        }
      }, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    if (btnJournalAutoPlay) {
      btnJournalAutoPlay.addEventListener("click", () => {
        isAutoPlaying = !isAutoPlaying;
        if (isAutoPlaying) {
          journalAutoPlayIcon.textContent = "⏸";
          startAutoPlay();
          showToast("▶ 3D Auto-Orbiting Active");
        } else {
          journalAutoPlayIcon.textContent = "▶";
          stopAutoPlay();
          showToast("⏸ Auto-Orbit Paused");
        }
      });
    }

    // Jump smoothly to index
    const cachedCards = Array.from(carousel.querySelectorAll(".journal-card"));
    let isCarouselRunning = false;
    let isGalleryInView = true;

    function requestCarouselUpdate() {
      if (!isCarouselRunning && isGalleryInView) {
        isCarouselRunning = true;
        requestAnimationFrame(update3DCarousel);
      }
    }

    // Jump smoothly to index
    function jumpToIndex(idx) {
      const total = spreads.length;
      const normalizedCurrent = ((Math.round(targetOffset) % total) + total) % total;
      let diff = idx - normalizedCurrent;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      targetOffset += diff;
      requestCarouselUpdate();
    }

    if (btnJournalPrev) {
      btnJournalPrev.addEventListener("click", () => {
        targetOffset -= 1;
        playPaperFlipSound();
        requestCarouselUpdate();
      });
    }

    if (btnJournalNext) {
      btnJournalNext.addEventListener("click", () => {
        targetOffset += 1;
        playPaperFlipSound();
        requestCarouselUpdate();
      });
    }

    // Main 3D Animation Render Loop (Optimized: pauses when motionless or offscreen!)
    function update3DCarousel() {
      const total = spreads.length;
      if (total === 0) return;

      const { spacing, depthZ, rotateAngle } = getGeometry();

      if (!isDragging) {
        const diffOffset = targetOffset - currentOffset;
        if (Math.abs(diffOffset) < 0.0008 && Math.abs(dragVelocity) < 0.0008) {
          currentOffset = targetOffset;
          dragVelocity = 0;
        } else {
          currentOffset += diffOffset * 0.14;
          if (Math.abs(dragVelocity) > 0.001) {
            targetOffset += dragVelocity;
            dragVelocity *= 0.86;
          }
        }
      }

      const activeIndex = ((Math.round(currentOffset) % total) + total) % total;

      // Play paper rustle when crossing integer index threshold
      if (activeIndex !== lastSoundIndex) {
        playPaperFlipSound();
        lastSoundIndex = activeIndex;
      }

      // Update meta pill display
      if (spreads[activeIndex]) {
        const item = spreads[activeIndex];
        if (activeEntryNum) activeEntryNum.textContent = String(item.id).padStart(2, "0");
        if (activeEntryTitle) activeEntryTitle.textContent = item.title;

        // Update dots
        const allDots = document.querySelectorAll(".journal-dot");
        allDots.forEach((dot, dIdx) => {
          if (dIdx === activeIndex) {
            dot.classList.add("active");
          } else {
            dot.classList.remove("active");
          }
        });

        // Update favorite heart button state
        if (dockHeartIcon) {
          if (favoriteState[item.id]) {
            btnSpreadFavorite.classList.add("favorite-active");
            dockHeartIcon.setAttribute("fill", "#ff4757");
          } else {
            btnSpreadFavorite.classList.remove("favorite-active");
            dockHeartIcon.setAttribute("fill", "none");
          }
        }
      }

      // Position each card along the 3D concave cylinder using pre-cached DOM nodes
      cachedCards.forEach((card) => {
        const idx = parseInt(card.getAttribute("data-index"), 10);
        let diff = idx - (currentOffset % total);
        while (diff > total / 2) diff -= total;
        while (diff < -total / 2) diff += total;

        const absDiff = Math.abs(diff);

        const isMobile = window.innerWidth <= 768;
        const maxVisibleDiff = isMobile ? 1.6 : 2.8;

        // Hide cards too far back (completely cull offscreen cards on mobile to reduce GPU draw calls)
        if (absDiff > maxVisibleDiff) {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          card.style.visibility = "hidden";
          card.style.display = "none";
          return;
        }

        card.style.display = "block";
        card.style.visibility = "visible";

        // Non-linear horizontal placement: cards separate cleanly without overlapping center
        const sign = diff < 0 ? -1 : 1;
        const x = sign * Math.pow(absDiff, 0.94) * spacing;

        // Depth Z: Active center card elevated at +25px forward.
        // Side cards pushed back deep (-depthZ) so forward edges can NEVER intersect active card.
        const z = -Math.pow(absDiff, 1.15) * depthZ + (absDiff < 0.25 ? 25 : 0);

        // Rotation: Tilted inward toward viewer (concave panoramic arc)
        const rotY = -sign * Math.min(rotateAngle * 1.4, Math.pow(absDiff, 0.75) * rotateAngle);

        // Scale: active card 1.0, neighbors gracefully contracted
        const scale = Math.max(0.68, 1 - absDiff * 0.12);

        // Opacity: Center 1.0, neighbors 0.72, far cards 0.25
        const opacity = Math.max(0.15, 1 - absDiff * 0.28);

        // Z-Index: Center card strictly dominates
        const zIndex = Math.round(100 - absDiff * 25);

        card.style.transform = `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = zIndex;
        card.style.pointerEvents = absDiff < 0.4 ? "auto" : "none";

        // Center card highlights
        if (absDiff < 0.35) {
          card.classList.add("center-card");
        } else {
          card.classList.remove("center-card");
        }
      });

      // Stop loop when motionless to save CPU & RAM; re-engages on user action
      const isMotionless = !isDragging && Math.abs(targetOffset - currentOffset) < 0.0005 && Math.abs(dragVelocity) < 0.0005;
      if (!isMotionless && isGalleryInView) {
        requestAnimationFrame(update3DCarousel);
      } else {
        isCarouselRunning = false;
      }
    }

    // Pointer Drag & Swipe Interaction with Inertia & Smart Touch Disambiguation
    let startY = 0;
    let isTouchGestureDecided = false;
    let hasDraggedCarousel = false;

    function onPointerDown(e) {
      if (
        e.target.closest(".journal-nav-arrow") ||
        e.target.closest(".journal-dock-btn") ||
        e.target.closest(".journal-active-meta-pill")
      ) return;

      isDragging = true;
      hasDraggedCarousel = false;
      isTouchGestureDecided = false;
      const touch = e.touches ? e.touches[0] : null;
      startX = touch ? touch.clientX : (e.clientX || 0);
      startY = touch ? touch.clientY : (e.clientY || 0);
      lastDragX = startX;
      dragStartOffset = currentOffset;
      dragVelocity = 0;
      stopAutoPlay();
      carousel.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const touch = e.touches ? e.touches[0] : null;
      const clientX = touch ? touch.clientX : (e.clientX || 0);
      const clientY = touch ? touch.clientY : (e.clientY || 0);

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 6) {
        hasDraggedCarousel = true;
      }

      // On touch devices, check if user is scrolling vertically or swiping carousel horizontally
      if (touch && !isTouchGestureDecided) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
          // Native vertical scroll: release dragging and snap to nearest integer!
          isDragging = false;
          isTouchGestureDecided = true;
          carousel.style.cursor = "grab";
          targetOffset = Math.round(currentOffset);
          requestCarouselUpdate();
          return;
        } else if (Math.abs(dx) > 8) {
          isTouchGestureDecided = true;
        }
      }

      const { spacing } = getGeometry();
      dragVelocity = (lastDragX - clientX) / spacing;
      lastDragX = clientX;

      currentOffset = dragStartOffset - dx / spacing;
      targetOffset = currentOffset;
      requestCarouselUpdate();
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      carousel.style.cursor = "grab";

      // Fling and Snap to nearest card
      const fling = Math.max(-1.2, Math.min(1.2, dragVelocity * 3.2));
      targetOffset = Math.round(currentOffset + fling);
      dragVelocity = 0;
      requestCarouselUpdate();

      if (isAutoPlaying) {
        startAutoPlay();
      }
    }

    // Attach drag events to carousel
    carousel.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    carousel.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });
    window.addEventListener("touchcancel", onPointerUp, { passive: true });

    // Mouse wheel only rotates gallery when cursor is directly hovering over the carousel
    let wheelThrottle = 0;
    carousel.addEventListener("wheel", (e) => {
      // Only rotate carousel if cursor is hovering directly over a book card
      if (!e.target.closest(".journal-card")) {
        return;
      }

      const now = Date.now();
      if (now - wheelThrottle < 200) {
        e.preventDefault();
        return;
      }

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 18) {
        e.preventDefault();
        wheelThrottle = now;
        if (delta > 0) {
          targetOffset += 1;
        } else {
          targetOffset -= 1;
        }
        playPaperFlipSound();
        requestCarouselUpdate();
      }
    }, { passive: false });

    // Keyboard navigation when user is looking at section
    window.addEventListener("keydown", (e) => {
      const section = document.getElementById("journalGallery");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === "ArrowLeft") {
          targetOffset -= 1;
          playPaperFlipSound();
          requestCarouselUpdate();
        } else if (e.key === "ArrowRight") {
          targetOffset += 1;
          playPaperFlipSound();
          requestCarouselUpdate();
        }
      }
    });

    // Clicking individual card
    carousel.addEventListener("click", (e) => {
      if (hasDraggedCarousel) {
        hasDraggedCarousel = false;
        return;
      }
      const card = e.target.closest(".journal-card");
      if (!card) return;
      const idx = parseInt(card.getAttribute("data-index"), 10);
      const total = spreads.length;
      let diff = idx - (currentOffset % total);
      while (diff > total / 2) diff -= total;
      while (diff < -total / 2) diff += total;

      if (Math.abs(diff) < 0.35) {
        // Centered card clicked: open Spread Reader Modal!
        openSpreadModal(idx);
      } else {
        // Flanking card clicked: smoothly rotate to center!
        targetOffset += Math.round(diff);
        playPaperFlipSound();
        requestCarouselUpdate();
      }
    });

    // Fullscreen Spread Reader Modal
    let currentReaderIdx = 0;
    function openSpreadModal(idx) {
      const item = spreads[idx];
      if (!item) return;
      currentReaderIdx = idx;

      if (readerBadge) readerBadge.textContent = item.badge;
      if (readerTitle) readerTitle.textContent = item.title;
      if (readerSpreadImg) {
        readerSpreadImg.src = item.img;
        readerSpreadImg.alt = item.title;
      }
      if (readerLocation) readerLocation.textContent = item.location;
      if (readerDate) readerDate.textContent = item.date;
      if (readerTranscript) readerTranscript.textContent = item.transcript;

      if (readerTags) {
        readerTags.innerHTML = "";
        (item.tags || []).forEach((t) => {
          const span = document.createElement("span");
          span.className = "reader-tag";
          span.textContent = t;
          readerTags.appendChild(span);
        });
      }

      openModal(modalSpreadDetail);
    }

    if (btnReaderPrevSpread) {
      btnReaderPrevSpread.addEventListener("click", () => {
        currentReaderIdx = (currentReaderIdx - 1 + spreads.length) % spreads.length;
        openSpreadModal(currentReaderIdx);
        jumpToIndex(currentReaderIdx);
        playPaperFlipSound();
      });
    }

    if (btnReaderNextSpread) {
      btnReaderNextSpread.addEventListener("click", () => {
        currentReaderIdx = (currentReaderIdx + 1) % spreads.length;
        openSpreadModal(currentReaderIdx);
        jumpToIndex(currentReaderIdx);
        playPaperFlipSound();
      });
    }

    if (btnDownloadSpread) {
      btnDownloadSpread.addEventListener("click", () => {
        const item = spreads[currentReaderIdx];
        if (!item) return;
        const link = document.createElement("a");
        link.href = item.img;
        link.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast(`📥 Downloading "${item.title}"`);
      });
    }

    // Action Dock Button Handlers
    if (btnSpreadInfo) {
      btnSpreadInfo.addEventListener("click", () => {
        const total = spreads.length;
        const activeIdx = ((Math.round(currentOffset) % total) + total) % total;
        openSpreadModal(activeIdx);
      });
    }

    if (btnSpreadShare) {
      btnSpreadShare.addEventListener("click", () => {
        const total = spreads.length;
        const activeIdx = ((Math.round(currentOffset) % total) + total) % total;
        const item = spreads[activeIdx];
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
        showToast(`🔗 Link to "${item.title}" copied to clipboard!`);
      });
    }

    if (btnSpreadFavorite) {
      btnSpreadFavorite.addEventListener("click", () => {
        const total = spreads.length;
        const activeIdx = ((Math.round(currentOffset) % total) + total) % total;
        const item = spreads[activeIdx];
        favoriteState[item.id] = !favoriteState[item.id];
        if (favoriteState[item.id]) {
          btnSpreadFavorite.classList.add("favorite-active");
          if (dockHeartIcon) dockHeartIcon.setAttribute("fill", "#ff4757");
          showToast(`❤️ Saved "${item.title}" to Moodboard`);
        } else {
          btnSpreadFavorite.classList.remove("favorite-active");
          if (dockHeartIcon) dockHeartIcon.setAttribute("fill", "none");
          showToast(`Removed from Moodboard`);
        }
      });
    }

    if (btnSpreadAdd) {
      btnSpreadAdd.addEventListener("click", () => {
        openModal(modalAddMemory);
      });
    }

    // Live Search Feature
    if (btnJournalSearch) {
      btnJournalSearch.addEventListener("click", () => {
        openModal(modalJournalSearch);
        if (journalSearchInput) {
          journalSearchInput.value = "";
          renderSearchResults("");
          setTimeout(() => journalSearchInput.focus(), 150);
        }
      });
    }

    function renderSearchResults(query) {
      if (!journalSearchResults) return;
      journalSearchResults.innerHTML = "";
      const q = (query || "").trim().toLowerCase();
      const filtered = spreads.filter(
        (s) =>
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.transcript.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
      );

      if (filtered.length === 0) {
        journalSearchResults.innerHTML = `<p style="color:rgba(255,255,255,0.5);font-size:13px;padding:12px;text-align:center;">No matching spreads found for "${query}"</p>`;
        return;
      }

      filtered.forEach((item) => {
        const row = document.createElement("div");
        row.style.cssText =
          "display:flex;align-items:center;gap:12px;padding:8px 12px;background:rgba(255,255,255,0.06);border-radius:12px;cursor:pointer;transition:background 0.2s;";
        row.innerHTML = `
          <img src="${item.img}" style="width:54px;height:44px;object-fit:cover;border-radius:8px;" />
          <div style="flex:1;">
            <h5 style="color:#fff;font-size:13px;margin:0;">${item.title}</h5>
            <span style="color:var(--accent-gold);font-size:11px;">${item.location}</span>
          </div>
        `;
        row.addEventListener("mouseenter", () => (row.style.background = "rgba(255,255,255,0.12)"));
        row.addEventListener("mouseleave", () => (row.style.background = "rgba(255,255,255,0.06)"));
        row.addEventListener("click", () => {
          closeModal(modalJournalSearch);
          const originalIdx = spreads.findIndex((s) => s.id === item.id);
          if (originalIdx !== -1) {
            switchView("carousel");
            jumpToIndex(originalIdx);
          }
        });
        journalSearchResults.appendChild(row);
      });
    }

    if (journalSearchInput) {
      journalSearchInput.addEventListener("input", (e) => {
        renderSearchResults(e.target.value);
      });
    }

    // Add Memory Form Handler
    window.JournalApp = {
      handleAddNewSpread() {
        const memTitle = document.getElementById("memTitle").value;
        const memLocation = document.getElementById("memLocation").value;
        const memNotes = document.getElementById("memNotes").value;
        const memFile = document.getElementById("memFile");

        function insertSpread(imgUrl) {
          const newId = spreads.length + 1;
          const newSpread = {
            id: newId,
            title: memTitle,
            location: memLocation,
            date: "Today",
            badge: `Personal Entry · Vol. ${String(newId).padStart(2, "0")}`,
            img: imgUrl || "public/spread_1.jpg",
            transcript: `"${memNotes}"`,
            tags: ["#PersonalMemory", "#JournalEntry", "#CapturedMoment"],
          };

          spreads.push(newSpread);

          // Add card element to carousel DOM
          const card = document.createElement("div");
          card.className = "journal-card";
          card.setAttribute("data-index", spreads.length - 1);
          card.setAttribute("data-id", newId);
          card.innerHTML = `
            <div class="journal-book-spread">
              <img src="${newSpread.img}" alt="${newSpread.title}" class="journal-spread-img" />
              <div class="journal-spine-gutter"></div>
              <div class="journal-card-sheen"></div>
              <div class="journal-card-hover-tag">Open Spread &amp; Reading Notes</div>
            </div>
            <div class="journal-card-shadow"></div>
          `;
          carousel.appendChild(card);

          // Update page count
          if (journalPageCountText) {
            journalPageCountText.textContent = `${70 + spreads.length - 8} Captures`;
          }

          renderDots();
          closeModal(modalAddMemory);
          showToast(`✨ Capture "${memTitle}" appended to your Portfolio Archive!`);

          // Jump straight to new card
          jumpToIndex(spreads.length - 1);
        }

        if (memFile && memFile.files && memFile.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => insertSpread(e.target.result);
          reader.readAsDataURL(memFile.files[0]);
        } else {
          // Use one of the existing beautiful spreads as sample
          insertSpread("public/spread_1.jpg");
        }
      },
      jumpToIndex,
      openSpreadModal,
    };

    // Smooth Scroll Helper from Hero Scroll Cue & Navbar
    const scrollCue = document.getElementById("scrollCue");
    if (scrollCue) {
      scrollCue.addEventListener("click", (e) => {
        e.preventDefault();
        const gallery = document.getElementById("journalGallery");
        if (gallery) {
          gallery.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const navJournal = document.getElementById("navJournal");
    if (navJournal) {
      navJournal.addEventListener("click", (e) => {
        e.preventDefault();
        const gallery = document.getElementById("journalGallery");
        if (gallery) {
          gallery.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Initialize View & Loop
    renderDots();
    requestCarouselUpdate();

    // IntersectionObserver: automatically pauses 3D rendering and autoplay when gallery is offscreen
    const gallerySection = document.getElementById("journalGallery");
    if (gallerySection && "IntersectionObserver" in window) {
      const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isGalleryInView = entry.isIntersecting;
          if (entry.isIntersecting) {
            requestCarouselUpdate();
            if (isAutoPlaying) startAutoPlay();
          } else {
            isCarouselRunning = false;
            stopAutoPlay();
          }
        });
      }, { threshold: 0.05 });
      galleryObserver.observe(gallerySection);
    } else {
      if (isAutoPlaying) startAutoPlay();
    }

    let galleryResizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(galleryResizeTimer);
      galleryResizeTimer = setTimeout(() => {
        requestCarouselUpdate();
      }, 150);
    }, { passive: true });
  }

  /* ==========================================================================
     8. SECTION 4: Interactive Studio Showcase & Disciplines Slider
     (Faithfully recreated after video reference @video_0d5c38085335.mp4)
     ========================================================================== */
  function initStudioShowcaseSlider() {
    const showcaseSection = document.getElementById("section4");
    if (!showcaseSection) return;

    const disciplines = [
      {
        id: "01",
        name: "Editorial Portraiture",
        img: "public/images/studio_showcase_1.webp",
        backupImg: "public/images/studio_showcase_1.jpg",
        impactTitle: "98% Natural Light Ratio",
        impactDesc: "Every portrait session is sculpted utilizing organic sunlight and architectural reflections to capture timeless authentic character without harsh artificial glare.",
        quoteAvatar: "public/images/avatar_director.jpg",
        quoteText: "We compose frames not just to document a subject, but to preserve the silent gravity of a passing moment.",
        quoteAuthor: "Julian Vane, Creative Director"
      },
      {
        id: "02",
        name: "Architectural & Spatial Synthesis",
        img: "public/images/studio_showcase_2.webp",
        backupImg: "public/images/studio_showcase_2.jpg",
        impactTitle: "100% Medium Format Precision",
        impactDesc: "Crafted on 120mm film and 100MP digital backs, balancing monolithic brutalist structures with delicate human presence and shadow interplay.",
        quoteAvatar: "public/images/avatar_client.jpg",
        quoteText: "FRAMEHAUS redefines how architecture breathes in print. The tonal discipline and depth are unmatched.",
        quoteAuthor: "Elena Rostova, Principal Architect"
      },
      {
        id: "03",
        name: "Haute Couture & Commercial Art",
        img: "public/images/studio_showcase_3.webp",
        backupImg: "public/images/studio_showcase_3.jpg",
        impactTitle: "Zero Artificial Manipulation",
        impactDesc: "Pure optical glass, physical diffusion filtration, and tailored set illumination producing rich chiaroscuro and museum-grade tactile finishes.",
        quoteAvatar: "public/images/avatar_director.jpg",
        quoteText: "A singular vision where high-concept fashion meets cinematic stillness. Pure visual poetry.",
        quoteAuthor: "Marcus Sterling, Vogue Contributor"
      }
    ];

    let currentIndex = 0;
    let autoSlideTimer = null;

    // Elements
    const mainImg = document.getElementById("showcaseMainImg");
    const mainSource = document.getElementById("showcaseMainSource");
    const badgeNum = document.getElementById("showcaseBadgeNum");
    const badgeText = document.getElementById("showcaseBadgeText");
    const impactTitle = document.getElementById("impactTitle");
    const impactDesc = document.getElementById("impactDesc");
    const quoteAvatar = document.getElementById("quoteAvatarImg");
    const quoteBody = document.getElementById("quoteBody");
    const quoteAuthor = document.getElementById("quoteAuthorName");
    const tabItems = document.querySelectorAll(".showcase-tab-item");
    const thumbnailsContainer = document.getElementById("showcaseThumbnailsRow");
    const btnShowcaseInquire = document.getElementById("btnShowcaseInquire");
    const btnImpactArrow = document.getElementById("btnImpactArrow");

    function renderThumbnails(activeIdx) {
      if (!thumbnailsContainer) return;
      thumbnailsContainer.innerHTML = "";
      disciplines.forEach((d, i) => {
        if (i !== activeIdx) {
          const btn = document.createElement("button");
          btn.className = "capsule-thumbnail";
          btn.setAttribute("data-index", i);
          btn.setAttribute("title", `Switch to Discipline ${d.id}: ${d.name}`);
          btn.innerHTML = `
            <picture>
              <source srcset="${d.img}" type="image/webp">
              <img src="${d.img}" alt="${d.name}" loading="lazy" decoding="async" onerror="if(!this.dataset.triedBackup){this.dataset.triedBackup='1';this.src='${d.backupImg}';}" />
            </picture>
            <span class="thumb-index-tag">${d.id}</span>
          `;
          btn.addEventListener("click", () => {
            renderDiscipline(i, true);
            resetAutoSlide();
          });
          thumbnailsContainer.appendChild(btn);
        }
      });
    }

    function renderDiscipline(index, withTransition = true) {
      if (index < 0 || index >= disciplines.length) return;
      currentIndex = index;
      const data = disciplines[index];

      // Update Tabs
      tabItems.forEach((tab) => {
        const tabIdx = parseInt(tab.getAttribute("data-index"), 10);
        if (tabIdx === index) {
          tab.classList.add("active");
        } else {
          tab.classList.remove("active");
        }
      });

      function applyData() {
        if (mainImg) {
          mainImg.src = data.img;
          mainImg.onerror = function () {
            if (!this.dataset.triedBackup) {
              this.dataset.triedBackup = "1";
              this.src = data.backupImg;
            }
          };
        }
        if (mainSource) mainSource.srcset = data.img;
        if (badgeNum) badgeNum.textContent = data.id;
        if (badgeText) badgeText.textContent = data.name;
        if (impactTitle) impactTitle.textContent = data.impactTitle;
        if (impactDesc) impactDesc.textContent = data.impactDesc;
        if (quoteAvatar) quoteAvatar.src = data.quoteAvatar;
        if (quoteBody) quoteBody.textContent = data.quoteText;
        if (quoteAuthor) quoteAuthor.textContent = data.quoteAuthor;

        renderThumbnails(index);
      }

      // Morphing Squeeze-Collapse and Spring-Expand Animation
      if (withTransition) {
        const morphCards = [
          document.getElementById("showcaseImpactCard"),
          document.getElementById("showcaseQuoteCard"),
          document.getElementById("showcaseThumbnailsRow")
        ];
        const mainCard = document.getElementById("showcaseMainCard");

        // 1. Collapse cards to small rounded pill in center
        morphCards.forEach((c) => {
          if (c) {
            c.classList.remove("morph-expanding");
            c.classList.add("morph-collapsing");
          }
        });
        if (mainCard) mainCard.classList.add("image-morphing");

        // 2. At peak of collapse, swap data
        setTimeout(() => {
          applyData();

          // 3. Spring expand cards back to full size
          morphCards.forEach((c) => {
            if (c) {
              c.classList.remove("morph-collapsing");
              c.classList.add("morph-expanding");
            }
          });
          if (mainCard) mainCard.classList.remove("image-morphing");

          setTimeout(() => {
            morphCards.forEach((c) => {
              if (c) c.classList.remove("morph-expanding");
            });
          }, 450);
        }, 240);
      } else {
        applyData();
      }
    }

    // Attach Section 3 Button Handlers
    const btnS3Team = document.getElementById("btnS3Team");
    const btnS3Explore = document.getElementById("btnS3Explore");
    const btnS3WorkWithUs = document.getElementById("btnS3WorkWithUs");

    if (btnS3Team) {
      btnS3Team.addEventListener("click", () => {
        showToast("FRAMEHAUS Atelier: Julian Vane (Direction), Elena Rostova (Spatial), Marcus Sterling (Curator)");
      });
    }
    if (btnS3Explore) {
      btnS3Explore.addEventListener("click", () => {
        const gal = document.getElementById("journalGallery");
        if (gal) gal.scrollIntoView({ behavior: "smooth" });
      });
    }
    if (btnS3WorkWithUs) {
      btnS3WorkWithUs.addEventListener("click", () => {
        openModal(modalCheckout);
      });
    }

    // Attach Tab click events
    tabItems.forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = parseInt(tab.getAttribute("data-index"), 10);
        renderDiscipline(idx, true);
        resetAutoSlide();
      });
    });

    // Arrow Buttons Inquiries
    if (btnShowcaseInquire) {
      btnShowcaseInquire.addEventListener("click", () => {
        openModal(modalProducts);
        showToast("Explore all Studio Disciplines & Curated Series");
      });
    }

    if (btnImpactArrow) {
      btnImpactArrow.addEventListener("click", () => {
        openModal(modalCheckout);
        showToast(`Inquiring about ${disciplines[currentIndex].name}`);
      });
    }

    // Auto-slide Timer (Low-RAM & Visibility Aware)
    function startAutoSlide() {
      stopAutoSlide();
      if (document.documentElement.classList.contains("low-ram-mode") || document.hidden) {
        return;
      }
      autoSlideTimer = setInterval(() => {
        const nextIndex = (currentIndex + 1) % disciplines.length;
        renderDiscipline(nextIndex, true);
      }, 7500);
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    function resetAutoSlide() {
      startAutoSlide();
    }

    showcaseSection.addEventListener("mouseenter", stopAutoSlide);
    showcaseSection.addEventListener("mouseleave", () => {
      if (showcaseSection.classList.contains("is-assembled")) {
        startAutoSlide();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoSlide();
      } else if (showcaseSection.classList.contains("is-assembled")) {
        startAutoSlide();
      }
    });

    // Mobile touch swipe gestures for Section 4 main card
    const mainCard = document.getElementById("showcaseMainCard");
    let touchStartX = 0;
    let touchStartY = 0;
    if (mainCard) {
      mainCard.addEventListener("touchstart", (e) => {
        if (!e.touches || !e.touches[0]) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      mainCard.addEventListener("touchend", (e) => {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) {
            // Swipe left -> Next discipline
            const nextIndex = (currentIndex + 1) % disciplines.length;
            renderDiscipline(nextIndex, true);
            resetAutoSlide();
          } else {
            // Swipe right -> Previous discipline
            const prevIndex = (currentIndex - 1 + disciplines.length) % disciplines.length;
            renderDiscipline(prevIndex, true);
            resetAutoSlide();
          }
        }
      }, { passive: true });
    }

    window._startShowcaseAutoSlide = startAutoSlide;
    window._stopShowcaseAutoSlide = stopAutoSlide;

    // Initial render (auto-slide starts only when user scrolls to Section 4)
    renderDiscipline(0, false);
  }

  // Float & Assemble Scroll Entrance Orchestration (faithfully matching video & site aesthetic)
  function initSectionAssembly() {
    const s3 = document.getElementById("section3");
    const s4 = document.getElementById("section4");
    const s5 = document.getElementById("section5");
    const s6 = document.getElementById("section6");
    const impactCard = document.getElementById("showcaseImpactCard");
    const quoteCard = document.getElementById("showcaseQuoteCard");
    const sections = [s3, s4, s5, s6].filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      sections.forEach((s) => {
        s.classList.add("is-assembled");
        s.classList.add("is-floating");
      });
      if (impactCard) impactCard.classList.add("box-entered");
      if (quoteCard) quoteCard.classList.add("box-entered");
      if (typeof window._startShowcaseAutoSlide === "function") {
        window._startShowcaseAutoSlide();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-assembled");
            if (entry.target === s4 && typeof window._startShowcaseAutoSlide === "function") {
              window._startShowcaseAutoSlide();
            }
            setTimeout(() => {
              if (entry.target.classList.contains("is-assembled")) {
                entry.target.classList.add("is-floating");
              }
            }, 1200);
          } else {
            // Reset when scrolling away so the elements re-occur each time we move to this section
            entry.target.classList.remove("is-assembled");
            entry.target.classList.remove("is-floating");
            if (entry.target === s4) {
              if (typeof window._stopShowcaseAutoSlide === "function") {
                window._stopShowcaseAutoSlide();
              }
              if (impactCard) impactCard.classList.remove("box-entered");
              if (quoteCard) quoteCard.classList.remove("box-entered");
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((sec) => {
      observer.observe(sec);
    });

    // Dedicated observer for the 2 right-side boxes in Section 4:
    // Ensures they dynamically occur from down & right side whenever moving/scrolling to that section
    const boxCards = [impactCard, quoteCard].filter(Boolean);
    if (boxCards.length > 0) {
      const boxesObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("box-entered");
            } else {
              entry.target.classList.remove("box-entered");
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
      );

      boxCards.forEach((card) => {
        boxesObserver.observe(card);
      });
    }
  }

  /* ==========================================================================
     9. SECTION 5 & 6: Interactive Experiences & Direct Reservation System
     ========================================================================== */
  function initExperiencesAndBooking() {
    const shootTypeSelect = document.getElementById("bookingShootType");
    const bookingForm = document.getElementById("bookingSessionForm");
    const btnFindExperience = document.getElementById("btnFindExperience");

    const cardsRow = document.getElementById("experiencesCardsRow");
    const scrubberTrack = document.getElementById("expScrubberTrack");
    const scrubberThumb = document.getElementById("expScrubberThumb");

    // Touch drag tracking for mobile side-scrolling disambiguation
    let hasDraggedExp = false;
    let expTouchStartX = 0;
    let expTouchStartY = 0;

    if (cardsRow) {
      cardsRow.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) {
          expTouchStartX = e.touches[0].clientX;
          expTouchStartY = e.touches[0].clientY;
          hasDraggedExp = false;
        }
      }, { passive: true });

      cardsRow.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - expTouchStartX);
          if (dx > 7) {
            hasDraggedExp = true;
          }
        }
      }, { passive: true });
    }

    // Click on any Experience card or notched round arrow button
    const expCards = document.querySelectorAll(".experience-card");
    expCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (hasDraggedExp) {
          hasDraggedExp = false;
          return;
        }

        // Switch active highlight
        expCards.forEach((c) => c.classList.remove("is-active"));
        card.classList.add("is-active");

        const service = card.getAttribute("data-service");
        if (shootTypeSelect && service) {
          shootTypeSelect.value = service;
        }

        // Scroll to reservation section only when tapping the round action button or deliberate tap
        const isRoundBtn = Boolean(e.target.closest(".exp-round-btn"));
        const s6 = document.getElementById("section6");
        if (s6 && isRoundBtn) {
          s6.scrollIntoView({ behavior: "smooth" });
          showToast(`Selected "${service}" — Complete your reservation below`);
        } else {
          showToast(`Selected "${service}"`);
        }
      });
    });

    // Horizontal slider scrubber sync
    if (cardsRow && scrubberTrack && scrubberThumb) {
      function updateScrubber() {
        const maxScroll = cardsRow.scrollWidth - cardsRow.clientWidth;
        if (maxScroll <= 4) {
          scrubberTrack.style.opacity = "0.3";
          return;
        }
        scrubberTrack.style.opacity = "1";
        const ratio = Math.max(0, Math.min(1, cardsRow.scrollLeft / maxScroll));
        const maxTranslate = scrubberTrack.clientWidth - scrubberThumb.clientWidth;
        scrubberThumb.style.transform = `translateX(${ratio * maxTranslate}px)`;
      }

      cardsRow.addEventListener("scroll", updateScrubber, { passive: true });
      window.addEventListener("resize", updateScrubber);
      setTimeout(updateScrubber, 300);

      // Touch scrubber drag & scrub
      function handleScrub(clientX) {
        const rect = scrubberTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const maxScroll = cardsRow.scrollWidth - cardsRow.clientWidth;
        cardsRow.scrollLeft = ratio * maxScroll;
      }

      scrubberTrack.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });

      scrubberTrack.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });

      // Click on scrubber track to scroll row
      scrubberTrack.addEventListener("click", (e) => {
        const rect = scrubberTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const maxScroll = cardsRow.scrollWidth - cardsRow.clientWidth;
        cardsRow.scrollTo({ left: ratio * maxScroll, behavior: "smooth" });
      });

      // Mouse drag-to-scroll for desktop
      let isDragging = false;
      let startX = 0;
      let startScrollLeft = 0;

      cardsRow.addEventListener("mousedown", (e) => {
        isDragging = true;
        hasDraggedExp = false;
        startX = e.pageX - cardsRow.offsetLeft;
        startScrollLeft = cardsRow.scrollLeft;
        cardsRow.style.cursor = "grabbing";
        cardsRow.style.userSelect = "none";
      });

      window.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          cardsRow.style.cursor = "grab";
          cardsRow.style.removeProperty("user-select");
        }
      });

      cardsRow.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const x = e.pageX - cardsRow.offsetLeft;
        const walk = (x - startX) * 1.4;
        if (Math.abs(walk) > 6) {
          hasDraggedExp = true;
        }
        cardsRow.scrollLeft = startScrollLeft - walk;
      });
    }

    // "Find Your Experience →" button
    if (btnFindExperience) {
      btnFindExperience.addEventListener("click", (e) => {
        e.preventDefault();
        const s6 = document.getElementById("section6");
        if (s6) {
          s6.scrollIntoView({ behavior: "smooth" });
        }
        const nameInput = document.getElementById("bookingName");
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 600);
        }
      });
    }

    // Direct Booking Form Submission
    if (bookingForm) {
      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("bookingName")?.value.trim();
        const phone = document.getElementById("bookingPhone")?.value.trim();
        const shootType = shootTypeSelect?.value;
        const date = document.getElementById("bookingDate")?.value;
        const message = document.getElementById("bookingMessage")?.value.trim();

        if (!name || !phone) {
          showToast("Please provide your name and phone / WhatsApp number");
          return;
        }
        if (!shootType) {
          showToast("Please select your desired shoot experience");
          return;
        }

        // Show cinematic success confirmation toast
        showToast(`✦ Thank you, ${name}! Your commission request for ${shootType} has been received. Julian Vane will reach out within 4 hours.`);
        bookingForm.reset();
      });
    }
  }

  // Central Power & Low-RAM Efficiency: Pause background video & animations when tab is hidden
  document.addEventListener("visibilitychange", () => {
    const heroVideo = document.getElementById("heroVideo");
    if (document.hidden) {
      if (heroVideo && !heroVideo.paused) {
        heroVideo.pause();
      }
      if (typeof window._stopShowcaseAutoSlide === "function") {
        window._stopShowcaseAutoSlide();
      }
    } else {
      if (heroVideo && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
      const s4 = document.getElementById("section4");
      if (s4 && s4.classList.contains("is-assembled") && typeof window._startShowcaseAutoSlide === "function") {
        window._startShowcaseAutoSlide();
      }
    }
  });

  /* ==========================================================================
     Routing: Atelier Main vs. Live Studio Drive Gallery (/studio-gallery)
     ========================================================================== */
  function initRouter() {
    function route() {
      const isGallery =
        window.location.pathname.startsWith("/studio-gallery") ||
        window.location.hash === "#/studio-gallery" ||
        window.location.search.includes("gallery=1");

      const main = document.getElementById("mainAtelierSite");
      const gallery = document.getElementById("studioGalleryApp");
      const video = document.querySelector(".video-background-wrap");
      const heroVideo = document.getElementById("heroVideo");

      if (isGallery) {
        if (main) main.style.display = "none";
        if (gallery) gallery.style.display = "block";
        if (video) video.style.display = "none";
        if (heroVideo && !heroVideo.paused) heroVideo.pause();
        document.title = "FRAMEHAUS — Live Studio Drive Gallery";
        window.scrollTo(0, 0);

        if (window.FramehausGallery && typeof window.FramehausGallery.refresh === "function") {
          window.FramehausGallery.refresh();
        }
      } else {
        if (main) main.style.display = "block";
        if (gallery) gallery.style.display = "none";
        if (video) video.style.display = "block";
        if (heroVideo && heroVideo.paused && !document.hidden) heroVideo.play().catch(() => {});
        document.title = "FRAMEHAUS — Stories Worth Remembering | Premium Photography Studio";
      }
    }

    window.addEventListener("popstate", route);
    window.addEventListener("hashchange", route);

    document.querySelectorAll('a[href="/studio-gallery"], a[href="#/studio-gallery"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState(null, "", "/studio-gallery");
        route();
      });
    });

    document.querySelectorAll(".btn-back-atelier").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState(null, "", "/");
        route();
      });
    });

    route();
  }

  /* ==========================================================================
     Low-RAM & Hardware Eco Engine
     - Auto-detects device capabilities (RAM <= 4GB, CPU <= 4, mobile, low-battery)
     - Dynamic user toggle with persistence
     - Pauses offscreen elements, lowers render overhead
     ========================================================================== */
  function initLowRamEngine() {
    const btnToggle = document.getElementById("btnLowRamToggle");
    const badge = document.getElementById("lowRamBadge");

    const isLowSpecHardware = Boolean(
      (navigator.deviceMemory && navigator.deviceMemory <= 1) ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );

    const savedPref = localStorage.getItem("framehaus_low_ram");
    let isLowRamActive = savedPref !== null ? savedPref === "true" : isLowSpecHardware;

    function applyLowRamMode(active) {
      isLowRamActive = active;
      if (active) {
        document.documentElement.classList.add("low-ram-mode");
        if (badge) badge.style.display = "inline-block";
        if (btnToggle) btnToggle.classList.add("eco-active");
        if (typeof window._stopShowcaseAutoSlide === "function") {
          window._stopShowcaseAutoSlide();
        }
      } else {
        document.documentElement.classList.remove("low-ram-mode");
        if (badge) badge.style.display = "none";
        if (btnToggle) btnToggle.classList.remove("eco-active");
        const s4 = document.getElementById("section4");
        if (s4 && s4.classList.contains("is-assembled") && typeof window._startShowcaseAutoSlide === "function") {
          window._startShowcaseAutoSlide();
        }
      }
      try {
        localStorage.setItem("framehaus_low_ram", String(active));
      } catch (_) {}
    }

    applyLowRamMode(isLowRamActive);

    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        applyLowRamMode(!isLowRamActive);
        showToast(
          isLowRamActive
            ? "⚡ Eco / Low RAM Mode Active (Smooth 60fps, Min Memory)"
            : "✦ High-Fidelity Glass Mode Active"
        );
      });
    }
  }

  // Initialize on DOMContentLoaded and immediately
  initHeroVideoAutoplay();
  initHeroScrollBlurEffect();
  initLowRamEngine();
  window.addEventListener("DOMContentLoaded", () => {
    initHeroVideoAutoplay();
    initHeroScrollBlurEffect();
    initLowRamEngine();
    initAmbientCanvas();
    initJournalGallery();
    initStudioShowcaseSlider();
    initSectionAssembly();
    initExperiencesAndBooking();
    initRouter();
  });

})();

