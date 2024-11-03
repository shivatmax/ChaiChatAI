import { Button } from '../../../../ui/button';
import { Card } from '../../../../ui/card';
import { Check } from 'lucide-react';
import React from 'react';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  action: {
    label: string;
    variant?: 'default' | 'outline';
  };
  isPopular?: boolean;
}

const PlanCard = ({
  title,
  price,
  period,
  features,
  action,
  isPopular,
}: PlanCardProps) => (
  <Card className="relative p-6 md:p-8 space-y-6 bg-gradient-to-br from-white to-blue-50/50 border-blue-100/50 shadow-lg shadow-blue-100/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    {isPopular && (
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
        Most Popular
      </div>
    )}
    <div className="text-center">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900">{title}</h2>
      <div className="mt-3">
        <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
          {price}
        </span>
        <span className="text-blue-600/70 ml-2">{period}</span>
      </div>
    </div>
    <ul className="space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <Check className="text-blue-600 flex-shrink-0" size={20} />
          <span className="text-blue-800">{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      className={
        action.variant === 'outline'
          ? 'w-full border-blue-200 hover:bg-blue-50'
          : 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      }
      variant={action.variant}
    >
      {action.label}
    </Button>
  </Card>
);

export const AccountPlans = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <PlanCard
        title="FREE"
        price="$0"
        period="forever"
        features={[
          '5 AI Friends',
          'Basic chat features',
          'Standard response time',
          'Community support',
        ]}
        action={{ label: 'Current Plan', variant: 'outline' }}
      />

      <PlanCard
        title="PRO"
        price="$9.99"
        period="per month"
        features={[
          'Unlimited AI Friends',
          'Priority response time',
          'Voice conversations',
          'Custom AI personalities',
          'Premium support',
          'Advanced analytics',
        ]}
        action={{ label: 'Coming Soon' }}
        isPopular
      />

      <PlanCard
        title="TEAM"
        price="$29.99"
        period="per month"
        features={[
          'Everything in Pro',
          'Team collaboration',
          'Shared AI Friends',
          'Admin dashboard',
          'API access',
          '24/7 priority support',
        ]}
        action={{ label: 'Contact Sales', variant: 'outline' }}
      />
    </div>
  );
};
