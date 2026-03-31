import { useState, useEffect, useRef } from 'react';
import { Question, InputMode } from '../../types';
import { normalizeAnswer } from '../../utils/normalize';
import FlagIcon from '../../components/FlagIcon/FlagIcon';
import styles from './CountryToFlag.module.scss';

interface Props {
  question: Question;
  onAnswer: (index: number, timeSpent: number) => void;
  feedback: 'correct' | 'wrong' | null;
  startTime: number;
  inputMode: InputMode;
}

export default function CountryToFlag({ question, onAnswer, feedback, startTime, inputMode }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(null);
    setTyped('');
    setSubmitted(false);
    if (inputMode === 'libre') setTimeout(() => inputRef.current?.focus(), 50);
  }, [question, inputMode]);

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

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>
        {inputMode === 'qcm' ? 'Quel est le drapeau de…' : 'Quel est le pays associé à ce drapeau ?'}
      </p>

      <div className={styles.countryDisplay}>
        <span className={styles.countryName}>{question.country.name}</span>
        <span className={styles.continent}>{question.country.continent}</span>
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
                <FlagIcon code={option.code} size="lg" />
                {feedback !== null && i === question.correctIndex && <span className={`${styles.badge} ${styles.correct}`}>✓</span>}
                {feedback !== null && i === selected && i !== question.correctIndex && <span className={`${styles.badge} ${styles.wrong}`}>✗</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.freeWrap}>
          <div className={styles.flagHint}>
            <FlagIcon code={question.country.code} size="xl" />
          </div>
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
