import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  iconColor?: string;
  isDebt?: boolean;
  isPending?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  isDebt = false,
  isPending = false
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Icon className={`h-5 w-5 ${iconColor} mr-2`} />
          <span className={`text-2xl font-bold ${
            isDebt ? 'text-red-500' : 
            isPending ? 'text-yellow-500' : 
            ''
          }`}>
            {isDebt ? '-' : isPending ? '+' : ''}{value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
