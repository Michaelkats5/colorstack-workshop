import { useMemo } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatXAxisDate,
  getAxisTickDates,
  msToYmd,
  ymdToUtcMs,
} from "../chartRangeUtils";

/** Recharts chart height in px (fixed wrapper height avoids overflow at zoom). */
const CHART_HEIGHT_PX = 200;

/**
 * Price history area chart with range pills. Parent passes pre-sliced `chartData` for the active window.
 */
export default function StockChart({
  chartData,
  selectedRange,
  onRangeChange,
  tickerSymbol,
  timeRangeOptions,
}) {
  const chartRows = useMemo(
    () => chartData.map((row) => ({ ...row, timeMs: ymdToUtcMs(row.date) })),
    [chartData]
  );

  const tickTimestamps = useMemo(
    () =>
      getAxisTickDates(
        chartData.map((row) => row.date),
        selectedRange
      )
        .map(ymdToUtcMs)
        .filter((ms) => ms > 0),
    [chartData, selectedRange]
  );

  const lastDate =
    chartData.length > 0 ? chartData[chartData.length - 1].date : "";
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

      <div
        className="chart-wrapper"
        style={{ width: "100%", minWidth: 0, overflow: "hidden" }}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT_PX}>
          <AreaChart
            key={chartKey}
            data={chartRows}
            margin={{ top: 5, right: 20, bottom: 5, left: 50 }}
          >
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
            tickFormatter={(ms) => formatXAxisDate(msToYmd(ms), selectedRange)}
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
            contentStyle={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted)" }}
            itemStyle={{ color: "var(--blue)" }}
            labelFormatter={(label) =>
              formatXAxisDate(
                typeof label === "number" ? msToYmd(label) : String(label),
                selectedRange
              )
            }
            formatter={(value) => [`$${value}`, tickerSymbol]}
          />

          <Area
            type="monotone"
            dataKey="close"
            stroke="var(--blue)"
            strokeWidth={2}
            fill="url(#grad)"
            dot={false}
          />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
