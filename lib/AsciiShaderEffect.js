import * as THREE from './three.module.js';

const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");

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

const CELL_FRAG = `
precision highp float;
out vec4 outColor;
uniform sampler2D tScene;
uniform sampler2D tShapes;
uniform vec2 uResolution;
uniform vec2 uCellPx;
uniform int uGlyphCount;
uniform float uContrast;
uniform float uEdgeContrast;
uniform float uExposure;
uniform float uInvert;
${SRGB_ENCODE}
const vec2 INNER[6] = vec2[6](
  vec2(0.28, 0.26), vec2(0.72, 0.14),
  vec2(0.28, 0.56), vec2(0.72, 0.44),
  vec2(0.28, 0.86), vec2(0.72, 0.74)
);
const vec2 OUTER[10] = vec2[10](
  vec2(0.28, -0.2), vec2(0.72, -0.2),
  vec2(-0.22, 0.25), vec2(1.22, 0.25),
  vec2(-0.22, 0.5), vec2(1.22, 0.5),
  vec2(-0.22, 0.75), vec2(1.22, 0.75),
  vec2(0.28, 1.2), vec2(0.72, 1.2)
);
const vec2 RING[6] = vec2[6](
  vec2(1.0, 0.0), vec2(0.5, 0.8660254), vec2(-0.5, 0.8660254),
  vec2(-1.0, 0.0), vec2(-0.5, -0.8660254), vec2(0.5, -0.8660254)
);
vec2 cellBase;
vec4 fetchTap(vec2 p) {
  vec2 uv = p / uResolution;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(tScene, uv);
}
vec4 sampleCircle(vec2 c) {
  vec2 middle = cellBase + vec2(c.x, 1.0 - c.y) * uCellPx;
  float r = uCellPx.y * 0.161;
  vec4 acc = fetchTap(middle);
  for (int k = 0; k < 6; k++) acc += fetchTap(middle + RING[k] * r);
  return acc / 7.0;
}
float circleLum(vec4 acc) {
  vec3 straight = toSrgb(acc.rgb / max(acc.a, 1e-4));
  float level = clamp(dot(straight, vec3(0.2126, 0.7152, 0.0722)) * uExposure, 0.0, 1.0);
  level = mix(level, 1.0 - level, uInvert);
  return level * acc.a;
}
float dirContrast(float value, float ext) {
  float peak = max(value, ext);
  if (peak < 1e-4) return value;
  return pow(value / peak, uEdgeContrast) * peak;
}
void main() {
  cellBase = floor(gl_FragCoord.xy) * uCellPx;
  float v[6];
  vec3 colAcc = vec3(0.0);
  float alphaAcc = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 acc = sampleCircle(INNER[i]);
    v[i] = circleLum(acc);
    colAcc += acc.rgb;
    alphaAcc += acc.a;
  }
  float e[10];
  for (int i = 0; i < 10; i++) e[i] = circleLum(sampleCircle(OUTER[i]));
  v[0] = dirContrast(v[0], max(max(e[0], e[1]), max(e[2], e[4])));
  v[1] = dirContrast(v[1], max(max(e[0], e[1]), max(e[3], e[5])));
  v[2] = dirContrast(v[2], max(e[2], max(e[4], e[6])));
  v[3] = dirContrast(v[3], max(e[3], max(e[5], e[7])));
  v[4] = dirContrast(v[4], max(max(e[4], e[6]), max(e[8], e[9])));
  v[5] = dirContrast(v[5], max(max(e[5], e[7]), max(e[8], e[9])));
  float peak = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));
  if (peak > 1e-4) {
    for (int i = 0; i < 6; i++) v[i] = pow(v[i] / peak, uContrast) * peak;
  }
  int best = 0;
  float bestD = 1e9;
  for (int g = 0; g < uGlyphCount; g++) {
    float d = 0.0;
    for (int i = 0; i < 6; i++) {
      float diff = v[i] - texelFetch(tShapes, ivec2(i, g), 0).r;
      d += diff * diff;
    }
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  vec3 cellColor = toSrgb(colAcc / max(alphaAcc, 1e-4));
  outColor = vec4(cellColor, float(best) / 255.0);
}`;

const POST_FRAG = `
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tScene;
uniform sampler2D tCells;
uniform sampler2D tAtlas;
uniform vec2 uResolution;
uniform vec2 uCellPx;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform vec2 uAtlasPad;
uniform vec2 uAtlasInner;
uniform float uAscii;
uniform float uColored;
uniform vec3 uColor;
uniform vec3 uBackground;
uniform float uHasBg;
${SRGB_ENCODE}
void main() {
  if (uAscii < 0.5) {
    vec4 raw = texture(tScene, vUv);
    vec3 rawColor = toSrgb(raw.rgb);
    if (uHasBg > 0.5) {
      outColor = vec4(uBackground * (1.0 - raw.a) + rawColor, 1.0);
    } else {
      outColor = vec4(rawColor, raw.a);
    }
    return;
  }
  vec2 fragCoord = vUv * uResolution;
  vec2 cellPos = fragCoord / uCellPx;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 info = texelFetch(tCells, ivec2(cell), 0);
  float glyph = floor(info.a * 255.0 + 0.5);
  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x);
  float gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2(
    (gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x,
    (uAtlasGrid.y - gy - 1.0 + uAtlasPad.y + local.y * uAtlasInner.y) /
      uAtlasGrid.y
  );
  float mask = texture(tAtlas, atlasUv).a;
  vec3 glyphColor = mix(uColor, info.rgb, uColored);
  if (uHasBg > 0.5) {
    outColor = vec4(mix(uBackground, glyphColor, mask), 1.0);
  } else {
    outColor = vec4(glyphColor, mask);
  }
};`;

const ATLAS_CELL = 64;
const ATLAS_PAD = 8;
const MAX_GLYPHS = 255;
const INNER_CIRCLES = [
  [0.28, 0.26], [0.72, 0.14],
  [0.28, 0.56], [0.72, 0.44],
  [0.28, 0.86], [0.72, 0.74],
];

function clampAspect(aspect) {
  return Math.min(Math.max(aspect || 0.6, 0.35), 1.25);
}

function buildGlyphList(charset) {
  const seen = new Set([" "]);
  const glyphs = [" "];
  for (const ch of charset) {
    if (glyphs.length >= MAX_GLYPHS) break;
    if (ch === "\n" || ch === "\r" || ch === "\t" || seen.has(ch)) continue;
    seen.add(ch);
    glyphs.push(ch);
  }
  return glyphs;
}

function glyphShapes(image, cols, cellW, cellH, count) {
  const vectors = new Float32Array(count * 6);
  const radius = cellH * 0.26;
  const padW = cellW + ATLAS_PAD * 2;
  const padH = cellH + ATLAS_PAD * 2;
  for (let g = 0; g < count; g++) {
    const originX = (g % cols) * padW + ATLAS_PAD;
    const originY = Math.floor(g / cols) * padH + ATLAS_PAD;
    for (let c = 0; c < 6; c++) {
      const cx = INNER_CIRCLES[c][0] * cellW;
      const cy = INNER_CIRCLES[c][1] * cellH;
      let sum = 0;
      let total = 0;
      for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          if (dx * dx + dy * dy > radius * radius) continue;
          total += 1;
          if (x < -ATLAS_PAD || y < -ATLAS_PAD || x >= cellW + ATLAS_PAD || y >= cellH + ATLAS_PAD) continue;
          sum += image.data[((originY + y) * image.width + originX + x) * 4 + 3];
        }
      }
      vectors[g * 6 + c] = total ? sum / (total * 255) : 0;
    }
  }
  for (let c = 0; c < 6; c++) {
    let peak = 0;
    for (let g = 0; g < count; g++) {
      peak = Math.max(peak, vectors[g * 6 + c]);
    }
    if (peak > 0) {
      for (let g = 0; g < count; g++) vectors[g * 6 + c] /= peak;
    }
  }
  const byteVectors = new Uint8Array(count * 6 * 4);
  for (let i = 0; i < count * 6; i++) {
    const val = Math.round(vectors[i] * 255);
    byteVectors[i * 4 + 0] = val; // R
    byteVectors[i * 4 + 1] = val; // G
    byteVectors[i * 4 + 2] = val; // B
    byteVectors[i * 4 + 3] = 255; // A
  }
  return byteVectors;
}

export class AsciiShaderEffect {
  constructor(renderer, scene, camera, options = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.config = {
      ascii: true,
      cellSize: 10,
      cellAspect: 0.5,
      charset: PRINTABLE_ASCII,
      colored: true,
      color: "#ffffff",
      contrast: 1.5,
      edgeContrast: 3,
      exposure: 1,
      invert: false,
      background: "",
      ...options
    };

    this.target = new THREE.WebGLRenderTarget(1, 1);
    this.target.texture.colorSpace = THREE.SRGBColorSpace;

    this.cellTarget = new THREE.WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    this.sharedResolution = new THREE.Vector2(1, 1);
    this.sharedCellPx = new THREE.Vector2(6, 10);
    this.sharedGrid = new THREE.Vector2(1, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: POST_VERT,
      fragmentShader: POST_FRAG,
      uniforms: {
        tScene: { value: this.target.texture },
        tCells: { value: this.cellTarget.texture },
        tAtlas: { value: null },
        uResolution: { value: this.sharedResolution },
        uCellPx: { value: this.sharedCellPx },
        uGrid: { value: this.sharedGrid },
        uAtlasGrid: { value: new THREE.Vector2(1, 1) },
        uAtlasPad: { value: new THREE.Vector2(0, 0) },
        uAtlasInner: { value: new THREE.Vector2(1, 1) },
        uAscii: { value: 1 },
        uColored: { value: 1 },
        uColor: { value: new THREE.Color(1, 1, 1) },
        uBackground: { value: new THREE.Color(0, 0, 0) },
        uHasBg: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });

    this.cellMaterial = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: POST_VERT,
      fragmentShader: CELL_FRAG,
      uniforms: {
        tScene: { value: this.target.texture },
        tShapes: { value: null },
        uResolution: { value: this.sharedResolution },
        uCellPx: { value: this.sharedCellPx },
        uGlyphCount: { value: 1 },
        uContrast: { value: 1.5 },
        uEdgeContrast: { value: 3 },
        uExposure: { value: 1 },
        uInvert: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });

    const postGeometry = new THREE.BufferGeometry();
    postGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
    );

    this.postMesh = new THREE.Mesh(postGeometry, this.postMaterial);
    this.postMesh.frustumCulled = false;
    this.postScene = new THREE.Scene();
    this.postScene.add(this.postMesh);

    this.cellMesh = new THREE.Mesh(postGeometry, this.cellMaterial);
    this.cellMesh.frustumCulled = false;
    this.cellScene = new THREE.Scene();
    this.cellScene.add(this.cellMesh);

    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    this.atlasTexture = null;
    this.shapeTexture = null;
    this.builtCharset = null;
    this.builtAspect = 0;

    this.applyOptions();
  }

  setOptions(options) {
    Object.assign(this.config, options);
    this.applyOptions();
  }

  rebuildAtlas() {
    const aspect = clampAspect(this.config.cellAspect);
    if (this.builtCharset === this.config.charset && this.builtAspect === aspect) return;

    const glyphs = buildGlyphList(this.config.charset);
    const cellH = ATLAS_CELL;
    const cellW = Math.max(Math.round(cellH * aspect), 8);
    const padW = cellW + ATLAS_PAD * 2;
    const padH = cellH + ATLAS_PAD * 2;
    const cols = Math.ceil(Math.sqrt(glyphs.length));
    const rows = Math.ceil(glyphs.length / cols);

    const canvas = document.createElement("canvas");
    canvas.width = cols * padW;
    canvas.height = rows * padH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    this.builtCharset = this.config.charset;
    this.builtAspect = aspect;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontPx = Math.floor(Math.min(cellH * 0.92, cellW / 0.58));
    ctx.font = \`600 \${fontPx}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace\`;

    for (let g = 0; g < glyphs.length; g++) {
      ctx.fillText(
        glyphs[g],
        (g % cols) * padW + padW / 2,
        Math.floor(g / cols) * padH + padH / 2
      );
    }

    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const vectors = glyphShapes(image, cols, cellW, cellH, glyphs.length);

    if (this.atlasTexture) this.atlasTexture.dispose();
    if (this.shapeTexture) this.shapeTexture.dispose();

    this.atlasTexture = new THREE.CanvasTexture(canvas);
    this.atlasTexture.minFilter = THREE.LinearFilter;
    this.atlasTexture.magFilter = THREE.LinearFilter;
    this.atlasTexture.generateMipmaps = false;
    this.atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.atlasTexture.wrapT = THREE.ClampToEdgeWrapping;

    this.shapeTexture = new THREE.DataTexture(
      vectors,
      6,
      glyphs.length,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    this.shapeTexture.needsUpdate = true;

    this.postMaterial.uniforms.tAtlas.value = this.atlasTexture;
    this.postMaterial.uniforms.uAtlasGrid.value.set(cols, rows);
    this.postMaterial.uniforms.uAtlasPad.value.set(ATLAS_PAD / padW, ATLAS_PAD / padH);
    this.postMaterial.uniforms.uAtlasInner.value.set(cellW / padW, cellH / padH);

    this.cellMaterial.uniforms.tShapes.value = this.shapeTexture;
    this.cellMaterial.uniforms.uGlyphCount.value = glyphs.length;
  }

  syncCellGrid() {
    const pr = this.renderer.getPixelRatio();
    const cellH = Math.max(this.config.cellSize, 3) * pr;
    const cellW = cellH * clampAspect(this.config.cellAspect);
    this.sharedCellPx.set(cellW, cellH);
    const cols = Math.max(Math.ceil(this.sharedResolution.x / cellW), 1);
    const rows = Math.max(Math.ceil(this.sharedResolution.y / cellH), 1);
    this.sharedGrid.set(cols, rows);
    if (this.cellTarget.width !== cols || this.cellTarget.height !== rows) {
      this.cellTarget.setSize(cols, rows);
    }
  }

  applyOptions() {
    this.cellMaterial.uniforms.uContrast.value = Math.max(this.config.contrast, 0.05);
    this.cellMaterial.uniforms.uEdgeContrast.value = Math.max(this.config.edgeContrast, 0.05);
    this.cellMaterial.uniforms.uExposure.value = Math.max(this.config.exposure, 0);
    this.cellMaterial.uniforms.uInvert.value = this.config.invert ? 1 : 0;
    
    this.postMaterial.uniforms.uAscii.value = this.config.ascii ? 1 : 0;
    this.postMaterial.uniforms.uColored.value = this.config.colored ? 1 : 0;
    this.postMaterial.uniforms.uColor.value.setStyle(this.config.color || "#ffffff");
    this.postMaterial.uniforms.uHasBg.value = this.config.background ? 1 : 0;
    if (this.config.background) {
      this.postMaterial.uniforms.uBackground.value.setStyle(this.config.background);
    }
    this.rebuildAtlas();
    this.syncCellGrid();
  }

  setSize(width, height) {
    const pr = this.renderer.getPixelRatio();
    const deviceW = Math.round(width * pr);
    const deviceH = Math.round(height * pr);
    this.target.setSize(deviceW, deviceH);
    this.sharedResolution.set(deviceW, deviceH);
    this.syncCellGrid();
  }

  render() {
    // If ASCII mode is not active, render scene directly to screen with zero overhead
    if (!this.config.ascii) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    try {
      // 1. Render main scene to offscreen render target
      this.renderer.setRenderTarget(this.target);
      this.renderer.render(this.scene, this.camera);

      // 2. Render cell matching pass
      this.renderer.setRenderTarget(this.cellTarget);
      this.renderer.render(this.cellScene, this.postCamera);

      // 3. Render final ASCII post pass to screen
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCamera);
    } catch (err) {
      console.warn("ASCII post pass error, falling back to direct render:", err);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.target.dispose();
    this.cellTarget.dispose();
    this.cellMaterial.dispose();
    this.postMaterial.dispose();
    this.postMesh.geometry.dispose();
    if (this.atlasTexture) this.atlasTexture.dispose();
    if (this.shapeTexture) this.shapeTexture.dispose();
  }
}
