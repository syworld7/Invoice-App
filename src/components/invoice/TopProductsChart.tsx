import React, { useState } from 'react';
import { Card } from '../common/Card/Card';
import type { TopItem } from '../../types';

interface TopProductsChartProps {
  topItems: TopItem[];
  currencySymbol: string;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ topItems, currencySymbol }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  
  const items = topItems.slice(0, 5);

  
  const totalAmount = items.reduce((sum, item) => sum + item.amountSum, 0);

  
  const colors = [
    '#262626', 
    '#4f46e5', 
    '#0d9488', 
    '#d97706', 
    '#be123c', 
  ];

  
  const cx = 60;
  const cy = 60;
  const r = 50;

  
  let accumulatedAngle = -Math.PI / 2; 

  const slices = items.map((item, idx) => {
    const amount = item.amountSum;
    const pct = totalAmount > 0 ? amount / totalAmount : 0;
    const angle = pct * 2 * Math.PI;

    
    const x1 = cx + r * Math.cos(accumulatedAngle);
    const y1 = cy + r * Math.sin(accumulatedAngle);

    
    const x2 = cx + r * Math.cos(accumulatedAngle + angle);
    const y2 = cy + r * Math.sin(accumulatedAngle + angle);

    const largeArc = pct > 0.5 ? 1 : 0;

    
    const isFullCircle = pct > 0.999;

    const pathData = isFullCircle
      ? ''
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    return {
      item,
      pct,
      pathData,
      isFullCircle,
      color: colors[idx % colors.length],
      angle,
      startAngle,
    };
  });

  return (
    <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Top 5 items
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, marginTop: '8px' }}>
        {}
        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
          {totalAmount === 0 ? (
            <svg width="100%" height="100%" viewBox="0 0 120 120">
              <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="500">
                No Sales
              </text>
            </svg>
          ) : (
            <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
              {slices.map((slice, idx) => {
                const isHovered = hoveredIdx === idx;
                
                
                const midAngle = slice.startAngle + slice.angle / 2;
                const tx = isHovered ? Math.cos(midAngle) * 4 : 0;
                const ty = isHovered ? Math.sin(midAngle) * 4 : 0;

                if (slice.isFullCircle) {
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={slice.color}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: `translate(${tx}px, ${ty}px)`
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                }

                return (
                  <path
                    key={idx}
                    d={slice.pathData}
                    fill={slice.color}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: `translate(${tx}px, ${ty}px)`
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {items.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#adb5bd' }}>No sales data.</span>
          ) : (
            slices.map((slice, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    backgroundColor: isHovered ? '#f8f9fa' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: slice.color,
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontWeight: isHovered ? 600 : 500,
                      color: '#262626',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {slice.item.itemName || `Item #${slice.item.itemID}`}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    color: '#6c757d',
                    fontWeight: 600,
                    marginLeft: '8px',
                    flexShrink: 0
                  }}>
                    {currencySymbol}{slice.item.amountSum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
