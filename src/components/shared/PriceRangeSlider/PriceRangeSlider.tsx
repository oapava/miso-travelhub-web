import React, { useMemo, useCallback } from 'react';
import './PriceRangeSlider.scss';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  prices: number[];
  onChange: (min: number, max: number) => void;
  dataTestId?: string;
}

const NUM_BUCKETS = 12;

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  prices,
  onChange,
  dataTestId,
}) => {
  const range = max - min || 1;

  const buckets = useMemo(() => {
    const counts = Array(NUM_BUCKETS).fill(0);
    prices.forEach((p) => {
      const idx = Math.min(
        Math.floor(((p - min) / range) * NUM_BUCKETS),
        NUM_BUCKETS - 1
      );
      if (idx >= 0) counts[idx]++;
    });
    const maxCount = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      heightPct: Math.max((count / maxCount) * 100, 4),
      bucketMin: min + (i / NUM_BUCKETS) * range,
      bucketMax: min + ((i + 1) / NUM_BUCKETS) * range,
    }));
  }, [prices, min, max, range]);

  const leftPct = ((minValue - min) / range) * 100;
  const widthPct = ((maxValue - minValue) / range) * 100;

  const handleMinSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), maxValue - 1);
      onChange(val, maxValue);
    },
    [maxValue, onChange]
  );

  const handleMaxSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), minValue + 1);
      onChange(minValue, val);
    },
    [minValue, onChange]
  );

  const handleMinInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val >= min && val < maxValue) {
        onChange(val, maxValue);
      }
    },
    [min, maxValue, onChange]
  );

  const handleMaxInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val > minValue && val <= max) {
        onChange(minValue, val);
      }
    },
    [max, minValue, onChange]
  );

  return (
    <div className="price-range-slider" data-testid={dataTestId}>
      {/* Histogram */}
      <div className="price-range-slider__histogram" aria-hidden="true">
        {buckets.map((bucket, i) => {
          const isActive =
            bucket.bucketMax > minValue && bucket.bucketMin < maxValue;
          return (
            <div
              key={i}
              className={`price-range-slider__bar${isActive ? ' price-range-slider__bar--active' : ''}`}
              style={{ height: `${bucket.heightPct}%` }}
            />
          );
        })}
      </div>

      {/* Dual range track */}
      <div className="price-range-slider__track-wrapper">
        <div className="price-range-slider__track-bg" />
        <div
          className="price-range-slider__track-fill"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        <input
          type="range"
          className="price-range-slider__range price-range-slider__range--min"
          min={min}
          max={max}
          step={1}
          value={minValue}
          onChange={handleMinSlider}
          data-testid={dataTestId ? `${dataTestId}-min-range` : undefined}
        />
        <input
          type="range"
          className="price-range-slider__range price-range-slider__range--max"
          min={min}
          max={max}
          step={1}
          value={maxValue}
          onChange={handleMaxSlider}
          data-testid={dataTestId ? `${dataTestId}-max-range` : undefined}
        />
      </div>

      {/* Text inputs */}
      <div className="price-range-slider__inputs">
        <div className="price-range-slider__input-group">
          <label className="price-range-slider__label">Minimum</label>
          <div className="price-range-slider__value-box">
            <span className="price-range-slider__currency">$</span>
            <input
              type="number"
              className="price-range-slider__number"
              value={minValue}
              min={min}
              max={maxValue - 1}
              onChange={handleMinInput}
              data-testid={dataTestId ? `${dataTestId}-min-input` : undefined}
            />
          </div>
        </div>

        <div className="price-range-slider__input-group">
          <label className="price-range-slider__label">Maximum</label>
          <div className="price-range-slider__value-box">
            <span className="price-range-slider__currency">$</span>
            <input
              type="number"
              className="price-range-slider__number"
              value={maxValue}
              min={minValue + 1}
              max={max}
              onChange={handleMaxInput}
              data-testid={dataTestId ? `${dataTestId}-max-input` : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
