/**
 * 3D Dithered Object Studio Engine (Vanilla Three.js)
 * Inspired by CanvasUI DitheredObject
 * 
 * Renders 3D extruded geometry (Creo brand glyph) floating in a lit studio
 * with real-time Bayer Matrix, Halftone Dots, and Floyd–Steinberg post-processing dither shaders.
 */

import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

const DEFAULTS = {
  src: 'assets/brand-glyph-solid.svg',
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
  method: 'halftone', // 'bayer' | 'halftone' | 'floyd'
  gridSize: 3.5,
  pixelSizeRatio: 1.0,
  grayscale: false,
  invert: false,
  dither: true,
  highlight: '#c084fc',
  cameraDistance: 6.8,
  fov: 46,
  autoRotate: false,
  autoRotateSpeed: 0,
  floatSpeed: 1.6,
  floatIntensity: 0.09,
};

const POST_VERT = `
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const SRGB_ENCODE = `
vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
`;

const LEVEL_FRAG = `
precision highp float;
out vec4 outColor;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uGridSize;
uniform float uPixelSizeRatio;
${SRGB_ENCODE}
void main() {
  vec2 fragCoord = (floor(gl_FragCoord.xy) + 0.5) * uGridSize;
  float pixelSize = uGridSize * uPixelSizeRatio;
  vec2 pixelUv = (floor(fragCoord / pixelSize) + 0.5) * pixelSize / uResolution;
  vec4 tex = texture(tDiffuse, pixelUv);
  outColor = vec4(toSrgb(tex.rgb), tex.a);
}`;

const POST_FRAG = `
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uGridSize;
uniform float uPixelSizeRatio;
uniform float uGrayscale;
uniform float uInvert;
uniform float uDither;
uniform int uMethod;
uniform sampler2D tMask;

const mat4 THRESHOLDS = mat4(
  0.94118, 0.29412, 0.76471, 0.05882,
  0.47059, 0.70588, 0.23529, 0.52941,
  0.82353, 0.11765, 0.88235, 0.17647,
  0.35294, 0.58824, 0.41176, 0.64706
);

const float SCREEN_ANGLE = 0.70710678;
const float CORNER_REACH = 1.41421356;
${SRGB_ENCODE}

float bayerThreshold(vec2 cellCoord) {
  ivec2 p = ivec2(mod(cellCoord, 4.0));
  return THRESHOLDS[p.x][p.y];
}

float halftoneThreshold(vec2 cellCoord) {
  vec2 screen = vec2(
    cellCoord.x * SCREEN_ANGLE - cellCoord.y * SCREEN_ANGLE,
    cellCoord.x * SCREEN_ANGLE + cellCoord.y * SCREEN_ANGLE
  );
  return clamp(length(fract(screen) - 0.5) * CORNER_REACH, 0.0, 1.0);
}

float thresholdAt(vec2 cellCoord) {
  if (uMethod == 1) return halftoneThreshold(cellCoord);
  return bayerThreshold(cellCoord);
}

bool maskAt(vec2 cellCoord) {
  ivec2 last = textureSize(tMask, 0) - ivec2(1);
  ivec2 cell = clamp(ivec2(floor(cellCoord)), ivec2(0), last);
  return texelFetch(tMask, cell, 0).r > 0.5;
}

void main() {
  vec2 fragCoord = vUv * uResolution;
  if (uDither < 0.5) {
    vec4 raw = texture(tDiffuse, vUv);
    outColor = vec4(toSrgb(raw.rgb) * raw.a, raw.a);
    return;
  }
  float pixelSize = uGridSize * uPixelSizeRatio;

  vec2 pixelUv = (floor(fragCoord / pixelSize) + 0.5) * pixelSize / uResolution;
  vec4 tex = texture(tDiffuse, pixelUv);
  vec3 color = toSrgb(tex.rgb);

  float level = dot(color, vec3(0.299, 0.587, 0.114));
  if (uGrayscale > 0.5) color = vec3(level);
  vec2 cellCoord = fragCoord / uGridSize;
  bool lit = (uMethod == 2)
    ? maskAt(cellCoord)
    : (level >= thresholdAt(cellCoord));
  if (!lit) color = vec3(0.04, 0.02, 0.08); // Deep obsidian void shadow
  if (uInvert > 0.5) color = 1.0 - color;

  outColor = vec4(color * tex.a, tex.a);
}`;

function diffuse(pixels, mask, rows, width, height) {
  let current = rows[0];
  let next = rows[1];
  current.fill(0);
  for (let y = 0; y < height; y++) {
    next.fill(0);
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = (row + x) * 4;
      const tone =
        Math.min((pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) / 255, 1) +
        current[x + 1];
      const lit = tone >= 0.5;
      mask[row + x] = lit ? 255 : 0;
      const error = lit ? tone - 1 : tone;
      current[x + 2] += error * 0.4375;
      next[x] += error * 0.1875;
      next[x + 1] += error * 0.3125;
      next[x + 2] += error * 0.0625;
    }
    const spent = current;
    current = next;
    next = spent;
  }
}

const RASTER_SIZE = 1024;
const TRACE_SIZE = 256;
const ALPHA_CUTOFF = 20;
const SIMPLIFY_TOLERANCE = 1.5;
const MIN_AREA = 16;
const MAX_CONTOURS = 64;
const EXTRUDE_DEPTH = 0.28;
const BEVEL_SIZE = 0.04;
const CAMERA_DIR = new THREE.Vector3(0, 0.4, 3.8).normalize();
const MODEL_LIFT = 0.1;

function drawToCanvas(image, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function decodeWithImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    image.src = url;
  });
}

async function decodeImage(blob, isSvg) {
  let width = RASTER_SIZE;
  let height = RASTER_SIZE;
  if (isSvg) {
    try {
      const text = await blob.text();
      const vbMatch = text.match(/viewBox=["']\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*["']/);
      if (vbMatch) {
        const vbW = parseFloat(vbMatch[3]);
        const vbH = parseFloat(vbMatch[4]);
        if (vbW > 0 && vbH > 0) {
          const ratio = vbW / vbH;
          if (ratio >= 1) {
            width = RASTER_SIZE;
            height = Math.round(RASTER_SIZE / ratio);
          } else {
            height = RASTER_SIZE;
            width = Math.round(RASTER_SIZE * ratio);
          }
        }
      }
    } catch (e) {}
  } else {
    const image = await decodeWithImage(blob);
    width = image.naturalWidth || RASTER_SIZE;
    height = image.naturalHeight || RASTER_SIZE;
    const longest = Math.max(width, height, 1);
    const scale = Math.min(1, RASTER_SIZE / longest);
    return drawToCanvas(image, width * scale, height * scale);
  }
  const image = await decodeWithImage(blob);
  return drawToCanvas(image, width, height);
}

function traceContours(inside, width, height) {
  const segments = [];
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const base = y * width + x;
      const code =
        inside[base] |
        (inside[base + 1] << 1) |
        (inside[base + width + 1] << 2) |
        (inside[base + width] << 3);
      if (code === 0 || code === 15) continue;
      const x0 = x + 0.5;
      const y0 = y + 0.5;
      switch (code) {
        case 1: segments.push(x0, y0 + 0.5, x0 + 0.5, y0); break;
        case 2: segments.push(x0 + 0.5, y0, x0 + 1.0, y0 + 0.5); break;
        case 3: segments.push(x0, y0 + 0.5, x0 + 1.0, y0 + 0.5); break;
        case 4: segments.push(x0 + 1.0, y0 + 0.5, x0 + 0.5, y0 + 1.0); break;
        case 5: segments.push(x0, y0 + 0.5, x0 + 0.5, y0, x0 + 1.0, y0 + 0.5, x0 + 0.5, y0 + 1.0); break;
        case 6: segments.push(x0 + 0.5, y0, x0 + 0.5, y0 + 1.0); break;
        case 7: segments.push(x0, y0 + 0.5, x0 + 0.5, y0 + 1.0); break;
        case 8: segments.push(x0 + 0.5, y0 + 1.0, x0, y0 + 0.5); break;
        case 9: segments.push(x0 + 0.5, y0 + 1.0, x0 + 0.5, y0); break;
        case 10: segments.push(x0 + 0.5, y0 + 1.0, x0, y0 + 0.5, x0 + 0.5, y0, x0 + 1.0, y0 + 0.5); break;
        case 11: segments.push(x0 + 0.5, y0 + 1.0, x0 + 1.0, y0 + 0.5); break;
        case 12: segments.push(x0 + 1.0, y0 + 0.5, x0, y0 + 0.5); break;
        case 13: segments.push(x0 + 1.0, y0 + 0.5, x0 + 0.5, y0); break;
        case 14: segments.push(x0 + 0.5, y0, x0, y0 + 0.5); break;
      }
    }
  }

  // Link segments into rings
  const rings = [];
  const pointKey = (x, y) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
  const linkMap = new Map();

  for (let i = 0; i < segments.length; i += 4) {
    const k1 = pointKey(segments[i], segments[i + 1]);
    const k2 = pointKey(segments[i + 2], segments[i + 3]);
    if (!linkMap.has(k1)) linkMap.set(k1, []);
    linkMap.get(k1).push([segments[i + 2], segments[i + 3]]);
  }

  const visited = new Set();
  for (let i = 0; i < segments.length; i += 4) {
    const startX = segments[i];
    const startY = segments[i + 1];
    const sk = pointKey(startX, startY);
    if (visited.has(sk)) continue;

    const ring = [startX, startY];
    let currX = segments[i + 2];
    let currY = segments[i + 3];
    visited.add(sk);

    for (let step = 0; step < 2000; step++) {
      ring.push(currX, currY);
      const ck = pointKey(currX, currY);
      visited.add(ck);
      if (pointKey(currX, currY) === sk) break;
      const nexts = linkMap.get(ck);
      if (!nexts || !nexts.length) break;
      const next = nexts.pop();
      currX = next[0];
      currY = next[1];
    }
    if (ring.length >= 8) rings.push(ring);
  }
  return rings;
}

function simplify(points, tolerance) {
  const count = points.length / 2;
  if (count <= 2) return points.slice();
  const keep = new Uint8Array(count);
  keep[0] = 1;
  keep[count - 1] = 1;
  const tolSq = tolerance * tolerance;
  const stack = [0, count - 1];

  while (stack.length > 0) {
    const last = stack.pop();
    const first = stack.pop();
    let farthest = -1;
    let farthestSq = tolSq;
    const x1 = points[first * 2];
    const y1 = points[first * 2 + 1];
    const x2 = points[last * 2];
    const y2 = points[last * 2 + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    for (let i = first + 1; i < last; i++) {
      const px = points[i * 2] - x1;
      const py = points[i * 2 + 1] - y1;
      const t = lengthSq > 0 ? (px * dx + py * dy) / lengthSq : 0;
      const clamped = Math.max(0, Math.min(1, t));
      const ox = px - dx * clamped;
      const oy = py - dy * clamped;
      const distanceSq = ox * ox + oy * oy;
      if (distanceSq > farthestSq) {
        farthest = i;
        farthestSq = distanceSq;
      }
    }
    if (farthest >= 0) {
      keep[farthest] = 1;
      stack.push(first, farthest, farthest, last);
    }
  }

  const result = [];
  for (let i = 0; i < count; i++) {
    if (keep[i]) result.push(points[i * 2], points[i * 2 + 1]);
  }
  return result;
}

function ringArea(points) {
  let area = 0;
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    area += (points[j] - points[i]) * (points[j + 1] + points[i + 1]);
  }
  return Math.abs(area) / 2;
}

function ringContains(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    const yi = points[i + 1];
    const yj = points[j + 1];
    if ((yi > y) === (yj > y)) continue;
    const t = (y - yi) / (yj - yi);
    if (x < points[i] + t * (points[j] - points[i])) inside = !inside;
  }
  return inside;
}

function buildShapes(canvas, aspectW, aspectH) {
  const rectangle = () =>
    new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(aspectW, 0),
      new THREE.Vector2(aspectW, aspectH),
      new THREE.Vector2(0, aspectH),
    ]);

  const scale = Math.min(1, TRACE_SIZE / Math.max(canvas.width, canvas.height, 1));
  const trace = scale < 1 ? drawToCanvas(canvas, canvas.width * scale, canvas.height * scale) : canvas;
  const ctx = trace.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [rectangle()];

  const traceW = trace.width;
  const traceH = trace.height;
  const data = ctx.getImageData(0, 0, traceW, traceH).data;
  const width = traceW + 2;
  const height = traceH + 2;
  const inside = new Uint8Array(width * height);
  let covered = 0;

  for (let y = 0; y < traceH; y++) {
    for (let x = 0; x < traceW; x++) {
      const on = data[(y * traceW + x) * 4 + 3] >= ALPHA_CUTOFF ? 1 : 0;
      inside[(y + 1) * width + x + 1] = on;
      covered += on;
    }
  }
  if (covered >= traceW * traceH * 0.995) return [rectangle()];

  const rings = traceContours(inside, width, height)
    .map((points) => simplify(points, SIMPLIFY_TOLERANCE))
    .filter((points) => points.length >= 6 && ringArea(points) >= MIN_AREA)
    .map((points) => ({ points, area: ringArea(points), depth: 0 }))
    .sort((a, b) => b.area - a.area)
    .slice(0, MAX_CONTOURS);

  if (!rings.length) return [rectangle()];

  for (const ring of rings) {
    for (const other of rings) {
      if (
        other !== ring &&
        other.area > ring.area &&
        ringContains(other.points, ring.points[0], ring.points[1])
      ) {
        ring.depth += 1;
      }
    }
  }

  const toPath = (points) => {
    const path = [];
    for (let i = 0; i < points.length; i += 2) {
      path.push(
        new THREE.Vector2(
          ((points[i] - 0.5) / traceW) * aspectW,
          (1 - (points[i + 1] - 0.5) / traceH) * aspectH,
        ),
      );
    }
    return path;
  };

  const shapes = new Map();
  for (const ring of rings) {
    if (ring.depth % 2 === 0) shapes.set(ring, new THREE.Shape(toPath(ring.points)));
  }
  for (const ring of rings) {
    if (ring.depth % 2 === 0) continue;
    let parent = null;
    for (const other of rings) {
      if (other.depth !== ring.depth - 1) continue;
      if (!ringContains(other.points, ring.points[0], ring.points[1])) continue;
      if (!parent || other.area < parent.area) parent = other;
    }
    const shape = parent ? shapes.get(parent) : undefined;
    if (shape) shape.holes.push(new THREE.Path(toPath(ring.points)));
  }
  const result = [...shapes.values()];
  return result.length ? result : [rectangle()];
}

function createImageMesh(canvas, anisotropy, sideColor = '#7c3aed') {
  const longest = Math.max(canvas.width, canvas.height, 1);
  const aspectW = canvas.width / longest;
  const aspectH = canvas.height / longest;
  const shapes = buildShapes(canvas, aspectW, aspectH);

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: EXTRUDE_DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL_SIZE,
    bevelSize: BEVEL_SIZE,
    bevelOffset: 0,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 2,
  });

  geometry.center();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.25,
    metalness: 0.35,
  });

  const sideMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(sideColor),
    roughness: 0.4,
    metalness: 0.6,
  });

  const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
  return mesh;
}

export function createDitheredObject(elements, options = {}) {
  const { canvas } = elements;
  const config = { ...DEFAULTS, ...options };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.error('WebGLRenderer initialization failed:', err);
    return null;
  }

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(config.fov, 1, 0.1, 100);
  camera.position.copy(CAMERA_DIR).multiplyScalar(config.cameraDistance);

  const floatGroup = new THREE.Group();
  floatGroup.position.y = MODEL_LIFT;
  const fitGroup = new THREE.Group();
  floatGroup.add(fitGroup);
  scene.add(floatGroup);

  // Lighting Studio Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(new THREE.Color(config.highlight), 3.5);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  const topSpot = new THREE.SpotLight(0xc084fc, 2.8, 20, Math.PI / 4, 0.5);
  topSpot.position.set(0, 8, 2);
  topSpot.target = floatGroup;
  scene.add(topSpot);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.minDistance = 3.0;
  controls.maxDistance = 12.0;

  // Render Targets & Shaders
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;

  const postMaterial = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: POST_VERT,
    fragmentShader: POST_FRAG,
    uniforms: {
      tDiffuse: { value: target.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uGridSize: { value: config.gridSize },
      uPixelSizeRatio: { value: config.pixelSizeRatio },
      uGrayscale: { value: config.grayscale ? 1 : 0 },
      uInvert: { value: config.invert ? 1 : 0 },
      uDither: { value: config.dither ? 1 : 0 },
      uMethod: { value: config.method === 'halftone' ? 1 : config.method === 'floyd' ? 2 : 0 },
      tMask: { value: null },
    },
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });

  const postGeometry = new THREE.BufferGeometry();
  postGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
  );
  const postMesh = new THREE.Mesh(postGeometry, postMaterial);
  postMesh.frustumCulled = false;
  const postScene = new THREE.Scene();
  postScene.add(postMesh);
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Floyd-Steinberg diffusion buffers
  let diffusionTarget = null;
  let diffusionTexture = null;
  let diffusionPixelBuffer = null;
  let diffusionMaskBuffer = null;
  let diffusionRowBuffers = null;

  function ensureDiffusionBuffers(w, h) {
    const size = w * h;
    if (!diffusionTarget || diffusionTarget.width !== w || diffusionTarget.height !== h) {
      if (diffusionTarget) diffusionTarget.dispose();
      diffusionTarget = new THREE.WebGLRenderTarget(w, h, { depthBuffer: false });
      diffusionPixelBuffer = new Uint8Array(size * 4);
      diffusionMaskBuffer = new Uint8Array(size);
      diffusionRowBuffers = [new Float32Array(w + 2), new Float32Array(w + 2)];
      if (diffusionTexture) diffusionTexture.dispose();
      diffusionTexture = new THREE.DataTexture(diffusionMaskBuffer, w, h, THREE.RedFormat, THREE.UnsignedByteType);
      postMaterial.uniforms.tMask.value = diffusionTexture;
    }
  }

  let disposed = false;
  let loopRunning = false;
  let inView = true;
  const letterGroups = [];
  let currentTheme = 'purple';
  let isTransitioning = false;

  async function loadModels(isWhite = false) {
    try {
      while (fitGroup.children.length > 0) {
        const c = fitGroup.children[0];
        c.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
        fitGroup.remove(c);
      }
      letterGroups.length = 0;

      const list = isWhite ? config.srcsWhite : (config.srcs || [config.src]);
      const count = list.length;
      const spacing = 1.95;
      const startX = -((count - 1) * spacing) / 2;

      for (let i = 0; i < count; i++) {
        const src = list[i];
        const response = await fetch(src);
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${src}`);
        const blob = await response.blob();
        const canvasAsset = await decodeImage(blob, true);
        if (disposed) return;

        const sideColor = isWhite ? '#ffffff' : '#7c3aed';
        const mesh = createImageMesh(canvasAsset, renderer.capabilities.getMaxAnisotropy(), sideColor);

        const letterGroup = new THREE.Group();
        letterGroup.add(mesh);
        letterGroup.position.x = startX + i * spacing;

        const box = new THREE.Box3().setFromObject(mesh);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        if (sphere.radius > 0) {
          const targetRadius = 1.05;
          const scale = targetRadius / sphere.radius;
          letterGroup.scale.setScalar(scale);
        }

        fitGroup.add(letterGroup);
        letterGroups.push(letterGroup);
      }
    } catch (err) {
      console.warn('Failed to load dithered model SVGs:', err);
    }
  }

  async function setTheme(theme) {
    if (theme === currentTheme || isTransitioning) return;
    isTransitioning = true;
    currentTheme = theme;
    const isWhite = theme === 'white';

    const baseGrid = config.gridSize;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const startTime = performance.now();
    const glitchDuration = 380;

    const animPulse = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < glitchDuration) {
        const progress = elapsed / glitchDuration;
        const shock = Math.sin(progress * Math.PI) * 1.8;
        postMaterial.uniforms.uGridSize.value = (baseGrid + shock) * dpr;
        requestAnimationFrame(animPulse);
      } else {
        postMaterial.uniforms.uGridSize.value = baseGrid * dpr;
      }
    };
    animPulse();

    await loadModels(isWhite);

    rimLight.color.set(isWhite ? 0xffffff : config.highlight);
    rimLight.intensity = isWhite ? 2.8 : 3.5;
    topSpot.color.set(isWhite ? 0xf8fafc : 0xc084fc);
    topSpot.intensity = isWhite ? 3.4 : 2.8;

    isTransitioning = false;
  }

  function resize() {
    if (disposed) return;
    const parent = canvas.parentElement || canvas;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(dpr);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const renderW = Math.round(width * dpr);
    const renderH = Math.round(height * dpr);
    target.setSize(renderW, renderH);

    postMaterial.uniforms.uResolution.value.set(renderW, renderH);
    postMaterial.uniforms.uGridSize.value = config.gridSize * dpr;
  }

  let lastTime = 0;
  function tick(time) {
    if (disposed || !loopRunning || !inView) return;
    const t = time * 0.001;
    const dt = lastTime ? Math.min(0.1, t - lastTime) : 0.016;
    lastTime = t;

    controls.update();

    // No turntable rotation - letters stay stationary
    floatGroup.rotation.set(0, 0, 0);

    // Subtle individual floating bobbing for each letter
    letterGroups.forEach((group, i) => {
      const phase = i * 0.75;
      group.position.y = Math.sin(t * config.floatSpeed + phase) * config.floatIntensity;
    });

    // Render 3D scene to offscreen target
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);

    // If Floyd-Steinberg mode is active, run diffusion
    if (postMaterial.uniforms.uMethod.value === 2) {
      const gSize = postMaterial.uniforms.uGridSize.value * postMaterial.uniforms.uPixelSizeRatio.value;
      const dw = Math.max(1, Math.floor(target.width / gSize));
      const dh = Math.max(1, Math.floor(target.height / gSize));
      ensureDiffusionBuffers(dw, dh);

      renderer.setRenderTarget(diffusionTarget);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(diffusionTarget, 0, 0, dw, dh, diffusionPixelBuffer);
      diffuse(diffusionPixelBuffer, diffusionMaskBuffer, diffusionRowBuffers, dw, dh);
      diffusionTexture.needsUpdate = true;
    }

    // Render post-process quad to screen
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  function startLoop() {
    if (loopRunning || disposed || !inView) return;
    loopRunning = true;
    renderer.setAnimationLoop(tick);
  }

  function stopLoop() {
    loopRunning = false;
    renderer.setAnimationLoop(null);
  }

  resize();
  loadModels(false);
  startLoop();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas.parentElement || canvas);

  // Viewport IntersectionObserver — Pauses WebGL rendering when off-screen to guarantee 120fps scrolling
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      inView = entry.isIntersecting;
      if (inView) {
        startLoop();
      } else {
        stopLoop();
      }
    });
  }, { rootMargin: '120px 0px 120px 0px' });
  visibilityObserver.observe(canvas.parentElement || canvas);

  const instance = {
    setMethod(method) {
      config.method = method;
      const mIdx = method === 'halftone' ? 1 : method === 'floyd' ? 2 : 0;
      postMaterial.uniforms.uMethod.value = mIdx;
    },
    setGridSize(size) {
      config.gridSize = size;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      postMaterial.uniforms.uGridSize.value = size * dpr;
    },
    setTheme,
    getTheme: () => currentTheme,
    resize,
    start: startLoop,
    stop: stopLoop,
    destroy() {
      disposed = true;
      stopLoop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      target.dispose();
      if (diffusionTarget) diffusionTarget.dispose();
      if (diffusionTexture) diffusionTexture.dispose();
    }
  };

  return instance;
}

if (typeof window !== 'undefined') {
  window.createDitheredObject = createDitheredObject;
  window.dispatchEvent(new CustomEvent('creo:dither-ready'));
}
