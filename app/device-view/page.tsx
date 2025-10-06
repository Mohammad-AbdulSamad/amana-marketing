"use client";
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { LineChart } from '../../src/components/ui/line-chart';
import { Table } from '../../src/components/ui/table';
import { fetchMarketingData } from '@/src/lib/api';
import { Smartphone, Monitor, Tablet, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

interface MarketingData {
  campaigns: any[];
  [key: string]: any;
}



export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const deviceMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return null;

    const deviceData: Record<string, {
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
      campaigns: number;
    }> = {
      'Mobile': { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, campaigns: 0 },
      'Desktop': { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, campaigns: 0 },
      'Tablet': { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, campaigns: 0 }
    };

    const campaignPerformance: any[] = [];

    marketingData.campaigns.forEach(campaign => {
      const campaignDeviceData: any = {
        campaign_name: campaign.name,
        campaign_id: campaign.id,
        medium: campaign.medium,
        Mobile: { revenue: 0, spend: 0, conversions: 0, roas: 0 },
        Desktop: { revenue: 0, spend: 0, conversions: 0, roas: 0 },
        Tablet: { revenue: 0, spend: 0, conversions: 0, roas: 0 }
      };

      campaign.device_performance?.forEach((device: any) => {
        if (deviceData[device.device]) {
          deviceData[device.device].impressions += device.impressions;
          deviceData[device.device].clicks += device.clicks;
          deviceData[device.device].conversions += device.conversions;
          deviceData[device.device].spend += device.spend;
          deviceData[device.device].revenue += device.revenue;
          deviceData[device.device].campaigns++;

          campaignDeviceData[device.device] = {
            revenue: device.revenue,
            spend: device.spend,
            conversions: device.conversions,
            roas: device.spend > 0 ? device.revenue / device.spend : 0
          };
        }
      });

      campaignPerformance.push(campaignDeviceData);
    });

    const devicesArray = Object.entries(deviceData).map(([device, data]) => ({
      device,
      ...data,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0,
      conversion_rate: data.clicks > 0 ? (data.conversions / data.clicks * 100) : 0,
      roas: data.spend > 0 ? (data.revenue / data.spend) : 0,
      avg_revenue_per_campaign: data.campaigns > 0 ? data.revenue / data.campaigns : 0
    }));

    const totalRevenue = devicesArray.reduce((sum, d) => sum + d.revenue, 0);
    const totalSpend = devicesArray.reduce((sum, d) => sum + d.spend, 0);
    const totalConversions = devicesArray.reduce((sum, d) => sum + d.conversions, 0);
    const totalClicks = devicesArray.reduce((sum, d) => sum + d.clicks, 0);

    return {
      devicesArray,
      campaignPerformance: campaignPerformance.filter(c => 
        c.Mobile.revenue > 0 || c.Desktop.revenue > 0 || c.Tablet.revenue > 0
      ),
      totalRevenue,
      totalSpend,
      totalConversions,
      totalClicks,
      mobileShare: totalRevenue > 0 ? (deviceData.Mobile.revenue / totalRevenue * 100) : 0,
      desktopShare: totalRevenue > 0 ? (deviceData.Desktop.revenue / totalRevenue * 100) : 0
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
      
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Device Performance Analysis
                </h1>
              )}
            </div>
          </div>
        </section>

        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && deviceMetrics && (
            <>
              {/* Overall Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                  Overall Performance Metrics
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <CardMetric
                    title="Total Revenue"
                    value={`$${deviceMetrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Spend"
                    value={`$${deviceMetrics.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Conversions"
                    value={deviceMetrics.totalConversions.toLocaleString()}
                    icon={<Target className="h-5 w-5" />}
                  />
                  <CardMetric
                    title="Total Clicks"
                    value={deviceMetrics.totalClicks.toLocaleString()}
                    icon={<Users className="h-5 w-5" />}
                  />
                </div>
              </div>

              {/* Device-Specific Metrics */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                  Performance by Device Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deviceMetrics.devicesArray.map(device => {
                    const Icon = device.device === 'Mobile' ? Smartphone : 
                                device.device === 'Desktop' ? Monitor : Tablet;
                    const color = device.device === 'Mobile' ? 'text-blue-400' :
                                 device.device === 'Desktop' ? 'text-purple-400' : 'text-green-400';
                    
                    return (
                      <div key={device.device} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">{device.device}</h3>
                          <Icon className={`h-6 w-6 ${color}`} />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-400">Revenue</div>
                            <div className="text-xl font-bold text-green-400">
                              ${device.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-gray-400">Conversions</div>
                              <div className="text-sm font-semibold text-white">
                                {device.conversions.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">ROAS</div>
                              <div className="text-sm font-semibold text-blue-400">
                                {device.roas.toFixed(2)}x
                              </div>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-700">
                            <div className="text-xs text-gray-400 mb-1">Conv. Rate</div>
                            <div className="text-sm font-semibold text-white">
                              {device.conversion_rate.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue Comparison Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Revenue by Device"
                  data={deviceMetrics.devicesArray.map(device => ({
                    label: device.device,
                    value: device.revenue,
                    color: device.device === 'Mobile' ? '#3B82F6' : 
                           device.device === 'Desktop' ? '#8B5CF6' : '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  height={350}
                />

                <BarChart
                  title="Conversions by Device"
                  data={deviceMetrics.devicesArray.map(device => ({
                    label: device.device,
                    value: device.conversions,
                    color: device.device === 'Mobile' ? '#3B82F6' : 
                           device.device === 'Desktop' ? '#8B5CF6' : '#10B981'
                  }))}
                  height={350}
                />
              </div>

              {/* Performance Metrics Comparison */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <BarChart
                  title="Click-Through Rate (CTR) by Device"
                  data={deviceMetrics.devicesArray.map(device => ({
                    label: device.device,
                    value: device.ctr,
                    color: '#F59E0B'
                  }))}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                  height={350}
                />

                <BarChart
                  title="Return on Ad Spend (ROAS) by Device"
                  data={deviceMetrics.devicesArray.map(device => ({
                    label: device.device,
                    value: device.roas,
                    color: '#EF4444'
                  }))}
                  formatValue={(value) => `${value.toFixed(2)}x`}
                  height={350}
                />
              </div>

              {/* Market Share Visualization */}
              <div className="mb-6 sm:mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue Distribution</h3>
                  <div className="space-y-4">
                    {deviceMetrics.devicesArray.map(device => {
                      const share = deviceMetrics.totalRevenue > 0 
                        ? (device.revenue / deviceMetrics.totalRevenue * 100) 
                        : 0;
                      const color = device.device === 'Mobile' ? 'bg-blue-500' : 
                                   device.device === 'Desktop' ? 'bg-purple-500' : 'bg-green-500';
                      
                      return (
                        <div key={device.device}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-300">{device.device}</span>
                            <span className="text-sm font-semibold text-white">
                              {share.toFixed(1)}% (${device.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className={`${color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Device Performance Table */}
              <div className="mb-6 sm:mb-8">
                <Table
                  title="Detailed Device Performance Metrics"
                  showIndex={false}
                  columns={[
                    {
                      key: 'device',
                      header: 'Device',
                      width: '12%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <div className="flex items-center gap-2">
                          {value === 'Mobile' && <Smartphone className="h-4 w-4 text-blue-400" />}
                          {value === 'Desktop' && <Monitor className="h-4 w-4 text-purple-400" />}
                          {value === 'Tablet' && <Tablet className="h-4 w-4 text-green-400" />}
                          <span className="font-medium text-white">{value}</span>
                        </div>
                      )
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '13%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '11%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '12%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'spend',
                      header: 'Spend',
                      width: '13%',
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
                      width: '13%',
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
                      width: '8%',
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
                  data={deviceMetrics.devicesArray}
                  emptyMessage="No device data available"
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