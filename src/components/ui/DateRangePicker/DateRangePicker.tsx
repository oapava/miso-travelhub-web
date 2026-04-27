import React, { useState, useRef, useEffect } from 'react';
import './DateRangePicker.scss';

// ─── Public API ────────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  /** Selected check-in date as "YYYY-MM-DD", or empty string */
  startDate: string;
  /** Selected check-out date as "YYYY-MM-DD", or empty string */
  endDate: string;
  /**
   * Earliest selectable date as "YYYY-MM-DD".
   * Days before this date are rendered as disabled.
   */
  minDate?: string;
  /** Called whenever either date changes */
  onChange: (start: string, end: string) => void;
  startLabel?: string;
  endLabel?: string;
  startTestId?: string;
  endTestId?: string;
  className?: string;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Builds a "YYYY-MM-DD" string from calendar coordinates */
function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Formats a "YYYY-MM-DD" string for display (e.g. "Apr 18, 2026") */
function formatDisplay(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  const y = parseInt(parts[0] ?? '0', 10);
  const m = parseInt(parts[1] ?? '1', 10);
  const d = parseInt(parts[2] ?? '1', 10);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Cell {
  iso: string;
  day: number;
  inMonth: boolean;
}

/** Builds the 42-cell (6-row × 7-col) grid for a given month */
function buildMonth(year: number, month: number): Cell[] {
  const cells: Cell[] = [];
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Trailing days from the previous month
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({ iso: toISO(py, pm, d), day: d, inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toISO(year, month, d), day: d, inMonth: true });
  }

  // Leading days from the next month — fill grid to exactly 42 cells
  for (let d = 1; cells.length < 42; d++) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    cells.push({ iso: toISO(ny, nm, d), day: d, inMonth: false });
  }

  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  minDate,
  onChange,
  startLabel = 'Check In',
  endLabel = 'Check Out',
  startTestId,
  endTestId,
  className = '',
}) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [isOpen, setIsOpen] = useState(false);
  const [picking, setPicking] = useState<'start' | 'end'>('start');
  const [hover, setHover] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click ──
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHover(null);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // ── Close on Escape ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHover(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ── Open calendar positioned at the relevant month ──
  function openFor(mode: 'start' | 'end') {
    setPicking(mode);
    setIsOpen(true);
    const anchor = mode === 'start' ? startDate : endDate || startDate;
    if (anchor) {
      const parts = anchor.split('-');
      setViewYear(parseInt(parts[0] ?? '0', 10));
      setViewMonth(parseInt(parts[1] ?? '1', 10) - 1);
    } else {
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  }

  // ── Day click handler ──
  function handleDayClick(iso: string) {
    if (picking === 'start') {
      const newEnd = endDate && iso >= endDate ? '' : endDate;
      onChange(iso, newEnd);
      setPicking('end');
    } else {
      if (!startDate || iso <= startDate) {
        // Clicked on or before the start → restart selection from this day
        onChange(iso, '');
        setPicking('end');
      } else {
        onChange(startDate, iso);
        setIsOpen(false);
        setHover(null);
      }
    }
  }

  // ── Month navigation ──
  function navMonth(dir: 1 | -1) {
    setViewMonth((m) => {
      const next = m + dir;
      if (next < 0) { setViewYear((y) => y - 1); return 11; }
      if (next > 11) { setViewYear((y) => y + 1); return 0; }
      return next;
    });
  }

  // ── Range preview: use hover when the user hasn't confirmed the end yet ──
  const previewEnd = picking === 'end' && !endDate && hover ? hover : endDate;
  const hasRange = Boolean(startDate && endDate);

  const cells = buildMonth(viewYear, viewMonth);

  // ── CSS class builder for each day cell ──
  function classFor(cell: Cell): string {
    const { iso, inMonth } = cell;
    const disabled = !inMonth || (!!minDate && iso < minDate);
    const parts = ['drp__day'];

    if (!inMonth)  parts.push('drp__day--other');
    if (disabled)  parts.push('drp__day--disabled');
    if (iso === startDate) parts.push('drp__day--sel-start');
    if (iso === endDate)   parts.push('drp__day--sel-end');

    if (startDate && previewEnd) {
      const lo = startDate <= previewEnd ? startDate : previewEnd;
      const hi = startDate <= previewEnd ? previewEnd : startDate;
      if (iso > lo && iso < hi)   parts.push('drp__day--in-range');
      if (iso === lo && lo !== hi) parts.push('drp__day--range-start');
      if (iso === hi && lo !== hi) parts.push('drp__day--range-end');
    }

    return parts.join(' ');
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={rootRef} className={`drp ${className}`.trim()}>

      {/* ── Check-in trigger ── */}
      <div
        className={[
          'drp__trigger',
          'drp__trigger--start',
          hasRange  ? 'drp__trigger--has-range' : '',
          isOpen && picking === 'start' ? 'drp__trigger--active' : '',
        ].filter(Boolean).join(' ')}
        role="button"
        tabIndex={0}
        onClick={() => openFor('start')}
        onKeyDown={(e) => e.key === 'Enter' && openFor('start')}
        data-testid={startTestId}
        aria-haspopup="true"
        aria-expanded={isOpen && picking === 'start'}
      >
        <span className="drp__trigger-label">{startLabel}</span>
        <span className={`drp__trigger-value${!startDate ? ' drp__trigger-value--placeholder' : ''}`}>
          {startDate ? formatDisplay(startDate) : 'Add date'}
        </span>
      </div>

      {/* ── Internal separator ── */}
      <div className={`drp__sep${hasRange ? ' drp__sep--range' : ''}`} aria-hidden="true" />

      {/* ── Check-out trigger ── */}
      <div
        className={[
          'drp__trigger',
          'drp__trigger--end',
          hasRange  ? 'drp__trigger--has-range' : '',
          isOpen && picking === 'end' ? 'drp__trigger--active' : '',
        ].filter(Boolean).join(' ')}
        role="button"
        tabIndex={0}
        onClick={() => openFor('end')}
        onKeyDown={(e) => e.key === 'Enter' && openFor('end')}
        data-testid={endTestId}
        aria-haspopup="true"
        aria-expanded={isOpen && picking === 'end'}
      >
        <span className="drp__trigger-label">{endLabel}</span>
        <span className={`drp__trigger-value${!endDate ? ' drp__trigger-value--placeholder' : ''}`}>
          {endDate ? formatDisplay(endDate) : 'Add date'}
        </span>
      </div>

      {/* ── Calendar popup ── */}
      {isOpen && (
        <div className="drp__popup" role="dialog" aria-modal="true" aria-label="Choose dates">

          {/* Month navigation */}
          <div className="drp__nav">
            <button
              type="button"
              className="drp__nav-btn"
              onClick={() => navMonth(-1)}
              aria-label="Previous month"
            >‹</button>
            <span className="drp__nav-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button
              type="button"
              className="drp__nav-btn"
              onClick={() => navMonth(1)}
              aria-label="Next month"
            >›</button>
          </div>

          {/* Day-of-week header */}
          <div className="drp__weekdays" aria-hidden="true">
            {DAY_ABBR.map((d) => (
              <span key={d} className="drp__weekday">{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="drp__grid" role="grid">
            {cells.map((cell) => {
              const disabled = !cell.inMonth || (!!minDate && cell.iso < minDate);
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={classFor(cell)}
                  disabled={disabled}
                  onClick={() => !disabled && handleDayClick(cell.iso)}
                  onMouseEnter={() => !disabled && setHover(cell.iso)}
                  onMouseLeave={() => setHover(null)}
                  aria-label={cell.iso}
                  aria-pressed={cell.iso === startDate || cell.iso === endDate}
                  tabIndex={disabled ? -1 : 0}
                >
                  <span className="drp__day-num">{cell.day}</span>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <p className="drp__hint">
            {picking === 'start' ? 'Select check‑in date' : 'Select check‑out date'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
