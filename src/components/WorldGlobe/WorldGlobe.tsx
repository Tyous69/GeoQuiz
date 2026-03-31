import { useState, useEffect, useRef, useCallback } from 'react';
import * as topojson from 'topojson-client';
import styles from './WorldGlobe.module.scss';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const R = 190, CX = 240, CY = 240;

function toRad(d: number) { return (d * Math.PI) / 180; }

function projectOrtho(lon: number, lat: number, rotY: number): [number, number] | null {
  const λ = toRad(lon - rotY);
  const φ = toRad(lat);
  const cosC = Math.cos(φ) * Math.cos(λ);
  if (cosC < 0.15) return null;
  const x = CX + R * Math.cos(φ) * Math.sin(λ);
  const y = CY - R * Math.sin(φ);
  return [x, y];
}

function ringToPath(ring: [number, number][], rotY: number): string {
  let d = '';
  let penDown = false;

  for (const [lon, lat] of ring) {
    const p = projectOrtho(lon, lat, rotY);
    if (p) {
      if (!penDown) {
        d += `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
        penDown = true;
      } else {
        d += `L${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      }
    } else {
      penDown = false;
    }
  }
  return d;
}

function featureToPath(geometry: any, rotY: number): string {
  if (!geometry) return '';
  try {
    const rings: [number, number][][] =
      geometry.type === 'Polygon' ? geometry.coordinates :
      geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(1) : [];
    return rings.map(r => ringToPath(r, rotY)).filter(Boolean).join(' ');
  } catch { return ''; }
}

function buildGrid(rotY: number): string {
  let d = '';
  for (let lon = -180; lon < 180; lon += 30) {
    let seg = '', pen = false;
    for (let lat = -85; lat <= 85; lat += 3) {
      const p = projectOrtho(lon, lat, rotY);
      if (p) {
        seg += pen
          ? `L${p[0].toFixed(1)},${p[1].toFixed(1)}`
          : `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
        pen = true;
      } else {
        pen = false;
      }
    }
    d += seg;
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    let seg = '', pen = false;
    for (let lon = -180; lon <= 180; lon += 3) {
      const p = projectOrtho(lon, lat, rotY);
      if (p) {
        seg += pen
          ? `L${p[0].toFixed(1)},${p[1].toFixed(1)}`
          : `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
        pen = true;
      } else {
        pen = false;
      }
    }
    d += seg;
  }
  return d;
}

interface Feature { geometry: any; }

export default function WorldGlobe() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const rotYRef = useRef(10);
  const [rotY, setRotY] = useState(10);
  const rafRef = useRef<number>(0);
  const lastRenderRef = useRef(0);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(world => {
        const fc = topojson.feature(world, world.objects.countries) as any;
        setFeatures(fc.features);
      })
      .catch(() => {});
  }, []);

  const animate = useCallback((ts: number) => {
    rafRef.current = requestAnimationFrame(animate);
    if (ts - lastRenderRef.current < 33) return; // ~30fps
    lastRenderRef.current = ts;
    rotYRef.current = (rotYRef.current + 0.25) % 360;
    setRotY(rotYRef.current);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const grid = buildGrid(rotY);

  return (
    <div className={styles.globe}>
      <svg viewBox="0 0 480 480" className={styles.svg}>
        <defs>
          <clipPath id="gc">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id="go" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#071528" />
            <stop offset="100%" stopColor="#040c18" />
          </radialGradient>
          <radialGradient id="gshine" cx="32%" cy="28%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="url(#go)" />

        <g clipPath="url(#gc)">
          <path
            d={grid}
            fill="none"
            stroke="rgba(0,158,219,0.1)"
            strokeWidth="0.5"
          />

          {features.map((f, i) => {
            const d = featureToPath(f.geometry, rotY);
            if (!d) return null;
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(0,158,219,0.6)"
                strokeWidth="0.7"
              />
            );
          })}

          {features.map((f, i) => {
            const d = featureToPath(f.geometry, rotY);
            if (!d) return null;
            return (
              <path
                key={`fill-${i}`}
                d={d}
                fill="rgba(0,158,219,0.08)"
                stroke="none"
              />
            );
          })}

          <circle cx={CX} cy={CY} r={R} fill="url(#gshine)" />
        </g>

        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(0,158,219,0.3)"
          strokeWidth="1.5"
        />
      </svg>
      <div className={styles.glow} />
    </div>
  );
}