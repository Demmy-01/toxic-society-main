import { useCurrency, type CurrencyCode } from "../context/CurrencyContext";

const BG_COLORS: Record<CurrencyCode, string> = {
  USD: "#C9A923",   // gold
  NGN: "#C41E3A",   // crimson
  EUR: "#C41E3A",   // crimson
  GBP: "#8B1A2A",   // dark crimson
};

export function CurrencySelector() {
  const { currency, currencies, setCurrency, ratesLoading, ratesError } = useCurrency();

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Live rate indicator dot */}
      <div
        title={
          ratesLoading
            ? "Loading live rates…"
            : ratesError
            ? "Using offline rates (live fetch failed)"
            : "Live rates active"
        }
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: ratesLoading ? "#888" : ratesError ? "#f59e0b" : "#22c55e",
          margin: "0 auto 4px",
          boxShadow: ratesLoading || ratesError ? "none" : "0 0 6px #22c55e",
          animation: ratesLoading ? "pulse 1.2s ease-in-out infinite" : "none",
          alignSelf: "center",
          marginRight: "11px",
        }}
      />

      {currencies.map((cur) => {
        const isActive = currency.code === cur.code;
        return (
          <button
            key={cur.code}
            onClick={() => setCurrency(cur.code)}
            title={`${cur.label}${!ratesLoading ? ` · 1 USD = ${cur.rate.toFixed(cur.code === "NGN" ? 0 : 4)} ${cur.code}` : ""}`}
            style={{
              width: isActive ? "54px" : "46px",
              height: isActive ? "54px" : "46px",
              borderRadius: "50%",
              backgroundColor: isActive ? BG_COLORS[cur.code] : "#1a1a1a",
              color: "white",
              border: isActive ? `2px solid ${BG_COLORS[cur.code]}` : "2px solid #333",
              cursor: "pointer",
              fontSize: isActive ? "18px" : "15px",
              fontWeight: "bold",
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive
                ? `0 0 0 3px rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.5)`
                : "0 2px 8px rgba(0,0,0,0.4)",
              transform: isActive ? "translateX(-8px)" : "translateX(0px)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              outline: "none",
              opacity: ratesLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateX(-6px)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#333";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateX(0px)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1a1a1a";
              }
            }}
          >
            {cur.symbol}
          </button>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
