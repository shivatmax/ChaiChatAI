import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Clock, MessageSquare, Users, AlertTriangle } from 'lucide-react';
import { useUserData } from '../../../integrations/supabase/hooks/useUserData';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

const Usage = ({ currentUserId }: { currentUserId: string }) => {
  const { data: userData, isLoading, error } = useUserData(currentUserId);
  const stats = userData?.usage;

  const avgSessionTime = stats?.avg_session_time || 0;
  const totalAiFriends = stats?.total_ai_friends || 0;
  const conversationsLeft = stats?.conversations_left || 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading usage data</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-8 rounded-2xl">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Usage Statistics
        </h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Monitor your activity and conversation credits
        </p>
      </div>

      {conversationsLeft === 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Conversations Left</AlertTitle>
          <AlertDescription>
            You&apos;ve used all your free conversation credits. Upgrade to our
            Pro plan to continue chatting with your AI friends!
          </AlertDescription>
          <button
            onClick={() => (window.location.href = '/account')}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Upgrade Now
          </button>
        </Alert>
      )}

      {conversationsLeft > 0 && conversationsLeft <= 10 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            Running Low on Credits
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            You have {conversationsLeft} conversation
            {conversationsLeft === 1 ? '' : 's'} left. Consider upgrading to our
            Pro plan for unlimited conversations!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total AI Friends Created
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-700">
              {totalAiFriends}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Total Conversations Left
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-purple-700">
              {conversationsLeft}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-white border-none shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Average Session Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-blue-800">
              {avgSessionTime} min
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl border border-blue-100 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-900">
            Conversation Credits
          </h2>
        </div>

        <div className="space-y-4">
          <div className="h-3 bg-blue-50 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min((conversationsLeft / 100) * 100, 100))}%`,
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
            <span className="text-blue-800 font-medium">
              Used: {100 - conversationsLeft} conversations
            </span>
            <span className="text-purple-800 font-medium">
              Left: {conversationsLeft} conversations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
