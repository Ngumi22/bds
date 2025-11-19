"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: Date | string;
}

export function CountdownTimer({ endsAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(endsAt).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

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

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (
    !timeLeft ||
    (timeLeft.days === 0 &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0)
  ) {
    return null;
  }

  return (
    <div className="text-sm font-bold text-red-600/80 flex items-center gap-1 whitespace-nowrap bg-white px-4 py-2">
      <span className="text-sm">
        {timeLeft.days}d : {String(timeLeft.hours).padStart(2, "0")}h :
        {String(timeLeft.minutes).padStart(2, "0")}m :
        {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}
