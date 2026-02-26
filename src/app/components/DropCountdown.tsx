import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface DropCountdownProps {
  targetDate: Date;
  dropName: string;
  subtitle?: string;
  variant?: "dark" | "light";
}

function Pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DropCountdown({
  targetDate,
  dropName,
  subtitle,
  variant = "dark",
}: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
      setPulse((p) => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isDark = variant === "dark";
  const dropped = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div
      className="py-16 px-4 text-center"
      style={{ backgroundColor: isDark ? "#0f0f0f" : "#fff" }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "6px",
          color: "#C41E3A",
        }}
        className="text-xs uppercase mb-4"
      >
        {dropped ? "Now Live" : "Dropping Soon"}
      </p>

      {/* Drop name */}
      <h2
        style={{
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: "6px",
          color: isDark ? "#fff" : "#0f0f0f",
        }}
        className="text-5xl sm:text-7xl mb-2"
      >
        {dropName}
      </h2>

      {subtitle && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            color: isDark ? "#888" : "#999",
          }}
          className="text-sm mb-10"
        >
          {subtitle}
        </p>
      )}

      {/* Countdown blocks */}
      {!dropped ? (
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center">
                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                    color: isDark ? "#fff" : "#0f0f0f",
                    border: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
                    minWidth: "70px",
                  }}
                  className="text-5xl sm:text-6xl px-4 py-3 tabular-nums leading-none"
                >
                  {Pad(unit.value)}
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "3px",
                    color: isDark ? "#555" : "#aaa",
                  }}
                  className="text-xs uppercase mt-2"
                >
                  {unit.label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    color: pulse ? "#C41E3A" : "transparent",
                    transition: "color 0.3s",
                  }}
                  className="text-4xl mb-4"
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-10">
          <p
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", color: "#C41E3A" }}
            className="text-4xl"
          >
            The Drop is Live
          </p>
        </div>
      )}
    </div>
  );
}
