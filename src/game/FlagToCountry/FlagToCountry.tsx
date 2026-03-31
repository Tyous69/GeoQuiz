import { useState, useEffect, useRef } from 'react';
import { Question, InputMode } from '../../types';
import { normalizeAnswer } from '../../utils/normalize';
import FlagIcon from '../../components/FlagIcon/FlagIcon';
import styles from './FlagToCountry.module.scss';

interface Props {
  question: Question;
  onAnswer: (index: number, timeSpent: number) => void;
  feedback: 'correct' | 'wrong' | null;
  startTime: number;
  inputMode: InputMode;
}

export default function FlagToCountry({ question, onAnswer, feedback, startTime, inputMode }: Props) {
  const [selected,  setSelected]  = useState<number | null>(null);
  const [typed,     setTyped]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ratio,     setRatio]     = useState(3 / 2);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(null);
    setTyped('');
    setSubmitted(false);
    setRatio(3 / 2);
    if (inputMode === 'libre') setTimeout(() => inputRef.current?.focus(), 50);
  }, [question, inputMode]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
  };

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

  const maxH = 160;
  const maxW = 260;
  const h = Math.min(maxH, maxW / ratio);
  const w = h * ratio;

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>Quel est ce pays ?</p>

      <div className={styles.flagDisplay}>
        <img
          src={`https://flagcdn.com/w320/${question.country.code.toLowerCase()}.png`}
          srcSet={`https://flagcdn.com/w160/${question.country.code.toLowerCase()}.png 1x, https://flagcdn.com/w320/${question.country.code.toLowerCase()}.png 2x`}
          alt={question.country.name}
          className={styles.flagImg}
          style={{ width: `${w}px`, height: `${h}px` }}
          onLoad={handleImageLoad}
          draggable={false}
        />
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
              <button
                key={option.code}
                className={`${styles.option} ${state}`}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <span>{option.name}</span>
                {feedback !== null && i === question.correctIndex && <span className={styles.mark}>✓</span>}
                {feedback !== null && i === selected && i !== question.correctIndex && <span className={styles.mark}>✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.freeWrap}>
          <div className={styles.freeInputRow}>
            <input
              ref={inputRef}
              className={`${styles.freeInput} ${submitted
                ? normalizeAnswer(typed) === normalizeAnswer(question.country.name)
                  ? styles.inputCorrect : styles.inputWrong
                : ''}`}
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
            <p className={`${styles.freeResult} ${feedback === 'correct' ? styles.correct : styles.wrong}`}>
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