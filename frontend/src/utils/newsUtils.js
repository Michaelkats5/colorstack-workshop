/** Builds placeholder headline rows for the news column (workshop demo copy, not live RSS). */
export function buildNewsHeadlines(companyName, symbol) {
  if (!companyName || !symbol) return [];
  const lines = [
    `${companyName} Stock Surges Amid Strong Quarterly Earnings`,
    `Analysts Raise Price Target for ${symbol} Following Product Launch`,
    `${companyName}: What Investors Need to Know This Week`,
    `${symbol} Faces Headwinds as Market Volatility Increases`,
    `Institutional Investors Increase Stakes in ${companyName}`,
    `${symbol} Options Activity Signals Bullish Sentiment`,
  ];
  const dates = ["2h ago", "5h ago", "Today", "Yesterday", "2d ago", "3d ago"];
  return lines.map((title, index) => ({
    title,
    source: "Yahoo Finance",
    date: dates[index % dates.length],
  }));
}
