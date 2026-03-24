// ── PriceChart.js ─────────────────────────────────────────────
// The area chart showing price history + the time range buttons.
// Receives:
//   chartData — array of { date, close, volume } objects (already sliced by range)
//   range     — currently active time range e.g. "3M"
//   setRange  — function to change the time range
//   ticker    — current ticker symbol (used in the tooltip)
//   TIME_RANGES — array of range button labels ["1W","1M","3M","6M","1Y"]

import {
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PriceChart({ chartData, range, setRange, ticker, TIME_RANGES }) {
  return (
    <section className="chart-section">
      <div className="chart-header">
        <span className="chart-label">PRICE HISTORY</span>

        {/* Time range buttons — clicking one updates range → chart re-slices */}
        <div className="range-pills">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              className={`range-pill ${range === r ? "active" : ""}`} // highlight active button
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts responsive container — resizes with the window */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {/* Gradient fill under the line — blue fades to transparent */}
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X axis — uses the "date" field, shows only month-day e.g. "03-26" */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={d => d.slice(5)} // slice(5) removes the year "2026-" from the front
            tickLine={false}
            axisLine={false}
          />

          {/* Y axis — formats values as dollar amounts */}
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={v => `$${v}`}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]} // auto-scale to the data range
            width={55}
          />

          {/* Tooltip popup when hovering over the chart */}
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#6b7280" }}
            itemStyle={{ color: "#2563eb" }}
            formatter={v => [`$${v}`, ticker]} // show value as "$213.57" + ticker name
          />

          {/* The actual filled line — uses "close" field from each history item */}
          <Area
            type="monotone"  // smooth curved line
            dataKey="close"  // which field to plot on the Y axis
            stroke="#2563eb" // line color
            strokeWidth={2}
            fill="url(#grad)" // fill with the gradient defined above
            dot={false}        // don't show dots on each data point
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
