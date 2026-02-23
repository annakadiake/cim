import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    secondary: 'text-secondary-600 bg-secondary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val > 1000000) {
        return formatCurrency(val);
      }
      return formatNumber(val);
    }
    return val;
  };

  return (
    <Card className="hover:shadow-medium transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="dashboard-stat-title">{title}</p>
            <p className="dashboard-stat-value mt-2">
              {formatValue(value)}
            </p>
            {change && (
              <p className={`dashboard-stat-change mt-1 ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{change.value}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickStatsProps {
  stats: Array<{
    title: string;
    value: string | number;
    icon: LucideIcon;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
    };
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }>;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
