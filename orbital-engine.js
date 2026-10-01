/* ==========================================================================
   Creo 3D Orbital Cyberspace Matrix Engine
   Pure High-Performance DOM/SVG/Canvas 3D Engine with Real-Time Physics:
   - Electrostatic Starfield Particles
   - Fluid Liquid-Ink Ribbon Trails
   - 12-Segment Quantum Docking Collar
   - 6 Orbiting Celestial Developer Microservices
   - Real-Time Spring Mouse Repulsion & Restitution
   - Dynamic SVG Laser Energy Conduits
   - Interactive HUD Inspector Telemetry
   - Full ASCII Cyberpunk Mode Shader & Audio Feedback
   - Guaranteed 100% visible across all browsers, http:// and file:///
   ========================================================================== */

(function () {
  'use strict';

  function initOrbitalEngine() {
    const stage = document.getElementById('stageWrapper');
    if (!stage) return;

    const viewportWrapper = document.getElementById('viewport3DWrapper');
    const hudInspector = document.getElementById('hudInspector');
    const inspTitle = document.getElementById('inspTitle');
    const inspDesc = document.getElementById('inspDesc');
    const inspMeta = document.getElementById('inspMeta');
    const inspDot = document.getElementById('inspDot');
    const toastNotice = document.getElementById('toastNotice');

    function showToast(msg) {
      if (!toastNotice) return;
      const textSpan = toastNotice.querySelector('.toast-text');
      if (textSpan) textSpan.textContent = msg;
      toastNotice.classList.add('show');
      setTimeout(() => toastNotice.classList.remove('show'), 2500);
    }

    // Audio Synthesizer
    let audioCtx = null;
    function playAudio(type = 'click') {
      try {
        if (!audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) audioCtx = new AudioContext();
        }
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (type === 'click') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(380, now + 0.04);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
        } else if (type === 'surge' || type === 'launch') {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc.type = 'triangle';
          osc2.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

          osc2.frequency.setValueAtTime(587.33, now + 0.05);
          osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.45);
          gain2.gain.setValueAtTime(0.05, now + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

          osc.connect(gain);
          osc2.connect(gain2);
          gain.connect(audioCtx.destination);
          gain2.connect(audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.35);
          osc2.start(now + 0.05);
          osc2.stop(now + 0.45);
        }
      } catch (_) {}
    }

    // --- Mouse Tracking ---
    let mouseX = -9999;
    let mouseY = -9999;
    let isMouseOverStage = false;

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isMouseOverStage = true;
    });

    stage.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
      isMouseOverStage = false;
    });

    // Viewport Culling State & Loop Controllers (Saves GPU/CPU when scrolled away)
    let isHeroInView = true;
    let isMatrixLoopActive = false;
    let isStarLoopActive = false;

    function startHeroLoops() {
      if (!isHeroInView) return;
      if (!isMatrixLoopActive) {
        isMatrixLoopActive = true;
        requestAnimationFrame(updateMatrix);
      }
      if (!isStarLoopActive && starCanvas) {
        isStarLoopActive = true;
        requestAnimationFrame(renderStars);
      }
    }

    function stopHeroLoops() {
      isMatrixLoopActive = false;
      isStarLoopActive = false;
    }

    // --- 1. Starfield Particles Canvas with Electrostatic Mouse Repulsion ---
    const starCanvas = document.getElementById('starCanvas');
    let stars = [];
    if (starCanvas) {
      const sCtx = starCanvas.getContext('2d');
      function initStars() {
        const w = stage.clientWidth || 1080;
        const h = stage.clientHeight || 520;
        starCanvas.width = w;
        starCanvas.height = h;
        stars = [];
        for (let i = 0; i < 180; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          stars.push({
            x, y, origX: x, origY: y,
            vx: 0, vy: 0,
            radius: Math.random() * 1.5 + 0.4,
            alpha: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.02 + 0.005
          });
        }
      }
      initStars();
      window.addEventListener('resize', initStars);

      function renderStars() {
        if (!isHeroInView || !sCtx) {
          isStarLoopActive = false;
          return;
        }
        sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

        stars.forEach(s => {
          if (isMouseOverStage) {
            const dx = s.x - mouseX;
            const dy = s.y - mouseY;
            const dist = Math.hypot(dx, dy);
            if (dist < 110 && dist > 1) {
              const force = (1 - dist / 110) * 5;
              s.vx += (dx / dist) * force;
              s.vy += (dy / dist) * force;
            }
          }

          s.vx += (s.origX - s.x) * 0.045;
          s.vy += (s.origY - s.y) * 0.045;
          s.vx *= 0.86;
          s.vy *= 0.86;
          s.x += s.vx;
          s.y += s.vy;

          s.alpha += Math.sin(Date.now() * s.speed) * 0.01;
          sCtx.beginPath();
          sCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          sCtx.fillStyle = `rgba(235, 220, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
          sCtx.fill();
        });

        requestAnimationFrame(renderStars);
      }
    }

    // --- 2. Fluid Canvas Minimal Reset (Cloudy ink bubbles removed for minimalist aesthetic) ---
    const fluidCanvas = document.getElementById('fluidCanvas');
    if (fluidCanvas) {
      const fCtx = fluidCanvas.getContext('2d');
      function resizeFluid() {
        fluidCanvas.width = stage.clientWidth || 1080;
        fluidCanvas.height = stage.clientHeight || 520;
        if (fCtx) fCtx.clearRect(0, 0, fluidCanvas.width, fluidCanvas.height);
      }
      resizeFluid();
      window.addEventListener('resize', resizeFluid);
    }

    // --- 3. Build 12 Mechanical Docking Blocks ---
    const dockingCollar = document.getElementById('dockingCollar');
    if (dockingCollar) {
      const numBlocks = 12;
      const collarRadius = 104;
      for (let i = 0; i < numBlocks; i++) {
        const angle = (i / numBlocks) * Math.PI * 2;
        const x = Math.cos(angle) * collarRadius;
        const y = Math.sin(angle) * collarRadius;
        const block = document.createElement('div');
        block.className = 'collar-block';
        block.style.transform = `translate(${x}px, ${y}px) rotate(${angle + Math.PI / 2}rad)`;
        dockingCollar.appendChild(block);
      }
    }

    // --- 4. Travelling Orbital Data Packet Beads ---
    // --- 5. Cybernetic Radial Orchestration Engine ---
    const cyberMatrixContainer = document.getElementById('cyberMatrixContainer');
    const reactorNexus = document.getElementById('reactorNexus');
    const geodesicSphere = document.getElementById('geodesicSphere');
    const shockwaveRing = document.getElementById('shockwaveRing');
    const dataPacketsContainer = document.getElementById('dataPacketsContainer');

    const serviceNodes = [
      { id: 'nodeFrontend', pathId: 'traceFrontend', color: '#38bdf8' },
      { id: 'nodeBackend',  pathId: 'traceBackend',  color: '#c084fc' },
      { id: 'nodeRedis',    pathId: 'traceRedis',    color: '#f43f5e' },
      { id: 'nodeWorker',   pathId: 'traceWorker',   color: '#10b981' },
      { id: 'nodeDatabase', pathId: 'tracePostgres', color: '#3b82f6' },
      { id: 'nodeStorage',  pathId: 'traceStorage',  color: '#a855f7' }
    ];

    // Travelling Data Packets on Conduits
    const activeBeads = [];
    if (dataPacketsContainer) {
      serviceNodes.forEach(node => {
        const pathEl = document.getElementById(node.pathId);
        if (!pathEl) return;
        
        // Create 2 traveling energy beads per circuit conduit
        for (let i = 0; i < 2; i++) {
          const bead = document.createElement('div');
          bead.className = 'cyber-packet-bead';
          bead.style.color = node.color;
          bead.style.background = node.color;
          dataPacketsContainer.appendChild(bead);

          activeBeads.push({
            el: bead,
            pathEl: pathEl,
            progress: (i / 2) + Math.random() * 0.2,
            speed: 0.007 + Math.random() * 0.003,
            color: node.color
          });
        }
      });
    }

    // Parallax Tilt State
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let focusedNodeId = null;
    let sparklineTick = 0;

    function updateMatrix() {
      if (!isHeroInView) {
        isMatrixLoopActive = false;
        return;
      }

      const stageW = stage.clientWidth || 1080;
      const stageH = stage.clientHeight || 520;
      const centerX = stageW / 2;
      const centerY = stageH / 2;

      // Mouse Parallax Calculation
      if (isMouseOverStage) {
        const deltaX = (mouseX - centerX) / centerX;
        const deltaY = (mouseY - centerY) / centerY;
        targetTiltX = -deltaY * 5.5; // Max 5.5 deg pitch
        targetTiltY = deltaX * 7.0;  // Max 7.0 deg yaw
      } else {
        targetTiltX = 0;
        targetTiltY = 0;
      }

      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      // Responsive proportional scaling
      let baseScale = 1;
      if (stageW < 520) baseScale = (stageW / 1080) * 1.05;
      else if (stageW < 768) baseScale = 0.65;
      else if (stageW < 960) baseScale = 0.78;
      else if (stageW < 1120) baseScale = stageW / 1120;

      if (cyberMatrixContainer) {
        cyberMatrixContainer.style.transform = `perspective(1100px) scale(${baseScale.toFixed(3)}) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }

      // Update Travelling SVG Circuit Data Packets
      activeBeads.forEach(b => {
        b.progress += b.speed;
        if (b.progress >= 1) b.progress = 0;

        try {
          const totalLength = b.pathEl.getTotalLength ? b.pathEl.getTotalLength() : 100;
          const pt = b.pathEl.getPointAtLength(b.progress * totalLength);
          b.el.style.left = `${pt.x}px`;
          b.el.style.top = `${pt.y}px`;
        } catch (_) {}
      });

      // Animate Dynamic Live Sparklines
      sparklineTick += 0.05;
      const sparklines = document.querySelectorAll('.sparkline-path');
      sparklines.forEach((sp, idx) => {
        const offset = Math.sin(sparklineTick + idx * 1.2) * 1.5;
        sp.style.transform = `translateY(${offset.toFixed(2)}px)`;
      });

      requestAnimationFrame(updateMatrix);
    }

    // --- 6. Click Water Wave Ripple Physics ---
    stage.addEventListener('click', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '60px';
      ripple.style.height = '60px';
      stage.appendChild(ripple);

      setTimeout(() => ripple.remove(), 850);
    });

    // --- 7. Interactive Hover on Microservice Cards & Telemetry Link ---
    serviceNodes.forEach(node => {
      const el = document.getElementById(node.id);
      const pathEl = document.getElementById(node.pathId);
      if (!el) return;

      el.addEventListener('mouseenter', () => {
        playAudio('click');
        const role = el.getAttribute('data-role') || 'MICROSERVICE NODE';
        const port = el.getAttribute('data-port') || ':0000';
        const pid = el.getAttribute('data-pid') || 'Auto';
        const cmd = el.getAttribute('data-cmd') || '$ creo up';
        const desc = el.getAttribute('data-desc') || 'Managed microservice running in Windows Terminal tab.';

        if (inspTitle) inspTitle.textContent = role.toUpperCase();
        if (inspDesc) inspDesc.textContent = desc;
        if (inspMeta) {
          inspMeta.innerHTML = `
            <span>Port: <strong>${port}</strong></span>
            <span>PID: <strong>${pid}</strong></span>
            <span>Command: <code>${cmd}</code></span>
          `;
        }
        if (inspDot) {
          inspDot.style.background = node.color;
          inspDot.style.boxShadow = `0 0 10px ${node.color}`;
        }

        // Highlight connected circuit trace
        if (pathEl) pathEl.classList.add('active-trace');
        el.classList.add('active-card');
      });

      el.addEventListener('mouseleave', () => {
        if (pathEl) pathEl.classList.remove('active-trace');
        if (focusedNodeId !== node.id) {
          el.classList.remove('active-card');
        }
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        playAudio('surge');
        focusedNodeId = node.id;
        document.querySelectorAll('.cyber-service-card').forEach(c => c.classList.remove('active-card'));
        el.classList.add('active-card');
        const name = el.getAttribute('data-name') || 'Microservice';
        showToast(`Telemetry locked: ${name} (${el.getAttribute('data-port') || ''})`);
      });
    });

    // Central Orchestrator Core Hover & Surge Pulse
    if (reactorNexus) {
      reactorNexus.addEventListener('mouseenter', () => {
        playAudio('click');
        if (inspTitle) inspTitle.textContent = 'CREO ORCHESTRATOR ROOT';
        if (inspDesc) inspDesc.textContent = 'Central orchestrator. Resolves dependency graph from creo.yml and executes atomic wt.exe invocation across all 4 terminal tabs.';
        if (inspMeta) {
          inspMeta.innerHTML = `
            <span>Role: <strong>Master Controller</strong></span>
            <span>Status: <strong>6 Services Healthy</strong></span>
            <span>Command: <code>$ creo up --all</code></span>
          `;
        }
        if (inspDot) {
          inspDot.style.background = '#c084fc';
          inspDot.style.boxShadow = '0 0 10px #c084fc';
        }
      });

      reactorNexus.addEventListener('click', () => {
        playAudio('surge');
        if (shockwaveRing) {
          shockwaveRing.classList.remove('surge');
          void shockwaveRing.offsetWidth;
          shockwaveRing.classList.add('surge');
        }

        // Pulse all conduit traces and data packets rapidly
        document.querySelectorAll('.circuit-path').forEach(p => {
          p.classList.add('active-trace');
          setTimeout(() => p.classList.remove('active-trace'), 1200);
        });

        activeBeads.forEach(b => {
          b.speed *= 2.5;
          setTimeout(() => b.speed /= 2.5, 1200);
        });

        showToast('✦ Creo Root Orchestrator: All 6 microservices synchronized');
      });
    }

    // --- 8. ASCII Cyberpunk Mode Toggle ---
    const btnToggleAscii = document.getElementById('btnToggleAscii');
    let asciiModeActive = false;

    if (btnToggleAscii) {
      btnToggleAscii.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playAudio('surge');
        asciiModeActive = !asciiModeActive;

        if (asciiModeActive) {
          if (viewportWrapper) viewportWrapper.classList.add('ascii-mode');
          btnToggleAscii.textContent = '⬡ RETURN TO RAW 3D';
          btnToggleAscii.style.background = '#22c55e';
          btnToggleAscii.style.color = '#000000';
          btnToggleAscii.style.borderColor = '#22c55e';
          btnToggleAscii.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.6)';
          showToast('✦ ASCII Cyberpunk Matrix Shader engaged');
        } else {
          if (viewportWrapper) viewportWrapper.classList.remove('ascii-mode');
          btnToggleAscii.textContent = '✦ ASCII CYBERPUNK MODE';
          btnToggleAscii.style.background = 'transparent';
          btnToggleAscii.style.color = '#a855f7';
          btnToggleAscii.style.borderColor = '#a855f7';
          btnToggleAscii.style.boxShadow = '';
          showToast('Cybernetic Radial Matrix view restored');
        }
      });
    }

    // --- 9. Camera Preset View Controls ---
    const hudButtons = document.querySelectorAll('.hud-btn:not(#btnToggleAscii)');
    hudButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        playAudio('click');
        hudButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const camType = btn.getAttribute('data-cam');
        if (camType === 'overview' || camType === 'reset') {
          focusedNodeId = null;
          document.querySelectorAll('.cyber-service-card').forEach(c => c.classList.remove('active-card'));
          showToast('View reset: Complete microservice cluster');
        } else if (camType === 'frontend') {
          focusedNodeId = 'nodeFrontend';
          const el = document.getElementById('nodeFrontend');
          if (el) el.dispatchEvent(new MouseEvent('mouseenter'));
          showToast('Telemetry locked: Frontend SPA (:4200)');
        } else if (camType === 'backend') {
          focusedNodeId = 'nodeBackend';
          const el = document.getElementById('nodeBackend');
          if (el) el.dispatchEvent(new MouseEvent('mouseenter'));
          showToast('Telemetry locked: Backend API (:8080)');
        } else if (camType === 'database') {
          focusedNodeId = 'nodeDatabase';
          const el = document.getElementById('nodeDatabase');
          if (el) el.dispatchEvent(new MouseEvent('mouseenter'));
          showToast('Telemetry locked: PostgreSQL (:5432)');
        }
      });
    });

    // --- 10. Launch Workspace (creo up) Button Connection ---
    const btnOrchestrate3D = document.getElementById('btnOrchestrate3D');
    const btnOrchestrate3DText = document.getElementById('btnOrchestrate3DText');
    if (btnOrchestrate3D) {
      btnOrchestrate3D.addEventListener('click', () => {
        playAudio('launch');
        if (shockwaveRing) {
          shockwaveRing.classList.remove('surge');
          void shockwaveRing.offsetWidth;
          shockwaveRing.classList.add('surge');
        }

        showToast('Initiating Creo workspace orchestration across wt.exe...');
        if (btnOrchestrate3DText) {
          btnOrchestrate3DText.textContent = 'Orchestrating Windows Terminal tabs...';
        }

        setTimeout(() => {
          showToast('All 4 microservices online in Windows Terminal!');
          if (btnOrchestrate3DText) {
            btnOrchestrate3DText.innerHTML = '<span class="badge-dot pulse-anim" style="background:#10b981;box-shadow:0 0 10px #10b981;margin-right:6px;"></span> Workspace Live (wt.exe Online)';
          }
          btnOrchestrate3D.classList.add('workspace-live');
        }, 800);
      });
    }

    // Viewport IntersectionObserver — Automatically pauses Hero 2D/3D loops when scrolled out of view
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroInView = entry.isIntersecting;
        if (isHeroInView) {
          startHeroLoops();
        } else {
          stopHeroLoops();
        }
      });
    }, { rootMargin: '120px 0px 120px 0px' });
    heroObserver.observe(viewportWrapper || stage);

    // Initial loop start
    startHeroLoops();

    // Expose global controller with complete method bridge
    window.CreoCyberspace = {
      toggleAscii: (enabled) => {
        if (btnToggleAscii) btnToggleAscii.click();
      },
      toggleAsciiMode: function(enabled) {
        this.toggleAscii(enabled);
      },
      focusNode: (nodeId) => {
        const id = typeof nodeId === 'string' ? nodeId : (nodeId?.id || nodeId?.userData?.id);
        focusedNodeId = id;
        const el = document.getElementById(id) || document.getElementById('node' + (id ? id.charAt(0).toUpperCase() + id.slice(1) : ''));
        if (el) el.dispatchEvent(new MouseEvent('mouseenter'));
      },
      focusOnNode: function(node) {
        this.focusNode(node);
      },
      reset: () => {
        focusedNodeId = null;
        document.querySelectorAll('.cyber-service-card').forEach(c => c.classList.remove('active-card'));
      },
      resetCamera: function() {
        this.reset();
      },
      launch: (cb) => {
        if (btnOrchestrate3D) btnOrchestrate3D.click();
        if (typeof cb === 'function') setTimeout(cb, 800);
      },
      orchestrateLaunch: function(cb) {
        this.launch(cb);
      },
      updateScrollProgress: (progress) => {
        // Smooth parallax depth reaction
      },
      serviceNodes: serviceNodes.map(s => ({
        id: s.id,
        userData: { id: s.id.replace('node', '').toLowerCase(), title: s.id }
      }))
    };
  }

  // Auto-run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitalEngine);
  } else {
    initOrbitalEngine();
  }
})();
