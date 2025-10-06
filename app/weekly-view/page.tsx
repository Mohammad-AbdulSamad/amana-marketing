"use client";
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { fetchMarketingData } from '../../src/lib/api';

interface MarketingData {
  campaigns: any[];
  [key: string]: any;
}


export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

   // Load data on component mount
      useEffect(() => {
        const loadData = async () => {
          try {
            const data = await fetchMarketingData();
            setMarketingData(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading marketing data:', err);
          } finally {
            setLoading(false);
          }
        };
    
        loadData();
      }, []);

  // Calculate weekly metrics
  const weeklyMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const weeklyData: Record<string, { spend: number; revenue: number; impressions: number; clicks: number }> = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance?.forEach((week: any) => {
        const weekKey = week.week_start;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            spend: 0,
            revenue: 0,
            impressions: 0,
            clicks: 0
          };
        }
        
        weeklyData[weekKey].spend += week.spend;
        weeklyData[weekKey].revenue += week.revenue;
        weeklyData[weekKey].impressions += week.impressions;
        weeklyData[weekKey].clicks += week.clicks;
      });
    });

    // Sort by date and prepare for charts
    const sortedWeeks = Object.entries(weeklyData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({
        date,
        ...data,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));

    // Calculate totals
    const totalSpend = sortedWeeks.reduce((sum, week) => sum + week.spend, 0);
    const totalRevenue = sortedWeeks.reduce((sum, week) => sum + week.revenue, 0);
    const totalImpressions = sortedWeeks.reduce((sum, week) => sum + week.impressions, 0);
    const totalClicks = sortedWeeks.reduce((sum, week) => sum + week.clicks, 0);
    const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    // Prepare data for line charts
    const revenueByWeek = sortedWeeks.map(week => ({
      label: week.formattedDate,
      value: week.revenue
    }));

    const spendByWeek = sortedWeeks.map(week => ({
      label: week.formattedDate,
      value: week.spend
    }));

    return {
      totalSpend,
      totalRevenue,
      totalImpressions,
      totalClicks,
      averageROAS,
      revenueByWeek,
      spendByWeek,
      weekCount: sortedWeeks.length
    };
  }, [marketingData?.campaigns]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Weekly Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && weeklyMetrics && (
            <>
              {/* Summary Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  Weekly Overview ({weeklyMetrics.weekCount} weeks)
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Spend"
                    value={`$${weeklyMetrics.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Revenue"
                    value={`$${weeklyMetrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Average ROAS"
                    value={`${weeklyMetrics.averageROAS.toFixed(2)}x`}
                    icon={<Activity className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Impressions"
                    value={weeklyMetrics.totalImpressions.toLocaleString()}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Line Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <LineChart
                  title="Revenue by Week"
                  data={weeklyMetrics.revenueByWeek}
                  height={350}
                  showValues={true}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  lineColor="#10B981"
                  fillColor="rgba(16, 185, 129, 0.1)"
                />

                <LineChart
                  title="Spend by Week"
                  data={weeklyMetrics.spendByWeek}
                  height={350}
                  showValues={true}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  lineColor="#EF4444"
                  fillColor="rgba(239, 68, 68, 0.1)"
                />
              </div>

              {/* Combined View */}
              <div className="mb-6 sm:mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Weekly Performance Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <p className="text-sm mb-2">
                        <span className="font-semibold text-green-400">Highest Revenue Week:</span>
                        {' '}
                        {weeklyMetrics.revenueByWeek.reduce((max, week) => 
                          week.value > max.value ? week : max
                        ).label}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-green-400">Peak Revenue:</span>
                        {' '}
                        ${Math.max(...weeklyMetrics.revenueByWeek.map(w => w.value)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-2">
                        <span className="font-semibold text-red-400">Highest Spend Week:</span>
                        {' '}
                        {weeklyMetrics.spendByWeek.reduce((max, week) => 
                          week.value > max.value ? week : max
                        ).label}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-red-400">Peak Spend:</span>
                        {' '}
                        ${Math.max(...weeklyMetrics.spendByWeek.map(w => w.value)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}