"use client";
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { BubbleMap } from '../../src/components/ui/bubble-map';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { fetchMarketingData } from '../../src/lib/api';

interface MarketingData {
  campaigns: any[];
  [key: string]: any;
}



export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'spend' | 'impressions' | 'clicks' | 'conversions'>('revenue');

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

  // Calculate regional metrics
  const regionalMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const regionData: Record<string, {
      country: string;
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
    }> = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance?.forEach((region: any) => {
        if (!regionData[region.region]) {
          regionData[region.region] = {
            country: region.country,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
            revenue: 0
          };
        }
        
        regionData[region.region].impressions += region.impressions;
        regionData[region.region].clicks += region.clicks;
        regionData[region.region].conversions += region.conversions;
        regionData[region.region].spend += region.spend;
        regionData[region.region].revenue += region.revenue;
      });
    });

    // Convert to array and calculate derived metrics
    const regionsArray = Object.entries(regionData).map(([region, data]) => ({
      region,
      country: data.country,
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      spend: data.spend,
      revenue: data.revenue,
      value: data[selectedMetric], // For bubble map
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
      conversion_rate: data.clicks > 0 ? (data.conversions / data.clicks * 100) : 0,
      roas: data.spend > 0 ? (data.revenue / data.spend) : 0,
      cpc: data.clicks > 0 ? (data.spend / data.clicks) : 0
    }));

    // Calculate totals
    const totalSpend = regionsArray.reduce((sum, r) => sum + r.spend, 0);
    const totalRevenue = regionsArray.reduce((sum, r) => sum + r.revenue, 0);
    const totalImpressions = regionsArray.reduce((sum, r) => sum + r.impressions, 0);
    const totalConversions = regionsArray.reduce((sum, r) => sum + r.conversions, 0);

    // Sort by revenue for charts
    const topRegionsByRevenue = [...regionsArray]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);

    return {
      regionsArray,
      topRegionsByRevenue,
      totalSpend,
      totalRevenue,
      totalImpressions,
      totalConversions,
      regionCount: regionsArray.length
    };
  }, [marketingData?.campaigns, selectedMetric]);

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

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      revenue: 'Revenue',
      spend: 'Spend',
      impressions: 'Impressions',
      clicks: 'Clicks',
      conversions: 'Conversions'
    };
    return labels[metric] || metric;
  };

  const getMetricFormat = (metric: string, value: number) => {
    if (metric === 'revenue' || metric === 'spend') {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString();
  };

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
                  Regional Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && regionalMetrics && (
            <>
              {/* Summary Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  Regional Overview ({regionalMetrics.regionCount} regions)
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Revenue"
                    value={`$${regionalMetrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend"
                    value={`$${regionalMetrics.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Impressions"
                    value={regionalMetrics.totalImpressions.toLocaleString()}
                    icon={<Users className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Conversions"
                    value={regionalMetrics.totalConversions.toLocaleString()}
                    icon={<Target className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Metric Selector */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Regional Bubble Map
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    {(['revenue', 'spend', 'impressions', 'clicks', 'conversions'] as const).map(metric => (
                      <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          selectedMetric === metric
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {getMetricLabel(metric)}
                      </button>
                    ))}
                  </div>
                </div>

                <BubbleMap
  title={`Regional ${getMetricLabel(selectedMetric)} Distribution`}
  data={regionalMetrics.regionsArray}
  metric={selectedMetric}
  height={500}
  formatValue={(value) => getMetricFormat(selectedMetric, value)}
/>

              </div>

              {/* Top Regions Chart */}
              <div className="mb-6 sm:mb-8">
                <BarChart
                  title="Top Regions by Revenue"
                  data={regionalMetrics.topRegionsByRevenue.map(region => ({
                    label: region.region,
                    value: region.revenue,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  height={350}
                />
              </div>

              {/* Regional Performance Table */}
              <div className="mb-6 sm:mb-8">
                <Table
                  title="Detailed Regional Performance"
                  showIndex={false}
                  columns={[
                    {
                      key: 'region',
                      header: 'Region',
                      width: '15%',
                      sortable: true,
                      sortType: 'string',
                      render: (value, row) => (
                        <div>
                          <div className="font-medium text-white">{value}</div>
                          <div className="text-xs text-gray-400">{row.country}</div>
                        </div>
                      )
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'spend',
                      header: 'Spend',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-red-400">
                          ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      )
                    },
                    {
                      key: 'revenue',
                      header: 'Revenue',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      )
                    },
                    {
                      key: 'ctr',
                      header: 'CTR',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conv. Rate',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'roas',
                      header: 'ROAS',
                      width: '9%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-blue-400 font-medium">
                          {value.toFixed(2)}x
                        </span>
                      )
                    }
                  ]}
                  defaultSort={{ key: 'revenue', direction: 'desc' }}
                  data={regionalMetrics.regionsArray}
                  emptyMessage="No regional data available"
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