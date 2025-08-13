import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Award,
  Play,
  FileText,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { earningsAPI, usersAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import DailyBonusModal from '../components/dashboard/DailyBonusModal';
import QuizModal from '../components/dashboard/QuizModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['earnings-stats'],
    earningsAPI.getStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    ['user-transactions'],
    () => usersAPI.getTransactions(1, 5),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const { data: referralStats } = useQuery(
    ['referral-stats'],
    usersAPI.getReferralStats
  );

  // Handle daily bonus
  const handleDailyBonus = async () => {
    try {
      const response = await earningsAPI.getDailyBonus();
      toast.success(`Daily bonus claimed! +${response.data.points} points`);
      // Refetch stats to update points
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim daily bonus');
    }
  };

  // Handle video watching
  const handleWatchVideo = async () => {
    try {
      const response = await earningsAPI.watchVideo();
      toast.success(`Video watched! +${response.data.points} points`);
      // Refetch stats to update points
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to watch video');
    }
  };

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  const canClaimDailyBonus = stats?.canClaimDailyBonus;
  const canWatchVideo = stats?.canWatchVideo;

  return (
    <>
      <Helmet>
        <title>Dashboard - Earning Website</title>
        <meta name="description" content="Your earning dashboard with stats, quick actions, and recent activity" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your earning overview and quick actions to boost your income.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Current Points"
            value={user?.points || 0}
            icon={DollarSign}
            color="blue"
            subtitle={`$${(user?.points / 100).toFixed(2)} USD`}
          />
          <StatsCard
            title="Total Earned"
            value={user?.totalEarned || 0}
            icon={TrendingUp}
            color="green"
            subtitle={`$${(user?.totalEarned / 100).toFixed(2)} USD`}
          />
          <StatsCard
            title="Referral Earnings"
            value={referralStats?.totalEarnings || 0}
            icon={Users}
            color="purple"
            subtitle={`${referralStats?.totalReferrals || 0} referrals`}
          />
          <StatsCard
            title="Daily Streak"
            value={user?.dailyBonusStreak || 0}
            icon={Award}
            color="yellow"
            subtitle="days"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActions
              title="Daily Bonus"
              description="Claim your daily bonus"
              icon={Award}
              onClick={() => setShowDailyBonus(true)}
              disabled={!canClaimDailyBonus}
              variant={canClaimDailyBonus ? "primary" : "disabled"}
            />
            <QuickActions
              title="Watch Video"
              description="Earn points by watching ads"
              icon={Play}
              onClick={handleWatchVideo}
              disabled={!canWatchVideo}
              variant={canWatchVideo ? "primary" : "disabled"}
            />
            <QuickActions
              title="Take Quiz"
              description="Answer questions for points"
              icon={FileText}
              onClick={() => setShowQuiz(true)}
              variant="primary"
            />
            <QuickActions
              title="Share Referral"
              description="Invite friends to earn"
              icon={Share2}
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.referralCode}`)}
              variant="secondary"
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h2>
                {transactionsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <RecentActivity transactions={transactions?.data?.transactions || []} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email Verification</span>
                  {user?.emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                {user?.country === 'BD' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone Verification</span>
                    {user?.phoneVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Minimum Withdrawal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.country === 'BD' ? '200 points' : '500 points'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Points to USD</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    100 points = $1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Referral Bonus</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    10% of earnings
                  </span>
                </div>
              </div>
            </div>

            {/* Next Bonus */}
            {!canClaimDailyBonus && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <h3 className="font-semibold">Next Daily Bonus</h3>
                </div>
                <p className="text-sm opacity-90">
                  Available in {stats?.nextBonusIn || '24 hours'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <DailyBonusModal
        isOpen={showDailyBonus}
        onClose={() => setShowDailyBonus(false)}
        onClaim={handleDailyBonus}
        streak={user?.dailyBonusStreak || 0}
      />
      
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
      />
    </>
  );
};

export default Dashboard;
