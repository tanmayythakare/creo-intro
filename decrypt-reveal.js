/**
 * Decrypt Reveal WebGL2 Engine (Vanilla Port)
 * Inspired by CanvasUI DecryptReveal
 * 
 * Renders high-performance ASCII cipher matrices that decrypt upon cursor proximity
 * with chromatic aberration, edge flicker, and wavefront glow.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.createDecryptReveal = factory().createDecryptReveal;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');

  const DEFAULTS = {
    radius: 320,
    softness: 0.45,
    cell: 11,
    aspect: 0.65,
    charset: PRINTABLE_ASCII,
    colored: 1.0,
    color: '#c084fc',
    brightness: 1.2,
    legibility: 0.95,
    contrast: 1.1,
    exposure: 1.1,
    scramble: 0.18,
    scrambleSpeed: 9.0,
    edgeWidth: 0.22,
    edgeFlicker: 0.9,
    edgeGlow: 2.4,
    edgeTint: 0.85,
    aberration: 14.0,
    passthrough: 0.1,
    threshold: 0.02,
    background: '#090714',
    smoothing: 0.18,
  };

  const ATLAS_CELL = 64;
  const ATLAS_PAD = 8;
  const MAX_GLYPHS = 255;

  const INNER_CIRCLES = [
    [0.28, 0.26],
    [0.72, 0.14],
    [0.28, 0.56],
    [0.72, 0.44],
    [0.28, 0.86],
    [0.72, 0.74],
  ];

  const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  const CELL_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uShapes;
uniform vec2 uContentRes;
uniform vec2 uCellPx;
uniform int uGlyphCount;
uniform float uContrast;
uniform float uExposure;
uniform float uThreshold;
uniform vec3 uBg;

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

vec4 fetchTap (vec2 p) {
  vec2 uv = p / uContentRes;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uContent, uv);
}

vec4 sampleCircle (vec2 c) {
  vec2 middle = cellBase + c * uCellPx;
  float r = uCellPx.y * 0.161;
  vec4 acc = fetchTap(middle);
  for (int k = 0; k < 6; k++) acc += fetchTap(middle + RING[k] * r);
  return acc / 7.0;
}

float luma (vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main () {
  cellBase = floor(gl_FragCoord.xy) * uCellPx;
  vec4 inPix[6];
  float inLuma[6];
  float inMax = 0.0;
  for (int i = 0; i < 6; i++) {
    inPix[i] = sampleCircle(INNER[i]);
    inLuma[i] = luma(inPix[i].rgb);
    inMax = max(inMax, inLuma[i]);
  }

  float outLuma[10];
  float outMax = 0.0;
  for (int i = 0; i < 10; i++) {
    outLuma[i] = luma(sampleCircle(OUTER[i]).rgb);
    outMax = max(outMax, outLuma[i]);
  }

  float bgLuma = luma(uBg);
  float outerLuma = max(outMax, bgLuma);
  float sig = 0.0;
  for (int i = 0; i < 6; i++) {
    sig = max(sig, abs(inLuma[i] - outerLuma));
  }

  vec4 avgPix = (inPix[0] + inPix[1] + inPix[2] + inPix[3] + inPix[4] + inPix[5]) / 6.0;
  vec3 avgColor = avgPix.rgb;

  if (sig < uThreshold || inMax <= 1e-4) {
    outColor = vec4(avgColor, 0.0);
    return;
  }

  float localMin = outerLuma;
  float localMax = inMax;
  float range = max(localMax - localMin, 0.05);

  float targetContrast[6];
  for (int i = 0; i < 6; i++) {
    float norm = clamp((inLuma[i] - localMin) / range, 0.0, 1.0);
    targetContrast[i] = pow(norm, uContrast);
  }

  int bestGlyph = 1;
  float bestDist = 1e9;
  for (int g = 1; g < uGlyphCount; g++) {
    float d = 0.0;
    for (int i = 0; i < 6; i++) {
      float shape = texelFetch(uShapes, ivec2(i, g), 0).r;
      float diff = targetContrast[i] - shape;
      d += diff * diff;
    }
    if (d < bestDist) {
      bestDist = d;
      bestGlyph = g;
    }
  }

  outColor = vec4(avgColor, float(bestGlyph) / 255.0);
}`;

  const MAIN_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform sampler2D uAtlas;
uniform sampler2D uCells;
uniform vec2 uOutputRes;
uniform vec2 uContentRes;
uniform vec2 uCellPx;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform vec2 uAtlasPad;
uniform vec2 uAtlasInner;
uniform vec2 uPointer;
uniform float uActive;
uniform float uRadius;
uniform float uSoftness;
uniform float uEdgeWidth;
uniform float uEdgeFlicker;
uniform float uEdgeGlow;
uniform float uEdgeTint;
uniform float uAberration;
uniform float uScramble;
uniform float uScrambleSpeed;
uniform float uColored;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uLegibility;
uniform float uPassthrough;
uniform vec3 uBg;
uniform float uTime;
uniform float uDpr;
uniform int uCaptured;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 samp (vec2 p) {
  if (uCaptured == 0) return vec4(0.0);
  vec2 uv = p * uDpr / uContentRes;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uContent, uv);
}

void main () {
  vec2 pc = gl_FragCoord.xy / uDpr;
  float dist = distance(pc, uPointer);
  float radius = max(uRadius, 1.0);
  float inner = radius * (1.0 - clamp(uSoftness, 0.02, 1.0));
  float e = (1.0 - smoothstep(inner, radius, dist)) * uActive;

  float bandW = max(radius * clamp(uEdgeWidth, 0.0, 1.0) * 0.5, 6.0);
  float bandD = dist - mix(inner, radius, 0.5);
  float ring = exp(-bandD * bandD / (2.0 * bandW * bandW)) * uActive;

  vec2 dir = (pc - uPointer) / max(dist, 1e-3);
  float ca = uAberration * ring;
  vec4 rC = samp(pc);
  vec3 real = vec3(samp(pc + dir * ca).r, rC.g, samp(pc - dir * ca).b);

  vec2 cellPos = pc * uDpr / uCellPx;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 info = texelFetch(uCells, ivec2(cell), 0);
  float glyph = floor(info.a * 255.0 + 0.5);

  float rerollP = clamp(uScramble * 0.35 + ring * uEdgeFlicker, 0.0, 1.0);
  float speed = max(uScrambleSpeed, 0.001) * (1.0 + ring * 2.5);
  float ft = floor(uTime * speed);
  float swap = step(1.0 - rerollP, hash(cell * 3.3 + vec2(ft * 0.717, ft * 0.523)))
    * step(0.5, glyph);
  float pick = hash(cell + vec2(ft * 0.613, ft * 0.831));
  glyph = mix(glyph, floor(pick * float(uGlyphCount - 1)) + 1.0, swap);

  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x);
  float gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2(
    (gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x,
    (gy + uAtlasPad.y + local.y * uAtlasInner.y) / uAtlasGrid.y
  );
  vec2 atlasStep = uAtlasInner / uAtlasGrid;
  float mask = textureGrad(
    uAtlas,
    atlasUv,
    dFdx(cellPos) * atlasStep,
    dFdy(cellPos) * atlasStep
  ).a * step(0.5, glyph);

  vec3 cellCol = info.rgb;
  vec3 lw = vec3(0.299, 0.587, 0.114);
  vec3 dev = cellCol - uBg;
  float mag = dot(abs(dev), lw);
  float target = clamp(uLegibility, 0.0, 1.0) * 0.75;
  float boost = clamp(target / max(mag, 0.01), 1.0, 32.0);
  vec3 vivid = clamp(uBg + dev * boost, 0.0, 1.0);
  float vividMag = dot(abs(vivid - uBg), lw);
  vec3 ink = mix(vec3(1.0), vec3(0.06), step(0.5, dot(uBg, lw)));
  vivid = mix(vivid, ink, clamp((target - vividMag) / max(target, 1e-3), 0.0, 1.0));
  float cellSig = clamp(mag * 1.6, 0.0, 1.0);
  vec3 mono = uColor * mix(0.35, 1.2, cellSig);
  vec3 glyphColor = mix(mono, vivid, clamp(uColored, 0.0, 1.0));
  glyphColor = clamp(uBg + (glyphColor - uBg) * uBrightness, 0.0, 1.0);
  float cellLum = dot(vivid, lw);
  glyphColor = mix(
    glyphColor,
    uColor * max(uBrightness, 1.0) * (0.6 + cellLum),
    ring * clamp(uEdgeTint, 0.0, 1.0)
  );
  glyphColor = clamp(
    uBg + (glyphColor - uBg) * (1.0 + ring * uEdgeGlow * 1.6),
    0.0,
    1.0
  );

  vec3 base = mix(uBg, real, clamp(uPassthrough, 0.0, 1.0));
  vec3 encrypted = mix(base, glyphColor, mask);
  vec3 col = mix(encrypted, real, e);
  float alpha = mix(max(rC.a, mask), rC.a, e);
  outColor = vec4(col, alpha);
}`;

  let colorProbe = null;
  function parseColor(input) {
    if (typeof document === 'undefined') return [0, 0, 0];
    if (!colorProbe) {
      const probe = document.createElement('canvas');
      probe.width = 1;
      probe.height = 1;
      colorProbe = probe.getContext('2d', { willReadFrequently: true });
    }
    if (!colorProbe) return [0, 0, 0];
    colorProbe.fillStyle = '#000000';
    colorProbe.fillStyle = input;
    colorProbe.clearRect(0, 0, 1, 1);
    colorProbe.fillRect(0, 0, 1, 1);
    const data = colorProbe.getImageData(0, 0, 1, 1).data;
    return [data[0] / 255, data[1] / 255, data[2] / 255];
  }

  function buildGlyphList(charset) {
    const seen = new Set([' ']);
    const glyphs = [' '];
    for (const ch of charset) {
      if (glyphs.length >= MAX_GLYPHS) break;
      if (ch === '\n' || ch === '\r' || ch === '\t' || seen.has(ch)) continue;
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
    return vectors;
  }

  function clampAspect(aspect) {
    return Math.min(Math.max(aspect || DEFAULTS.aspect, 0.35), 1.25);
  }

  function createDecryptReveal(elements, options = {}) {
    const config = { ...DEFAULTS, ...options };
    const { container, output } = elements;

    const gl = output.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl || gl.isContextLost()) {
      console.warn('WebGL2 not supported for DecryptReveal');
      return null;
    }

    let disposed = false;
    let contentDirty = true;
    let cellsDirty = true;

    // Create offscreen canvas for rendering the crisp terminal content
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d');

    function compile(type, text) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('DecryptReveal shader error:', gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    function link(frag) {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      const uniforms = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(program, i);
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
      return { program, vs, fs, uniforms };
    }

    const cellPass = link(CELL_FRAG);
    const mainPass = link(MAIN_FRAG);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    function makeTexture(filter) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    }

    const contentTexture = makeTexture(gl.LINEAR);
    const cellTexture = makeTexture(gl.NEAREST);
    const cellFbo = gl.createFramebuffer();

    let atlasTexture = null;
    let shapeTexture = null;
    let glyphCount = 0;
    let atlasCols = 1;
    let atlasRows = 1;
    let atlasCellW = 1;
    let atlasCellH = 1;
    let builtCharset = '';
    let builtAspect = 0;

    function buildAtlas() {
      const glyphs = buildGlyphList(config.charset);
      glyphCount = glyphs.length;
      builtCharset = config.charset;
      builtAspect = clampAspect(config.aspect);

      atlasCellH = ATLAS_CELL;
      atlasCellW = Math.max(8, Math.round(atlasCellH * builtAspect));
      const padW = atlasCellW + ATLAS_PAD * 2;
      const padH = atlasCellH + ATLAS_PAD * 2;

      atlasCols = Math.min(16, Math.max(1, Math.ceil(Math.sqrt(glyphCount))));
      atlasRows = Math.ceil(glyphCount / atlasCols);

      const atlasCanvas = document.createElement('canvas');
      atlasCanvas.width = atlasCols * padW;
      atlasCanvas.height = atlasRows * padH;
      const actx = atlasCanvas.getContext('2d', { willReadFrequently: true });
      actx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      actx.font = `${atlasCellH}px 'JetBrains Mono', 'Fira Code', monospace`;
      actx.fillStyle = '#ffffff';
      actx.textAlign = 'center';
      actx.textBaseline = 'middle';

      for (let i = 0; i < glyphCount; i++) {
        const col = i % atlasCols;
        const row = Math.floor(i / atlasCols);
        const x = col * padW + ATLAS_PAD + atlasCellW / 2;
        const y = row * padH + ATLAS_PAD + atlasCellH / 2;
        actx.fillText(glyphs[i], x, y);
      }

      if (atlasTexture) gl.deleteTexture(atlasTexture);
      atlasTexture = makeTexture(gl.LINEAR_MIPMAP_LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
      gl.generateMipmap(gl.TEXTURE_2D);

      const imgData = actx.getImageData(0, 0, atlasCanvas.width, atlasCanvas.height);
      const shapes = glyphShapes(imgData, atlasCols, atlasCellW, atlasCellH, glyphCount);

      if (shapeTexture) gl.deleteTexture(shapeTexture);
      shapeTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, shapeTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 6, glyphCount, 0, gl.RED, gl.FLOAT, shapes);
    }

    buildAtlas();

    let dpr = 1;
    let gridW = 1;
    let gridH = 1;
    let cellPxW = 1;
    let cellPxH = 1;

    /**
     * Render the high-contrast Creo terminal content to the offscreen canvas
     */
    function renderTerminalContent() {
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;
      if (w <= 0 || h <= 0) return;

      sourceCtx.fillStyle = config.background;
      sourceCtx.fillRect(0, 0, w, h);

      // Subtle cyber grid line accents
      sourceCtx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
      sourceCtx.lineWidth = 1;
      for (let y = 20; y < h; y += 24) {
        sourceCtx.beginPath();
        sourceCtx.moveTo(0, y);
        sourceCtx.lineTo(w, y);
        sourceCtx.stroke();
      }

      // Render the Creo ASCII Banner
      const lines = [
        " ██████╗██████╗ ███████╗ ██████╗",
        "██╔════╝██╔══██╗██╔════╝██╔═══██╗",
        "██║     ██████╔╝█████╗  ██║   ██║",
        "██║     ██╔══██╗██╔══╝  ██║   ██║",
        "╚██████╗██║  ██║███████╗╚██████╔╝",
        " ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝"
      ];

      const fontSize = Math.max(11, Math.min(22, Math.floor(w / 38)));
      sourceCtx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
      sourceCtx.textBaseline = 'top';

      const bannerHeight = lines.length * (fontSize * 1.25);
      const startY = Math.max(24, Math.floor((h - bannerHeight - 60) * 0.45));
      const startX = Math.max(20, Math.floor((w - (34 * fontSize * 0.6)) / 2));

      lines.forEach((line, idx) => {
        // Gradient text for banner
        const grad = sourceCtx.createLinearGradient(startX, 0, startX + 34 * fontSize * 0.6, 0);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#c084fc');
        grad.addColorStop(0.75, '#a855f7');
        grad.addColorStop(1, '#38bdf8');
        sourceCtx.fillStyle = grad;
        sourceCtx.fillText(line, startX, startY + idx * (fontSize * 1.25));
      });

      // Subtitle labels
      const subY = startY + bannerHeight + 18;
      sourceCtx.font = `600 ${Math.max(12, fontSize * 0.8)}px 'JetBrains Mono', monospace`;
      sourceCtx.fillStyle = '#f5d0fe';
      sourceCtx.fillText("  Welcome to Creo", startX, subY);

      sourceCtx.fillStyle = '#38bdf8';
      sourceCtx.font = `500 ${Math.max(10, fontSize * 0.7)}px 'JetBrains Mono', monospace`;
      sourceCtx.fillText("  v0.4.0 • ANSI Color(99)", startX + 220, subY + 2);

      // Prompt line
      const promptY = subY + 36;
      sourceCtx.fillStyle = '#a78bfa';
      sourceCtx.fillText("$ creo up --all  [OK: wt.exe synchronized]", startX, promptY);

      contentDirty = true;
    }

    function resize() {
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);

      if (output.width !== targetW || output.height !== targetH) {
        output.width = targetW;
        output.height = targetH;
        output.style.width = cssW + 'px';
        output.style.height = cssH + 'px';
      }

      if (sourceCanvas.width !== targetW || sourceCanvas.height !== targetH) {
        sourceCanvas.width = targetW;
        sourceCanvas.height = targetH;
        renderTerminalContent();
      }

      cellPxH = Math.max(4, config.cell * dpr);
      cellPxW = Math.max(4, Math.round(cellPxH * clampAspect(config.aspect)));

      gridW = Math.max(1, Math.ceil(targetW / cellPxW));
      gridH = Math.max(1, Math.ceil(targetH / cellPxH));

      gl.bindTexture(gl.TEXTURE_2D, cellTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gridW, gridH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cellTexture, 0);

      cellsDirty = true;
    }

    const pointer = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      active: 0,
      target: 0,
    };

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      pointer.target = 1;
      startLoop();
    }

    function onPointerEnter(e) {
      onPointerMove(e);
      pointer.target = 1;
      startLoop();
    }

    function onPointerLeave() {
      pointer.target = 0;
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);

    // Initial positioning in center
    const rect = container.getBoundingClientRect();
    pointer.x = rect.width / 2;
    pointer.y = rect.height / 2;
    pointer.tx = pointer.x;
    pointer.ty = pointer.y;

    function renderCellPass() {
      if (!cellsDirty) return;
      cellsDirty = false;

      gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
      gl.viewport(0, 0, gridW, gridH);
      gl.useProgram(cellPass.program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, contentTexture);
      gl.uniform1i(cellPass.uniforms.uContent, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, shapeTexture);
      gl.uniform1i(cellPass.uniforms.uShapes, 1);

      gl.uniform2f(cellPass.uniforms.uContentRes, sourceCanvas.width, sourceCanvas.height);
      gl.uniform2f(cellPass.uniforms.uCellPx, cellPxW, cellPxH);
      gl.uniform1i(cellPass.uniforms.uGlyphCount, glyphCount);
      gl.uniform1f(cellPass.uniforms.uContrast, config.contrast);
      gl.uniform1f(cellPass.uniforms.uExposure, config.exposure);
      gl.uniform1f(cellPass.uniforms.uThreshold, config.threshold);

      const bg = parseColor(config.background);
      gl.uniform3f(cellPass.uniforms.uBg, bg[0], bg[1], bg[2]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function renderMainPass(time) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, output.width, output.height);
      gl.useProgram(mainPass.program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, contentTexture);
      gl.uniform1i(mainPass.uniforms.uContent, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.uniform1i(mainPass.uniforms.uAtlas, 1);

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, cellTexture);
      gl.uniform1i(mainPass.uniforms.uCells, 2);

      gl.uniform2f(mainPass.uniforms.uOutputRes, output.width, output.height);
      gl.uniform2f(mainPass.uniforms.uContentRes, sourceCanvas.width, sourceCanvas.height);
      gl.uniform2f(mainPass.uniforms.uCellPx, cellPxW, cellPxH);
      gl.uniform2f(mainPass.uniforms.uGrid, gridW, gridH);
      gl.uniform2f(mainPass.uniforms.uAtlasGrid, atlasCols, atlasRows);
      gl.uniform2f(mainPass.uniforms.uAtlasPad, ATLAS_PAD / (atlasCellW + ATLAS_PAD * 2), ATLAS_PAD / (atlasCellH + ATLAS_PAD * 2));
      gl.uniform2f(mainPass.uniforms.uAtlasInner, atlasCellW / (atlasCellW + ATLAS_PAD * 2), atlasCellH / (atlasCellH + ATLAS_PAD * 2));

      gl.uniform2f(mainPass.uniforms.uPointer, pointer.x, pointer.y);
      gl.uniform1f(mainPass.uniforms.uActive, pointer.active);
      gl.uniform1f(mainPass.uniforms.uRadius, config.radius);
      gl.uniform1f(mainPass.uniforms.uSoftness, config.softness);
      gl.uniform1f(mainPass.uniforms.uEdgeWidth, config.edgeWidth);
      gl.uniform1f(mainPass.uniforms.uEdgeFlicker, config.edgeFlicker);
      gl.uniform1f(mainPass.uniforms.uEdgeGlow, config.edgeGlow);
      gl.uniform1f(mainPass.uniforms.uEdgeTint, config.edgeTint);
      gl.uniform1f(mainPass.uniforms.uAberration, config.aberration);
      gl.uniform1f(mainPass.uniforms.uScramble, config.scramble);
      gl.uniform1f(mainPass.uniforms.uScrambleSpeed, config.scrambleSpeed);
      gl.uniform1f(mainPass.uniforms.uColored, config.colored);

      const col = parseColor(config.color);
      gl.uniform3f(mainPass.uniforms.uColor, col[0], col[1], col[2]);

      gl.uniform1f(mainPass.uniforms.uBrightness, config.brightness);
      gl.uniform1f(mainPass.uniforms.uLegibility, config.legibility);
      gl.uniform1f(mainPass.uniforms.uPassthrough, config.passthrough);

      const bg = parseColor(config.background);
      gl.uniform3f(mainPass.uniforms.uBg, bg[0], bg[1], bg[2]);

      gl.uniform1f(mainPass.uniforms.uTime, time);
      gl.uniform1f(mainPass.uniforms.uDpr, dpr);
      gl.uniform1i(mainPass.uniforms.uCaptured, 1);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    let rafId = 0;
    let running = false;
    let inView = true;
    let lastTime = 0;

    function tick(now) {
      if (disposed || !running || !inView) return;
      const t = now * 0.001;
      const dt = lastTime ? Math.min(0.1, t - lastTime) : 0.016;
      lastTime = t;

      if (contentDirty) {
        contentDirty = false;
        cellsDirty = true;
        gl.bindTexture(gl.TEXTURE_2D, contentTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
      }

      // Pointer smoothing
      const alpha = 1 - Math.exp(-dt / Math.max(0.01, config.smoothing));
      pointer.x += (pointer.tx - pointer.x) * alpha;
      pointer.y += (pointer.ty - pointer.y) * alpha;
      pointer.active += (pointer.target - pointer.active) * alpha;

      renderCellPass();
      renderMainPass(t);

      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (running || disposed || !inView) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    resize();
    renderTerminalContent();

    // Pulse trigger once on load to reveal effect
    pointer.active = 0.85;
    pointer.target = 0.85;
    setTimeout(() => {
      pointer.target = 0.0;
    }, 1200);

    startLoop();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    return {
      setOptions(newOpts) {
        Object.assign(config, newOpts);
        if (newOpts.charset && newOpts.charset !== builtCharset) buildAtlas();
        cellsDirty = true;
        contentDirty = true;
        startLoop();
      },
      resize,
      start: startLoop,
      stop: stopLoop,
      destroy() {
        disposed = true;
        stopLoop();
        resizeObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerenter', onPointerEnter);
        container.removeEventListener('pointerleave', onPointerLeave);
        gl.deleteProgram(cellPass.program);
        gl.deleteProgram(mainPass.program);
        gl.deleteTexture(contentTexture);
        gl.deleteTexture(cellTexture);
        if (atlasTexture) gl.deleteTexture(atlasTexture);
        if (shapeTexture) gl.deleteTexture(shapeTexture);
        gl.deleteFramebuffer(cellFbo);
        gl.deleteBuffer(quad);
      }
    };
  }

  return { createDecryptReveal };
}));
