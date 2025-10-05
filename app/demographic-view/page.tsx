"use client";
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign } from '../../src/types/marketing';
import { Users, UserCheck, TrendingUp, DollarSign, MousePointer, Banknote } from 'lucide-react';




export default function DemographicView() {
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
  
   // Calculate demographic metrics
  const demographicMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    let maleClicks = 0, maleSpend = 0, maleRevenue = 0;
    let femaleClicks = 0, femaleSpend = 0, femaleRevenue = 0;
    
    const ageGroupData: Record<string, { spend: number; revenue: number }> = {};
    const maleAgeGroups: Record<string, { impressions: number; clicks: number; conversions: number; campaigns: number }> = {};
    const femaleAgeGroups: Record<string, { impressions: number; clicks: number; conversions: number; campaigns: number }> = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown?.forEach(demo => {
        const clicks = demo.performance.clicks;
        const conversions = demo.performance.conversions;
        const impressions = demo.performance.impressions;
        
        // Calculate spend and revenue proportionally based on demographics
        const demoPercentage = demo.percentage_of_audience / 100;
        const demoSpend = campaign.spend * demoPercentage;
        const demoRevenue = campaign.revenue * demoPercentage;

        // Aggregate by gender
        if (demo.gender === 'Male') {
          maleClicks += clicks;
          maleSpend += demoSpend;
          maleRevenue += demoRevenue;

          // Male age groups
          if (!maleAgeGroups[demo.age_group]) {
            maleAgeGroups[demo.age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              campaigns: 0
            };
          }
          maleAgeGroups[demo.age_group].impressions += impressions;
          maleAgeGroups[demo.age_group].clicks += clicks;
          maleAgeGroups[demo.age_group].conversions += conversions;
          maleAgeGroups[demo.age_group].campaigns++;
        } else if (demo.gender === 'Female') {
          femaleClicks += clicks;
          femaleSpend += demoSpend;
          femaleRevenue += demoRevenue;

          // Female age groups
          if (!femaleAgeGroups[demo.age_group]) {
            femaleAgeGroups[demo.age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              campaigns: 0
            };
          }
          femaleAgeGroups[demo.age_group].impressions += impressions;
          femaleAgeGroups[demo.age_group].clicks += clicks;
          femaleAgeGroups[demo.age_group].conversions += conversions;
          femaleAgeGroups[demo.age_group].campaigns++;
        }

        // Aggregate by age group for charts
        if (!ageGroupData[demo.age_group]) {
          ageGroupData[demo.age_group] = { spend: 0, revenue: 0 };
        }
        ageGroupData[demo.age_group].spend += demoSpend;
        ageGroupData[demo.age_group].revenue += demoRevenue;
      });
    });

    // Calculate CTR and Conversion Rate for age groups
    const maleAgeGroupsArray = Object.entries(maleAgeGroups).map(([age, data]) => ({
      age_group: age,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
      conversion_rate: data.clicks > 0 ? (data.conversions / data.clicks * 100) : 0
    }));

    const femaleAgeGroupsArray = Object.entries(femaleAgeGroups).map(([age, data]) => ({
      age_group: age,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
      conversion_rate: data.clicks > 0 ? (data.conversions / data.clicks * 100) : 0
    }));

    return {
      maleClicks,
      maleSpend,
      maleRevenue,
      femaleClicks,
      femaleSpend,
      femaleRevenue,
      ageGroupData,
      maleAgeGroupsArray,
      femaleAgeGroupsArray
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
                  Demographic Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && demographicMetrics && (
            <>
              {/* Male Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  Male Performance Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Clicks by Males"
                    value={demographicMetrics.maleClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend by Males"
                    value={`$${demographicMetrics.maleSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Revenue by Males"
                    value={`$${demographicMetrics.maleRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Female Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 mr-2" />
                  Female Performance Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Clicks by Females"
                    value={demographicMetrics.femaleClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend by Females"
                    value={`$${demographicMetrics.femaleSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Revenue by Females"
                    value={`$${demographicMetrics.femaleRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<Banknote className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Age Group Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={Object.entries(demographicMetrics.ageGroupData)
                    .sort((a, b) => {
                      const order: Record<string, number> = { '18-24': 1, '25-34': 2, '35-44': 3, '45-54': 4, '55+': 5 };
                      return (order[a[0]] || 99) - (order[b[0]] || 99);
                    })
                    .map(([age, data]) => ({
                      label: age,
                      value: data.spend,
                      color: '#3B82F6'
                    }))}
                  formatValue={(value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />

                <BarChart
                  title="Total Revenue by Age Group"
                  data={Object.entries(demographicMetrics.ageGroupData)
                    .sort((a, b) => {
                      const order: Record<string, number> = { '18-24': 1, '25-34': 2, '35-44': 3, '45-54': 4, '55+': 5 };
                      return (order[a[0]] || 99) - (order[b[0]] || 99);
                    })
                    .map(([age, data]) => ({
                      label: age,
                      value: data.revenue,
                      color: '#10B981'
                    }))}
                  formatValue={(value) => `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
              </div>

              {/* Male Age Groups Table */}
              <div className="mb-6 sm:mb-8">
                <Table
                  title="Campaign Performance by Male Age Groups"
                  showIndex={false}
                  columns={[
                    {
                      key: 'age_group',
                      header: 'Age Group',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <span className="font-medium text-blue-400">{value}</span>
                      )
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'ctr',
                      header: 'CTR',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conversion Rate',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          {value.toFixed(2)}%
                        </span>
                      )
                    }
                  ]}
                  defaultSort={{ key: 'clicks', direction: 'desc' }}
                  data={demographicMetrics.maleAgeGroupsArray}
                  emptyMessage="No male demographic data available"
                />
              </div>

              {/* Female Age Groups Table */}
              <div className="mb-6 sm:mb-8">
                <Table
                  title="Campaign Performance by Female Age Groups"
                  showIndex={false}
                  columns={[
                    {
                      key: 'age_group',
                      header: 'Age Group',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <span className="font-medium text-pink-400">{value}</span>
                      )
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'ctr',
                      header: 'CTR',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conversion Rate',
                      width: '17%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          {value.toFixed(2)}%
                        </span>
                      )
                    }
                  ]}
                  defaultSort={{ key: 'clicks', direction: 'desc' }}
                  data={demographicMetrics.femaleAgeGroupsArray}
                  emptyMessage="No female demographic data available"
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}