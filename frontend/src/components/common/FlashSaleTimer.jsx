import { useState, useEffect } from 'react';

export default function FlashSaleTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt) - new Date();
      if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0 });
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
      <span className="text-xs text-gray-500">Ends in:</span>
      {['h', 'm', 's'].map((unit, i) => (
        <span key={unit}>
          <span className="countdown-box">{pad(timeLeft[unit])}</span>
          {i < 2 && <span className="text-red-500 font-bold mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
}
