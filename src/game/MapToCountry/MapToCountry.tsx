import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as topojson from 'topojson-client';
import { Question, InputMode, Continent } from '../../types';
import { normalizeAnswer } from '../../utils/normalize';
import { useTheme } from '../../context/ThemeContext';
import styles from './MapToCountry.module.scss';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const CONTINENT_BOUNDS: Record<string, L.LatLngBoundsExpression> = {
  'Tous':      [[-60, -170], [80, 180]],
  'Europe':    [[34,  -25],  [72,  45]],
  'Afrique':   [[-37, -20],  [38,  52]],
  'Asie':      [[-12,  24],  [78, 148]],
  'Amériques': [[-56,-125],  [73, -30]],
  'Océanie':   [[-50, 110],  [10, 180]],
};

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';

const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004':'AF','008':'AL','012':'DZ','020':'AD','024':'AO','028':'AG','031':'AZ',
  '032':'AR','036':'AU','040':'AT','044':'BS','048':'BH','050':'BD','051':'AM',
  '052':'BB','056':'BE','064':'BT','068':'BO','070':'BA','072':'BW','076':'BR',
  '084':'BZ','096':'BN','100':'BG','104':'MM','108':'BI','112':'BY','116':'KH',
  '120':'CM','124':'CA','132':'CV','140':'CF','144':'LK','148':'TD','152':'CL',
  '156':'CN','170':'CO','174':'KM','178':'CG','180':'CD','188':'CR','191':'HR',
  '192':'CU','196':'CY','203':'CZ','204':'BJ','208':'DK','212':'DM','214':'DO',
  '218':'EC','222':'SV','226':'GQ','231':'ET','232':'ER','233':'EE','242':'FJ',
  '246':'FI','250':'FR','262':'DJ','266':'GA','268':'GE','270':'GM','276':'DE',
  '288':'GH','296':'KI','300':'GR','308':'GD','320':'GT','324':'GN','328':'GY',
  '332':'HT','340':'HN','348':'HU','352':'IS','356':'IN','360':'ID','364':'IR',
  '368':'IQ','372':'IE','376':'IL','380':'IT','384':'CI','388':'JM','392':'JP',
  '398':'KZ','400':'JO','404':'KE','408':'KP','410':'KR','414':'KW','417':'KG',
  '418':'LA','422':'LB','426':'LS','428':'LV','430':'LR','434':'LY','438':'LI',
  '440':'LT','442':'LU','450':'MG','454':'MW','458':'MY','462':'MV','466':'ML',
  '470':'MT','478':'MR','480':'MU','484':'MX','492':'MC','496':'MN','498':'MD',
  '499':'ME','504':'MA','508':'MZ','512':'OM','516':'NA','520':'NR','524':'NP',
  '528':'NL','548':'VU','554':'NZ','558':'NI','562':'NE','566':'NG','578':'NO',
  '583':'FM','584':'MH','585':'PW','586':'PK','591':'PA','598':'PG','600':'PY',
  '604':'PE','608':'PH','616':'PL','620':'PT','624':'GW','626':'TL','634':'QA',
  '642':'RO','643':'RU','646':'RW','659':'KN','662':'LC','670':'VC','674':'SM',
  '678':'ST','682':'SA','686':'SN','688':'RS','690':'SC','694':'SL','702':'SG',
  '703':'SK','704':'VN','705':'SI','706':'SO','710':'ZA','716':'ZW','724':'ES',
  '728':'SS','729':'SD','740':'SR','748':'SZ','752':'SE','756':'CH','760':'SY',
  '762':'TJ','764':'TH','768':'TG','776':'TO','780':'TT','784':'AE','788':'TN',
  '792':'TR','795':'TM','798':'TV','800':'UG','804':'UA','807':'MK','818':'EG',
  '826':'GB','834':'TZ','840':'US','854':'BF','858':'UY','860':'UZ','862':'VE',
  '882':'WS','887':'YE','894':'ZM',
};

function fixRing(ring: GeoJSON.Position[]): GeoJSON.Position[] {
  if (ring.length === 0) return ring;
  const out: GeoJSON.Position[] = [[ring[0][0], ring[0][1]]];
  for (let i = 1; i < ring.length; i++) {
    let lon = ring[i][0];
    const lat = ring[i][1];
    const prevLon = out[i - 1][0];
    while (lon - prevLon >  180) lon -= 360;
    while (prevLon - lon >  180) lon += 360;
    out.push([lon, lat]);
  }
  return out;
}

function fixGeometry(geometry: GeoJSON.Geometry): GeoJSON.Geometry {
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: (geometry as GeoJSON.Polygon).coordinates.map(fixRing) };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: (geometry as GeoJSON.MultiPolygon).coordinates.map(
        poly => poly.map(fixRing)
      ),
    };
  }
  return geometry;
}

let geoCache: GeoJSON.FeatureCollection | null = null;

interface Props {
  question: Question;
  onAnswer: (index: number, timeSpent: number) => void;
  feedback: 'correct' | 'wrong' | null;
  startTime: number;
  inputMode: InputMode;
  continent: Continent;
}

export default function MapToCountry({
  question, onAnswer, feedback, startTime, inputMode, continent,
}: Props) {
  const { theme } = useTheme();
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const tileRef       = useRef<L.TileLayer | null>(null);
  const geoLayerRef   = useRef<L.GeoJSON | null>(null);

  const [selected,  setSelected]  = useState<number | null>(null);
  const [typed,     setTyped]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(null); setTyped(''); setSubmitted(false);
    if (inputMode === 'libre') setTimeout(() => inputRef.current?.focus(), 80);
  }, [question, inputMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      minZoom: 1,
      maxZoom: 18,
    });

    map.attributionControl.setPrefix('');

    const tile = L.tileLayer(TILE_LIGHT, {
      maxZoom: 18,
    }).addTo(map);

    mapRef.current  = map;
    tileRef.current = tile;

    map.fitBounds(
      (CONTINENT_BOUNDS[continent] ?? CONTINENT_BOUNDS['Tous']) as L.LatLngBoundsExpression,
      { animate: false }
    );

    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      geoLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map  = mapRef.current;
    const tile = tileRef.current;
    if (!map || !tile) return;
    map.removeLayer(tile);
    const newTile = L.tileLayer(TILE_LIGHT, {
      maxZoom: 18,
    });
    newTile.addTo(map);
    newTile.bringToBack();
    tileRef.current = newTile;
    if (geoLayerRef.current) geoLayerRef.current.bringToFront();
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetCode = question.country.code;

    const applyLayer = (geoData: GeoJSON.FeatureCollection) => {
      if (geoLayerRef.current) {
        map.removeLayer(geoLayerRef.current);
        geoLayerRef.current = null;
      }

      const layer = L.geoJSON(geoData, {
        style: (feature) => {
          const isTarget = (feature?.properties as any)?.alpha2 === targetCode;
          return {
            fillColor:   isTarget ? '#009EDB' : 'transparent',
            fillOpacity: isTarget ? 0.55 : 0,
            weight:      isTarget ? 2.5 : 0.6,
            color:       isTarget ? '#009EDB' : 'rgba(0,158,219,0.2)',
            opacity:     1,
          };
        },
      }).addTo(map);

      geoLayerRef.current = layer;
    };

    const run = (geoData: GeoJSON.FeatureCollection) => {
      applyLayer(geoData);
      map.fitBounds(
        (CONTINENT_BOUNDS[continent] ?? CONTINENT_BOUNDS['Tous']) as L.LatLngBoundsExpression,
        { animate: true, duration: 0.4 }
      );
    };

    if (geoCache) {
      run(geoCache);
    } else {
      fetch(GEO_URL)
        .then(r => r.json())
        .then(world => {
          const fc = topojson.feature(world, world.objects.countries) as unknown as GeoJSON.FeatureCollection;
          geoCache = {
            ...fc,
            features: fc.features.map(f => ({
              ...f,
              geometry: fixGeometry(f.geometry as GeoJSON.Geometry),
              properties: {
                ...f.properties,
                alpha2: NUMERIC_TO_ALPHA2[String((f as any).id)] ?? null,
              },
            })),
          };
          if (mapRef.current) run(geoCache!);
        })
        .catch(console.error);
    }
  }, [question.country.code, continent]);

  const handleSelect = (index: number) => {
    if (selected !== null || feedback !== null) return;
    setSelected(index);
    onAnswer(index, Math.round((Date.now() - startTime) / 1000));
  };

  const handleSubmit = () => {
    if (submitted || feedback !== null) return;
    setSubmitted(true);
    const ok = normalizeAnswer(typed) === normalizeAnswer(question.country.name);
    onAnswer(
      ok ? question.correctIndex : (question.correctIndex === 0 ? 1 : 0),
      Math.round((Date.now() - startTime) / 1000),
    );
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>Quel est ce pays en surbrillance ?</p>

      <div className={styles.mapOuter}>
        <div ref={containerRef} className={styles.mapContainer} />
      </div>

      {inputMode === 'qcm' ? (
        <div className={styles.options}>
          {question.options.map((option, i) => {
            let state = '';
            if (feedback !== null) {
              if (i === question.correctIndex) state = styles.correct;
              else if (i === selected)         state = styles.wrong;
            } else if (i === selected)         state = styles.selecting;
            return (
              <button
                key={option.code}
                className={`${styles.option} ${state}`}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <span>{option.name}</span>
                {feedback !== null && i === question.correctIndex && <span>✓</span>}
                {feedback !== null && i === selected && i !== question.correctIndex && <span>✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.freeWrap}>
          <div className={styles.freeInputRow}>
            <input
              ref={inputRef}
              className={`${styles.freeInput} ${
                submitted
                  ? normalizeAnswer(typed) === normalizeAnswer(question.country.name)
                    ? styles.inputCorrect : styles.inputWrong
                  : ''
              }`}
              type="text"
              placeholder="Tapez le nom du pays…"
              value={typed}
              onChange={e => !submitted && setTyped(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !submitted && typed.trim() && handleSubmit()}
              disabled={submitted}
              autoComplete="off"
            />
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!typed.trim() || submitted}
            >
              Valider
            </button>
          </div>
          {feedback !== null && (
            <p className={`${styles.freeResult} ${
              feedback === 'correct' ? styles.correctResult : styles.wrongResult
            }`}>
              {feedback === 'correct'
                ? `✓ Bonne réponse !`
                : `✗ La bonne réponse était : ${question.country.name}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}