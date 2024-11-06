import { Card } from '../../../ui/card';
import { Star, Sparkles, Rocket } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import { useUserData } from '../../../../integrations/supabase/hooks/useUserData';

const BetaFeatures = ({ currentUserId }: { currentUserId: string }) => {
  const { data: userData, isLoading } = useUserData(currentUserId);
  const features = userData?.beta;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl"
          ></div>
        ))}
      </div>
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb';

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl border border-blue-200/20 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Beta Features
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Discover the future of our platform
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features?.map((feature) => (
          <Card
            key={feature.id}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm border-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {feature.image_url ? (
              <div className="h-48 overflow-hidden">
                <Image
                  src={feature.image_url}
                  alt={feature.feature_name}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="h-48 overflow-hidden">
                <Image
                  src={defaultImage}
                  alt="Default feature image"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            )}
            <div className="relative p-6">
              <div className="flex items-center gap-2 mb-4">
                {feature.status === 'active' ? (
                  <div className="flex items-center gap-2 bg-green-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Star className="text-yellow-500" size={18} />
                    <span className="text-sm font-medium text-green-700">
                      Available Now
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Rocket className="text-blue-500" size={18} />
                    <span className="text-sm font-medium text-blue-700">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {feature.feature_name}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BetaFeatures;
