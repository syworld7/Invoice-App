import React from 'react';
import { Card } from '../common/Card/Card';
import type { TrendItem } from '../../types';

interface TrendChartProps {
  trendData: TrendItem[];
  currencySymbol: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trendData, currencySymbol }) => {
  
  const maxVal = Math.max(...trendData.map(d => d.amountSum), 100);
  const chartHeight = 110;
  const chartWidth = 320;
  const paddingX = 20;
  const paddingY = 15;

  const points = trendData.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(trendData.length - 1, 1);
    const y = chartHeight - paddingY - (d.amountSum * (chartHeight - paddingY * 2)) / maxVal;
    return { x, y, label: d.monthStart, value: d.amountSum };
  });

  
  let dPath = '';
  if (points.length > 0) {
    dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  
  let dPathGrad = '';
  if (points.length > 0) {
    dPathGrad = `${dPath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
  }

  return (
    <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
         Last 12 Months
        </span>
      </div>

      <div style={{ position: 'relative', height: `${chartHeight}px`, marginTop: '8px' }}>
        {trendData.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            No trend data available.
          </div>
        ) : (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(0,0,0,0.03)" strokeWidth={1} />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(0,0,0,0.05)" strokeWidth={1} />

            {}
            {dPathGrad && <path d={dPathGrad} fill="url(#trend-grad)" />}

            {}
            {dPath && (
              <path
                d={dPath}
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {}
            {points.map((p, idx) => (
              <g key={idx} className="chart-node-group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="#ffffff"
                  stroke="var(--brand-primary)"
                  strokeWidth={1.5}
                />
                {}
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill="var(--brand-primary)"
                  style={{ display: 'none', pointerEvents: 'none' }}
                  className="chart-node-tooltip"
                >
                  {currencySymbol}{p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </text>
              </g>
            ))}

            {}
            {points.filter((_, idx) => idx % 2 === 0).map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={chartHeight}
                textAnchor="middle"
                fontSize="8"
                fill="var(--text-secondary)"
                fontWeight="500"
              >
                {(() => {
                  const parts = p.label.split('-');
                  if (parts.length < 2) return p.label;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const mIdx = parseInt(parts[1], 10) - 1;
                  return `${months[mIdx]} '${parts[0].substring(2)}`;
                })()}
              </text>
            ))}
          </svg>
        )}
      </div>

      <style>{`
        .chart-node-group:hover circle {
          r: 5px;
          fill: var(--brand-primary);
        }
        .chart-node-group:hover .chart-node-tooltip {
          display: block !important;
        }
      `}</style>
    </Card>
  );
};
