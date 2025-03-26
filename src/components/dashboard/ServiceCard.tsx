
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  value: number;
  onEdit: (id: string) => void;
}

const ServiceCard = ({ id, title, description, value, onEdit }: ServiceCardProps) => {
  return (
    <Card className="hover:shadow-elevation transition-shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="font-medium">₹{value}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(id)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
