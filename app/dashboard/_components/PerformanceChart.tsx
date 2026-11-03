export type PerformancePoint = {
  id: string;
  title: string;
  lesson: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
};

export default function PerformanceChart({
  points,
}: {
  points: PerformancePoint[];
}) {
  const width = 900;
  const height = 320;
  const padding = { top: 28, right: 28, bottom: 52, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const plotted = points.map((point, index) => ({
    ...point,
    x:
      padding.left +
      (points.length <= 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth),
    y: padding.top + chartHeight * (1 - point.percentage / 100),
  }));
  const path = plotted
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <section
      aria-label="Quiz performance over time"
      className="rounded-2xl border border-white/10 bg-[#10182B] p-4 sm:p-6"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Performance over time</h2>
          <p className="mt-1 text-sm text-slate-400">
            Each point is one saved quiz attempt, ordered from oldest to newest.
          </p>
        </div>
        <span className="text-xs text-slate-500">{points.length} attempts</span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Line chart of quiz percentages from 0 to 100 percent, in chronological order"
          className="h-auto min-w-[640px] w-full"
        >
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding.top + chartHeight * (1 - value / 100);
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray={value === 0 ? undefined : "4 6"}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="12"
                >
                  {value}%
                </text>
              </g>
            );
          })}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#64748B"
          />
          {plotted.length > 1 && (
            <path
              d={path}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {plotted.map((point, index) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill="#080D1B"
                stroke="#7DD3FC"
                strokeWidth="3"
                tabIndex={0}
                aria-label={`${point.title}, ${point.lesson}, ${point.percentage} percent, ${new Date(point.date).toLocaleString()}`}
              >
                <title>
                  {`${point.title} · ${point.lesson} · ${point.score}/${point.totalQuestions} (${point.percentage}%) · ${new Date(point.date).toLocaleString()}`}
                </title>
              </circle>
              {(index === 0 || index === plotted.length - 1) && (
                <text
                  x={point.x}
                  y={height - 20}
                  textAnchor={index === 0 ? "start" : "end"}
                  fill="#94A3B8"
                  fontSize="11"
                >
                  {new Date(point.date).toLocaleDateString()}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {plotted.map((point, index) => (
          <span
            key={point.id}
            className="rounded-lg border border-white/10 bg-[#080D1B] px-3 py-2 text-xs text-slate-300"
          >
            {index + 1}. {point.percentage}% · {point.title}
          </span>
        ))}
      </div>
    </section>
  );
}
