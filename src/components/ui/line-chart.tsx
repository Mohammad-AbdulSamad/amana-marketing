interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  lineColor?: string;
  fillColor?: string;
}

export function LineChart({ 
  title, 
  data, 
  className = "", 
  height = 300,
  showValues = false,
  formatValue = (value) => value.toLocaleString(),
  lineColor = '#3B82F6',
  fillColor = 'rgba(59, 130, 246, 0.1)'
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const valueRange = maxValue - minValue;
  const chartHeight = height - 80;

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = valueRange > 0 
      ? ((maxValue - item.value) / valueRange) * chartHeight 
      : chartHeight / 2;
    return { x, y, value: item.value, label: item.label };
  });

  // Create SVG path for the line
  const linePath = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // Create SVG path for the filled area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* SVG Chart */}
        <svg 
          className="w-full" 
          style={{ height: `${chartHeight}px` }}
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Filled area under the line */}
          <path
            d={areaPath}
            fill={fillColor}
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="1"
                fill={lineColor}
                vectorEffect="non-scaling-stroke"
                className="hover:r-1.5 transition-all cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Labels and values */}
        <div className="flex justify-between mt-4">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1 min-w-0"
            >
              {showValues && (
                <div className="text-xs text-gray-300 mb-1 text-center">
                  {formatValue(item.value)}
                </div>
              )}
              <div className="text-xs text-gray-400 text-center break-words">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Y-axis reference lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ height: `${chartHeight}px` }}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <div
              key={ratio}
              className="absolute w-full border-t border-gray-700 opacity-30"
              style={{ top: `${ratio * chartHeight}px` }}
            />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between" style={{ height: `${chartHeight}px` }}>
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, index) => (
            <div 
              key={index}
              className="text-xs text-gray-500 -ml-2"
            >
              {formatValue(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}