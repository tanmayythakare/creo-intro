/* ==========================================================================
   Creo 3D WebGL Cyberspace Engine — Vercel Monochrome & Electric Purple
   Three.js + GSAP + OrbitControls + Interactive Raycasting
   ========================================================================== */

import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { AsciiShaderEffect } from './lib/AsciiShaderEffect.js';

export class Creo3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    this.width = this.container.clientWidth || rect.width || 1080;
    this.height = this.container.clientHeight || rect.height || 480;
    if (this.width <= 0) this.width = 1080;
    if (this.height <= 0) this.height = 480;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    // 3D Objects
    this.coreGroup = new THREE.Group();
    this.serviceNodes = [];
    this.energyStreams = [];
    this.streamParticles = [];
    this.starfield = null;
    this.coreMonolith = null;
    this.coreCrystal = null;
    this.coreRings = [];
    this.scannerGroup = null;
    this.shockwave = null;
    this.particleSpeedMultiplier = 1;

    // Interaction, Raycasting & Parallax
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.parallaxTarget = { x: 0, y: 0 };
    this.baseCameraPos = new THREE.Vector3(0, 2.8, 10.2);
    this.hoveredNode = null;
    this.selectedNode = null;
    this.isOrchestrating = false;
    this.scrollProgress = 0;
    this.targetScrollPos = new THREE.Vector3(0, 2.8, 10.2);
    this.targetScrollLook = new THREE.Vector3(0, 0.95, 0);
    this.asciiModeActive = false;

    // Callbacks
    this.onNodeSelect = null;
    this.onNodeHover = null;

    this.init();
  }

  updateScrollProgress(progress) {
    if (this.selectedNode || this.isOrchestrating) return;
    this.scrollProgress = progress;

    // Choreographed camera journey through 3D microservice universe
    if (progress < 0.25) {
      const t = progress / 0.25;
      this.targetScrollPos.set(
        THREE.MathUtils.lerp(0, -2.4, t),
        THREE.MathUtils.lerp(2.8, 2.0, t),
        THREE.MathUtils.lerp(10.2, 8.8, t)
      );
      this.targetScrollLook.set(
        THREE.MathUtils.lerp(0, -0.8, t),
        THREE.MathUtils.lerp(0, 0.4, t),
        0
      );
    } else if (progress < 0.5) {
      const t = (progress - 0.25) / 0.25;
      this.targetScrollPos.set(
        THREE.MathUtils.lerp(-2.4, 3.2, t),
        THREE.MathUtils.lerp(2.0, 2.8, t),
        THREE.MathUtils.lerp(8.8, 8.2, t)
      );
      this.targetScrollLook.set(
        THREE.MathUtils.lerp(-0.8, 1.2, t),
        THREE.MathUtils.lerp(0.4, 0, t),
        0
      );
    } else if (progress < 0.75) {
      const t = (progress - 0.5) / 0.25;
      this.targetScrollPos.set(
        THREE.MathUtils.lerp(3.2, -1.8, t),
        THREE.MathUtils.lerp(2.8, 3.8, t),
        THREE.MathUtils.lerp(8.2, 9.2, t)
      );
      this.targetScrollLook.set(
        THREE.MathUtils.lerp(1.2, 0, t),
        0,
        0
      );
    } else {
      const t = (progress - 0.75) / 0.25;
      this.targetScrollPos.set(
        THREE.MathUtils.lerp(-1.8, 0, t),
        THREE.MathUtils.lerp(3.8, 2.8, t),
        THREE.MathUtils.lerp(9.2, 10.6, t)
      );
      this.targetScrollLook.set(0, 0, 0);
    }
  }

  init() {
    // 1. Scene setup (clean transparent background blending into cosmic purple)
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x090317, 0.012);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.1, 100);
    this.camera.position.copy(this.baseCameraPos);
    this.camera.lookAt(0, 0.95, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.zIndex = '1';
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.minDistance = 4.5;
    this.controls.maxDistance = 18.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.minPolarAngle = Math.PI / 6;
    this.controls.target.set(0, 0.95, 0);

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    this.purpleCoreLight = new THREE.PointLight(0xc084fc, 5.5, 22);
    this.purpleCoreLight.position.set(0, 0.95, 0);
    this.scene.add(this.purpleCoreLight);

    const whiteTopLight = new THREE.DirectionalLight(0xffffff, 2.2);
    whiteTopLight.position.set(6, 12, 6);
    this.scene.add(whiteTopLight);

    const purpleCounterLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    purpleCounterLight.position.set(-8, -4, -6);
    this.scene.add(purpleCounterLight);

    const cyanAccentLight = new THREE.PointLight(0x38bdf8, 2.8, 16);
    cyanAccentLight.position.set(4, 2, -3);
    this.scene.add(cyanAccentLight);

    // 6. Build Cybernetic Elements (Each guarded so any sub-mesh failure cannot stop rendering)
    try { this.createCyberFloor(); } catch (e) { console.error('createCyberFloor err:', e); }
    try { this.createStarfield(); } catch (e) { console.error('createStarfield err:', e); }
    try { this.createCore(); } catch (e) { console.error('createCore err:', e); }
    try { this.createSatellitePods(); } catch (e) { console.error('createSatellitePods err:', e); }
    try { this.createEnergyConduits(); } catch (e) { console.error('createEnergyConduits err:', e); }
    try { this.createHolographicScanner(); } catch (e) { console.error('createHolographicScanner err:', e); }
    try { this.createShockwaveMesh(); } catch (e) { console.error('createShockwaveMesh err:', e); }

    // 7. Event Listeners
    this.setupEvents();

    // 8. ASCII Cyberpunk Shader Effect (Initialized OFF, toggled by UI)
    try {
      this.asciiEffect = new AsciiShaderEffect(this.renderer, this.scene, this.camera, {
        ascii: false,
        color: "#c084fc"
      });
      this.asciiEffect.setSize(this.width, this.height);
    } catch (e) {
      console.error("ASCII Shader Error:", e);
      this.asciiEffect = null;
    }

    // 9. Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // --- High-Contrast Monochrome Cyber Floor Grid ---
  createCyberFloor() {
    const gridHelper = new THREE.GridHelper(36, 36, 0x553388, 0x110822);
    gridHelper.position.y = -2.6;
    gridHelper.material.opacity = 0.45;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  // --- High-Contrast Silver & Purple Starfield Particles ---
  createStarfield() {
    const count = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 44;
      positions[i3 + 1] = (Math.random() - 0.5) * 26 + 1;
      positions[i3 + 2] = (Math.random() - 0.5) * 44;

      const rand = Math.random();
      if (rand < 0.6) {
        colors[i3] = 0.95; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.95;
      } else if (rand < 0.85) {
        colors[i3] = 0.65; colors[i3 + 1] = 0.45; colors[i3 + 2] = 0.98;
      } else {
        colors[i3] = 0.85; colors[i3 + 1] = 0.75; colors[i3 + 2] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(210, 200, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTex = new THREE.CanvasTexture(pCanvas);
    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      map: pTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  // --- Central Creo Quantum Reactor Sun (Spherical & Celestial, Zero Hexagons!) ---
  createCore() {
    this.coreGroup.position.set(0, 0, 0);

    // 1. Sleek Circular Beveled Plinth (48 smooth radial segments)
    const baseGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.22, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c0818,
      metalness: 0.92,
      roughness: 0.2,
      emissive: 0x3b0764,
      emissiveIntensity: 0.4
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.11;
    this.coreGroup.add(baseMesh);

    // 2. Segmented Circular Mechanical Docking Collar (12 curved radial armor blocks)
    this.dockingCollar = new THREE.Group();
    const collarRadius = 1.75;
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x1f1733,
      metalness: 0.95,
      roughness: 0.25,
      emissive: 0x581c87,
      emissiveIntensity: 0.45
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const blockGeo = new THREE.BoxGeometry(0.38, 0.16, 0.3);
      const block = new THREE.Mesh(blockGeo, blockMat);
      block.position.set(Math.cos(angle) * collarRadius, 0.05, Math.sin(angle) * collarRadius);
      block.rotation.y = -angle;
      this.dockingCollar.add(block);
    }
    this.coreGroup.add(this.dockingCollar);

    // 3. Inner Radiant Volumetric Plasma Sphere (Pure Sphere)
    const plasmaGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const plasmaMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0xc084fc,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.2
    });
    this.corePlasma = new THREE.Mesh(plasmaGeo, plasmaMat);
    this.corePlasma.position.y = 0.95;
    this.coreGroup.add(this.corePlasma);

    // 4. Outer Spherical Geodesic Crystal Facet Shell with Glowing Wireframe
    const crystalGeo = new THREE.IcosahedronGeometry(1.42, 2);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.45,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5
    });
    this.coreCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    this.coreCrystal.position.y = 0.95;
    this.coreGroup.add(this.coreCrystal);

    const wireframeGeo = new THREE.WireframeGeometry(crystalGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0xf5d0fe,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    this.coreWireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    this.coreWireframe.position.y = 0.95;
    this.coreGroup.add(this.coreWireframe);

    // 5. Centered Glowing Typography Billboard: 'Creo'
    const creoSpriteMat = new THREE.SpriteMaterial({
      map: this.createCreoTextTexture(),
      transparent: true,
      depthTest: false
    });
    const creoSprite = new THREE.Sprite(creoSpriteMat);
    creoSprite.position.set(0, 0.95, 0);
    creoSprite.scale.set(2.4, 1.2, 1);
    this.coreGroup.add(creoSprite);

    // 6. Three 3D Rotating Astrolabe Gimbal Rings (Pitch, Yaw, Roll)
    const astrolabeConfigs = [
      { radius: 1.95, tube: 0.024, color: 0xc084fc, rotSpeed: { x: 0.012, y: 0.007, z: 0 } },
      { radius: 2.18, tube: 0.018, color: 0x38bdf8, rotSpeed: { x: 0, y: -0.010, z: 0.008 } },
      { radius: 2.38, tube: 0.020, color: 0xf472b6, rotSpeed: { x: -0.009, y: 0, z: 0.007 } }
    ];

    astrolabeConfigs.forEach(ac => {
      const ringGeo = new THREE.TorusGeometry(ac.radius, ac.tube, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({ color: ac.color, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.95;
      ring.userData = { rotSpeed: ac.rotSpeed };
      this.coreGroup.add(ring);
      this.coreRings.push(ring);
    });

    // 7. Floor Pedestal Glow Ring
    const haloGeo = new THREE.RingGeometry(1.6, 2.5, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.15;
    this.coreGroup.add(halo);

    this.scene.add(this.coreGroup);
  }

  // --- Creo Typography Sprite Texture ---
  createCreoTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 92px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Creo', 256, 128);
    return new THREE.CanvasTexture(canvas);
  }

  // --- Dynamic Canvas Text Sprite Generator (Compact & Sharp) ---
  createTextSprite(title, subtitle, accentColor = '#a78bfa') {
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');

    // High-contrast translucent dark glass
    ctx.fillStyle = 'rgba(8, 8, 18, 0.88)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(6, 6, 448, 98, 14);
    } else {
      ctx.rect(6, 6, 448, 98);
    }
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    // Status dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(32, 38, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(title, 48, 45);

    // Subtitle text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(subtitle, 32, 80);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 0.48, 1);
    return sprite;
  }

  // --- 6 Orbiting Celestial Developer Microservice Planets (Zero Hexagons!) ---
  createSatellitePods() {
    const podConfigs = [
      {
        id: 'frontend',
        title: 'FRONTEND SPA',
        subtitle: 'Vite / React · :4200 · 48ms',
        roleDesc: 'Spawns Tab 1 in Windows Terminal, running Vite dev server with Hot Module Replacement on :4200.',
        cmd: 'npm run dev',
        color: 0x38bdf8,
        hexColor: '#38bdf8',
        orbitRadiusX: 5.6,
        orbitRadiusZ: 3.8,
        orbitSpeed: 0.0058 * 60,
        orbitPhase: 0.8,
        planetType: 'frontend-laptop'
      },
      {
        id: 'backend',
        title: 'BACKEND API',
        subtitle: 'Go 1.23 · :8080 · 61ms',
        roleDesc: 'Spawns Tab 2, compiling & running high-performance Go REST API on :8080 with zero port conflicts.',
        cmd: 'go run main.go',
        color: 0x06b6d4,
        hexColor: '#06b6d4',
        orbitRadiusX: 6.8,
        orbitRadiusZ: 4.8,
        orbitSpeed: 0.0050 * 60,
        orbitPhase: 2.3,
        planetType: 'backend-cube'
      },
      {
        id: 'database',
        title: 'POSTGRESQL 16',
        subtitle: 'Docker DB · :5432 · 12ms',
        roleDesc: 'Spawns Tab 3, orchestrating containerized PostgreSQL 16 database with volume persistence on :5432.',
        cmd: 'docker compose up db',
        color: 0x60a5fa,
        hexColor: '#60a5fa',
        orbitRadiusX: 8.4,
        orbitRadiusZ: 5.8,
        orbitSpeed: 0.0042 * 60,
        orbitPhase: 3.8,
        planetType: 'postgres-sphere'
      },
      {
        id: 'cache',
        title: 'REDIS CACHE',
        subtitle: 'In-Memory · :6379 · 10ms',
        roleDesc: 'Spawns Tab 4, launching Redis in-memory key-value cache and message broker on :6379.',
        cmd: 'docker compose up redis',
        color: 0xf43f5e,
        hexColor: '#f43f5e',
        orbitRadiusX: 6.2,
        orbitRadiusZ: 4.4,
        orbitSpeed: 0.0054 * 60,
        orbitPhase: 5.1,
        planetType: 'redis-disks'
      },
      {
        id: 'worker',
        title: 'WORKER / JOBS',
        subtitle: 'Async DAG Tasks · 112ms',
        roleDesc: 'Spawns background task runner executing asynchronous job queues.',
        cmd: 'creo worker start',
        color: 0x10b981,
        hexColor: '#10b981',
        orbitRadiusX: 7.6,
        orbitRadiusZ: 5.2,
        orbitSpeed: 0.0048 * 60,
        orbitPhase: 1.5,
        planetType: 'worker-gem'
      },
      {
        id: 'storage',
        title: 'FILE STORAGE',
        subtitle: '.creo/ · Assets · 35ms',
        roleDesc: 'Spawns local S3/minio asset bucket emulator for media and configurations.',
        cmd: 'docker compose up s3',
        color: 0xa855f7,
        hexColor: '#a855f7',
        orbitRadiusX: 5.0,
        orbitRadiusZ: 3.5,
        orbitSpeed: 0.0064 * 60,
        orbitPhase: 4.4,
        planetType: 'storage-orb'
      }
    ];

    podConfigs.forEach(cfg => {
      const podGroup = new THREE.Group();
      podGroup.userData = {
        ...cfg,
        isServicePod: true,
        originalY: 0.5,
        deflectX: 0,
        deflectZ: 0,
        vx: 0,
        vz: 0
      };

      // 1. FRONTEND: Blue Gas Sphere with Saturn Ring + 3D Laptop Display
      if (cfg.planetType === 'frontend-laptop') {
        const planetGeo = new THREE.SphereGeometry(0.72, 28, 28);
        const planetMat = new THREE.MeshStandardMaterial({
          color: 0x1d4ed8,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.6,
          roughness: 0.3
        });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        podGroup.add(planet);

        const ringGeo = new THREE.TorusGeometry(1.22, 0.045, 8, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.85 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        podGroup.add(ring);

        // 3D Miniature Laptop
        const laptop = new THREE.Group();
        laptop.position.set(0, 0.65, 0);
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.6), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
        laptop.add(baseMesh);
        const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.58, 0.03), new THREE.MeshBasicMaterial({ map: this.createLaptopScreenTexture() }));
        screenMesh.position.set(0, 0.28, -0.28);
        screenMesh.rotation.x = 0.2;
        laptop.add(screenMesh);
        podGroup.add(laptop);

      // 2. BACKEND: Cyber Server Mainframe Cube with Illuminated LED Bays
      } else if (cfg.planetType === 'backend-cube') {
        const cubeGeo = new THREE.BoxGeometry(1.0, 1.25, 1.0);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: 0x032840,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.85
        });
        const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
        podGroup.add(cubeMesh);

        for (let s = 0; s < 4; s++) {
          const slot = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          slot.position.set(0, 0.38 - s * 0.24, 0.51);
          podGroup.add(slot);
        }

        const pyramid = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.52, 4), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0284c7, emissiveIntensity: 1.0 }));
        pyramid.position.set(0, 0.88, 0);
        pyramid.rotation.y = Math.PI / 4;
        podGroup.add(pyramid);

        const bRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 8, 48), new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.8 }));
        bRing.rotation.x = Math.PI / 2.2;
        podGroup.add(bRing);

      // 3. POSTGRESQL: Cyan-Blue Gas Giant with Elephant Emblem & Dual Rings
      } else if (cfg.planetType === 'postgres-sphere') {
        const dbSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.85, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x2563eb, emissiveIntensity: 0.75, roughness: 0.25 })
        );
        podGroup.add(dbSphere);

        const dbRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.9 }));
        dbRing1.rotation.x = Math.PI / 2.4;
        podGroup.add(dbRing1);

        const dbRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.6 }));
        dbRing2.rotation.x = Math.PI / 2.4;
        podGroup.add(dbRing2);

        const pgLogoPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), new THREE.MeshBasicMaterial({ map: this.createPostgresLogoTexture(), transparent: true }));
        pgLogoPlane.position.set(0, 0, 0.88);
        podGroup.add(pgLogoPlane);

      // 4. REDIS: 3 Stacked Floating Ruby Database Discs (Zero Hexagons!)
      } else if (cfg.planetType === 'redis-disks') {
        for (let k = 0; k < 3; k++) {
          const disk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.72, 0.72, 0.14, 32),
            new THREE.MeshStandardMaterial({ color: 0xbe123c, emissive: 0xf43f5e, emissiveIntensity: 0.85, roughness: 0.2 })
          );
          disk.position.y = (k - 1) * 0.26;
          podGroup.add(disk);
        }
        const rRing = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.85 }));
        rRing.rotation.x = Math.PI / 2.3;
        podGroup.add(rRing);

      // 5. WORKER: Multifaceted Emerald Crystal Polyhedron + Gyro
      } else if (cfg.planetType === 'worker-gem') {
        const gem = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.78, 0),
          new THREE.MeshStandardMaterial({ color: 0x059669, emissive: 0x10b981, emissiveIntensity: 0.85, roughness: 0.15 })
        );
        podGroup.add(gem);

        const wRing = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 }));
        wRing.rotation.x = Math.PI / 2.6;
        podGroup.add(wRing);

      // 6. STORAGE: Luminous Violet Crystal Orb + Document
      } else {
        const sSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 28, 28),
          new THREE.MeshStandardMaterial({ color: 0x6d28d9, emissive: 0xa855f7, emissiveIntensity: 0.75, roughness: 0.2 })
        );
        podGroup.add(sSphere);

        const sRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.035, 8, 48), new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.8 }));
        sRing.rotation.x = Math.PI / 2.3;
        podGroup.add(sRing);

        const docMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.62), new THREE.MeshBasicMaterial({ map: this.createDocumentTexture(), transparent: true }));
        docMesh.position.set(0, 0, 0.78);
        podGroup.add(docMesh);
      }

      // Compact Crisp Billboard Label Sprite
      const labelSprite = this.createTextSprite(cfg.title, cfg.subtitle, cfg.hexColor);
      labelSprite.position.set(0, 1.25, 0);
      podGroup.add(labelSprite);

      this.scene.add(podGroup);
      this.serviceNodes.push(podGroup);
    });
  }

  createLaptopScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050814'; ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 256, 20);
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(12, 10, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(24, 10, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(36, 10, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 110); ctx.lineTo(60, 70); ctx.lineTo(100, 95); ctx.lineTo(150, 45); ctx.lineTo(200, 65); ctx.lineTo(240, 30);
    ctx.stroke();
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(30, 120, 18, 25);
    ctx.fillRect(70, 105, 18, 40);
    ctx.fillRect(110, 85, 18, 60);
    ctx.fillRect(150, 95, 18, 50);
    ctx.fillRect(190, 75, 18, 70);
    return new THREE.CanvasTexture(canvas);
  }

  createPostgresLogoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,128,128);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(64, 52, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(52, 60, 24, 38);
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.arc(72, 48, 5, 0, Math.PI*2); ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  createDocumentTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(8, 8, 112, 144);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(24, 30, 80, 8);
    ctx.fillRect(24, 50, 80, 8);
    ctx.fillRect(24, 70, 60, 8);
    ctx.fillRect(24, 90, 75, 8);
    ctx.fillRect(24, 110, 45, 8);
    return new THREE.CanvasTexture(canvas);
  }

  // --- Dynamic Directional Data Streams & Traveling Packets ---
  createEnergyConduits() {
    this.serviceNodes.forEach((pod, index) => {
      const p1 = new THREE.Vector3(0, 0.95, 0);
      const p2 = pod.position.clone();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 0.6;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(40);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: pod.userData.color,
        transparent: true,
        opacity: 0.45
      });

      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.energyStreams.push({ line, curve, color: pod.userData.color, pod });

      const pulseMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
      );
      this.scene.add(pulseMesh);
      this.streamParticles.push({ mesh: pulseMesh, curve, progress: index * 0.16 });
    });
  }

  // --- Holographic Scanner Radar ---
  createHolographicScanner() {
    this.scannerGroup = new THREE.Group();

    const ringGeo = new THREE.RingGeometry(3.6, 3.75, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 2;
    this.scannerGroup.add(scanRing);

    this.scene.add(this.scannerGroup);
  }

  // --- Shockwave Mesh ---
  createShockwaveMesh() {
    const shockGeo = new THREE.RingGeometry(0.1, 0.45, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.shockwave = new THREE.Mesh(shockGeo, shockMat);
    this.shockwave.rotation.x = Math.PI / 2;
    this.shockwave.position.set(0, 0, 0);
    this.scene.add(this.shockwave);
  }

  // --- Mouse & Raycasting Setup ---
  setupEvents() {
    const handleResize = () => {
      const w = this.container.clientWidth || this.container.offsetWidth || 1080;
      const h = this.container.clientHeight || this.container.offsetHeight || 480;
      if (w > 0 && h > 0) {
        this.width = w;
        this.height = h;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        if (this.asciiEffect) this.asciiEffect.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    if (window.ResizeObserver && this.container) {
      const ro = new ResizeObserver(() => handleResize());
      ro.observe(this.container);
    }

    const getCanvasMouse = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1
      };
    };

    this.renderer.domElement.addEventListener('mousemove', (e) => {
      const coords = getCanvasMouse(e);
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
      this.parallaxTarget.x = coords.x * 0.45;
      this.parallaxTarget.y = coords.y * 0.3;

      // Spring mouse repulsion calculation for 3D service pods
      this.serviceNodes.forEach(pod => {
        const podScreenPos = pod.position.clone().project(this.camera);
        const dist = Math.hypot(coords.x - podScreenPos.x, coords.y - podScreenPos.y);
        if (dist < 0.32 && dist > 0.01) {
          const push = (1 - dist / 0.32) * 0.14;
          const dx = (podScreenPos.x - coords.x) / dist;
          const dy = (podScreenPos.y - coords.y) / dist;
          pod.userData.vx += dx * push;
          pod.userData.vz += -dy * push;
        }
      });

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.serviceNodes, true);

      if (intersects.length > 0) {
        let hitGroup = intersects[0].object;
        while (hitGroup.parent && !hitGroup.userData.isServicePod) {
          hitGroup = hitGroup.parent;
        }

        if (hitGroup && hitGroup.userData.isServicePod) {
          document.body.style.cursor = 'pointer';
          if (this.hoveredNode !== hitGroup) {
            if (this.hoveredNode && this.hoveredNode.userData.pedestal) {
              this.hoveredNode.userData.pedestal.material.opacity = 0.35;
            }
            this.hoveredNode = hitGroup;
            if (this.hoveredNode.userData.pedestal) {
              this.hoveredNode.userData.pedestal.material.opacity = 0.9;
            }
            if (this.onNodeHover) this.onNodeHover(this.hoveredNode.userData);
          }
          return;
        }
      }

      document.body.style.cursor = 'default';
      if (this.hoveredNode) {
        if (this.hoveredNode.userData.pedestal) {
          this.hoveredNode.userData.pedestal.material.opacity = 0.35;
        }
        this.hoveredNode = null;
        if (this.onNodeHover) this.onNodeHover(null);
      }
    });

    this.renderer.domElement.addEventListener('mouseleave', () => {
      this.parallaxTarget.x = 0;
      this.parallaxTarget.y = 0;
    });

    this.renderer.domElement.addEventListener('click', () => {
      if (this.hoveredNode) {
        this.focusOnNode(this.hoveredNode);
        if (this.onNodeSelect) this.onNodeSelect(this.hoveredNode.userData);
      } else {
        // Emit subtle water ripple pulse across 3D grid
        if (this.shockwave && window.gsap) {
          this.shockwave.scale.set(0.1, 0.1, 0.1);
          this.shockwave.material.opacity = 0.65;
          window.gsap.to(this.shockwave.scale, { x: 9, y: 9, z: 9, duration: 0.85, ease: 'power2.out' });
          window.gsap.to(this.shockwave.material, { opacity: 0, duration: 0.85, ease: 'power2.out' });
        }
      }
    });
  }

  // --- Smooth Camera Fly-To Animation (GSAP) ---
  focusOnNode(pod) {
    if (!window.gsap) return;
    this.selectedNode = pod;

    const targetPos = pod.position.clone().add(new THREE.Vector3(0, 0.4, 3.4));
    const targetLook = pod.position.clone();

    window.gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: 'power3.inOut'
    });

    window.gsap.to(this.controls.target, {
      x: targetLook.x,
      y: targetLook.y,
      z: targetLook.z,
      duration: 1.2,
      ease: 'power3.inOut'
    });
  }

  resetCamera() {
    if (!window.gsap) return;
    this.selectedNode = null;

    window.gsap.to(this.camera.position, {
      x: this.baseCameraPos.x,
      y: this.baseCameraPos.y,
      z: this.baseCameraPos.z,
      duration: 1.2,
      ease: 'power3.inOut'
    });

    window.gsap.to(this.controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.2,
      ease: 'power3.inOut'
    });
  }

  // --- Cinematic Orchestration Launch Sequence ('creo up') ---
  orchestrateLaunch(callback) {
    if (this.isOrchestrating) return;
    this.isOrchestrating = true;

    if (!window.gsap) {
      if (callback) callback();
      return;
    }

    // 1. Core Energy Flare
    window.gsap.to(this.purpleCoreLight, {
      intensity: 14,
      distance: 30,
      duration: 0.35,
      yoyo: true,
      repeat: 1
    });

    if (this.coreCrystal) {
      window.gsap.to(this.coreCrystal.scale, {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }

    // 2. Camera FOV Punch
    window.gsap.to(this.camera, {
      fov: 40,
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });

    // 3. Expanding Shockwave
    if (this.shockwave) {
      this.shockwave.scale.set(0.1, 0.1, 0.1);
      this.shockwave.material.opacity = 0.95;
      window.gsap.to(this.shockwave.scale, { x: 18, y: 18, z: 18, duration: 1.2, ease: 'power2.out' });
      window.gsap.to(this.shockwave.material, { opacity: 0, duration: 1.2, ease: 'power2.out' });
    }

    // 4. Particle Speed Boost
    window.gsap.to(this, {
      particleSpeedMultiplier: 4.5,
      duration: 0.45,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });

    // 5. Stagger scale pods
    this.serviceNodes.forEach((node, i) => {
      window.gsap.to(node.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 0.25,
        delay: 0.1 + i * 0.08,
        yoyo: true,
        repeat: 1
      });
    });

    setTimeout(() => {
      this.isOrchestrating = false;
      if (callback) callback();
    }, 1200);
  }

  // --- Render Loop ---
  animate() {
    requestAnimationFrame(this.animate);
    try {
      const elapsedTime = this.clock.getElapsedTime();

    // 1. Central Core Animation
    if (this.coreMonolith) {
      this.coreMonolith.rotation.y = elapsedTime * 0.25;
    }
    if (this.coreCrystal) {
      this.coreCrystal.rotation.y = -elapsedTime * 0.6;
      this.coreCrystal.rotation.x = Math.sin(elapsedTime * 0.8) * 0.2;
      this.coreCrystal.position.y = 1.48 + Math.sin(elapsedTime * 2.0) * 0.05;
      if (this.coreWireframe) {
        this.coreWireframe.rotation.copy(this.coreCrystal.rotation);
      }
    }
    if (this.corePlasma) {
      const pulse = 1.0 + Math.sin(elapsedTime * 3.0) * 0.04;
      this.corePlasma.scale.set(pulse, pulse, pulse);
    }
    if (this.dockingCollar) {
      this.dockingCollar.rotation.y = elapsedTime * 0.08;
    }

    // 2. Orbital Radar Rings Rotation
    this.coreRings.forEach(ring => {
      if (ring.userData.rotSpeed) {
        ring.rotation.x += ring.userData.rotSpeed.x;
        ring.rotation.y += ring.userData.rotSpeed.y;
        ring.rotation.z += ring.userData.rotSpeed.z;
      }
    });

    // 3. Subtle Floating Motion + Spring Mouse Repulsion on Satellite Service Pods
    this.serviceNodes.forEach(pod => {
      // Damped spring restitution towards base position
      pod.userData.vx += (0 - pod.userData.deflectX) * 0.09;
      pod.userData.vz += (0 - pod.userData.deflectZ) * 0.09;
      pod.userData.vx *= 0.82;
      pod.userData.vz *= 0.82;
      pod.userData.deflectX += pod.userData.vx;
      pod.userData.deflectZ += pod.userData.vz;

      const orbitTheta = elapsedTime * (pod.userData.orbitSpeed * 0.05) + pod.userData.orbitPhase;
      const orbitX = Math.cos(orbitTheta) * pod.userData.orbitRadiusX;
      const orbitZ = Math.sin(orbitTheta) * pod.userData.orbitRadiusZ;
      const floatY = Math.sin(elapsedTime * 1.5 + pod.userData.orbitPhase) * 0.08;

      pod.position.x = orbitX + pod.userData.deflectX;
      pod.position.z = orbitZ + pod.userData.deflectZ;
      pod.position.y = pod.userData.originalY + floatY;

      pod.rotation.y = elapsedTime * 0.35;
    });

    // Central Core Proximity Energy Flare
    if (this.purpleCoreLight) {
      const coreDist = Math.hypot(this.mouse.x, this.mouse.y);
      if (coreDist < 0.45) {
        const proximity = (1 - coreDist / 0.45);
        this.purpleCoreLight.intensity = 4.5 + proximity * 4.5;
      } else {
        this.purpleCoreLight.intensity = 4.5;
      }
    }

    // Dynamic Energy Conduit Update
    this.energyStreams.forEach(stream => {
      const p1 = new THREE.Vector3(0, 0.95, 0);
      const p2 = stream.pod.position.clone();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 0.55;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(40);
      stream.line.geometry.setFromPoints(points);
      stream.curve = curve; // update curve for particles
    });

    // 4. Data Stream Traveling Light Pulses
    this.streamParticles.forEach(sp => {
      sp.progress += 0.008 * this.particleSpeedMultiplier;
      if (sp.progress > 1) sp.progress = 0;
      
      const matchedStream = this.energyStreams[this.streamParticles.indexOf(sp)];
      if (matchedStream && matchedStream.curve) {
          const point = matchedStream.curve.getPoint(sp.progress);
          sp.mesh.position.copy(point);
      }
    });

    // 5. Starfield Drift
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.015;
    }

    // 6. Camera Parallax & Controls
    if (!this.selectedNode && !this.isOrchestrating) {
      this.camera.position.x += (this.targetScrollPos.x + this.parallaxTarget.x - this.camera.position.x) * 0.04;
      this.camera.position.y += (this.targetScrollPos.y + this.parallaxTarget.y - this.camera.position.y) * 0.04;
      this.camera.position.z += (this.targetScrollPos.z - this.camera.position.z) * 0.04;
      this.controls.target.lerp(this.targetScrollLook, 0.04);
    }

    this.controls.update();

    // Render using AsciiShaderEffect when enabled, otherwise standard renderer
    if (this.asciiModeActive && this.asciiEffect) {
      this.asciiEffect.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  } catch (err) {
    console.warn("3D Render loop error:", err);
  }
}

  toggleAsciiMode(enabled) {
    this.asciiModeActive = enabled;
    if (this.asciiEffect) {
      this.asciiEffect.setOptions({ ascii: enabled });
    }
  }
}
