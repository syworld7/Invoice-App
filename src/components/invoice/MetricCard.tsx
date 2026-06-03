import React from 'react';
import { Card } from '../common/Card/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  filterLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, subtitle, filterLabel }) => {
  return (
    <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          {value}
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          {subtitle}
        </p>
        {filterLabel && (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {filterLabel}
          </p>
        )}
      </div>
    </Card>
  );
};
