import { useState, useEffect, useRef } from 'react';
import * as topojson from 'topojson-client';
import styles from './WorldGlobe.module.scss';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const W = 480, H = 480, R = 200, CX = 240, CY = 240;

function toRad(d: number) { return d * Math.PI / 180; }

function projectOrtho(lon: number, lat: number, rotY: number): [number, number] | null {
  const λ = toRad(lon - rotY);
  const φ = toRad(lat);
  const cosC = Math.cos(φ) * Math.cos(λ);
  if (cosC < 0) return null;
  return [CX + R * Math.cos(φ) * Math.sin(λ), CY - R * Math.sin(φ)];
}

function ringToPath(ring: [number, number][], rotY: number): string {
  const segs: string[][] = [];
  let curr: string[] = [];
  for (const [lon, lat] of ring) {
    const p = projectOrtho(lon, lat, rotY);
    if (p) {
      curr.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
    } else if (curr.length >= 2) {
      segs.push(curr); curr = [];
    } else { curr = []; }
  }
  if (curr.length >= 2) segs.push(curr);
  return segs.map(s => 'M' + s.join('L')).join(' ');
}

function featureToPath(geometry: any, rotY: number): string {
  if (!geometry) return '';
  try {
    const rings =
      geometry.type === 'Polygon' ? geometry.coordinates :
      geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(1) : [];
    return rings.map((r: [number, number][]) => ringToPath(r, rotY)).join(' ');
  } catch { return ''; }
}

function gridLines(rotY: number): string {
  const paths: string[] = [];
  // Meridians every 30°
  for (let lon = -180; lon <= 180; lon += 30) {
    const pts: string[] = [];
    for (let lat = -90; lat <= 90; lat += 2) {
      const p = projectOrtho(lon, lat, rotY);
      if (p) pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
      else if (pts.length > 1) { paths.push('M' + pts.join('L')); pts.length = 0; }
      else pts.length = 0;
    }
    if (pts.length > 1) paths.push('M' + pts.join('L'));
  }
  // Parallels every 30°
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: string[] = [];
    for (let lon = -180; lon <= 180; lon += 2) {
      const p = projectOrtho(lon, lat, rotY);
      if (p) pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
      else if (pts.length > 1) { paths.push('M' + pts.join('L')); pts.length = 0; }
      else pts.length = 0;
    }
    if (pts.length > 1) paths.push('M' + pts.join('L'));
  }
  return paths.join(' ');
}

interface GeoFeature { geometry: any; }

export default function WorldGlobe() {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [rotY, setRotY] = useState(10);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef(0);

  useEffect(() => {
    fetch(GEO_URL).then(r => r.json()).then(world => {
      const countries = topojson.feature(world, world.objects.countries) as any;
      setFeatures(countries.features);
    }).catch(() => {});
  }, []);

  // Slow rotation at ~10fps
  useEffect(() => {
    const animate = (time: number) => {
      if (time - lastTimeRef.current >= 100) {
        lastTimeRef.current = time;
        setRotY(r => (r + 0.4) % 360);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current!);
  }, []);

  const grid = gridLines(rotY);

  return (
    <div className={styles.globe}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        <defs>
          <clipPath id="globe-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id="globe-ocean" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#050c18" />
          </radialGradient>
          <radialGradient id="globe-shine" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Ocean */}
        <circle cx={CX} cy={CY} r={R} fill="url(#globe-ocean)" />

        <g clipPath="url(#globe-clip)">
          {/* Grid */}
          <path d={grid} fill="none" stroke="rgba(0,158,219,0.1)" strokeWidth="0.5" />

          {/* Countries */}
          {features.map((f, i) => (
            <path
              key={i}
              d={featureToPath(f.geometry, rotY)}
              fill="rgba(0,158,219,0.25)"
              stroke="rgba(0,158,219,0.5)"
              strokeWidth="0.6"
            />
          ))}

          {/* Shine overlay */}
          <circle cx={CX} cy={CY} r={R} fill="url(#globe-shine)" />
        </g>

        {/* Border */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,158,219,0.3)" strokeWidth="1.5" />
      </svg>
      <div className={styles.glow} />
    </div>
  );
}
