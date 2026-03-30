import { useState, useEffect, useRef } from 'react';
import * as topojson from 'topojson-client';
import { Question, InputMode, Continent } from '../../types';
import { normalizeAnswer } from '../../utils/normalize';
import styles from './MapToCountry.module.scss';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Continent viewBox config: center [lon, lat] + zoom scale
const CONTINENT_VIEW: Record<string, { lon: number; lat: number; scale: number }> = {
  'Tous':      { lon: 10,   lat: 20,  scale: 1.0 },
  'Europe':    { lon: 15,   lat: 52,  scale: 3.5 },
  'Afrique':   { lon: 20,   lat: 5,   scale: 2.2 },
  'Asie':      { lon: 90,   lat: 40,  scale: 1.8 },
  'Amériques': { lon: -80,  lat: 15,  scale: 1.8 },
  'Océanie':   { lon: 150,  lat: -25, scale: 3.0 },
};

const W = 700, H = 380;

function getViewBox(continent: Continent): string {
  const cfg = CONTINENT_VIEW[continent] ?? CONTINENT_VIEW['Tous'];
  const cx = (cfg.lon + 180) * (W / 360);
  const cy = (90 - cfg.lat) * (H / 180);
  const vw = W / cfg.scale;
  const vh = H / cfg.scale;
  return `${(cx - vw / 2).toFixed(0)} ${(cy - vh / 2).toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}`;
}

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

function ringToPath(ring: [number, number][]): string {
  if (ring.length < 2) return '';
  const pts = ring.map(([lon, lat]) => {
    const x = (lon + 180) * (W / 360);
    const y = (90 - lat) * (H / 180);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return 'M' + pts.join('L') + 'Z';
}

function featureToPath(geometry: any): string {
  if (!geometry) return '';
  try {
    const rings =
      geometry.type === 'Polygon' ? geometry.coordinates :
      geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(1) : [];
    return rings.map((r: [number, number][]) => ringToPath(r)).join(' ');
  } catch { return ''; }
}

interface GeoPath { id: string; d: string; }

interface Props {
  question: Question;
  onAnswer: (index: number, timeSpent: number) => void;
  feedback: 'correct' | 'wrong' | null;
  startTime: number;
  inputMode: InputMode;
  continent: Continent;
}

export default function MapToCountry({ question, onAnswer, feedback, startTime, inputMode, continent }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [geoPaths, setGeoPaths] = useState<GeoPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(null);
    setTyped('');
    setSubmitted(false);
    if (inputMode === 'libre') setTimeout(() => inputRef.current?.focus(), 50);
  }, [question, inputMode]);

  useEffect(() => {
    fetch(GEO_URL).then(r => r.json()).then(world => {
      const countries = topojson.feature(world, world.objects.countries) as any;
      setGeoPaths(countries.features.map((f: any) => ({ id: String(f.id), d: featureToPath(f.geometry) })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null || feedback !== null) return;
    setSelected(index);
    onAnswer(index, Math.round((Date.now() - startTime) / 1000));
  };

  const handleSubmit = () => {
    if (submitted || feedback !== null) return;
    setSubmitted(true);
    const isCorrect = normalizeAnswer(typed) === normalizeAnswer(question.country.name);
    const idx = isCorrect ? question.correctIndex : (question.correctIndex === 0 ? 1 : 0);
    onAnswer(idx, Math.round((Date.now() - startTime) / 1000));
  };

  const viewBox = getViewBox(continent);

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>Quel est ce pays ?</p>

      <div className={styles.mapContainer}>
        <svg viewBox={viewBox} style={{ width: '100%', height: 'auto' }} className={styles.mapSvg}>
          {/* Ocean background */}
          <rect x="-180" y="-90" width="1060" height="560" fill="var(--map-ocean)" />
          {loading && (
            <text x="350" y="190" textAnchor="middle" fill="var(--text-muted)" fontSize="14">
              Chargement…
            </text>
          )}
          {geoPaths.map(p => {
            const alpha2 = NUMERIC_TO_ALPHA2[p.id];
            const isTarget = alpha2 === question.country.code;
            return (
              <path
                key={p.id}
                d={p.d}
                fill={isTarget ? 'var(--map-target)' : 'var(--map-country)'}
                stroke="var(--map-country-stroke)"
                strokeWidth={0.5}
              />
            );
          })}
        </svg>
      </div>

      {inputMode === 'qcm' ? (
        <div className={styles.options}>
          {question.options.map((option, i) => {
            let state = '';
            if (feedback !== null) {
              if (i === question.correctIndex) state = styles.correct;
              else if (i === selected) state = styles.wrong;
            } else if (i === selected) state = styles.selecting;

            return (
              <button key={option.code} className={`${styles.option} ${state}`} onClick={() => handleSelect(i)} disabled={selected !== null}>
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
              className={`${styles.freeInput} ${submitted ? (normalizeAnswer(typed) === normalizeAnswer(question.country.name) ? styles.inputCorrect : styles.inputWrong) : ''}`}
              type="text"
              placeholder="Tapez le nom du pays…"
              value={typed}
              onChange={e => !submitted && setTyped(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !submitted && typed.trim() && handleSubmit()}
              disabled={submitted}
              autoComplete="off"
            />
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={!typed.trim() || submitted}>
              Valider
            </button>
          </div>
          {feedback !== null && (
            <p className={`${styles.freeResult} ${feedback === 'correct' ? styles.correctResult : styles.wrongResult}`}>
              {feedback === 'correct' ? `✓ Bonne réponse !` : `✗ La bonne réponse était : ${question.country.name}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}