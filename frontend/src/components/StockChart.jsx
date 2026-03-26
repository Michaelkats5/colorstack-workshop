// ============================================================
// PHASE 5 — Display
// File: frontend/src/components/StockChart.jsx
// ============================================================
// What this file does in plain English:
// Receives chart rows from App and renders a line/area chart.
// It also renders range buttons (1W, 1M, 3M...) for display.
// ============================================================

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatXAxisDate, getAxisTickDates, msToYmd, ymdToUtcMs } from "../utils/chartUtils";

const CHART_HEIGHT_PX = 200;

// StockChart receives:
// chartData      — array of { date, close, volume } for the chart
// selectedRange  — active range button text such as "1W" or "3M"
// onRangeChange  — function called when user clicks a range button
// tickerSymbol   — current ticker shown in tooltip series label
// timeRangeOptions — list of button labels to render
export default function StockChart({ chartData, selectedRange, onRangeChange, tickerSymbol, timeRangeOptions }) {
  // Convert each chart row date string into UTC milliseconds for Recharts number axis.
  const chartRows = useMemo(() => {
    return chartData.map((historyRow) => ({ ...historyRow, timeMs: ymdToUtcMs(historyRow.date) }));
  }, [chartData]);

  // Build a reduced tick list so labels do not overlap heavily.
  const tickTimestamps = useMemo(() => {
    const dateStrings = chartData.map((historyRow) => historyRow.date);
    return getAxisTickDates(dateStrings, selectedRange).map(ymdToUtcMs).filter((timeMs) => timeMs > 0);
  }, [chartData, selectedRange]);

  const lastDate = chartData.length > 0 ? chartData[chartData.length - 1].date : "";
  const chartKey = `${selectedRange}-${lastDate}-${chartData.length}`;

  return (
    <section className="chart-section chart-container">
      <div className="chart-header">
        <span className="chart-label">PRICE HISTORY</span>
        <div className="range-pills">
          {timeRangeOptions.map((rangeOption) => (
            <button
              key={rangeOption}
              type="button"
              className={`range-pill ${selectedRange === rangeOption ? "active" : ""}`}
              onClick={() => onRangeChange(rangeOption)}
            >
              {rangeOption}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-wrapper" style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
          <AreaChart key={chartKey} data={chartRows} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="timeMs"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={tickTimestamps}
              tick={{ fill: "var(--muted2)", fontSize: 11 }}
              tickFormatter={(timeMs) => formatXAxisDate(msToYmd(timeMs), selectedRange)}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              padding={{ left: 4, right: 12 }}
            />
            <YAxis
              tick={{ fill: "var(--muted2)", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              width={50}
            />
            <Tooltip
              contentStyle={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted)" }}
              itemStyle={{ color: "var(--blue)" }}
              labelFormatter={(labelValue) => {
                const labelText = typeof labelValue === "number" ? msToYmd(labelValue) : String(labelValue);
                return formatXAxisDate(labelText, selectedRange);
              }}
              formatter={(value) => [`$${value}`, tickerSymbol]}
            />
            <Area type="monotone" dataKey="close" stroke="var(--blue)" strokeWidth={2} fill="url(#grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
