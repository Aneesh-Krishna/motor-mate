import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [vehicleAnalytics, setVehicleAnalytics] = useState(null);
  const [comparativeData, setComparativeData] = useState(null);
  const [fuelPriceData, setFuelPriceData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch total analytics
      const totalResponse = await fetch(
        `http://localhost:5000/api/analytics/total?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!totalResponse.ok) throw new Error('Failed to fetch total analytics');
      const totalData = await totalResponse.json();
      setAnalyticsData(totalData);

      // Fetch comparative analytics
      const comparativeResponse = await fetch(
        `http://localhost:5000/api/analytics/comparative?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (comparativeResponse.ok) {
        const compData = await comparativeResponse.json();
        setComparativeData(compData);
        setVehicles(compData.vehicles);
      }

      // Fetch fuel price trends
      const fuelResponse = await fetch(
        `http://localhost:5000/api/analytics/fuel-prices?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (fuelResponse.ok) {
        const fuelData = await fuelResponse.json();
        setFuelPriceData(fuelData);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleAnalytics = async (vehicleId) => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/analytics/vehicle/${vehicleId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch vehicle analytics');
      const data = await response.json();
      setVehicleAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleAnalytics(selectedVehicle);
      setActiveTab('vehicle');
    }
  }, [selectedVehicle]);

  // Chart configurations
  const monthlyExpensesChart = {
    labels: analyticsData?.monthlyExpenses?.map(m => {
      const date = new Date(m.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Fuel',
        data: analyticsData?.monthlyExpenses?.map(m => m.Fuel) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Service',
        data: analyticsData?.monthlyExpenses?.map(m => m.Service) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Other',
        data: analyticsData?.monthlyExpenses?.map(m => m.Other) || [],
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 1,
      }
    ]
  };

  const expenseTypePieChart = {
    labels: ['Fuel', 'Service', 'Other'],
    datasets: [
      {
        data: [
          analyticsData?.typeBreakdown?.Fuel || 0,
          analyticsData?.typeBreakdown?.Service || 0,
          analyticsData?.typeBreakdown?.Other || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  const vehicleComparisonChart = {
    labels: comparativeData?.vehicles?.map(v => v.vehicle.name) || [],
    datasets: [
      {
        label: 'Total Expenses',
        data: comparativeData?.vehicles?.map(v => v.totalExpense) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1,
      }
    ]
  };

  const mileageTrendChart = {
    labels: vehicleAnalytics?.monthlyMileageTrends?.map(m => {
      const date = new Date(m.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Average Mileage (km/l)',
        data: vehicleAnalytics?.monthlyMileageTrends?.map(m => m.averageMileage) || [],
        borderColor: 'rgba(236, 72, 153, 1)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const fuelPriceChart = {
    labels: fuelPriceData?.monthlyTrends?.map(m => {
      const date = new Date(m.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Average Price per Liter',
        data: fuelPriceData?.monthlyTrends?.map(m => m.avgPrice) || [],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Min Price',
        data: fuelPriceData?.monthlyTrends?.map(m => m.minPrice) || [],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Max Price',
        data: fuelPriceData?.monthlyTrends?.map(m => m.maxPrice) || [],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
      }
    ]
  };

  if (loading && !analyticsData) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>Error: {error}</p>
        <button onClick={fetchAnalyticsData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Expense Analytics</h1>

        <div className="analytics-controls">
          <div className="date-range-selector">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              max={dateRange.endDate}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="vehicle-selector">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">All Vehicles</option>
              {vehicles?.map(vehicle => (
                <option key={vehicle.vehicle.id} value={vehicle.vehicle.id}>
                  {vehicle.vehicle.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'vehicle' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicle')}
          disabled={!selectedVehicle}
        >
          Vehicle Details
        </button>
        <button
          className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparison
        </button>
        <button
          className={`tab-button ${activeTab === 'fuel' ? 'active' : ''}`}
          onClick={() => setActiveTab('fuel')}
        >
          Fuel Analysis
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && analyticsData && (
          <div className="overview-tab">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="amount">₹{analyticsData.summary?.totalExpenses?.toFixed(2) || 0}</p>
                <span className="period">Last {Math.round((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))} days</span>
              </div>
              <div className="summary-card">
                <h3>Average Monthly</h3>
                <p className="amount">₹{analyticsData.summary?.avgMonthlyExpense || 0}</p>
                <span className="period">Per month</span>
              </div>
              <div className="summary-card">
                <h3>Total Transactions</h3>
                <p className="amount">{analyticsData.summary?.totalTransactions || 0}</p>
                <span className="period">All expenses</span>
              </div>
              <div className="summary-card">
                <h3>Most Expensive Vehicle</h3>
                <p className="amount">{analyticsData.highestExpenseVehicle?.vehicle || 'N/A'}</p>
                <span className="period">₹{analyticsData.highestExpenseVehicle?.total?.toFixed(2) || 0}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              <div className="chart-container large">
                <h3>Monthly Expenses by Type</h3>
                <Bar data={monthlyExpensesChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>

              <div className="chart-container">
                <h3>Expense Types Distribution</h3>
                <Doughnut data={expenseTypePieChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>

              <div className="chart-container">
                <h3>Vehicle Expense Comparison</h3>
                <Bar data={vehicleComparisonChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Vehicle Expenses Table */}
            <div className="data-table">
              <h3>Vehicle Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Total Expenses</th>
                    <th>Fuel</th>
                    <th>Service</th>
                    <th>Other</th>
                    <th>Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.vehicleExpenses?.map(vehicle => (
                    <tr key={vehicle.vehicle}>
                      <td>{vehicle.vehicle}</td>
                      <td>₹{vehicle.total?.toFixed(2)}</td>
                      <td>₹{vehicle.Fuel?.toFixed(2)}</td>
                      <td>₹{vehicle.Service?.toFixed(2)}</td>
                      <td>₹{vehicle.Other?.toFixed(2)}</td>
                      <td>{vehicle.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vehicle' && vehicleAnalytics && (
          <div className="vehicle-tab">
            <div className="vehicle-header">
              <h2>{vehicleAnalytics.vehicle.name} Analytics</h2>
              <p>{vehicleAnalytics.vehicle.company} {vehicleAnalytics.vehicle.model} ({vehicleAnalytics.vehicle.fuelType})</p>
            </div>

            {/* Vehicle Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="amount">₹{vehicleAnalytics.summary.totalExpenses?.toFixed(2) || 0}</p>
                <span className="period">Selected period</span>
              </div>
              <div className="summary-card">
                <h3>Average Mileage</h3>
                <p className="amount">{vehicleAnalytics.mileageAnalysis.averageMileage || 0} km/l</p>
                <span className="period">Best: {vehicleAnalytics.mileageAnalysis.bestMileage || 0} km/l</span>
              </div>
              <div className="summary-card">
                <h3>Total Distance</h3>
                <p className="amount">{(vehicleAnalytics.mileageAnalysis.totalDistance / 1000).toFixed(1)}k km</p>
                <span className="period">Total traveled</span>
              </div>
              <div className="summary-card">
                <h3>Cost per km</h3>
                <p className="amount">₹{vehicleAnalytics.mileageAnalysis.costPerKm || 0}</p>
                <span className="period">Fuel cost only</span>
              </div>
            </div>

            {/* Vehicle Charts */}
            <div className="charts-grid">
              <div className="chart-container large">
                <h3>Monthly Expenses</h3>
                <Bar data={{
                  labels: vehicleAnalytics.monthlyExpenses?.map(m => {
                    const date = new Date(m.month + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }) || [],
                  datasets: [
                    {
                      label: 'Fuel',
                      data: vehicleAnalytics.monthlyExpenses?.map(m => m.Fuel) || [],
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    },
                    {
                      label: 'Service',
                      data: vehicleAnalytics.monthlyExpenses?.map(m => m.Service) || [],
                      backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    },
                    {
                      label: 'Other',
                      data: vehicleAnalytics.monthlyExpenses?.map(m => m.Other) || [],
                      backgroundColor: 'rgba(251, 146, 60, 0.8)',
                    }
                  ]
                }} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>

              <div className="chart-container">
                <h3>Mileage Trends</h3>
                <Line data={mileageTrendChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>

              <div className="chart-container">
                <h3>Expense Breakdown</h3>
                <Pie data={{
                  labels: ['Fuel', 'Service', 'Other'],
                  datasets: [
                    {
                      data: [
                        vehicleAnalytics.expenseBreakdown.fuel.total,
                        vehicleAnalytics.expenseBreakdown.service.total,
                        vehicleAnalytics.expenseBreakdown.other.total
                      ],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(251, 146, 60, 0.8)'
                      ]
                    }
                  ]
                }} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="data-table">
              <h3>Recent Expenses</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Odometer</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleAnalytics.recentExpenses?.map(expense => (
                    <tr key={expense.id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>{expense.type}</td>
                      <td>{expense.description}</td>
                      <td>₹{expense.amount?.toFixed(2)}</td>
                      <td>{expense.odometer?.toLocaleString()} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && comparativeData && (
          <div className="comparison-tab">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Vehicles</h3>
                <p className="amount">{comparativeData.summary.totalVehicles}</p>
                <span className="period">In your garage</span>
              </div>
              <div className="summary-card">
                <h3>Most Expensive</h3>
                <p className="amount">{comparativeData.summary.mostExpensive?.vehicle.name}</p>
                <span className="period">₹{comparativeData.summary.mostExpensive?.totalExpense?.toFixed(2)}</span>
              </div>
              <div className="summary-card">
                <h3>Best Mileage</h3>
                <p className="amount">{comparativeData.summary.bestMileage?.vehicle.name}</p>
                <span className="period">{comparativeData.summary.bestMileage?.avgMileage} km/l</span>
              </div>
              <div className="summary-card">
                <h3>Most Used</h3>
                <p className="amount">{comparativeData.summary.mostUsed?.vehicle.name}</p>
                <span className="period">{(comparativeData.summary.mostUsed?.totalDistance / 1000).toFixed(1)}k km</span>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container large">
                <h3>Vehicle Expense Comparison</h3>
                <Bar data={vehicleComparisonChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="data-table">
              <h3>Vehicle Performance Comparison</h3>
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Total Expenses</th>
                    <th>Transactions</th>
                    <th>Avg Mileage</th>
                    <th>Cost per km</th>
                    <th>Total Distance</th>
                    <th>Fuel Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativeData.vehicles?.map(vehicle => (
                    <tr key={vehicle.vehicle.id}>
                      <td>{vehicle.vehicle.name}</td>
                      <td>₹{vehicle.totalExpense?.toFixed(2)}</td>
                      <td>{vehicle.transactionCount}</td>
                      <td>{vehicle.avgMileage || 'N/A'} km/l</td>
                      <td>₹{vehicle.costPerKm || 'N/A'}</td>
                      <td>{(vehicle.totalDistance / 1000).toFixed(1)}k km</td>
                      <td>{vehicle.fuelConsumed?.toFixed(1)}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fuel' && fuelPriceData && (
          <div className="fuel-tab">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Average Fuel Price</h3>
                <p className="amount">₹{fuelPriceData.overallStats.avgPrice}/L</p>
                <span className="period">Price range: ₹{fuelPriceData.overallStats.minPrice} - ₹{fuelPriceData.overallStats.maxPrice}</span>
              </div>
              <div className="summary-card">
                <h3>Price Trend</h3>
                <p className="amount">{fuelPriceData.priceTrend.direction}</p>
                <span className="period">{fuelPriceData.priceTrend.changePercent}% change</span>
              </div>
              <div className="summary-card">
                <h3>Data Points</h3>
                <p className="amount">{fuelPriceData.overallStats.totalDataPoints}</p>
                <span className="period">Fuel entries analyzed</span>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container large">
                <h3>Fuel Price Trends</h3>
                <Line data={fuelPriceChart} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="data-table">
              <h3>Recent Fuel Prices</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Price per Liter</th>
                    <th>Total Cost</th>
                    <th>Total Fuel</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelPriceData.recentPrices?.slice(0, 10).map((price, index) => (
                    <tr key={index}>
                      <td>{new Date(price.date).toLocaleDateString()}</td>
                      <td>{price.vehicle}</td>
                      <td>₹{price.pricePerLiter}</td>
                      <td>₹{price.totalCost?.toFixed(2)}</td>
                      <td>{price.totalFuel?.toFixed(1)}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;