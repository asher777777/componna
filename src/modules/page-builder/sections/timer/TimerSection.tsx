import React, { useState, useEffect } from 'react';
import { TimerSectionConfig } from '../../types/sectionConfigs';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const TimerSection: React.FC<{ config: TimerSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'הספירה לאחור החלה',
    subtitle = 'אל תפספסו את ההזדמנות',
    targetDate = '2026-12-31T23:59:59',
    backgroundColor = 'transparent',
    boxBackgroundColor = '#0f172a',
    numberColor = '#ffffff',
    labelColor = '#94a3b8',
  } = config;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section
      id={anchorId || 'timer'}
      className="w-full py-16 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        {/* Timer Box Units */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-2xl">
          {[
            { label: 'ימים', value: timeLeft.days },
            { label: 'שעות', value: timeLeft.hours },
            { label: 'דקות', value: timeLeft.minutes },
            { label: 'שניות', value: timeLeft.seconds },
          ].map((unit, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md"
              style={{ backgroundColor: boxBackgroundColor }}
            >
              <span
                className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight"
                style={{ color: numberColor }}
              >
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-bold mt-2" style={{ color: labelColor }}>
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
