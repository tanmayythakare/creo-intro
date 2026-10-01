/* ==========================================================================
   Creo — High-Contrast Monochrome & Electric Purple Controller
   Integrated with:
   - Creo3DScene (Three.js WebGL Spatial Cyberspace Engine)
   - ASCII Logo Lab Engine (Init Glitch & Drop Dissolve from banner.go)
   - Interactive Terminal Simulator with Direct Typing & Auto-Demo
   - Live creo.yml Configurator matching Go schema (schema.go)
   - Synthesized Mechanical Web Audio FX & 4-Bar Equalizer
   - Raycast-Style Command Palette (Ctrl+K)
   ========================================================================== */

function initApp() {
  const toastNotice = document.getElementById('toastNotice');

  function showToast(msg) {
    if (!toastNotice) return;
    const textSpan = toastNotice.querySelector('.toast-text');
    if (textSpan) textSpan.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2500);
  }

  // ========================================================================
  // 0. Lenis Luxury Smooth Inertial Scrolling Engine (60/120fps Zero-Lag)
  // ========================================================================
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential luxury ease-out
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    } catch (_) {}
  }
  window.creoLenis = lenis;

  // ========================================================================
  // 1. Synthesized Mechanical Audio FX (Web Audio API)
  // ========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playKeyClick(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1450, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.035);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'enter') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(940, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'launch' || type === 'success') {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc.type = 'sine';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
        osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.38); // A6
        gain2.gain.setValueAtTime(0.04, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(audioCtx.destination);
        gain2.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.28);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.38);
      }

      // Animate Equalizer bars
      const soundEq = document.getElementById('soundEq');
      if (soundEq) {
        soundEq.classList.add('playing');
        clearTimeout(soundEq._timer);
        soundEq._timer = setTimeout(() => {
          soundEq.classList.remove('playing');
        }, type === 'launch' || type === 'success' ? 420 : 140);
      }
    } catch {
      // Audio not permitted, fail silently
    }
  }

  // Sound Toggle Control
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    const onIcon = soundToggleBtn.querySelector('.sound-on-icon');
    const offIcon = soundToggleBtn.querySelector('.sound-off-icon');

    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        onIcon.classList.remove('hidden');
        offIcon.classList.add('hidden');
        soundToggleBtn.title = 'Mute Audio FX';
        initAudio();
        playKeyClick('enter');
        showToast('Mechanical audio effects enabled');
      } else {
        onIcon.classList.add('hidden');
        offIcon.classList.remove('hidden');
        soundToggleBtn.title = 'Enable Audio FX';
        showToast('Audio effects muted');
      }
    });
  }

  // ========================================================================
  // 2. Initialize 3D WebGL Spatial Cyberspace Engine (Three.js + GSAP)
  // ========================================================================
  let scene3D = null;
  const viewport3D = document.getElementById('viewport3D');
  const hudInspector = document.getElementById('hudInspector');
  const inspTitle = document.getElementById('inspTitle');
  const inspDesc = document.getElementById('inspDesc');
  const inspMeta = document.getElementById('inspMeta');
  const inspDot = document.getElementById('inspDot');

  if (viewport3D) {
    if (window.CreoCyberspace) {
      scene3D = window.CreoCyberspace;
    } else if (typeof Creo3DScene === 'function') {
      try {
        scene3D = new Creo3DScene('viewport3D');
      } catch (e) {
        console.warn('Creo 3D WebGL initialization error:', e);
      }
    }

    if (scene3D) {
      // Update Inspector card on 3D hover
      scene3D.onNodeHover = (nodeData) => {
        if (!hudInspector) return;
        if (nodeData) {
          playKeyClick('click');
          if (inspTitle) inspTitle.textContent = nodeData.title;
          if (inspDesc) inspDesc.textContent = nodeData.roleDesc || `Managed microservice in Windows Terminal. Auto-detected manifest and allocated port.`;
          if (inspMeta) {
            inspMeta.innerHTML = `
              <span>Port: <strong>${nodeData.subtitle.split('·')[1] || ''}</strong></span>
              <span>PID: <strong>${nodeData.subtitle.split('·')[2] || ''}</strong></span>
              <span>Command: <code>${nodeData.cmd || ''}</code></span>
            `;
          }
          if (inspDot) {
            inspDot.style.background = nodeData.hexColor || '#ffffff';
          }
        } else {
          if (inspTitle) inspTitle.textContent = 'CREO ROOT ORCHESTRATOR';
          if (inspDesc) inspDesc.textContent = 'Central orchestrator. Resolves dependency graph from creo.yml and executes atomic wt.exe invocation across all 4 terminal tabs.';
          if (inspMeta) {
            inspMeta.innerHTML = `
              <span>Role: <strong>Master Controller</strong></span>
              <span>Status: <strong>4 Tabs Online</strong></span>
              <span>Command: <code>$ creo up</code></span>
            `;
          }
          if (inspDot) {
            inspDot.style.background = 'var(--purple-accent)';
          }
        }
      };

      scene3D.onNodeSelect = (nodeData) => {
        playKeyClick('enter');
        showToast(`Inspecting node: ${nodeData.title}`);
      };
    }
  }

  // 3D Camera Preset View Controls
  const hudButtons = document.querySelectorAll('.hud-btn:not(#btnToggleAscii)');
  hudButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick('click');
      hudButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const camType = btn.getAttribute('data-cam');
      if (!scene3D) return;

      if (camType === 'overview' || camType === 'reset') {
        scene3D.resetCamera();
      } else {
        const targetPod = scene3D.serviceNodes.find(p => p.userData.id === camType);
        if (targetPod) {
          scene3D.focusOnNode(targetPod);
        }
      }
    });
  });

  // ASCII Cyberpunk Shader Toggle
  const btnToggleAscii = document.getElementById('btnToggleAscii');
  let asciiModeActive = false;
  if (btnToggleAscii) {
    btnToggleAscii.addEventListener('click', () => {
      playKeyClick('enter');
      asciiModeActive = !asciiModeActive;
      if (scene3D && typeof scene3D.toggleAsciiMode === 'function') {
        scene3D.toggleAsciiMode(asciiModeActive);
      }
      
      if (asciiModeActive) {
        btnToggleAscii.textContent = '⬡ RETURN TO RAW 3D';
        btnToggleAscii.style.background = '#a855f7';
        btnToggleAscii.style.color = '#fff';
        showToast('ASCII Cyberpunk Shader engaged');
      } else {
        btnToggleAscii.textContent = '✦ ASCII CYBERPUNK MODE';
        btnToggleAscii.style.background = 'transparent';
        btnToggleAscii.style.color = '#a855f7';
        showToast('Raw 3D rendering restored');
      }
    });
  }

  // 3D "Launch Workspace (creo up)" Sequence
  const btnOrchestrate3D = document.getElementById('btnOrchestrate3D');
  const btnOrchestrate3DText = document.getElementById('btnOrchestrate3DText');
  if (btnOrchestrate3D) {
    btnOrchestrate3D.addEventListener('click', () => {
      playKeyClick('launch');
      showToast('Initiating Creo launch sequence across wt.exe...');
      
      if (btnOrchestrate3DText) {
        btnOrchestrate3DText.textContent = 'Orchestrating Windows Terminal tabs...';
      }

      if (window.gsap) {
        window.gsap.to(btnOrchestrate3D, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 });
      }

      if (scene3D) {
        scene3D.orchestrateLaunch(() => {
          showToast('All services online in Windows Terminal tabs!');
          if (btnOrchestrate3DText) {
            btnOrchestrate3DText.innerHTML = '<span class="badge-dot pulse-anim" style="background:#10b981;box-shadow:0 0 10px #10b981;margin-right:6px;"></span> Workspace Live (wt.exe Online)';
          }
          btnOrchestrate3D.classList.add('workspace-live');
        });
      }
    });
  }

  // Hero Quick Copy
  const heroQuickCopy = document.getElementById('heroQuickCopy');
  if (heroQuickCopy) {
    heroQuickCopy.addEventListener('click', async () => {
      playKeyClick('enter');
      const cmd = heroQuickCopy.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(cmd);
        playKeyClick('success');
        showToast('Scoop command copied to clipboard!');
      } catch (err) {
        console.error(err);
      }
    });
  }

  // ========================================================================
  // 3. The Iconic ASCII Logo Lab (Init Glitch & Drop Dissolve)
  // Derived directly from Creo CLI internal/ui/banner.go
  // ========================================================================
  const asciiLines = [
    " ██████╗██████╗ ███████╗ ██████╗",
    "██╔════╝██╔══██╗██╔════╝██╔═══██╗",
    "██║     ██████╔╝█████╗  ██║   ██║",
    "██║     ██╔══██╗██╔══╝  ██║   ██║",
    "╚██████╗██║  ██║███████╗╚██████╔╝",
    " ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝"
  ];
  const cleanAsciiArt = asciiLines.join("\n");
  const glitchChars = ['#', '@', '!', '%', '&', '/', '?', '~', '^', '*', '$', 'a', 'x', '7', '0', '1', '2'];
  const decayEarly = ['░', '▒', '·', '∙'];
  const decayLate = ['·', '.', ' ', ' '];
  const monochromeDecay = [
    "#ffffff", "#f5f5f5", // frames 0-1: pure white
    "#e5e5e5", "#d4d4d4", // frames 2-3: light gray
    "#a3a3a3", "#8b5cf6", // frames 4-5: gray & purple flash
    "#737373", "#525252", // frames 6-7: medium gray
    "#404040", "#333333", // frames 8-9: dark gray
    "#262626", "#1c1c1c", // frames 10-11: charcoal
    "#141414", "#0d0d0d", // frames 12-13: near-black
    "#080808", "#000000"  // frames 14-15: void
  ];

  const asciiArtCode = document.getElementById('asciiArtCode');
  const asciiSub1 = document.getElementById('asciiSub1');
  const asciiSub2 = document.getElementById('asciiSub2');
  const btnRunInitGlitch = document.getElementById('btnRunInitGlitch');
  const btnRunDropDissolve = document.getElementById('btnRunDropDissolve');
  const btnResetAscii = document.getElementById('btnResetAscii');

  let asciiAnimationTimer = null;
  let isAsciiAnimating = false;

  function renderCleanAscii() {
    if (!asciiArtCode) return;
    clearInterval(asciiAnimationTimer);
    isAsciiAnimating = false;
    asciiArtCode.textContent = cleanAsciiArt;
    asciiArtCode.style.color = "#ffffff";
    asciiArtCode.style.opacity = "1";
    if (asciiSub1) {
      asciiSub1.textContent = "  Welcome to Creo";
      asciiSub1.style.color = "var(--text-tertiary)";
    }
    if (asciiSub2) {
      asciiSub2.textContent = "  v0.4.0";
      asciiSub2.style.color = "var(--purple-accent)";
    }
  }

  // 12-Frame Init Glitch Animation
  function runInitGlitch(onComplete) {
    if (!asciiArtCode || isAsciiAnimating) return;
    isAsciiAnimating = true;
    clearInterval(asciiAnimationTimer);
    playKeyClick('click');

    const totalFrames = 12;
    let frame = 0;

    asciiAnimationTimer = setInterval(() => {
      const prob = 0.85 * (1.0 - frame / totalFrames);

      let output = "";
      for (let l = 0; l < asciiLines.length; l++) {
        const line = asciiLines[l];
        let lineOut = "";
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === ' ') {
            lineOut += ' ';
          } else if (Math.random() < prob) {
            lineOut += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          } else {
            lineOut += char;
          }
        }
        output += lineOut + (l < asciiLines.length - 1 ? "\n" : "");
      }

      asciiArtCode.textContent = output;
      asciiArtCode.style.color = frame < totalFrames - 2 ? "var(--text-secondary)" : "#ffffff";

      if (asciiSub1) {
        asciiSub1.textContent = "  Welcome to Creo";
        asciiSub1.style.color = "var(--text-tertiary)";
      }
      if (asciiSub2) {
        asciiSub2.textContent = "  v0.4.0";
        asciiSub2.style.color = frame % 2 === 0 ? "var(--purple-bright)" : "var(--text-tertiary)";
      }

      frame++;
      if (frame >= totalFrames) {
        clearInterval(asciiAnimationTimer);
        isAsciiAnimating = false;
        renderCleanAscii();
        playKeyClick('enter');
        if (onComplete) onComplete();
      }
    }, 100);
  }

  // 16-Stage Drop Dissolve Animation
  function runDropDissolve(onComplete) {
    if (!asciiArtCode || isAsciiAnimating) return;
    isAsciiAnimating = true;
    clearInterval(asciiAnimationTimer);
    playKeyClick('click');

    const totalFrames = 16;
    let frame = 0;

    asciiAnimationTimer = setInterval(() => {
      let prob;
      if (frame <= 5) {
        prob = 0.15 * (frame + 1) / 5.0;
      } else if (frame <= 11) {
        prob = 0.3 + 0.5 * (frame - 6) / 5.0;
      } else {
        prob = 0.85 + 0.15 * (frame - 12) / 3.0;
      }

      const color = monochromeDecay[Math.min(frame, monochromeDecay.length - 1)];
      const decayChars = frame >= 8 ? decayLate : decayEarly;

      let output = "";
      for (let l = 0; l < asciiLines.length; l++) {
        const line = asciiLines[l];
        let lineOut = "";
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === ' ') {
            lineOut += ' ';
          } else if (Math.random() < prob) {
            if (frame >= 13) {
              lineOut += ' ';
            } else {
              lineOut += decayChars[Math.floor(Math.random() * decayChars.length)];
            }
          } else {
            lineOut += char;
          }
        }
        output += lineOut + (l < asciiLines.length - 1 ? "\n" : "");
      }

      asciiArtCode.textContent = output;
      asciiArtCode.style.color = color;

      if (frame < 12) {
        const dots = frame >= 8 ? ".".repeat(frame - 7) : "...";
        if (asciiSub1) {
          asciiSub1.textContent = `  Dropping Creo${dots}`;
          asciiSub1.style.color = color;
        }
        if (asciiSub2) {
          asciiSub2.textContent = "  Teardown in progress";
          asciiSub2.style.color = color;
        }
      } else {
        if (asciiSub1) asciiSub1.textContent = "";
        if (asciiSub2) asciiSub2.textContent = "";
      }

      frame++;
      if (frame >= totalFrames) {
        clearInterval(asciiAnimationTimer);
        isAsciiAnimating = false;
        asciiArtCode.textContent = "\n\n  [ Creo environment dropped. Zero orphaned ports. ]\n\n";
        asciiArtCode.style.color = "var(--green-accent)";
        playKeyClick('success');
        if (onComplete) onComplete();
      }
    }, 90);
  }

  // ========================================================================
  // Section 02: 3D Halftone Monolith Wordmark Studio (C · R · E · O)
  // ========================================================================
  const asciiSection = document.getElementById('ascii-lab');
  const ditherCanvas = document.getElementById('ditherCanvas');
  const btnDitherHalftone = document.getElementById('btnDitherHalftone');
  const activeDitherModeText = document.getElementById('activeDitherModeText');
  const themeStatusText = document.getElementById('themeStatusText');
  const themeStatusDot = document.getElementById('themeStatusDot');

  let ditherStudioInstance = null;

  function initDitherStudio() {
    if (ditherStudioInstance || !ditherCanvas) return;
    if (typeof window.createDitheredObject === 'function') {
      ditherStudioInstance = window.createDitheredObject({
        canvas: ditherCanvas,
      }, {
        srcs: [
          'assets/brand-glyph-solid.svg',
          'assets/creo-r.svg',
          'assets/creo-e.svg',
          'assets/creo-o.svg',
        ],
        srcsWhite: [
          'assets/brand-glyph-solid-white.svg',
          'assets/creo-r-white.svg',
          'assets/creo-e-white.svg',
          'assets/creo-o-white.svg',
        ],
        method: 'halftone',
        gridSize: 3.5,
        highlight: '#c084fc',
        autoRotate: false,
      });
    }
  }

  if (typeof window.createDitheredObject === 'function') {
    initDitherStudio();
  } else {
    window.addEventListener('creo:dither-ready', initDitherStudio, { once: true });
  }

  // Halftone Shader Mode
  if (btnDitherHalftone) {
    btnDitherHalftone.addEventListener('click', () => {
      playKeyClick('click');
      showToast('3D Dither Shader: Halftone Dots Active');
    });
  }

  // IntersectionObserver to pause/resume WebGL rendering when offscreen
  if (asciiSection) {
    const cyberLabObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (ditherStudioInstance) ditherStudioInstance.start();
        } else {
          if (ditherStudioInstance) ditherStudioInstance.stop();
        }
      });
    }, { threshold: 0.12 });
    cyberLabObserver.observe(asciiSection);
  }

  // Easter Egg: Type "creo" on keyboard anytime to trigger terminal glitch and convert to White ASCII Logo!
  const terminalWhiteOverlay = document.getElementById('terminalWhiteOverlay');
  const ditherCanvasElement = document.getElementById('ditherCanvas');
  const ditherHintOverlay = document.getElementById('ditherHintOverlay');
  let keySequence = '';
  let isWhiteTheme = false;
  let isTransitioningMode = false;

  function switchToWhiteTerminal() {
    if (isTransitioningMode || isWhiteTheme) return;
    isTransitioningMode = true;
    isWhiteTheme = true;
    playKeyClick('enter');

    // 1. 3D canvas glitch effect
    if (ditherCanvasElement) {
      ditherCanvasElement.classList.add('glitch-fading');
    }

    // 2. Reveal White Terminal Overlay and trigger terminal decipher animation
    if (terminalWhiteOverlay) {
      terminalWhiteOverlay.classList.add('active');
    }

    if (ditherHintOverlay) {
      ditherHintOverlay.innerHTML = '<span>Terminal Runtime Active · Click screen or type "creo" to return to 3D Halftone</span>';
    }

    if (themeStatusText) {
      themeStatusText.textContent = 'White Terminal ASCII';
    }
    if (themeStatusDot) {
      themeStatusDot.className = 'tiny-dot white';
      themeStatusDot.style.background = '#ffffff';
    }

    showToast('Easter Egg: Terminal Glitch → White Creo Wordmark!');

    // 3. Run the authentic terminal scramble decipher glitch across frames
    runInitGlitch(() => {
      isTransitioningMode = false;
    });
  }

  function switchToHalftone3D() {
    if (isTransitioningMode || !isWhiteTheme) return;
    isTransitioningMode = true;
    isWhiteTheme = false;
    playKeyClick('click');

    // Run terminal dissolve animation before restoring 3D
    runDropDissolve(() => {
      if (terminalWhiteOverlay) {
        terminalWhiteOverlay.classList.remove('active');
      }
      if (ditherCanvasElement) {
        ditherCanvasElement.classList.remove('glitch-fading');
      }

      // Reset clean ASCII for next toggle
      renderCleanAscii();

      if (ditherHintOverlay) {
        ditherHintOverlay.innerHTML = '<span>Floating Inertia · Staggered Buoyancy · Type "creo" for Easter Egg</span>';
      }

      if (themeStatusText) {
        themeStatusText.textContent = 'Neon Violet';
      }
      if (themeStatusDot) {
        themeStatusDot.className = 'tiny-dot purple';
        themeStatusDot.style.background = '#c084fc';
      }

      showToast('3D Halftone Monolith Restored!');
      isTransitioningMode = false;
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    keySequence = (keySequence + e.key.toLowerCase()).slice(-4);
    if (keySequence === 'creo' || (e.key === 'Enter' && window.location.hash === '#ascii-lab')) {
      if (!isWhiteTheme) {
        switchToWhiteTerminal();
      } else {
        switchToHalftone3D();
      }
      keySequence = '';
    }
  });

  if (terminalWhiteOverlay) {
    terminalWhiteOverlay.addEventListener('click', () => {
      if (isWhiteTheme && !isTransitioningMode) {
        switchToHalftone3D();
      }
    });
  }

  if (btnRunInitGlitch) {
    btnRunInitGlitch.addEventListener('click', () => {
      runInitGlitch(() => showToast('Init Glitch completed'));
    });
  }

  if (btnRunDropDissolve) {
    btnRunDropDissolve.addEventListener('click', () => {
      runDropDissolve(() => showToast('Drop Dissolve completed'));
    });
  }

  if (btnResetAscii) {
    btnResetAscii.addEventListener('click', () => {
      playKeyClick('click');
      renderCleanAscii();
      showToast('Logo reset to clean state');
    });
  }

  // ========================================================================
  // 4. Interactive Live creo.yml Configurator
  // Matches real Creo Go CLI schema from internal/config/schema.go
  // ========================================================================
  const configState = {
    frontend: 'vite',
    backend: 'go',
    databases: ['postgres', 'redis']
  };

  const stackDetails = {
    frontend: {
      vite: { key: 'frontend', name: 'Frontend (Vite)', path: 'web', cmd: 'npm run dev', port: 4200, tab: 'UI (:4200)' },
      next: { key: 'frontend', name: 'Frontend (Next.js)', path: 'frontend', cmd: 'npm run dev', port: 3000, tab: 'Next.js (:3000)' },
      angular: { key: 'frontend', name: 'Client (Angular)', path: 'client', cmd: 'ng serve', port: 4200, tab: 'Angular (:4200)' },
      svelte: { key: 'frontend', name: 'UI (SvelteKit)', path: 'src/ui', cmd: 'npm run dev', port: 5173, tab: 'SvelteKit (:5173)' }
    },
    backend: {
      go: { key: 'backend', name: 'Backend API (Go)', path: 'api', cmd: 'go run main.go', port: 8080, tab: 'Go API (:8080)' },
      spring: { key: 'backend', name: 'API (Spring Boot)', path: 'backend', cmd: './mvnw spring-boot:run', port: 8080, tab: 'Spring Boot (:8080)' },
      fastapi: { key: 'backend', name: 'Server (FastAPI)', path: 'server', cmd: 'uvicorn main:app --reload', port: 8000, tab: 'FastAPI (:8000)' },
      nest: { key: 'backend', name: 'Core (NestJS)', path: 'services/api', cmd: 'npm run start:dev', port: 3001, tab: 'NestJS (:3001)' }
    },
    database: {
      postgres: { key: 'database', name: 'PostgreSQL', path: 'infra', cmd: 'docker compose up postgres', port: 5432, tab: 'PostgreSQL (:5432)' },
      redis: { key: 'cache', name: 'Redis Cache', path: 'infra', cmd: 'docker compose up redis', port: 6379, tab: 'Redis (:6379)' },
      docker: { key: 'mesh', name: 'Docker Mesh', path: '.', cmd: 'docker compose up', port: 9000, tab: 'Docker Mesh' }
    }
  };

  const yamlCodeView = document.getElementById('yamlCodeView');
  const wtLivePreview = document.getElementById('wtLivePreview');
  const wtDynamicTabs = document.getElementById('wtDynamicTabs');
  const wtDynamicBody = document.getElementById('wtDynamicBody');
  const btnShowYaml = document.getElementById('btnShowYaml');
  const btnShowWt = document.getElementById('btnShowWt');
  const copyConfigYamlBtn = document.getElementById('copyConfigYamlBtn');

  function updateConfiguratorUI() {
    const f = stackDetails.frontend[configState.frontend];
    const b = stackDetails.backend[configState.backend];
    const dbs = configState.databases.map(k => stackDetails.database[k]).filter(Boolean);

    let yaml = `project:\n  name: my-app\n\nservices:\n`;
    yaml += `  ${f.key}:\n    path: ${f.path}\n    command: ${f.cmd}\n`;
    yaml += `  ${b.key}:\n    path: ${b.path}\n    command: ${b.cmd}\n`;
    dbs.forEach(d => {
      yaml += `  ${d.key}:\n    path: ${d.path}\n    command: ${d.cmd}\n`;
    });

    yaml += `\nworkflows:\n  dev:\n`;
    yaml += `    - ${f.key}\n    - ${b.key}\n`;
    dbs.forEach(d => {
      yaml += `    - ${d.key}\n`;
    });

    if (yamlCodeView) {
      yamlCodeView.textContent = yaml.trim();
    }

    if (wtDynamicTabs && wtDynamicBody) {
      wtDynamicTabs.innerHTML = '';
      const allServices = [f, b, ...dbs];

      allServices.forEach((svc, idx) => {
        const tab = document.createElement('div');
        tab.className = `wt-live-tab ${idx === 0 ? 'active' : ''}`;
        tab.innerHTML = `<span class="tiny-dot green"></span> <span>${svc.tab}</span>`;
        tab.addEventListener('click', () => {
          playKeyClick('click');
          wtDynamicTabs.querySelectorAll('.wt-live-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          renderWtTabLogs(svc);
        });
        wtDynamicTabs.appendChild(tab);
      });

      renderWtTabLogs(allServices[0]);
    }
  }

  function renderWtTabLogs(svc) {
    if (!wtDynamicBody || !svc) return;
    wtDynamicBody.innerHTML = `
      <div class="wt-log-line" style="color:#ffffff;">Tab: <strong>${svc.tab}</strong> in directory <code>./${svc.path}</code></div>
      <div class="wt-log-line" style="color:var(--text-tertiary); margin: 6px 0;">Invocation: <code>wt.exe -w 0 nt -d "./${svc.path}" -t "${svc.tab}" cmd /k "${svc.cmd}"</code></div>
      <div class="wt-log-line"><span class="t-green">✔</span> Pre-flight check: Target port :${svc.port} available.</div>
      <div class="wt-log-line"><span class="t-green">✔</span> Service active and recorded in <code>.creo/pids.json</code></div>
    `;
  }

  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      playKeyClick('click');
      const type = chip.getAttribute('data-type');
      const val = chip.getAttribute('data-val');

      if (type === 'frontend') {
        document.querySelectorAll('#frontendChips .chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        configState.frontend = val;
      } else if (type === 'backend') {
        document.querySelectorAll('#backendChips .chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        configState.backend = val;
      } else if (type === 'database') {
        chip.classList.toggle('active');
        if (configState.databases.includes(val)) {
          configState.databases = configState.databases.filter(d => d !== val);
        } else {
          configState.databases.push(val);
        }
      }
      updateConfiguratorUI();
    });
  });

  if (btnShowYaml && btnShowWt && yamlCodeView && wtLivePreview) {
    btnShowYaml.addEventListener('click', () => {
      playKeyClick('click');
      btnShowYaml.classList.add('active');
      btnShowWt.classList.remove('active');
      yamlCodeView.classList.remove('hidden');
      wtLivePreview.classList.add('hidden');
    });

    btnShowWt.addEventListener('click', () => {
      playKeyClick('click');
      btnShowWt.classList.add('active');
      btnShowYaml.classList.remove('active');
      yamlCodeView.classList.add('hidden');
      wtLivePreview.classList.remove('hidden');
    });
  }

  if (copyConfigYamlBtn && yamlCodeView) {
    copyConfigYamlBtn.addEventListener('click', async () => {
      playKeyClick('enter');
      try {
        await navigator.clipboard.writeText(yamlCodeView.textContent);
        playKeyClick('success');
        showToast('creo.yml copied to clipboard!');
        const span = copyConfigYamlBtn.querySelector('span');
        if (span) span.textContent = 'Copied!';
        setTimeout(() => { if (span) span.textContent = 'Copy YAML'; }, 2000);
      } catch (err) {
        console.error(err);
      }
    });
  }

  updateConfiguratorUI();

  // ========================================================================
  // 5. Interactive CLI Terminal Simulator (Conflict-Free & Animated)
  // ========================================================================
  const cmdTabs = document.querySelectorAll('.cmd-tab');
  const demoScreen = document.getElementById('demoScreen');
  const terminalInput = document.getElementById('terminalInteractiveInput');
  const terminalExecBtn = document.getElementById('terminalExecBtn');

  // Terminal Execution Controller & Collision-Prevention Engine
  let terminalExecToken = 0;
  let activeTerminalTimers = [];
  let isAutoPlaying = false;
  let autoPlayToken = 0;

  function cancelTerminalExecution() {
    terminalExecToken++;
    autoPlayToken++;
    isAutoPlaying = false;

    activeTerminalTimers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    activeTerminalTimers = [];

    const autoBtn = document.getElementById('autoDemoBtn');
    if (autoBtn) {
      autoBtn.disabled = false;
      autoBtn.classList.remove('active');
      autoBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right:2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Auto-Play Simulation';
    }
  }

  function addTerminalTimer(fn, delayMs) {
    const currentToken = terminalExecToken;
    const id = setTimeout(() => {
      if (currentToken !== terminalExecToken) return;
      fn();
    }, delayMs);
    activeTerminalTimers.push(id);
    return id;
  }

  function appendTerminalLine(htmlContent) {
    if (!demoScreen) return null;
    const div = document.createElement('div');
    div.className = 'd-line';
    div.innerHTML = htmlContent;
    demoScreen.appendChild(div);
    demoScreen.scrollTop = demoScreen.scrollHeight;
    return div;
  }

  // Pre-defined static scenarios (Status, Up, Restart, Stop, Doctor)
  const demoScenarios = {
    up: [
      { html: '<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo up</strong>' },
      { html: '<span style="color:#71717a;">Parsing declarative workspace schema from creo.yml...</span>' },
      { html: '<span class="t-green">✔</span> Pre-flight checks: Ports 4200, 8080, 5432 verified available' },
      { html: '<span class="t-purple">➜</span> Synthesizing Windows Terminal wt.exe invocation commands...' },
      { html: '<span class="t-green">✔</span> Tab 1: frontend [npm run dev] on :4200 (PID 14280)' },
      { html: '<span class="t-green">✔</span> Tab 2: backend [go run main.go] on :8080 (PID 19844)' },
      { html: '<span class="t-green">✔</span> Tab 3: database [docker compose up] on :5432 (PID 8412)' },
      { html: '<span class="t-green">✔</span> Transactional PID table saved to .creo/pids.json' },
      { html: '<span class="t-green">✔</span> <span style="color:#ffffff; font-weight:700;">All 3 services booted in 162ms. Windows Terminal active.</span>' },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ],
    status: [
      { html: '<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo status</strong>' },
      { html: '<span style="color:#71717a;">Querying active process registry in .creo/pids.json...</span>' },
      { html: '<span style="color:#525252;">┌──────────────────┬──────────┬──────────┬──────────────┐</span>' },
      { html: '<span style="color:#525252;">│</span> <strong style="color:#ffffff;">SERVICE</strong>          <span style="color:#525252;">│</span> <strong style="color:#ffffff;">PID</strong>      <span style="color:#525252;">│</span> <strong style="color:#ffffff;">PORT</strong>     <span style="color:#525252;">│</span> <strong style="color:#ffffff;">STATUS</strong>       <span style="color:#525252;">│</span>' },
      { html: '<span style="color:#525252;">├──────────────────┼──────────┼──────────┼──────────────┤</span>' },
      { html: '<span style="color:#525252;">│</span> frontend         <span style="color:#525252;">│</span> 14280    <span style="color:#525252;">│</span> :4200    <span style="color:#525252;">│</span> <span class="t-green">ONLINE (42m)</span> <span style="color:#525252;">│</span>' },
      { html: '<span style="color:#525252;">│</span> backend          <span style="color:#525252;">│</span> 19844    <span style="color:#525252;">│</span> :8080    <span style="color:#525252;">│</span> <span class="t-green">ONLINE (42m)</span> <span style="color:#525252;">│</span>' },
      { html: '<span style="color:#525252;">│</span> database         <span style="color:#525252;">│</span> 8412     <span style="color:#525252;">│</span> :5432    <span style="color:#525252;">│</span> <span class="t-green">ONLINE (42m)</span> <span style="color:#525252;">│</span>' },
      { html: '<span style="color:#525252;">└──────────────────┴──────────┴──────────┴──────────────┘</span>' },
      { html: '<span class="t-purple">➜</span> Memory: 218 MB total | Windows Terminal Session: Connected' },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ],
    restart: [
      { html: '<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo restart backend</strong>' },
      { html: '<span style="color:#71717a;">Looking up service \'backend\' in active PID table...</span>' },
      { html: '<span class="t-green">✔</span> Found running instance (PID: 19844 on port 8080)' },
      { html: '<span class="t-purple">➜</span> Dispatching graceful termination signal (SIGTERM)...' },
      { html: '<span class="t-green">✔</span> Process 19844 exited cleanly (0 exit code)' },
      { html: '<span class="t-purple">➜</span> Re-launching service in target tab: <span style="color:#ffffff;">go run main.go</span>' },
      { html: '<span class="t-green">✔</span> Re-registered new PID: 24190 in .creo/pids.json' },
      { html: '<span class="t-green">✔</span> <span style="color:#ffffff; font-weight:700;">Service \'backend\' restarted successfully in 142ms.</span>' },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ],
    stop: [
      { html: '<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo stop</strong>' },
      { html: '<span style="color:#71717a;">Reading registered processes from .creo/pids.json...</span>' },
      { html: '<span class="t-purple">➜</span> Terminating frontend (PID 14280)... <span class="t-green">Done</span>' },
      { html: '<span class="t-purple">➜</span> Terminating backend (PID 19844)... <span class="t-green">Done</span>' },
      { html: '<span class="t-purple">➜</span> Terminating database (PID 8412)... <span class="t-green">Done</span>' },
      { html: '<span class="t-green">✔</span> All 3 background service trees stopped gracefully.' },
      { html: '<span class="t-green">✔</span> Cleared temporary PID table. Zero orphaned ports remaining.' },
      { html: '<span class="t-green">✔</span> <span style="color:#ffffff; font-weight:700;">Environment cleanly stopped in 94ms.</span>' },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ],
    doctor: [
      { html: '<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo doctor</strong>' },
      { html: '<span style="color:#71717a;">Running diagnostic environment check...</span>' },
      { html: '<span class="t-green">✔</span> Host OS: <span style="color:#ffffff;">Windows 11 (build 22631, amd64)</span>' },
      { html: '<span class="t-green">✔</span> Windows Terminal: <span style="color:#ffffff;">wt.exe v1.19+ located in PATH</span>' },
      { html: '<span class="t-green">✔</span> Go Toolchain: <span style="color:#ffffff;">go1.23+ runtime verified</span>' },
      { html: '<span class="t-green">✔</span> Port 4200 (Frontend): <span class="t-green">AVAILABLE</span>' },
      { html: '<span class="t-green">✔</span> Port 8080 (Backend API): <span class="t-green">AVAILABLE</span>' },
      { html: '<span class="t-green">✔</span> Port 5432 (PostgreSQL): <span class="t-green">AVAILABLE</span>' },
      { html: '<span class="t-green">✔</span> <span style="color:#ffffff; font-weight:700;">All systems operational. Ready for instant orchestration.</span>' },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ]
  };

  // 1. Signature Creo Init Animation (Animated Purple Glitch & Repository Detection)
  function renderInitScenario() {
    if (!demoScreen) return;
    demoScreen.innerHTML = '';

    appendTerminalLine('<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo init</strong>');

    // ASCII wrapper & pre
    const asciiWrap = document.createElement('div');
    asciiWrap.className = 'demo-ascii-wrap';
    const asciiPre = document.createElement('pre');
    asciiPre.className = 'demo-ascii-block';
    asciiWrap.appendChild(asciiPre);
    demoScreen.appendChild(asciiWrap);

    const termBannerLines = [
      " ██████╗██████╗ ███████╗ ██████╗",
      "██╔════╝██╔══██╗██╔════╝██╔═══██╗",
      "██║     ██████╔╝█████╗  ██║   ██║",
      "██║     ██╔══██╗██╔══╝  ██║   ██║",
      "╚██████╗██║  ██║███████╗╚██████╔╝",
      " ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝"
    ];
    const glitchGlyphs = "░▒▓█║╗╔═█01!#%&*+=@";

    // Smooth 12-frame probabilistic glitch decay in ANSI 99 purple (~720ms)
    const totalFrames = 12;
    for (let f = 0; f < totalFrames; f++) {
      addTerminalTimer(() => {
        if (f === totalFrames - 1) {
          // Locked clean purple banner
          asciiPre.textContent = termBannerLines.join('\n');
          asciiPre.style.color = '#a78bfa';
          asciiPre.style.textShadow = '0 0 14px rgba(167, 139, 250, 0.75), 0 0 25px rgba(139, 92, 246, 0.4)';
          playKeyClick('enter');
        } else {
          const prob = f / (totalFrames - 1);
          const glitched = termBannerLines.map(line => {
            return line.split('').map(ch => {
              if (ch === ' ') return ' ';
              return Math.random() < prob ? ch : glitchGlyphs[Math.floor(Math.random() * glitchGlyphs.length)];
            }).join('');
          }).join('\n');
          asciiPre.textContent = glitched;
          asciiPre.style.color = (f % 2 === 0) ? '#c084fc' : '#a78bfa';
        }
        demoScreen.scrollTop = demoScreen.scrollHeight;
      }, f * 60);
    }

    const baseGlitchDelay = totalFrames * 60; // 720ms

    // Post-glitch lines: metadata and repository scan (Comfortable, deliberate reading pacing)
    const postLines = [
      { delay: baseGlitchDelay + 120, html: '<div class="demo-ascii-meta">  Welcome to Creo  <span class="ver">v0.4.0</span></div>' },
      { delay: baseGlitchDelay + 300, html: '<span class="t-green">✓</span> <span style="color:#ffffff;">scanning repository</span>' },
      { delay: baseGlitchDelay + 460, html: '<span style="color:#a1a1aa;">  found 3 services:</span>' },
      { delay: baseGlitchDelay + 620, html: '    <span class="t-purple">●</span> <span style="color:#ffffff; font-weight:600;">frontend</span>      <span style="color:#71717a;">web</span>           <span style="color:#a78bfa;">npm run dev</span>' },
      { delay: baseGlitchDelay + 780, html: '    <span class="t-purple">●</span> <span style="color:#ffffff; font-weight:600;">backend</span>       <span style="color:#71717a;">api</span>           <span style="color:#a78bfa;">go run main.go</span>' },
      { delay: baseGlitchDelay + 940, html: '    <span class="t-purple">●</span> <span style="color:#ffffff; font-weight:600;">database</span>      <span style="color:#71717a;">infra</span>         <span style="color:#a78bfa;">docker compose up</span>' },
      { delay: baseGlitchDelay + 1140, html: '<span class="t-green">✓</span> <strong style="color:#ffffff;">created creo.yml</strong> — run <span class="t-purple" style="font-weight:700;">creo dev</span> to start all services' },
      { delay: baseGlitchDelay + 1320, html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ];

    postLines.forEach(item => {
      addTerminalTimer(() => {
        appendTerminalLine(item.html);
      }, item.delay);
    });
  }

  // 2. Signature Creo Drop Animation (Authentic 16-Frame Dissolve from banner.go)
  function renderDropScenario() {
    if (!demoScreen) return;
    demoScreen.innerHTML = '';

    appendTerminalLine('<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">creo drop</strong>');
    appendTerminalLine('<span style="color:#ef4444; font-weight:600;">[!] Drop Creo from this project? This cannot be undone. [y/N]: y</span>');

    // ASCII wrapper & pre block matching init scenario
    const asciiWrap = document.createElement('div');
    asciiWrap.className = 'demo-ascii-wrap';
    const asciiPre = document.createElement('pre');
    asciiPre.className = 'demo-ascii-block demo-dissolve-block';
    asciiWrap.appendChild(asciiPre);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'demo-ascii-meta';
    metaDiv.textContent = '  Dropping Creo...';
    asciiWrap.appendChild(metaDiv);

    demoScreen.appendChild(asciiWrap);

    const termBannerLines = [
      " ██████╗██████╗ ███████╗ ██████╗",
      "██╔════╝██╔══██╗██╔════╝██╔═══██╗",
      "██║     ██████╔╝█████╗  ██║   ██║",
      "██║     ██╔══██╗██╔══╝  ██║   ██║",
      "╚██████╗██║  ██║███████╗╚██████╔╝",
      " ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝"
    ];

    const decayEarly = ['░', '▒', '·', '∙'];
    const decayLate = ['·', '.', ' ', ' '];
    const colorStages = [
      '#c084fc', '#c084fc', // 0-1: bold purple
      '#a78bfa', '#a78bfa', // 2-3: medium purple
      '#9333ea', '#8b5cf6', // 4-5: desaturating mauve
      '#7c3aed', '#6d28d9', // 6-7: dark violet
      '#71717a', '#52525b', // 8-9: medium gray
      '#3f3f46', '#27272a', // 10-11: dark charcoal
      '#18181b', '#18181b', // 12-13: near-black
      '#09090b', '#000000'  // 14-15: void
    ];

    const totalFrames = 16;
    const frameDelay = 75; // 75ms * 16 = 1200ms smooth decay

    for (let frame = 0; frame < totalFrames; frame++) {
      addTerminalTimer(() => {
        let prob;
        if (frame <= 5) {
          prob = 0.15 * (frame + 1) / 5.0;
        } else if (frame <= 11) {
          prob = 0.30 + 0.50 * (frame - 6) / 5.0;
        } else {
          prob = 0.85 + 0.15 * (frame - 12) / 3.0;
        }

        const color = colorStages[frame] || '#000000';
        const decayRunes = frame >= 8 ? decayLate : decayEarly;

        const dissolvedText = termBannerLines.map(line => {
          return line.split('').map(ch => {
            if (ch === ' ') return ' ';
            if (Math.random() < prob) {
              return frame >= 13 ? ' ' : decayRunes[Math.floor(Math.random() * decayRunes.length)];
            }
            return ch;
          }).join('');
        }).join('\n');

        asciiPre.textContent = dissolvedText;
        asciiPre.style.color = color;
        asciiPre.style.textShadow = frame < 8 ? `0 0 ${12 - frame}px rgba(167, 139, 250, ${(1 - frame / 16) * 0.5})` : 'none';

        if (frame < 12) {
          const dots = frame >= 8 ? "·".repeat(frame - 7) : "...";
          metaDiv.textContent = `  Dropping Creo${dots}`;
          metaDiv.style.color = color;
        } else {
          metaDiv.textContent = '';
        }

        if (frame % 3 === 0) playKeyClick('click');
        demoScreen.scrollTop = demoScreen.scrollHeight;
      }, frame * frameDelay);
    }

    // Teardown Summary output sequence
    const teardownDelay = totalFrames * frameDelay + 100;
    const dropLines = [
      { delay: teardownDelay + 80, html: '<span class="t-green">✔</span> <span style="color:#ffffff;">Stopped 3 active background services (PID 14280, 19844, 8412)</span>' },
      { delay: teardownDelay + 260, html: '<span class="t-green">✔</span> <span style="color:#ffffff;">Removed creo.yml configuration</span>' },
      { delay: teardownDelay + 440, html: '<span class="t-green">✔</span> <span style="color:#ffffff;">Cleaned .creo/ process registry &amp; socket locks</span>' },
      { delay: teardownDelay + 660, html: '<span class="t-purple" style="font-weight:700;">Creo has been dropped from this project.</span> <span style="color:#71717a;">(Zero leftover files)</span>' },
      { delay: teardownDelay + 880, html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ];

    dropLines.forEach(item => {
      addTerminalTimer(() => {
        appendTerminalLine(item.html);
        playKeyClick('enter');
      }, item.delay);
    });
  }

  // 3. Generic Scenario Line Renderer
  function renderGenericScenario(lines) {
    if (!demoScreen || !lines) return;
    demoScreen.innerHTML = '';

    lines.forEach((lineObj, idx) => {
      addTerminalTimer(() => {
        appendTerminalLine(lineObj.html);
      }, idx * 36);
    });
  }

  // Master Scenario Dispatcher (Handles button clicks, direct typing, and auto-play)
  function executeTerminalScenario(cmdName) {
    // 1. Instantly abort any ongoing animation, timer, or auto-play
    cancelTerminalExecution();

    // 2. Synchronize active state on tabs
    cmdTabs.forEach(t => {
      if (t.getAttribute('data-cmd') === cmdName) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // 3. Dispatch specific command
    if (cmdName === 'init') {
      renderInitScenario();
    } else if (cmdName === 'drop') {
      renderDropScenario();
    } else if (demoScenarios[cmdName]) {
      renderGenericScenario(demoScenarios[cmdName]);
      if (cmdName === 'up' && scene3D) {
        scene3D.orchestrateLaunch();
      }
    }
  }

  // Tab click listeners with zero-conflict dispatch
  cmdTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cmd = tab.getAttribute('data-cmd');
      if (!cmd) return; // autoDemoBtn handled separately
      playKeyClick('enter');
      executeTerminalScenario(cmd);
    });
  });

  // Initial clean render
  executeTerminalScenario('status');

  // Direct Interactive Shell Typing
  const cmdHistory = [];
  let historyIdx = -1;

  function executeCustomInput() {
    if (!terminalInput) return;
    const inputVal = terminalInput.value.trim();
    if (!inputVal) return;

    playKeyClick('enter');
    cmdHistory.push(inputVal);
    historyIdx = cmdHistory.length;
    terminalInput.value = '';

    const lower = inputVal.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      cancelTerminalExecution();
      demoScreen.innerHTML = '<div class="d-line"><span style="color:#a78bfa;">$</span> <span class="d-cursor"></span></div>';
      return;
    }

    if (lower === 'help' || lower === 'creo help' || lower === 'creo --help') {
      cancelTerminalExecution();
      renderGenericScenario([
        { html: `<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">${inputVal}</strong>` },
        { html: '<strong style="color:#ffffff;">Creo CLI — Developer Workflow in High Contrast</strong>' },
        { html: '<span style="color:#71717a;">Usage: creo [command] [options]</span>' },
        { html: '  <span class="t-purple">init</span>      Detect repository stacks and write creo.yml' },
        { html: '  <span class="t-purple">up</span>        Launch all services in isolated Windows Terminal tabs' },
        { html: '  <span class="t-purple">status</span>    Show running PIDs, ports, and uptime' },
        { html: '  <span class="t-purple">restart</span>   Gracefully restart a target microservice' },
        { html: '  <span class="t-purple">stop</span>      Terminate all managed services and purge PIDs' },
        { html: '  <span class="t-purple">doctor</span>    Verify Windows Terminal, Go, and port readiness' },
        { html: '  <span class="t-purple">drop</span>      Remove Creo config and release all resources' },
        { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
      ]);
      return;
    }

    if (lower === 'creo init' || lower === 'init') {
      executeTerminalScenario('init');
      return;
    }

    if (lower === 'creo up' || lower === 'up') {
      executeTerminalScenario('up');
      return;
    }

    if (lower === 'creo status' || lower === 'status') {
      executeTerminalScenario('status');
      return;
    }

    if (lower === 'creo restart' || lower === 'restart') {
      executeTerminalScenario('restart');
      return;
    }

    if (lower === 'creo stop' || lower === 'stop') {
      executeTerminalScenario('stop');
      return;
    }

    if (lower === 'creo doctor' || lower === 'doctor') {
      executeTerminalScenario('doctor');
      return;
    }

    if (lower === 'creo drop' || lower === 'drop') {
      executeTerminalScenario('drop');
      return;
    }

    // Fallback unknown command
    cancelTerminalExecution();
    renderGenericScenario([
      { html: `<span style="color:#a78bfa;">$</span> <strong style="color:#ffffff;">${inputVal}</strong>` },
      { html: `<span style="color:#ef4444;">creo: unknown command '${inputVal}'. Type 'help' for available commands.</span>` },
      { html: '<span style="color:#a78bfa;">$</span> <span class="d-cursor"></span>' }
    ]);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCustomInput();
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          terminalInput.value = cmdHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          terminalInput.value = cmdHistory[historyIdx] || '';
        } else {
          historyIdx = cmdHistory.length;
          terminalInput.value = '';
        }
      } else {
        playKeyClick('click');
      }
    });
  }

  if (terminalExecBtn) {
    terminalExecBtn.addEventListener('click', executeCustomInput);
  }

  // ========================================================================
  // 6. Distribution Switcher & Clipboard Copy
  // ========================================================================
  const distroBtns = document.querySelectorAll('.distro-btn');
  const distroCode = document.getElementById('distroCommand');
  const distroCopyBtn = document.getElementById('distroCopyBtn');

  const distroCommands = {
    scoop: 'scoop bucket add creo https://github.com/tanmayythakare/scoop-creo && scoop install creo',
    go: 'go install github.com/tanmayythakare/creo@latest',
    source: 'git clone https://github.com/tanmayythakare/creo.git && cd creo && go build -o creo.exe'
  };

  distroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick('click');
      distroBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dist = btn.getAttribute('data-dist');
      if (distroCommands[dist] && distroCode) {
        distroCode.textContent = distroCommands[dist];
      }
    });
  });

  if (distroCopyBtn && distroCode) {
    distroCopyBtn.addEventListener('click', async () => {
      playKeyClick('enter');
      const text = distroCode.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        playKeyClick('success');
        showToast('Command copied to clipboard!');
        
        const spanText = distroCopyBtn.querySelector('span');
        if (spanText) spanText.textContent = 'Copied!';
        distroCopyBtn.style.borderColor = '#ffffff';

        setTimeout(() => {
          if (spanText) spanText.textContent = 'Copy';
          distroCopyBtn.style.borderColor = '';
        }, 2200);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // ========================================================================
  // 7. Command Palette Modal (Ctrl+K / Cmd+K)
  // ========================================================================
  const paletteBackdrop = document.getElementById('paletteBackdrop');
  const cmdPaletteBtn = document.getElementById('cmdPaletteBtn');
  const paletteInput = document.getElementById('paletteInput');
  const paletteResults = document.getElementById('paletteResults');

  const paletteActions = [
    { title: 'Launch Workspace (creo up)', cat: 'Action', action: () => { window.location.hash = '#hero'; if (scene3D) scene3D.orchestrateLaunch(); } },
    { title: 'Fly 3D Camera: Frontend (:4200)', cat: '3D View', action: () => { window.location.hash = '#hero'; const p = scene3D?.serviceNodes.find(n => n.userData.id === 'frontend'); if (p) scene3D.focusOnNode(p); } },
    { title: 'Fly 3D Camera: Go API (:8080)', cat: '3D View', action: () => { window.location.hash = '#hero'; const p = scene3D?.serviceNodes.find(n => n.userData.id === 'backend'); if (p) scene3D.focusOnNode(p); } },
    { title: 'Reset 3D Camera', cat: '3D View', action: () => { window.location.hash = '#hero'; scene3D?.resetCamera(); } },
    { title: 'Run Terminal: creo init', cat: 'CLI', action: () => { window.location.hash = '#demo'; executeTerminalScenario('init'); } },
    { title: 'Run Terminal: creo status', cat: 'CLI', action: () => { window.location.hash = '#demo'; executeTerminalScenario('status'); } },
    { title: 'Run Terminal: creo drop', cat: 'CLI', action: () => { window.location.hash = '#demo'; executeTerminalScenario('drop'); } },
    { title: 'Copy Scoop Command', cat: 'Install', action: async () => { await navigator.clipboard.writeText(distroCommands.scoop); showToast('Scoop command copied!'); } },
    { title: 'Open creo.yml Configurator', cat: 'Navigate', action: () => { window.location.hash = '#configurator'; } },
    { title: 'Toggle Mechanical Audio FX', cat: 'Setting', action: () => { if (soundToggleBtn) soundToggleBtn.click(); } },
    { title: 'Open GitHub Repository', cat: 'External', action: () => { window.open('https://github.com/tanmayythakare/creo', '_blank'); } }
  ];

  let selectedIdx = 0;

  function renderPaletteItems(filterText = '') {
    if (!paletteResults) return;
    paletteResults.innerHTML = '';
    const filtered = paletteActions.filter(item => 
      item.title.toLowerCase().includes(filterText.toLowerCase()) ||
      item.cat.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      paletteResults.innerHTML = '<div style="padding:14px; color:var(--text-tertiary); text-align:center;">No matching actions</div>';
      return;
    }

    filtered.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `palette-item ${idx === selectedIdx ? 'active' : ''}`;
      div.innerHTML = `
        <div class="palette-item-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
          <span>${item.title}</span>
        </div>
        <span class="palette-item-badge">${item.cat}</span>
      `;

      div.addEventListener('click', () => {
        playKeyClick('enter');
        closePalette();
        item.action();
      });

      paletteResults.appendChild(div);
    });
  }

  function openPalette() {
    if (!paletteBackdrop) return;
    playKeyClick('enter');
    paletteBackdrop.classList.remove('hidden');
    selectedIdx = 0;
    if (paletteInput) {
      paletteInput.value = '';
      paletteInput.focus();
    }
    renderPaletteItems('');
  }

  function closePalette() {
    if (!paletteBackdrop) return;
    paletteBackdrop.classList.add('hidden');
  }

  if (cmdPaletteBtn) {
    cmdPaletteBtn.addEventListener('click', openPalette);
  }

  if (paletteBackdrop) {
    paletteBackdrop.addEventListener('click', (e) => {
      if (e.target === paletteBackdrop) closePalette();
    });
  }

  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => {
      playKeyClick('click');
      selectedIdx = 0;
      renderPaletteItems(e.target.value);
    });

    paletteInput.addEventListener('keydown', (e) => {
      const items = paletteResults.querySelectorAll('.palette-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeyClick('click');
        selectedIdx = (selectedIdx + 1) % items.length;
        renderPaletteItems(paletteInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeyClick('click');
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        renderPaletteItems(paletteInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const filtered = paletteActions.filter(item => 
          item.title.toLowerCase().includes(paletteInput.value.toLowerCase()) ||
          item.cat.toLowerCase().includes(paletteInput.value.toLowerCase())
        );
        if (filtered[selectedIdx]) {
          playKeyClick('enter');
          closePalette();
          filtered[selectedIdx].action();
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (paletteBackdrop && paletteBackdrop.classList.contains('hidden')) {
        openPalette();
      } else {
        closePalette();
      }
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  // ========================================================================
  // 8. Mobile Drawer Toggle & Smooth Scrolling
  // ========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      playKeyClick('click');
      mobileMenuBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
    });

    document.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Smooth scrolling with 70px header offset (routed via Lenis for luxury momentum)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        playKeyClick('click');
        if (lenis) {
          lenis.scrollTo(target, { offset: -70 });
        } else {
          const offset = 70;
          const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        }
      }
    });
  });

  // Section 03: Interactive Windows Terminal Tab Preview ("With Creo")
  const wtPreviewTabs = document.querySelectorAll('.wt-tab-bar .wt-tab');
  const wtTabContent = document.querySelector('.wt-tab-content');
  const wtTabLogs = {
    '0': `
      <div class="wt-log-line"><span class="t-purple">[vite]</span> ready in 142 ms</div>
      <div class="wt-log-line"><span class="t-green">➜</span> Local:   <span style="color:#ffffff;">http://localhost:4200/</span></div>
      <div class="wt-log-line"><span class="t-purple">[vite]</span> HMR active across 14 components</div>
      <div class="wt-log-line t-highlight"><span class="t-green">✔</span> Tab 1: Frontend web client online on port :4200.</div>
    `,
    '1': `
      <div class="wt-log-line"><span class="t-green">[go]</span> 2026/09/29 09:30:14 starting API server on :8080</div>
      <div class="wt-log-line"><span class="t-purple">[go]</span> routes registered: /api/v1/auth, /api/v1/tasks, /api/v1/health</div>
      <div class="wt-log-line"><span class="t-green">[go]</span> database connection pool established (max 25)</div>
      <div class="wt-log-line t-highlight"><span class="t-green">✔</span> Tab 2: Backend Go microservice online on port :8080.</div>
    `,
    '2': `
      <div class="wt-log-line"><span class="t-purple">[postgres]</span> 2026-09-29 09:30:14.288 UTC [1] LOG: database system was shut down cleanly</div>
      <div class="wt-log-line"><span class="t-green">[postgres]</span> 2026-09-29 09:30:14.301 UTC [1] LOG: database system is ready to accept connections</div>
      <div class="wt-log-line"><span class="t-purple">[postgres]</span> port 5432 bound to 0.0.0.0 (Docker bridge)</div>
      <div class="wt-log-line t-highlight"><span class="t-green">✔</span> Tab 3: PostgreSQL 16 container active and healthy.</div>
    `
  };

  wtPreviewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playKeyClick('click');
      wtPreviewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const idx = tab.getAttribute('data-tab-preview') || '0';
      if (wtTabContent && wtTabLogs[idx]) {
        wtTabContent.innerHTML = wtTabLogs[idx];
      }
    });
  });

  // ========================================================================
  // 9. Ecosystem Constellation Filtering
  // ========================================================================
  const filterBtns = document.querySelectorAll('.eco-filter-btn');
  const stackNodes = document.querySelectorAll('.stack-node');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playKeyClick('click');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      stackNodes.forEach((node, i) => {
        const nodeCat = node.getAttribute('data-cat');
        if (cat === 'all' || nodeCat === cat || nodeCat === 'all') {
          node.classList.remove('hidden');
          node.style.opacity = '1';
          if (window.gsap) {
            window.gsap.fromTo(node, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, delay: i * 0.02 });
          }
        } else {
          node.classList.add('hidden');
          node.style.opacity = '0';
        }
      });
    });
  });

  // ========================================================================
  // 10. Heavy Scroll Reveal Observer & 3D Card Tilt Engine
  // ========================================================================
  const revealElements = document.querySelectorAll('.anim-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        if (window.gsap) {
          window.gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // 3D Card Gyro-Tilt with Interactive Cursor Spotlight Reflex
  const interactiveCards = document.querySelectorAll('.bento-card, .compare-card, .stage-card, .ascii-lab-card, .cta-box');
  interactiveCards.forEach(card => {
    card.classList.add('card-3d-tilt');

    if (!card.querySelector('.card-spotlight-layer')) {
      const spot = document.createElement('div');
      spot.className = 'card-spotlight-layer';
      card.appendChild(spot);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ========================================================================
  // 11. High-End Invert / Difference Blend Mode Cursor
  // ========================================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isCursorVisible = false;

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorVisible) {
        isCursorVisible = true;
        cursorDot.classList.add('cursor-visible');
        cursorRing.classList.add('cursor-visible');
      }

      // Zero-latency direct update for precision dot
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    document.addEventListener('mouseleave', () => {
      isCursorVisible = false;
      cursorDot.classList.remove('cursor-visible');
      cursorRing.classList.remove('cursor-visible');
    });

    document.addEventListener('mouseenter', () => {
      isCursorVisible = true;
      cursorDot.classList.add('cursor-visible');
      cursorRing.classList.add('cursor-visible');
    });

    const updateRing = () => {
      if (isCursorVisible) {
        ringX += (mouseX - ringX) * 0.20;
        ringY += (mouseY - ringY) * 0.20;
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(updateRing);
    };
    requestAnimationFrame(updateRing);

    // Event delegation for all interactive elements (seamless across dynamic DOM updates)
    const interactiveSelector = 'button, a, input, textarea, select, [role="button"], .chip-btn, .bento-card, .compare-card, .stage-card, .hud-btn, .cmd-tab, .stack-node, .distro-btn, .dock-btn, .interactive, .hero-quick-copy, .palette-item';

    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
        cursorRing.classList.add('cursor-hover');
      } else {
        cursorRing.classList.remove('cursor-hover');
      }
    });

    window.addEventListener('mousedown', () => cursorRing.classList.add('cursor-active'));
    window.addEventListener('mouseup', () => cursorRing.classList.remove('cursor-active'));
  }

  // ========================================================================
  // 12. High-Contrast Click Sparks (Silver, White & Purple)
  // ========================================================================
  const sparksCanvas = document.getElementById('clickSparksCanvas');
  let sparksCtx = null;
  const particles = [];
  const sparkColors = ['#ffffff', '#ededed', '#8b5cf6', '#a78bfa', '#c4b5fd'];

  if (sparksCanvas) {
    sparksCtx = sparksCanvas.getContext('2d');
    const resizeSparks = () => {
      sparksCanvas.width = window.innerWidth;
      sparksCanvas.height = window.innerHeight;
    };
    resizeSparks();
    window.addEventListener('resize', resizeSparks);

    let isSparksLoopRunning = false;

    function spawnSparks(x, y, count = 14) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.0 + 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          radius: Math.random() * 2.0 + 1,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          alpha: 1,
          decay: Math.random() * 0.035 + 0.02
        });
      }
      if (!isSparksLoopRunning) {
        isSparksLoopRunning = true;
        requestAnimationFrame(renderSparks);
      }
    }

    function renderSparks() {
      if (particles.length > 0) {
        sparksCtx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.vx *= 0.98;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          sparksCtx.save();
          sparksCtx.globalAlpha = p.alpha;
          sparksCtx.fillStyle = p.color;
          sparksCtx.beginPath();
          sparksCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          sparksCtx.fill();
          sparksCtx.restore();
        }
        requestAnimationFrame(renderSparks);
      } else {
        sparksCtx.clearRect(0, 0, sparksCanvas.width, sparksCanvas.height);
        isSparksLoopRunning = false;
      }
    }

    window.addEventListener('click', (e) => {
      spawnSparks(e.clientX, e.clientY, 12);
    });
  }

  // ========================================================================
  // 12B. Page-Wide Fluid Cosmic Stardust & Liquid Ribbon Cursor (Option 1)
  // Mouse electrostatic repulsion, spring restitution, liquid ribbon trails & click ripples
  // ========================================================================
  const cosmicCanvas = document.getElementById('globalCosmicCanvas');
  if (cosmicCanvas && window.matchMedia('(pointer: fine)').matches) {
    const cCtx = cosmicCanvas.getContext('2d');
    let cosmicStars = [];
    const inkTrail = [];
    const maxInkPoints = 32;

    const resizeCosmic = () => {
      cosmicCanvas.width = window.innerWidth;
      cosmicCanvas.height = window.innerHeight;
      initCosmicStars();
    };

    function initCosmicStars() {
      cosmicStars = [];
      const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 9000));
      for (let i = 0; i < count; i++) {
        const x = Math.random() * cosmicCanvas.width;
        const y = Math.random() * cosmicCanvas.height;
        cosmicStars.push({
          x,
          y,
          origX: x,
          origY: y,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.75 + 0.25,
          speed: Math.random() * 0.02 + 0.005
        });
      }
    }

    resizeCosmic();
    window.addEventListener('resize', resizeCosmic);

    let globalMouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => {
      globalMouse.x = e.clientX;
      globalMouse.y = e.clientY;
    });

    function renderCosmicScene() {
      cCtx.clearRect(0, 0, cosmicCanvas.width, cosmicCanvas.height);

      // Render Minimalist Cosmic Stardust with Mouse Repulsion (Batched draw call)
      cCtx.beginPath();
      cosmicStars.forEach(s => {
        const dx = s.x - globalMouse.x;
        const dy = s.y - globalMouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 115 && dist > 1) {
          const force = (1 - dist / 115) * 5.0;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }

        // Spring restitution to home position
        s.vx += (s.origX - s.x) * 0.045;
        s.vy += (s.origY - s.y) * 0.045;
        s.vx *= 0.86;
        s.vy *= 0.86;
        s.x += s.vx;
        s.y += s.vy;

        cCtx.moveTo(s.x + s.radius, s.y);
        cCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      });
      cCtx.fillStyle = 'rgba(235, 220, 255, 0.45)';
      cCtx.fill();

      requestAnimationFrame(renderCosmicScene);
    }
    renderCosmicScene();
  }

  // ========================================================================
  // 12C. Magnetic Cursor Pull on Key Action Buttons (Option 1)
  // ========================================================================
  const magneticTargets = document.querySelectorAll('.magnetic-target');
  magneticTargets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - btnCenterX) * 0.32;
      const deltaY = (e.clientY - btnCenterY) * 0.32;
      btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  // ========================================================================
  // 13. Metric Counter Observers
  // ========================================================================
  function animateValue(obj, start, end, duration, decimals = 0, prefix = '', suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;
      obj.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        animateValue(el, 0, target, 1000, decimals, prefix, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

  // ========================================================================
  // 14. Scroll Progress, 3D Cyberspace Journey & Side Stage Tracker
  // ========================================================================
  const scrollProgress = document.getElementById('scrollProgress');
  const floatingQuickDock = document.getElementById('floatingQuickDock');
  const dockLaunchBtn = document.getElementById('dockLaunchBtn');
  const dockTopBtn = document.getElementById('dockTopBtn');
  const trackerThumb = document.getElementById('trackerThumb');
  const trackerNodes = document.querySelectorAll('.tracker-node');
  const navItemLinks = document.querySelectorAll('.nav-item-link');
  const scrollSections = document.querySelectorAll('.scroll-section');

  function handleScrollProgress(scrollY, scrollRatio) {
    const pct = scrollRatio * 100;

    // 1. Top progress bar
    if (scrollProgress) scrollProgress.style.width = `${pct}%`;

    // 2. Stage tracker laser thumb
    if (trackerThumb) trackerThumb.style.height = `${pct}%`;

    // 3. Drive 3D Cyberspace Camera through microservice universe
    if (scene3D && typeof scene3D.updateScrollProgress === 'function') {
      scene3D.updateScrollProgress(scrollRatio);
    }

    // 4. Floating Quick Actions Dock
    if (floatingQuickDock) {
      if (scrollY > 400) {
        floatingQuickDock.classList.add('visible');
      } else {
        floatingQuickDock.classList.remove('visible');
      }
    }
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll, progress }) => {
      handleScrollProgress(scroll, progress);
    });
  } else {
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollRatio = totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
          handleScrollProgress(window.scrollY, scrollRatio);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // Stage Tracker Active Node Spy (Center Viewport Observer)
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;

        // Highlight Side Stage Tracker
        trackerNodes.forEach(node => {
          if (node.getAttribute('data-target') === id) {
            node.classList.add('active');
          } else {
            node.classList.remove('active');
          }
        });

        // Highlight Top Navbar
        navItemLinks.forEach(link => {
          if (link.getAttribute('data-nav') === id) {
            link.style.color = '#ffffff';
          } else {
            link.style.color = '';
          }
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -40% 0px'
  });

  scrollSections.forEach(sec => stageObserver.observe(sec));

  if (dockLaunchBtn) {
    dockLaunchBtn.addEventListener('click', () => {
      playKeyClick('launch');
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.1 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (scene3D) {
        setTimeout(() => scene3D.orchestrateLaunch(), 400);
      }
      showToast('Initiating Creo launch...');
    });
  }

  if (dockTopBtn) {
    dockTopBtn.addEventListener('click', () => {
      playKeyClick('click');
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.9 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ========================================================================
  // 15. Terminal "Auto-Play Simulation" Walkthrough (Conflict-Free & Cancellable)
  // ========================================================================
  const autoDemoBtn = document.getElementById('autoDemoBtn');

  function waitCancellable(ms, token) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(token === autoPlayToken);
      }, ms);
      activeTerminalTimers.push(timer);
    });
  }

  async function typeIntoInput(text, delayMs, token) {
    if (!terminalInput) return false;
    terminalInput.value = '';
    for (let char of text) {
      if (token !== autoPlayToken) return false;
      terminalInput.value += char;
      playKeyClick('click');
      const cont = await waitCancellable(delayMs, token);
      if (!cont) return false;
    }
    // Realistic pause after typing command before pressing Enter
    return await waitCancellable(320, token);
  }

  if (autoDemoBtn) {
    autoDemoBtn.addEventListener('click', async () => {
      if (isAutoPlaying) {
        cancelTerminalExecution();
        showToast('Simulation stopped');
        return;
      }

      cancelTerminalExecution();
      isAutoPlaying = true;
      const currentToken = ++autoPlayToken;

      playKeyClick('enter');
      autoDemoBtn.classList.add('active');
      autoDemoBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right:2px;"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg> Stop Simulation';
      showToast('Auto-Play Simulation started');

      // Step 1: creo init (animated glitch + repo detection)
      let ok = await typeIntoInput('creo init', 55, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;
      executeTerminalScenario('init');
      ok = await waitCancellable(2800, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;

      // Step 2: creo up (boot services + 3D launch trigger)
      ok = await typeIntoInput('creo up', 55, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;
      playKeyClick('launch');
      executeTerminalScenario('up');
      ok = await waitCancellable(3000, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;

      // Step 3: creo status (uptime & process PID table)
      ok = await typeIntoInput('creo status', 55, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;
      playKeyClick('enter');
      executeTerminalScenario('status');
      ok = await waitCancellable(2800, currentToken);
      if (!ok || currentToken !== autoPlayToken) return;

      if (terminalInput) terminalInput.value = '';
      cancelTerminalExecution();
      showToast('Auto-Play Simulation complete');
    });
  }

}

// Robust execution whether DOM is loading or already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
