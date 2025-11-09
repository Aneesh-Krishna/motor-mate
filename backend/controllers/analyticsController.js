const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// Get comprehensive expense analytics for all vehicles
exports.getTotalExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range to last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Get all vehicles for the user
    const vehicles = await Vehicle.find({ user: userId, isActive: true });
    const vehicleIds = vehicles.map(v => v._id);

    // Get all expenses for the user's vehicles
    const expenses = await Expense.find({
      vehicle: { $in: vehicleIds },
      isActive: true,
      date: { $gte: start, $lte: end }
    }).populate('vehicle', 'vehicleName company model fuelType');

    // Monthly expenses by type
    const monthlyExpenses = {};
    const vehicleExpenses = {};
    const typeExpenses = { Fuel: 0, Service: 0, Other: 0 };

    expenses.forEach(expense => {
      const month = expense.date.toISOString().slice(0, 7); // YYYY-MM
      const vehicleName = expense.vehicle.vehicleName;
      const type = expense.expenseType;
      const amount = expense.amount;

      // Initialize monthly data
      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = { Fuel: 0, Service: 0, Other: 0, total: 0 };
      }

      // Initialize vehicle data
      if (!vehicleExpenses[vehicleName]) {
        vehicleExpenses[vehicleName] = { total: 0, Fuel: 0, Service: 0, Other: 0, count: 0 };
      }

      // Accumulate data
      monthlyExpenses[month][type] += amount;
      monthlyExpenses[month].total += amount;

      vehicleExpenses[vehicleName][type] += amount;
      vehicleExpenses[vehicleName].total += amount;
      vehicleExpenses[vehicleName].count += 1;

      typeExpenses[type] += amount;
    });

    // Sort months
    const sortedMonths = Object.keys(monthlyExpenses).sort();
    const monthlyData = sortedMonths.map(month => ({
      month,
      ...monthlyExpenses[month]
    }));

    // Sort vehicles by total expense
    const sortedVehicles = Object.entries(vehicleExpenses)
      .sort(([,a], [,b]) => b.total - a.total)
      .map(([name, data]) => ({ vehicle: name, ...data }));

    // Calculate trends
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgMonthlyExpense = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

    // Month over month growth
    const monthlyGrowth = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const current = monthlyData[i].total;
      const previous = monthlyData[i - 1].total;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      monthlyGrowth.push({
        month: monthlyData[i].month,
        growth: growth.toFixed(2)
      });
    }

    res.json({
      summary: {
        totalExpenses,
        avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
        totalTransactions: expenses.length,
        dateRange: { start: start.toISOString(), end: end.toISOString() }
      },
      monthlyExpenses: monthlyData,
      vehicleExpenses: sortedVehicles,
      typeBreakdown: typeExpenses,
      monthlyGrowth,
      highestExpenseVehicle: sortedVehicles[0] || null,
      lowestExpenseVehicle: sortedVehicles[sortedVehicles.length - 1] || null
    });

  } catch (error) {
    console.error('Error in getTotalExpenseAnalytics:', error);
    res.status(500).json({ message: 'Error fetching total expense analytics' });
  }
};

// Get detailed analytics for a specific vehicle
exports.getVehicleAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify vehicle ownership
    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId, isActive: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Set default date range to last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Get all expenses for the vehicle
    const expenses = await Expense.find({
      vehicle: vehicleId,
      isActive: true,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Separate expense types
    const fuelExpenses = expenses.filter(e => e.expenseType === 'Fuel');
    const serviceExpenses = expenses.filter(e => e.expenseType === 'Service');
    const otherExpenses = expenses.filter(e => e.expenseType === 'Other');

    // Monthly breakdown
    const monthlyData = {};
    expenses.forEach(expense => {
      const month = expense.date.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { Fuel: 0, Service: 0, Other: 0, total: 0, count: 0 };
      }
      monthlyData[month][expense.expenseType] += expense.amount;
      monthlyData[month].total += expense.amount;
      monthlyData[month].count += 1;
    });

    // Mileage analysis
    const mileageData = [];
    let totalDistance = 0;
    let totalFuel = 0;

    for (let i = 0; i < fuelExpenses.length - 1; i++) {
      const current = fuelExpenses[i];
      const next = fuelExpenses[i + 1];

      if (current.odometerReading && next.odometerReading && current.fuelAdded) {
        const distance = next.odometerReading - current.odometerReading;
        const fuel = current.fuelAdded;

        if (distance > 0 && fuel > 0) {
          const mileage = distance / fuel;
          totalDistance += distance;
          totalFuel += fuel;

          mileageData.push({
            date: current.date,
            mileage: mileage.toFixed(2),
            distance,
            fuel,
            odometer: current.odometerReading
          });
        }
      }
    }

    // Calculate mileage statistics
    const mileages = mileageData.map(m => parseFloat(m.mileage)).filter(m => m > 0);
    const avgMileage = mileages.length > 0 ? mileages.reduce((a, b) => a + b, 0) / mileages.length : 0;
    const bestMileage = mileages.length > 0 ? Math.max(...mileages) : 0;
    const worstMileage = mileages.length > 0 ? Math.min(...mileages) : 0;

    // Monthly mileage trends
    const monthlyMileage = {};
    mileageData.forEach(data => {
      const month = data.date.toISOString().slice(0, 7);
      if (!monthlyMileage[month]) {
        monthlyMileage[month] = { totalMileage: 0, count: 0, distances: [] };
      }
      monthlyMileage[month].totalMileage += parseFloat(data.mileage);
      monthlyMileage[month].count += 1;
      monthlyMileage[month].distances.push(data.distance);
    });

    const monthlyMileageTrends = Object.entries(monthlyMileage).map(([month, data]) => ({
      month,
      averageMileage: (data.totalMileage / data.count).toFixed(2),
      totalDistance: data.distances.reduce((a, b) => a + b, 0),
      dataPoints: data.count
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Cost analysis
    const totalFuelCost = fuelExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalServiceCost = serviceExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOtherCost = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = totalFuelCost + totalServiceCost + totalOtherCost;

    // Calculate cost per km
    const costPerKm = totalDistance > 0 ? (totalFuelCost / totalDistance).toFixed(2) : 0;

    // Fuel efficiency analysis
    const fuelQuantity = fuelExpenses.reduce((sum, e) => sum + (e.fuelAdded || 0), 0);
    const avgFuelPrice = fuelQuantity > 0 ? (totalFuelCost / fuelQuantity).toFixed(2) : 0;

    // Monthly trends
    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyExpenses = sortedMonths.map(month => ({
      month,
      ...monthlyData[month]
    }));

    // Calculate trends
    let trendAnalysis = { direction: 'stable', changePercent: 0 };
    if (monthlyExpenses.length >= 2) {
      const recent = monthlyExpenses.slice(-3).reduce((sum, m) => sum + m.total, 0) / Math.min(3, monthlyExpenses.slice(-3).length);
      const previous = monthlyExpenses.slice(-6, -3).reduce((sum, m) => sum + m.total, 0) / Math.min(3, monthlyExpenses.slice(-6, -3).length);

      if (previous > 0) {
        const change = ((recent - previous) / previous) * 100;
        trendAnalysis = {
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          changePercent: change.toFixed(2)
        };
      }
    }

    res.json({
      vehicle: {
        id: vehicle._id,
        name: vehicle.vehicleName,
        company: vehicle.company,
        model: vehicle.model,
        fuelType: vehicle.fuelType
      },
      summary: {
        totalExpenses: totalCost,
        totalTransactions: expenses.length,
        avgMonthlyExpense: monthlyExpenses.length > 0 ? (totalCost / monthlyExpenses.length).toFixed(2) : 0,
        dateRange: { start: start.toISOString(), end: end.toISOString() }
      },
      expenseBreakdown: {
        fuel: { total: totalFuelCost, percentage: totalCost > 0 ? ((totalFuelCost / totalCost) * 100).toFixed(1) : 0 },
        service: { total: totalServiceCost, percentage: totalCost > 0 ? ((totalServiceCost / totalCost) * 100).toFixed(1) : 0 },
        other: { total: totalOtherCost, percentage: totalCost > 0 ? ((totalOtherCost / totalCost) * 100).toFixed(1) : 0 }
      },
      monthlyExpenses,
      mileageAnalysis: {
        averageMileage: avgMileage.toFixed(2),
        bestMileage: bestMileage.toFixed(2),
        worstMileage: worstMileage.toFixed(2),
        totalDistance,
        totalFuel: totalFuel.toFixed(2),
        dataPoints: mileageData.length,
        costPerKm,
        avgFuelPrice
      },
      monthlyMileageTrends,
      fuelEfficiency: {
        totalFuelConsumed: fuelQuantity.toFixed(2),
        avgFuelPrice,
        totalDistance,
        efficiency: totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0
      },
      trendAnalysis,
      recentExpenses: expenses.slice(-10).reverse().map(e => ({
        id: e._id,
        date: e.date,
        type: e.expenseType,
        amount: e.amount,
        description: e.description,
        odometer: e.odometerReading
      }))
    });

  } catch (error) {
    console.error('Error in getVehicleAnalytics:', error);
    res.status(500).json({ message: 'Error fetching vehicle analytics' });
  }
};

// Get comparative analytics between vehicles
exports.getComparativeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range to last 6 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 6, 1);

    // Get all vehicles for the user
    const vehicles = await Vehicle.find({ user: userId, isActive: true });

    const vehicleAnalytics = [];

    for (const vehicle of vehicles) {
      const expenses = await Expense.find({
        vehicle: vehicle._id,
        isActive: true,
        date: { $gte: start, $lte: end }
      });

      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const fuelExpenses = expenses.filter(e => e.expenseType === 'Fuel');
      const totalFuelCost = fuelExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalFuelQuantity = fuelExpenses.reduce((sum, e) => sum + (e.fuelAdded || 0), 0);

      // Calculate mileage for this vehicle
      let totalDistance = 0;
      let totalFuelForMileage = 0;
      const sortedFuelExpenses = fuelExpenses.sort((a, b) => a.odometerReading - b.odometerReading);

      for (let i = 0; i < sortedFuelExpenses.length - 1; i++) {
        const current = sortedFuelExpenses[i];
        const next = sortedFuelExpenses[i + 1];

        if (current.odometerReading && next.odometerReading && current.fuelAdded) {
          const distance = next.odometerReading - current.odometerReading;
          if (distance > 0 && current.fuelAdded > 0) {
            totalDistance += distance;
            totalFuelForMileage += current.fuelAdded;
          }
        }
      }

      const avgMileage = totalFuelForMileage > 0 ? (totalDistance / totalFuelForMileage).toFixed(2) : 0;
      const costPerKm = totalDistance > 0 ? (totalFuelCost / totalDistance).toFixed(2) : 0;

      vehicleAnalytics.push({
        vehicle: {
          id: vehicle._id,
          name: vehicle.vehicleName,
          company: vehicle.company,
          model: vehicle.model,
          fuelType: vehicle.fuelType
        },
        totalExpense,
        transactionCount: expenses.length,
        fuelCost: totalFuelCost,
        avgMileage: parseFloat(avgMileage),
        costPerKm: parseFloat(costPerKm),
        totalDistance,
        fuelConsumed: totalFuelQuantity
      });
    }

    // Sort by different metrics
    const sortByExpense = [...vehicleAnalytics].sort((a, b) => b.totalExpense - a.totalExpense);
    const sortByMileage = [...vehicleAnalytics].filter(v => v.avgMileage > 0).sort((a, b) => b.avgMileage - a.avgMileage);
    const sortByDistance = [...vehicleAnalytics].sort((a, b) => b.totalDistance - a.totalDistance);

    res.json({
      vehicles: vehicleAnalytics,
      rankings: {
        byExpense: sortByExpense,
        byMileage: sortByMileage,
        byDistance: sortByDistance
      },
      summary: {
        mostExpensive: sortByExpense[0] || null,
        leastExpensive: sortByExpense[sortByExpense.length - 1] || null,
        bestMileage: sortByMileage[0] || null,
        mostUsed: sortByDistance[0] || null,
        totalVehicles: vehicles.length
      }
    });

  } catch (error) {
    console.error('Error in getComparativeAnalytics:', error);
    res.status(500).json({ message: 'Error fetching comparative analytics' });
  }
};

// Get fuel price trends
exports.getFuelPriceTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId, startDate, endDate } = req.query;

    // Set default date range to last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Build query
    const query = {
      user: userId,
      expenseType: 'Fuel',
      isActive: true,
      date: { $gte: start, $lte: end },
      totalFuel: { $gt: 0 },
      totalCost: { $gt: 0 }
    };

    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const fuelExpenses = await Expense.find(query)
      .populate('vehicle', 'vehicleName company model fuelType')
      .sort({ date: 1 });

    // Calculate price per liter for each fuel expense
    const priceData = fuelExpenses.map(expense => {
      const pricePerLiter = expense.totalFuel > 0 ? expense.totalCost / expense.totalFuel : 0;
      return {
        date: expense.date,
        pricePerLiter: pricePerLiter.toFixed(2),
        totalCost: expense.totalCost,
        totalFuel: expense.totalFuel,
        vehicle: expense.vehicle.vehicleName,
        vehicleFuelType: expense.vehicle.fuelType
      };
    }).filter(item => item.pricePerLiter > 0);

    // Group by month
    const monthlyPrices = {};
    priceData.forEach(item => {
      const month = item.date.toISOString().slice(0, 7);
      if (!monthlyPrices[month]) {
        monthlyPrices[month] = { prices: [], count: 0, total: 0 };
      }
      monthlyPrices[month].prices.push(parseFloat(item.pricePerLiter));
      monthlyPrices[month].count += 1;
      monthlyPrices[month].total += parseFloat(item.pricePerLiter);
    });

    const monthlyTrends = Object.entries(monthlyPrices).map(([month, data]) => ({
      month,
      avgPrice: (data.total / data.count).toFixed(2),
      minPrice: Math.min(...data.prices).toFixed(2),
      maxPrice: Math.max(...data.prices).toFixed(2),
      dataPoints: data.count
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trends
    let priceTrend = { direction: 'stable', changePercent: 0 };
    if (monthlyTrends.length >= 2) {
      const recent = parseFloat(monthlyTrends[monthlyTrends.length - 1].avgPrice);
      const previous = parseFloat(monthlyTrends[monthlyTrends.length - 2].avgPrice);

      if (previous > 0) {
        const change = ((recent - previous) / previous) * 100;
        priceTrend = {
          direction: change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable',
          changePercent: change.toFixed(2)
        };
      }
    }

    // Overall statistics
    const allPrices = priceData.map(p => parseFloat(p.pricePerLiter));
    const overallStats = {
      avgPrice: allPrices.length > 0 ? (allPrices.reduce((a, b) => a + b, 0) / allPrices.length).toFixed(2) : 0,
      minPrice: allPrices.length > 0 ? Math.min(...allPrices).toFixed(2) : 0,
      maxPrice: allPrices.length > 0 ? Math.max(...allPrices).toFixed(2) : 0,
      totalDataPoints: allPrices.length
    };

    res.json({
      monthlyTrends,
      priceTrend,
      overallStats,
      recentPrices: priceData.slice(-20).reverse()
    });

  } catch (error) {
    console.error('Error in getFuelPriceTrends:', error);
    res.status(500).json({ message: 'Error fetching fuel price trends' });
  }
};

// Get comprehensive trip analytics for all vehicles
exports.getTripAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range to last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Get all vehicles for the user
    const vehicles = await Vehicle.find({ user: userId, isActive: true });
    const vehicleIds = vehicles.map(v => v._id);

    // Get all trips for the user's vehicles
    const trips = await Trip.find({
      vehicle: { $in: vehicleIds },
      isActive: true,
      date: { $gte: start, $lte: end }
    }).populate('vehicle', 'vehicleName company model fuelType');

    // Monthly trips analysis
    const monthlyTrips = {};
    const vehicleTrips = {};
    const purposeTrips = {};

    trips.forEach(trip => {
      const month = trip.date.toISOString().slice(0, 7); // YYYY-MM
      const vehicleName = trip.vehicle.vehicleName;
      const purpose = trip.purpose;
      const distance = trip.distance || 0;
      const cost = trip.totalCost || 0;

      // Initialize monthly data
      if (!monthlyTrips[month]) {
        monthlyTrips[month] = {
          tripCount: 0,
          totalDistance: 0,
          totalCost: 0,
          avgDistance: 0,
          avgCost: 0
        };
      }

      // Initialize vehicle data
      if (!vehicleTrips[vehicleName]) {
        vehicleTrips[vehicleName] = {
          tripCount: 0,
          totalDistance: 0,
          totalCost: 0,
          avgDistance: 0,
          avgCost: 0
        };
      }

      // Initialize purpose data
      if (!purposeTrips[purpose]) {
        purposeTrips[purpose] = {
          tripCount: 0,
          totalDistance: 0,
          totalCost: 0,
          avgDistance: 0,
          avgCost: 0
        };
      }

      // Accumulate monthly data
      monthlyTrips[month].tripCount += 1;
      monthlyTrips[month].totalDistance += distance;
      monthlyTrips[month].totalCost += cost;

      // Accumulate vehicle data
      vehicleTrips[vehicleName].tripCount += 1;
      vehicleTrips[vehicleName].totalDistance += distance;
      vehicleTrips[vehicleName].totalCost += cost;

      // Accumulate purpose data
      purposeTrips[purpose].tripCount += 1;
      purposeTrips[purpose].totalDistance += distance;
      purposeTrips[purpose].totalCost += cost;
    });

    // Calculate averages
    Object.keys(monthlyTrips).forEach(month => {
      const data = monthlyTrips[month];
      data.avgDistance = data.tripCount > 0 ? data.totalDistance / data.tripCount : 0;
      data.avgCost = data.tripCount > 0 ? data.totalCost / data.tripCount : 0;
    });

    Object.keys(vehicleTrips).forEach(vehicle => {
      const data = vehicleTrips[vehicle];
      data.avgDistance = data.tripCount > 0 ? data.totalDistance / data.tripCount : 0;
      data.avgCost = data.tripCount > 0 ? data.totalCost / data.tripCount : 0;
    });

    Object.keys(purposeTrips).forEach(purpose => {
      const data = purposeTrips[purpose];
      data.avgDistance = data.tripCount > 0 ? data.totalDistance / data.tripCount : 0;
      data.avgCost = data.tripCount > 0 ? data.totalCost / data.tripCount : 0;
    });

    // Sort months
    const sortedMonths = Object.keys(monthlyTrips).sort();
    const monthlyData = sortedMonths.map(month => ({
      month,
      ...monthlyTrips[month]
    }));

    // Sort vehicles by total distance
    const sortedVehicles = Object.entries(vehicleTrips)
      .sort(([,a], [,b]) => b.totalDistance - a.totalDistance)
      .map(([name, data]) => ({ vehicle: name, ...data }));

    // Calculate trends
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalCost = trips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);
    const avgMonthlyTrips = monthlyData.length > 0 ? totalTrips / monthlyData.length : 0;

    // Month over month growth
    const monthlyGrowth = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const current = monthlyData[i].tripCount;
      const previous = monthlyData[i - 1].tripCount;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      monthlyGrowth.push({
        month: monthlyData[i].month,
        growth: growth.toFixed(2)
      });
    }

    res.json({
      summary: {
        totalTrips,
        totalDistance,
        totalCost,
        avgMonthlyTrips: avgMonthlyTrips.toFixed(1),
        avgDistancePerTrip: totalTrips > 0 ? (totalDistance / totalTrips).toFixed(1) : 0,
        avgCostPerTrip: totalTrips > 0 ? (totalCost / totalTrips).toFixed(2) : 0,
        avgCostPerKm: totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0,
        dateRange: { start: start.toISOString(), end: end.toISOString() }
      },
      monthlyTrips: monthlyData,
      vehicleTrips: sortedVehicles,
      purposeBreakdown: purposeTrips,
      monthlyGrowth,
      mostTraveledVehicle: sortedVehicles[0] || null,
      mostExpensiveVehicle: sortedVehicles.sort((a, b) => b.totalCost - a.totalCost)[0] || null
    });

  } catch (error) {
    console.error('Error in getTripAnalytics:', error);
    res.status(500).json({ message: 'Error fetching trip analytics' });
  }
};

// Get detailed trip analytics for a specific vehicle
exports.getVehicleTripAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify vehicle ownership
    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: userId, isActive: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Set default date range to last 12 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1);

    // Get all trips for the vehicle
    const trips = await Trip.find({
      vehicle: vehicleId,
      isActive: true,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Monthly breakdown
    const monthlyData = {};
    const purposeData = {};

    trips.forEach(trip => {
      const month = trip.date.toISOString().slice(0, 7);
      const distance = trip.distance || 0;
      const cost = trip.totalCost || 0;
      const purpose = trip.purpose;

      if (!monthlyData[month]) {
        monthlyData[month] = {
          tripCount: 0,
          totalDistance: 0,
          totalCost: 0,
          avgDistance: 0,
          avgCost: 0,
          purposes: {}
        };
      }

      monthlyData[month].tripCount += 1;
      monthlyData[month].totalDistance += distance;
      monthlyData[month].totalCost += cost;

      // Track purposes
      if (!monthlyData[month].purposes[purpose]) {
        monthlyData[month].purposes[purpose] = 0;
      }
      monthlyData[month].purposes[purpose] += 1;

      // Overall purpose data
      if (!purposeData[purpose]) {
        purposeData[purpose] = {
          tripCount: 0,
          totalDistance: 0,
          totalCost: 0,
          avgDistance: 0,
          avgCost: 0,
          percentage: 0
        };
      }

      purposeData[purpose].tripCount += 1;
      purposeData[purpose].totalDistance += distance;
      purposeData[purpose].totalCost += cost;
    });

    // Calculate averages
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.avgDistance = data.tripCount > 0 ? data.totalDistance / data.tripCount : 0;
      data.avgCost = data.tripCount > 0 ? data.totalCost / data.tripCount : 0;
    });

    Object.keys(purposeData).forEach(purpose => {
      const data = purposeData[purpose];
      data.avgDistance = data.tripCount > 0 ? data.totalDistance / data.tripCount : 0;
      data.avgCost = data.tripCount > 0 ? data.totalCost / data.tripCount : 0;
      data.percentage = trips.length > 0 ? (data.tripCount / trips.length) * 100 : 0;
    });

    // Distance and cost analysis
    const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalCost = trips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);
    const avgDistance = trips.length > 0 ? totalDistance / trips.length : 0;
    const avgCost = trips.length > 0 ? totalCost / trips.length : 0;

    // Find longest and shortest trips
    const tripDistances = trips.map(t => t.distance || 0).filter(d => d > 0);
    const longestTrip = tripDistances.length > 0 ? Math.max(...tripDistances) : 0;
    const shortestTrip = tripDistances.length > 0 ? Math.min(...tripDistances) : 0;

    // Monthly trends
    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyTrips = sortedMonths.map(month => ({
      month,
      ...monthlyData[month]
    }));

    // Calculate trends
    let trendAnalysis = { direction: 'stable', changePercent: 0 };
    if (monthlyTrips.length >= 2) {
      const recentTrips = monthlyTrips.slice(-3).reduce((sum, m) => sum + m.tripCount, 0);
      const previousTrips = monthlyTrips.slice(-6, -3).reduce((sum, m) => sum + m.tripCount, 0);

      if (previousTrips > 0) {
        const change = ((recentTrips - previousTrips) / previousTrips) * 100;
        trendAnalysis = {
          direction: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
          changePercent: change.toFixed(2)
        };
      }
    }

    // Seasonal analysis
    const seasonalData = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };
    trips.forEach(trip => {
      const month = trip.date.getMonth();
      if (month >= 2 && month <= 4) seasonalData.Spring++;
      else if (month >= 5 && month <= 7) seasonalData.Summer++;
      else if (month >= 8 && month <= 10) seasonalData.Fall++;
      else seasonalData.Winter++;
    });

    res.json({
      vehicle: {
        id: vehicle._id,
        name: vehicle.vehicleName,
        company: vehicle.company,
        model: vehicle.model,
        fuelType: vehicle.fuelType
      },
      summary: {
        totalTrips: trips.length,
        totalDistance,
        totalCost,
        avgDistancePerTrip: avgDistance.toFixed(1),
        avgCostPerTrip: avgCost.toFixed(2),
        avgCostPerKm: totalDistance > 0 ? (totalCost / totalDistance).toFixed(2) : 0,
        longestTrip,
        shortestTrip,
        dateRange: { start: start.toISOString(), end: end.toISOString() }
      },
      monthlyTrips,
      purposeBreakdown: purposeData,
      seasonalAnalysis: seasonalData,
      trendAnalysis,
      recentTrips: trips.slice(-10).reverse().map(t => ({
        id: t._id,
        date: t.date,
        startLocation: t.startLocation,
        endLocation: t.endLocation,
        distance: t.distance,
        cost: t.totalCost,
        purpose: t.purpose
      }))
    });

  } catch (error) {
    console.error('Error in getVehicleTripAnalytics:', error);
    res.status(500).json({ message: 'Error fetching vehicle trip analytics' });
  }
};

// Get comparative trip analytics between vehicles
exports.getComparativeTripAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range to last 6 months
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 6, 1);

    // Get all vehicles for the user
    const vehicles = await Vehicle.find({ user: userId, isActive: true });

    const vehicleTripAnalytics = [];

    for (const vehicle of vehicles) {
      const trips = await Trip.find({
        vehicle: vehicle._id,
        isActive: true,
        date: { $gte: start, $lte: end }
      });

      const totalTrips = trips.length;
      const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
      const totalCost = trips.reduce((sum, t) => sum + (t.totalCost || 0), 0);
      const avgDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;
      const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;
      const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

      // Purpose breakdown for this vehicle
      const purposeCounts = {};
      trips.forEach(trip => {
        purposeCounts[trip.purpose] = (purposeCounts[trip.purpose] || 0) + 1;
      });

      vehicleTripAnalytics.push({
        vehicle: {
          id: vehicle._id,
          name: vehicle.vehicleName,
          company: vehicle.company,
          model: vehicle.model,
          fuelType: vehicle.fuelType
        },
        totalTrips,
        totalDistance,
        totalCost,
        avgDistance,
        avgCost,
        costPerKm,
        purposeBreakdown: purposeCounts
      });
    }

    // Sort by different metrics
    const sortByTrips = [...vehicleTripAnalytics].sort((a, b) => b.totalTrips - a.totalTrips);
    const sortByDistance = [...vehicleTripAnalytics].sort((a, b) => b.totalDistance - a.totalDistance);
    const sortByCost = [...vehicleTripAnalytics].sort((a, b) => b.totalCost - a.totalCost);

    // Overall purpose analysis across all vehicles
    const overallPurposeAnalysis = {};
    vehicleTripAnalytics.forEach(vehicle => {
      Object.entries(vehicle.purposeBreakdown).forEach(([purpose, count]) => {
        overallPurposeAnalysis[purpose] = (overallPurposeAnalysis[purpose] || 0) + count;
      });
    });

    res.json({
      vehicles: vehicleTripAnalytics,
      rankings: {
        byTrips: sortByTrips,
        byDistance: sortByDistance,
        byCost: sortByCost
      },
      summary: {
        mostActive: sortByTrips[0] || null,
        mostTraveled: sortByDistance[0] || null,
        mostExpensiveTrips: sortByCost[0] || null,
        totalVehicles: vehicles.length,
        overallPurposeAnalysis
      }
    });

  } catch (error) {
    console.error('Error in getComparativeTripAnalytics:', error);
    res.status(500).json({ message: 'Error fetching comparative trip analytics' });
  }
};