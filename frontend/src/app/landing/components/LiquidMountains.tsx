"use client";

import { useEffect, useRef } from "react";

interface CardDef {
  normX: number;
  layerIdx: number;
  title: string;
  sub?: string;
  badge?: string;
  width: number;
  height: number;
  seed?: number;
}

const CARDS: CardDef[] = [
  {
    badge: "Live Escrow Yield",
    height: 90,
    layerIdx: 0,
    normX: 0.27,
    sub: "APY",
    title: "4.8%",
    width: 158,
  },
  { height: 34, layerIdx: 0, normX: 0.6, title: "USDC Secured", width: 128 },
];

// Smooth Perlin-ish noise via sum of sines
function wave(
  x: number,
  t: number,
  seed: number,
  freqs: number[],
  amps: number[]
) {
  let v = 0;
  for (let k = 0; k < freqs.length; k++) {
    v +=
      Math.sin(x * freqs[k] + t * (0.18 + k * 0.07) + seed + k * 1.3) * amps[k];
    v +=
      Math.cos(x * freqs[k] * 1.4 + t * (0.12 + k * 0.05) + seed * 2.1 + k) *
      amps[k] *
      0.45;
  }
  return v;
}

export function LiquidMountains() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const svg = svgRef.current!;
    const ctx = canvas.getContext("2d")!;

    // ── Layer definitions (back → front) ──
    // Each layer: baseline (fraction from bottom), amplitude, color
    const LAYERS = [
      {
        amp: 0.22,
        base: 0.38,
        color: "rgba(90,100,160,0.55)",
        seed: 0.0,
        stroke: "rgba(120,130,200,0.18)",
      },
      {
        amp: 0.2,
        base: 0.48,
        color: "rgba(70,80,140,0.62)",
        seed: 2.3,
        stroke: "rgba(100,115,190,0.20)",
      },
      {
        amp: 0.18,
        base: 0.55,
        color: "rgba(55,65,120,0.70)",
        seed: 4.7,
        stroke: "rgba(90,105,180,0.22)",
      },
      {
        amp: 0.16,
        base: 0.62,
        color: "rgba(40,50,100,0.78)",
        seed: 1.5,
        stroke: "rgba(75,90,165,0.24)",
      },
      {
        amp: 0.13,
        base: 0.68,
        color: "rgba(28,36,82,0.85)",
        seed: 3.9,
        stroke: "rgba(60,75,150,0.26)",
      },
      {
        amp: 0.1,
        base: 0.74,
        color: "rgba(18,24,64,0.92)",
        seed: 6.1,
        stroke: "rgba(50,65,138,0.28)",
      },
    ];

    const FREQS = [0.9, 1.8, 3.1, 5.0, 8.2];
    const AMPS = [1.0, 0.55, 0.3, 0.15, 0.08];

    // ── SVG setup ──
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <filter id="mlglow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="mlsoft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    svg.insertBefore(defs, svg.firstChild);

    // Build SVG card elements
    interface CardEl {
      g: SVGGElement;
      line: SVGLineElement;
      dot: SVGCircleElement;
    }

    function buildApyCard(): SVGGElement {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("width", "158");
      bg.setAttribute("height", "90");
      bg.setAttribute("rx", "10");
      bg.setAttribute("fill", "rgba(10,14,40,0.88)");
      bg.setAttribute("stroke", "rgba(255,255,255,0.10)");
      bg.setAttribute("stroke-width", "1");

      const badgeBg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      badgeBg.setAttribute("x", "12");
      badgeBg.setAttribute("y", "12");
      badgeBg.setAttribute("width", "112");
      badgeBg.setAttribute("height", "18");
      badgeBg.setAttribute("rx", "9");
      badgeBg.setAttribute("fill", "rgba(109,40,217,0.38)");

      const bDot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      bDot.setAttribute("cx", "22");
      bDot.setAttribute("cy", "21");
      bDot.setAttribute("r", "3.5");
      bDot.setAttribute("fill", "#a855f7");
      bDot.setAttribute("filter", "url(#mlsoft)");

      const bTxt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      bTxt.setAttribute("x", "31");
      bTxt.setAttribute("y", "25");
      bTxt.setAttribute("fill", "#c4b5fd");
      bTxt.setAttribute("font-size", "9");
      bTxt.setAttribute("font-family", "monospace");
      bTxt.setAttribute("font-weight", "600");
      bTxt.textContent = "Live Escrow Yield";

      const subTxt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      subTxt.setAttribute("x", "14");
      subTxt.setAttribute("y", "52");
      subTxt.setAttribute("fill", "rgba(255,255,255,0.40)");
      subTxt.setAttribute("font-size", "10");
      subTxt.setAttribute("font-family", "sans-serif");
      subTxt.textContent = "APY";

      const valTxt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      valTxt.setAttribute("x", "14");
      valTxt.setAttribute("y", "82");
      valTxt.setAttribute("fill", "#ffffff");
      valTxt.setAttribute("font-size", "34");
      valTxt.setAttribute("font-family", "sans-serif");
      valTxt.setAttribute("font-weight", "700");
      valTxt.textContent = "4.8%";

      g.appendChild(bg);
      g.appendChild(badgeBg);
      g.appendChild(bDot);
      g.appendChild(bTxt);
      g.appendChild(subTxt);
      g.appendChild(valTxt);
      return g;
    }

    function buildUsdcCard(): SVGGElement {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("width", "128");
      bg.setAttribute("height", "34");
      bg.setAttribute("rx", "8");
      bg.setAttribute("fill", "rgba(10,14,40,0.88)");
      bg.setAttribute("stroke", "rgba(255,255,255,0.12)");
      bg.setAttribute("stroke-width", "1");

      const txt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      txt.setAttribute("x", "64");
      txt.setAttribute("y", "21");
      txt.setAttribute("fill", "#e2e8f0");
      txt.setAttribute("font-size", "11");
      txt.setAttribute("font-family", "sans-serif");
      txt.setAttribute("font-weight", "600");
      txt.setAttribute("text-anchor", "middle");
      txt.textContent = "USDC Secured";

      g.appendChild(bg);
      g.appendChild(txt);
      return g;
    }

    const cardEls: CardEl[] = [
      {
        dot: document.createElementNS("http://www.w3.org/2000/svg", "circle"),
        g: buildApyCard(),
        line: document.createElementNS("http://www.w3.org/2000/svg", "line"),
      },
      {
        dot: document.createElementNS("http://www.w3.org/2000/svg", "circle"),
        g: buildUsdcCard(),
        line: document.createElementNS("http://www.w3.org/2000/svg", "line"),
      },
    ];

    cardEls.forEach(({ g, line, dot }) => {
      line.setAttribute("stroke", "rgba(168,85,247,0.50)");
      line.setAttribute("stroke-width", "1");
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", "#a855f7");
      dot.setAttribute("filter", "url(#mlglow)");
      svg.appendChild(line);
      svg.appendChild(g);
      svg.appendChild(dot);
    });

    // ── Resize ──
    let W = 0,
      H = 0;
    function resize() {
      const p = canvas.parentElement!;
      W = p.clientWidth;
      H = p.clientHeight;
      canvas.width = Math.round(W * Math.min(devicePixelRatio, 2));
      canvas.height = Math.round(H * Math.min(devicePixelRatio, 2));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(Math.min(devicePixelRatio, 2), Math.min(devicePixelRatio, 2));
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));
    }
    resize();
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas.parentElement!);

    // ── Main loop ──
    const start = performance.now();

    // Cache peak Y per card for SVG positioning
    const peakY: number[] = CARDS.map(() => 0);
    const peakX: number[] = CARDS.map(c => c.normX * (W || 800));

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      const t = (performance.now() - start) / 1000;

      ctx.clearRect(0, 0, W, H);

      const STEPS = Math.max(2, Math.round(W / 1.5));

      // Draw layers back → front
      LAYERS.forEach((layer, li) => {
        const baseY = H * layer.base;
        const ampY = H * layer.amp;

        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const xRaw = (s / STEPS) * W;
          const xN = (s / STEPS) * 8; // scale for noise
          const y =
            baseY - (wave(xN, t, layer.seed, FREQS, AMPS) * 0.5 + 0.5) * ampY;
          if (s === 0) ctx.moveTo(xRaw, y);
          else ctx.lineTo(xRaw, y);
        }

        // Close path to bottom
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();

        // Fill with gradient for depth
        const grad = ctx.createLinearGradient(0, baseY - ampY, 0, H);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, "rgba(8,9,26,0.0)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke the top edge
        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
          const xRaw = (s / STEPS) * W;
          const xN = (s / STEPS) * 8;
          const y =
            baseY - (wave(xN, t, layer.seed, FREQS, AMPS) * 0.5 + 0.5) * ampY;
          if (s === 0) ctx.moveTo(xRaw, y);
          else ctx.lineTo(xRaw, y);
        }
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // ── Update card peaks for layer 0 ──
        if (li === 0) {
          CARDS.forEach((card, ci) => {
            const xRaw = card.normX * W;
            const xN = card.normX * 8;
            const y =
              baseY - (wave(xN, t, layer.seed, FREQS, AMPS) * 0.5 + 0.5) * ampY;
            peakY[ci] = y;
            peakX[ci] = xRaw;
          });
        }
      });

      // ── Update SVG cards ──
      CARDS.forEach((card, ci) => {
        const { g, line, dot } = cardEls[ci];
        const tx = peakX[ci];
        const ty = peakY[ci];

        const GAP = 18;
        const cx = tx - card.width / 2;
        const cy = ty - card.height - GAP;

        g.setAttribute("transform", `translate(${cx},${cy})`);
        line.setAttribute("x1", String(tx));
        line.setAttribute("y1", String(cy + card.height));
        line.setAttribute("x2", String(tx));
        line.setAttribute("y2", String(ty - 3));
        dot.setAttribute("cx", String(tx));
        dot.setAttribute("cy", String(ty));
      });
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      cardEls.forEach(({ g, line, dot }) => {
        g.remove();
        line.remove();
        dot.remove();
      });
      defs.remove();
    };
  }, []);

  return (
    <div
      style={{
        background: "#08091a",
        height: "100%",
        inset: 0,
        overflow: "hidden",
        position: "absolute",
        width: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", inset: 0, position: "absolute" }}
      />
      {/* top fade so content text is readable */}
      <div
        style={{
          background:
            "linear-gradient(to bottom, #08091a 0%, #08091a 12%, transparent 45%)",
          inset: 0,
          pointerEvents: "none",
          position: "absolute",
          zIndex: 2,
        }}
      />
      <svg
        ref={svgRef}
        style={{
          inset: 0,
          overflow: "visible",
          pointerEvents: "none",
          position: "absolute",
          zIndex: 3,
        }}
        xmlns="http://www.w3.org/2000/svg"
      />
    </div>
  );
}
