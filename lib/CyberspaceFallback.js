/* ==========================================================================
   Creo Cyberspace Dynamic Fallback Engine (Ultra-Resilient Canvas & 3D Math)
   Guarantees 100% visible, interactive microservice galaxy on any browser engine.
   Matches Creo3DScene API exactly: hover, click, orbit, launch, ASCII mode.
   ========================================================================== */

export function mountFallbackCyberspace(container) {
  if (!container) return null;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.zIndex = '1';
  canvas.style.cursor = 'crosshair';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = container.clientWidth || 1080;
  let height = container.clientHeight || 480;

  function resize() {
    width = container.clientWidth || 1080;
    height = container.clientHeight || 480;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(container);
  }

  // State
  let asciiMode = false;
  let isOrchestrating = false;
  let shockwaveRadius = 0;
  let shockwaveAlpha = 0;
  let cameraOffset = { x: 0, y: 0, zoom: 1 };
  let targetCamera = { x: 0, y: 0, zoom: 1 };
  let mouse = { x: -999, y: -999 };
  let hoveredNode = null;

  // Stardust
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * 1200 - 100,
    y: Math.random() * 600 - 50,
    r: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.4 + 0.1,
    alpha: Math.random() * 0.7 + 0.3
  }));

  // Service Nodes matching Creo architecture
  const nodes = [
    {
      id: 'frontend',
      title: 'FRONTEND SPA',
      subtitle: 'Vite / React · :4200 · 48ms',
      roleDesc: 'Spawns Tab 1 in Windows Terminal, running Vite dev server with Hot Module Replacement on :4200.',
      cmd: 'npm run dev',
      color: '#38bdf8',
      radiusX: 280,
      radiusY: 90,
      speed: 0.35,
      phase: 0.6,
      size: 14,
      tag: ':4200'
    },
    {
      id: 'backend',
      title: 'BACKEND API',
      subtitle: 'Go / Fiber · :8080 · 18ms',
      roleDesc: 'Spawns Tab 2 in Windows Terminal, compiling and executing Go REST API backend with zero orphaned ports.',
      cmd: 'go run main.go',
      color: '#06b6d4',
      radiusX: 380,
      radiusY: 125,
      speed: 0.28,
      phase: 2.4,
      size: 16,
      tag: ':8080'
    },
    {
      id: 'database',
      title: 'POSTGRESQL 16',
      subtitle: 'Docker Compose · :5432 · 140ms',
      roleDesc: 'Spawns Tab 3 in Windows Terminal, orchestrating local Postgres container with transactional PID management.',
      cmd: 'docker compose up postgres',
      color: '#60a5fa',
      radiusX: 470,
      radiusY: 155,
      speed: 0.22,
      phase: 4.2,
      size: 15,
      tag: ':5432'
    },
    {
      id: 'cache',
      title: 'REDIS CACHE',
      subtitle: 'In-Memory · :6379 · 12ms',
      roleDesc: 'Spawns Tab 4 in Windows Terminal, binding Redis caching layer for sub-millisecond query responses.',
      cmd: 'docker compose up redis',
      color: '#f43f5e',
      radiusX: 200,
      radiusY: 65,
      speed: 0.45,
      phase: 5.1,
      size: 12,
      tag: ':6379'
    }
  ];

  // Map to serviceNodes compatible array
  const serviceNodes = nodes.map(n => ({
    userData: { id: n.id, title: n.title, subtitle: n.subtitle, roleDesc: n.roleDesc, cmd: n.cmd, hexColor: n.color }
  }));

  // Public Interface Callback handles
  const controller = {
    serviceNodes,
    onNodeHover: null,
    onNodeSelect: null,
    resetCamera: () => {
      targetCamera = { x: 0, y: 0, zoom: 1 };
    },
    focusOnNode: (pod) => {
      const id = pod?.userData?.id || pod;
      const target = nodes.find(n => n.id === id);
      if (target) {
        targetCamera = { x: -target.currX * 0.4, y: -target.currY * 0.4, zoom: 1.25 };
      }
    },
    orchestrateLaunch: (cb) => {
      isOrchestrating = true;
      shockwaveRadius = 20;
      shockwaveAlpha = 1.0;
      setTimeout(() => {
        isOrchestrating = false;
        if (cb) cb();
      }, 1200);
    },
    toggleAsciiMode: (enabled) => {
      asciiMode = enabled;
    },
    updateScrollProgress: (progress) => {
      targetCamera.x = (progress - 0.5) * 60;
      targetCamera.y = (progress - 0.5) * 40;
    }
  };

  // Interaction Listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    let found = null;
    nodes.forEach(node => {
      if (node.screenX !== undefined && node.screenY !== undefined) {
        const dist = Math.hypot(mouse.x - node.screenX, mouse.y - node.screenY);
        if (dist < node.size + 14) {
          found = node;
        }
      }
    });

    if (found !== hoveredNode) {
      hoveredNode = found;
      if (controller.onNodeHover) {
        controller.onNodeHover(found ? {
          title: found.title,
          subtitle: found.subtitle,
          roleDesc: found.roleDesc,
          cmd: found.cmd,
          hexColor: found.color
        } : null);
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    mouse = { x: -999, y: -999 };
    if (hoveredNode && controller.onNodeHover) {
      hoveredNode = null;
      controller.onNodeHover(null);
    }
  });

  canvas.addEventListener('click', () => {
    if (hoveredNode && controller.onNodeSelect) {
      controller.onNodeSelect({
        title: hoveredNode.title,
        subtitle: hoveredNode.subtitle,
        roleDesc: hoveredNode.roleDesc,
        cmd: hoveredNode.cmd,
        hexColor: hoveredNode.color
      });
    }
  });

  // Main 60FPS Cyber Animation Loop
  let startTime = performance.now();

  function render(now) {
    requestAnimationFrame(render);
    const time = (now - startTime) * 0.001;

    // Smooth camera lerp
    cameraOffset.x += (targetCamera.x - cameraOffset.x) * 0.08;
    cameraOffset.y += (targetCamera.y - cameraOffset.y) * 0.08;
    cameraOffset.zoom += (targetCamera.zoom - cameraOffset.zoom) * 0.08;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + cameraOffset.x;
    const cy = height / 2 + cameraOffset.y;

    // 1. Cosmic Stardust
    stars.forEach(s => {
      s.x -= s.speed;
      if (s.x < 0) s.x = width;
      const tw = Math.sin(time * 2 + s.alpha * 10) * 0.25;
      ctx.fillStyle = `rgba(220, 200, 255, ${Math.max(0.1, s.alpha + tw)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Perspective Orbital Tracks (Ellipses)
    ctx.lineWidth = 1;
    [200, 280, 380, 470].forEach((rx, idx) => {
      const ry = rx * 0.32;
      ctx.strokeStyle = idx % 2 === 0 ? 'rgba(168, 85, 247, 0.22)' : 'rgba(56, 189, 248, 0.18)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * cameraOffset.zoom, ry * cameraOffset.zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Shockwave on "creo up"
    if (shockwaveAlpha > 0.01) {
      shockwaveRadius += 6.5;
      shockwaveAlpha *= 0.94;
      ctx.strokeStyle = `rgba(192, 132, 252, ${shockwaveAlpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, shockwaveRadius, shockwaveRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Update and calculate node positions
    nodes.forEach(n => {
      const angle = time * n.speed + n.phase;
      n.currX = Math.cos(angle) * n.radiusX * cameraOffset.zoom;
      n.currY = Math.sin(angle) * n.radiusY * cameraOffset.zoom;
      n.screenX = cx + n.currX;
      n.screenY = cy + n.currY;
      n.depth = Math.sin(angle); // -1 (back) to +1 (front)
    });

    // Sort by depth (render back nodes first, then core, then front nodes)
    const backNodes = nodes.filter(n => n.depth < 0);
    const frontNodes = nodes.filter(n => n.depth >= 0);

    function drawNode(n) {
      const isHov = hoveredNode && hoveredNode.id === n.id;
      const sz = (n.size + (isHov ? 5 : 0)) * (0.85 + (n.depth + 1) * 0.15);

      // Energy conduit line to core
      ctx.strokeStyle = n.color;
      ctx.lineWidth = isHov ? 2.5 : 1.2;
      ctx.globalAlpha = isHov ? 0.85 : 0.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const midX = (cx + n.screenX) / 2;
      const midY = (cy + n.screenY) / 2 - 25;
      ctx.quadraticCurveTo(midX, midY, n.screenX, n.screenY);
      ctx.stroke();

      // Traveling light packet
      const packetProgress = (time * 0.8 + n.phase) % 1;
      const px = Math.pow(1 - packetProgress, 2) * cx + 2 * (1 - packetProgress) * packetProgress * midX + Math.pow(packetProgress, 2) * n.screenX;
      const py = Math.pow(1 - packetProgress, 2) * cy + 2 * (1 - packetProgress) * packetProgress * midY + Math.pow(packetProgress, 2) * n.screenY;
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      // Node Planet Body
      ctx.globalAlpha = 1.0;
      const grad = ctx.createRadialGradient(n.screenX, n.screenY, 0, n.screenX, n.screenY, sz * 1.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, n.color);
      grad.addColorStop(1, 'rgba(10, 6, 20, 0.9)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.screenX, n.screenY, sz, 0, Math.PI * 2);
      ctx.fill();

      // Saturn Ring
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(n.screenX, n.screenY, sz * 1.8, sz * 0.6, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Label Pill
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const labelText = `${n.title} ${n.tag}`;
      const textW = ctx.measureText(labelText).width;
      ctx.fillStyle = 'rgba(8, 6, 16, 0.85)';
      ctx.strokeStyle = isHov ? '#ffffff' : n.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(n.screenX - textW / 2 - 8, n.screenY - sz - 24, textW + 16, 18, 4) : ctx.rect(n.screenX - textW / 2 - 8, n.screenY - sz - 24, textW + 16, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHov ? '#ffffff' : n.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, n.screenX, n.screenY - sz - 15);
    }

    // Draw back nodes
    backNodes.forEach(drawNode);

    // 5. Central Creo Reactor Core (Always visible & glorious)
    ctx.globalAlpha = 1.0;
    const corePulse = Math.sin(time * 3) * 3;
    const coreR = 38 + corePulse;

    // Core outer glow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4);
    coreGrad.addColorStop(0, 'rgba(192, 132, 252, 0.95)');
    coreGrad.addColorStop(0.35, 'rgba(147, 51, 234, 0.65)');
    coreGrad.addColorStop(0.7, 'rgba(88, 28, 135, 0.25)');
    coreGrad.addColorStop(1, 'rgba(2, 1, 8, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 3 Rotating Astrolabe Rings
    [
      { r: 56, speed: 0.6, color: '#c084fc' },
      { r: 68, speed: -0.4, color: '#38bdf8' },
      { r: 80, speed: 0.25, color: '#f472b6' }
    ].forEach(ring => {
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ring.r, ring.r * 0.45, time * ring.speed, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Core Center Disc
    ctx.fillStyle = '#170a2c';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Typography: 'creo'
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 14;
    ctx.fillText('creo', cx, cy - 1);
    ctx.shadowBlur = 0;

    // Draw front nodes
    frontNodes.forEach(drawNode);

    // 6. ASCII Cyberpunk Mode Overlay
    if (asciiMode) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const asciiChars = ['+', '*', '#', '⬡', '·', '%', '░', '▒'];
      for (let y = 10; y < height; y += 22) {
        for (let x = 12; x < width; x += 36) {
          const ch = asciiChars[(Math.floor(x * 13 + y * 7 + time * 4)) % asciiChars.length];
          ctx.fillText(ch, x, y);
        }
      }
    }
  }

  requestAnimationFrame(render);
  return controller;
}
