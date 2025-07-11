import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import mongoose from "mongoose";
// @desc    recuperer utilisateur par moi
// @route   GET /api/charts/users
// @access  private
export const chartGetUsers = asyncHandler(async (req, res) => {
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    // Fix timezone issues by setting explicit times
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day
    
    console.log("🔍 Using date range:", { startDate, endDate });
    console.log("🔍 StartDate ISO:", startDate.toISOString());
    console.log("🔍 EndDate ISO:", endDate.toISOString());
    
    const result = await Utilisateur.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ]);

    // Generate all months in the range in correct chronological order
    const allMonthsInRange = [];
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || startDate.getFullYear() !== endDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const finalResult = allMonthsInRange.map(monthInfo => {
      const existingData = result.find(item => 
        item.monthName === monthInfo.monthKey && item.year === monthInfo.year
      );
      return {
        month: monthInfo.monthDisplay,
        count: existingData ? existingData.count : 0
      };
    });

    res.json(finalResult);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    
    const result = await Utilisateur.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ]);

    // Generate all months for the last 5 months in correct chronological order
    const currentDate = new Date();
    const allMonthsInRange = [];
    let currentYear = fiveMonthsAgo.getFullYear();
    let currentMonth = fiveMonthsAgo.getMonth();
    const endYear = currentDate.getFullYear();
    const endMonth = currentDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || fiveMonthsAgo.getFullYear() !== currentDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const finalResult = allMonthsInRange.map(monthInfo => {
      const existingData = result.find(item => 
        item.monthName === monthInfo.monthKey && item.year === monthInfo.year
      );
      return {
        month: monthInfo.monthDisplay,
        count: existingData ? existingData.count : 0
      };
    });

    res.json(finalResult);
  }
});

// @desc    recuperer option&dami par moi
// @route   GET /api/charts/options
// @access  private
export const chartGetOptions = asyncHandler(async (req, res) => {
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    // Fix timezone issues by setting explicit times
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day
    
    console.log("🔍 Using date range:", { startDate, endDate });
    console.log("🔍 StartDate ISO:", startDate.toISOString());
    console.log("🔍 EndDate ISO:", endDate.toISOString());
    
    const result = await Option.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ]);

    // Generate all months in the range in correct chronological order
    const allMonthsInRange = [];
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || startDate.getFullYear() !== endDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const finalResult = allMonthsInRange.map(monthInfo => {
      const existingData = result.find(item => 
        item.monthName === monthInfo.monthKey && item.year === monthInfo.year
      );
      return {
        month: monthInfo.monthDisplay,
        count: existingData ? existingData.count : 0
      };
    });

    res.json(finalResult);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    
    const result = await Option.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ]);

    // Generate all months for the last 5 months in correct chronological order
    const currentDate = new Date();
    const allMonthsInRange = [];
    let currentYear = fiveMonthsAgo.getFullYear();
    let currentMonth = fiveMonthsAgo.getMonth();
    const endYear = currentDate.getFullYear();
    const endMonth = currentDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || fiveMonthsAgo.getFullYear() !== currentDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const finalResult = allMonthsInRange.map(monthInfo => {
      const existingData = result.find(item => 
        item.monthName === monthInfo.monthKey && item.year === monthInfo.year
      );
      return {
        month: monthInfo.monthDisplay,
        count: existingData ? existingData.count : 0
      };
    });

    res.json(finalResult);
  }
});

// @desc    recuperer le nombre d'options pour chaque sous-categorie
// @route   GET /api/charts/options/souscategories
// @access  private
export const chartGetCountOptionsOfSousCategories = asyncHandler(
  async (req, res) => {
    const result = await Option.aggregate([
      {
        $group: {
          _id: "$sousCategorie",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "souscategories", // Replace with the actual name of your sousCategorie collection
          localField: "_id",
          foreignField: "_id",
          as: "sousCategorieInfo",
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          sousCategorie: { $arrayElemAt: ["$sousCategorieInfo.libelle", 0] },
        },
      },
    ]);

    res.json(result);
  }
);

// @desc    recuperer le nombre d'options pour chaque service
// @route   GET /api/charts/options/services
// @access  private
export const chartGetCountOptionsOfServices = asyncHandler(async (req, res) => {
  const result = await Option.aggregate([
    {
      $group: {
        _id: "$service",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "services", // Replace with the actual name of your service collection
        localField: "_id",
        foreignField: "_id",
        as: "serviceInfo",
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        service: { $arrayElemAt: ["$serviceInfo.libelle", 0] },
      },
    },
  ]);

  res.json(result);
});

// @desc    Recuperer les demandes 'lines'
// @route   GET /api/charts/lines/demandes
// @access  private
export const chartLineGetDemandes = asyncHandler(async (req, res) => {
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    // Fix timezone issues by setting explicit times
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day
    
    console.log("🔍 Using date range:", { startDate, endDate });
    console.log("🔍 StartDate ISO:", startDate.toISOString());
    console.log("🔍 EndDate ISO:", endDate.toISOString());
    
    // Let's check what documents exist in the date range WITHOUT user filtering first
    const totalDocsInRange = await Demande.countDocuments({
      dateDemande: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    console.log("🔍 Total documents in date range (all users):", totalDocsInRange);
    
    // Now check documents for this specific user
    const userDocsInRange = await Demande.countDocuments({
      "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
      dateDemande: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    console.log("🔍 User documents in date range:", userDocsInRange);
    
    // Let's see some sample documents for this user (any date)
    const sampleUserDocs = await Demande.find({
      "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
    }).limit(3).select('dateDemande traitement').sort({ dateDemande: -1 });
    console.log("🔍 Sample user documents (recent):", JSON.stringify(sampleUserDocs, null, 2));

    const aggregatePipeline = [
      {
        $match: {
          dateDemande: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$dateDemande" },
            month: { $month: "$dateDemande" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ];

    // Use the aggregate method to apply the pipeline to your model
    const result = await Demande.aggregate(aggregatePipeline);
    
    console.log("🔍 Raw aggregation result:", result);
    console.log("🔍 Result length:", result.length);

    // Generate all months in the range in correct chronological order
    const allMonthsInRange = [];
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || startDate.getFullYear() !== endDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const formattedResult = {};
    allMonthsInRange.forEach(monthInfo => {
      formattedResult[monthInfo.monthDisplay] = {
        "en cours": 0,
        "refuse": 0,
        "approuve": 0
      };
    });

    // Fill with actual data
    result.forEach((item) => {
      const statusCounts = {};
      item.statusCounts.forEach((statusItem) => {
        statusCounts[statusItem.status] = Number(statusItem.count);
      });
      
      // Find the correct month display name from our generated range
      const monthInfo = allMonthsInRange.find(m => m.monthKey === item.month && m.year === item.year);
      if (monthInfo && formattedResult[monthInfo.monthDisplay]) {
        formattedResult[monthInfo.monthDisplay] = { ...formattedResult[monthInfo.monthDisplay], ...statusCounts };
      }
    });
    
    console.log("🔍 Final formattedResult:", formattedResult);
    console.log("🔍 Final result keys:", Object.keys(formattedResult));
    
    res.json(formattedResult);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    
    const result = await Demande.aggregate([
      {
        $match: {
          dateDemande: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$dateDemande" },
            month: { $month: "$dateDemande" }
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $addFields: {
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
          monthIndex: "$_id.month"
        },
      },
      {
        $project: {
          _id: 0,
          monthName: 1,
          year: 1,
          monthIndex: 1,
          count: 1,
        },
      },
    ]);

    // Generate all months for the last 5 months in correct chronological order
    const currentDate = new Date();
    const allMonthsInRange = [];
    let currentYear = fiveMonthsAgo.getFullYear();
    let currentMonth = fiveMonthsAgo.getMonth();
    const endYear = currentDate.getFullYear();
    const endMonth = currentDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || fiveMonthsAgo.getFullYear() !== currentDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const finalResult = allMonthsInRange.map(monthInfo => {
      const existingData = result.find(item => 
        item.monthName === monthInfo.monthKey && item.year === monthInfo.year
      );
      return {
        month: monthInfo.monthDisplay,
        count: existingData ? existingData.count : 0
      };
    });

    res.json(finalResult);
  }
});

// @desc    Recuperer les demandes 'bars'
// @route   GET /api/charts/bars/demandes
// @access  private
export const chartBarGetDemandes = asyncHandler(async (req, res) => {
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const demandes = await Demande.find({
      dateDemande: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate({
        path: "option",
        populate: {
          path: "service",
          populate: {
            path: "direction",
          },
        },
      })
      .populate({
        path: "demandeur",
        populate: {
          path: "direction",
        },
      });
    const stats = {
      labels: getUniqueDirectionLabels(demandes),
      demandeEnCours: getDirectionStats(demandes, "en cours"),
      demandeRefuse: getDirectionStats(demandes, "refuse"),
      demandeApprouver: getDirectionStats(demandes, "approuve"),
    };

    res.json(stats);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    const demandes = await Demande.find({
      dateDemande: { $gte: fiveMonthsAgo },
    })
      .populate({
        path: "option",
        populate: {
          path: "service",
          populate: {
            path: "direction",
          },
        },
      })
      .populate({
        path: "demandeur",
        populate: {
          path: "direction",
        },
      });
    const stats = {
      labels: getUniqueDirectionLabels(demandes),
      demandeEnCours: getDirectionStats(demandes, "en cours"),
      demandeRefuse: getDirectionStats(demandes, "refuse"),
      demandeApprouver: getDirectionStats(demandes, "approuve"),
    };

    res.json(stats);
  }

  function getUniqueDirectionLabels(demandes) {
    const uniqueLabels = new Set();
    demandes.forEach((demande) => {
      if (demande && demande.demandeur && demande.demandeur.direction)
        uniqueLabels.add(demande.demandeur.direction.libelle);
    });
    return Array.from(uniqueLabels);
  }

  function getDirectionStats(demandes, status) {
    const directionStats = {};
    const uniqueLabels = getUniqueDirectionLabels(demandes);

    uniqueLabels.forEach((label) => {
      directionStats[label] = 0;
    });

    const filteredDemandes = demandes.filter(
      (demande) => demande.status === status
    );

    filteredDemandes.forEach((demande) => {
      if (demande && demande.demandeur && demande.demandeur.direction) {
        const directionLibelle = demande.demandeur.direction.libelle;
        directionStats[directionLibelle]++;
      }
    });

    return uniqueLabels.map((label) => directionStats[label]);
  }
});

// @desc    Recuperer les demandes de signataire
// @route   GET /api/charts/lines/demandes/signataire
// @access  private
export const chartLinesSignataireDemandes = asyncHandler(async (req, res) => {
  console.log("🔍 chartLinesSignataireDemandes called with:");
  console.log("  - query:", req.query);
  console.log("  - user.id:", req.user.id);
  
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    // Fix timezone issues by setting explicit times
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day
    
    console.log("🔍 Using date range:", { startDate, endDate });

    const aggregatePipeline = [
      {
        $match: {
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
          dateDemande: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          year: { $year: "$dateDemande" },
          month: { $month: "$dateDemande" },
          traitement: "$traitement",
        },
      },
      {
        $unwind: "$traitement",
      },
      {
        $match: {
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            status: "$traitement.status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $addFields: {
          monthString: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
        },
      },
      {
        $project: {
          _id: 0,
          month: "$monthString",
          year: 1,
          statusCounts: 1,
        },
      },
    ];

    // Use the aggregate method to apply the pipeline to your model
    const result = await Demande.aggregate(aggregatePipeline);
    
    console.log("🔍 Raw aggregation result:", result);
    console.log("🔍 Result length:", result.length);

    // Generate all months in the range in correct chronological order
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const allMonthsInRange = [];
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || startDate.getFullYear() !== endDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }

    // Initialize result with all months in correct chronological order
    const formattedResult = {};
    allMonthsInRange.forEach(monthInfo => {
      formattedResult[monthInfo.monthDisplay] = {
        "en cours": 0,
        "refuse": 0,
        "approuve": 0
      };
    });

    // Fill with actual data
    result.forEach((item) => {
      const statusCounts = {};
      item.statusCounts.forEach((statusItem) => {
        statusCounts[statusItem.status] = Number(statusItem.count);
      });
      
      // Find the correct month display name from our generated range
      const monthInfo = allMonthsInRange.find(m => m.monthKey === item.month && m.year === item.year);
      if (monthInfo && formattedResult[monthInfo.monthDisplay]) {
        formattedResult[monthInfo.monthDisplay] = { ...formattedResult[monthInfo.monthDisplay], ...statusCounts };
      }
    });
    
    console.log("🔍 Final formattedResult:", formattedResult);
    console.log("🔍 Final result keys:", Object.keys(formattedResult));
    
    res.json(formattedResult);
  } else {
    const aggregatePipeline = [
      {
        $match: {
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
          dateDemande: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 4)),
          },
        },
      },
      {
        $project: {
          year: { $year: "$dateDemande" },
          month: { $month: "$dateDemande" },
          traitement: "$traitement",
        },
      },
      {
        $unwind: "$traitement",
      },
      {
        $match: {
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            status: "$traitement.status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $addFields: {
          monthString: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "Janvier" },
                { case: { $eq: ["$_id.month", 2] }, then: "Février" },
                { case: { $eq: ["$_id.month", 3] }, then: "Mars" },
                { case: { $eq: ["$_id.month", 4] }, then: "Avril" },
                { case: { $eq: ["$_id.month", 5] }, then: "Mai" },
                { case: { $eq: ["$_id.month", 6] }, then: "Juin" },
                { case: { $eq: ["$_id.month", 7] }, then: "Juillet" },
                { case: { $eq: ["$_id.month", 8] }, then: "Août" },
                { case: { $eq: ["$_id.month", 9] }, then: "Septembre" },
                { case: { $eq: ["$_id.month", 10] }, then: "Octobre" },
                { case: { $eq: ["$_id.month", 11] }, then: "Novembre" },
                { case: { $eq: ["$_id.month", 12] }, then: "Décembre" },
              ],
              default: "Unknown",
            },
          },
          year: "$_id.year",
        },
      },
      {
        $project: {
          _id: 0,
          month: "$monthString",
          year: 1,
          statusCounts: 1,
        },
      },
    ];

    // Use the aggregate method to apply the pipeline to your model
    const result = await Demande.aggregate(aggregatePipeline);
    
    console.log("🔍 Raw aggregation result:", result);
    console.log("🔍 Result length:", result.length);

    // Generate all months for the last 4 months in correct chronological order
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    
    const currentDate = new Date();
    const fourMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 4));
    
    const allMonthsInRange = [];
    let currentYear = fourMonthsAgo.getFullYear();
    let currentMonth = fourMonthsAgo.getMonth();
    const endYear = currentDate.getFullYear();
    const endMonth = currentDate.getMonth();
    const currentYearRef = new Date().getFullYear();
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthName = monthNames[currentMonth];
      // Include year in display if different from current year or if span crosses years
      const monthDisplay = (currentYear !== currentYearRef || fourMonthsAgo.getFullYear() !== currentDate.getFullYear()) 
        ? `${monthName} ${currentYear}` 
        : monthName;
      
      allMonthsInRange.push({
        monthKey: monthName,
        monthDisplay: monthDisplay,
        year: currentYear,
        monthIndex: currentMonth
      });
      
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
    
    // Initialize result with all months in correct chronological order
    const formattedResult = {};
    allMonthsInRange.forEach(monthInfo => {
      formattedResult[monthInfo.monthDisplay] = {
        "en cours": 0,
        "refuse": 0,
        "approuve": 0
      };
    });
    
    // Fill with actual data
    result.forEach((item) => {
      const statusCounts = {};
      item.statusCounts.forEach((statusItem) => {
        statusCounts[statusItem.status] = Number(statusItem.count);
      });
      
      // Find the correct month display name from our generated range
      const monthInfo = allMonthsInRange.find(m => m.monthKey === item.month && m.year === item.year);
      if (monthInfo && formattedResult[monthInfo.monthDisplay]) {
        formattedResult[monthInfo.monthDisplay] = { ...formattedResult[monthInfo.monthDisplay], ...statusCounts };
      }
    });
    
    console.log("🔍 Final formattedResult (else branch):", formattedResult);
    console.log("🔍 Final result keys (else branch):", Object.keys(formattedResult));
    
    res.json(formattedResult);
  }
});

// @desc    Recuperer les demandes 'bars'
// @route   GET /api/charts/bars/demandes/signataire
// @access  private
export const chartBarGetSignatairesDemandes = asyncHandler(async (req, res) => {
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    
    // Fix timezone issues by setting explicit times
    startDate.setHours(0, 0, 0, 0); // Start of day
    endDate.setHours(23, 59, 59, 999); // End of day
    
    console.log("🔍 Debug chartBarGetSignatairesDemandes - Filtering with dates:");
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("startDate ISO:", startDate.toISOString());
    console.log("endDate ISO:", endDate.toISOString());
    console.log("userId:", req.user.id);

    // Use same approach as else branch - simpler and more reliable
    let demandes = JSON.parse(
      JSON.stringify(
        await Demande.find({
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
          dateDemande: {
            $gte: startDate,
            $lte: endDate,
          },
        })
          .populate({
            path: "option",
            populate: {
              path: "service",
              populate: {
                path: "direction",
              },
            },
          })
          .populate({
            path: "demandeur",
            populate: {
              path: "direction",
            },
          })
      )
    );

    console.log("🔍 Debug - Raw demandes from find:", demandes.length);
    console.log("🔍 Debug - First few demandes:", demandes.slice(0, 2));

    let ndemandes = [];

    for (let demande of demandes) {
      let ntraitement = demande.traitement.filter(
        (tr) => String(tr.utilisateur) === String(req.user.id)
      );
      demande.traitement = ntraitement;
      ndemandes.push(demande);
    }
    
    console.log("🔍 Debug - Processed ndemandes:", ndemandes.length);
    console.log("🔍 Debug - Demandes with traitement:", ndemandes.filter(d => d.traitement && d.traitement.length > 0).length);

    const stats = {
      labels: getUniqueDirectionLabels(ndemandes),
      demandeEnCours: getDirectionStats(ndemandes, "en cours"),
      demandeRefuse: getDirectionStats(ndemandes, "refuse"),
      demandeApprouver: getDirectionStats(ndemandes, "approuve"),
    };

    console.log("🔍 Debug - Final stats:", stats);
    res.json(stats);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    let demandes = JSON.parse(
      JSON.stringify(
        await Demande.find({
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
          dateDemande: { $gte: fiveMonthsAgo },
        })
          .populate({
            path: "option",
            populate: {
              path: "service",
              populate: {
                path: "direction",
              },
            },
          })
          .populate({
            path: "demandeur",
            populate: {
              path: "direction",
            },
          })
      )
    );

    let ndemandes = [];

    for (let demande of demandes) {
      let ntraitement = demande.traitement.filter(
        (tr) => String(tr.utilisateur) === String(req.user.id)
      );
      demande.traitement = ntraitement;
      ndemandes.push(demande);
    }

    const stats = {
      labels: getUniqueDirectionLabels(ndemandes),
      demandeEnCours: getDirectionStats(ndemandes, "en cours"),
      demandeRefuse: getDirectionStats(ndemandes, "refuse"),
      demandeApprouver: getDirectionStats(ndemandes, "approuve"),
    };

    res.json(stats);
  }

  function getUniqueDirectionLabels(demandes) {
    const uniqueLabels = new Set();
    demandes.forEach((demande) => {
      if (demande && demande.demandeur && demande.demandeur.direction)
        uniqueLabels.add(demande.demandeur.direction.libelle);
    });
    return Array.from(uniqueLabels);
  }

  function getDirectionStats(demandes, status) {
    const directionStats = {};
    const uniqueLabels = getUniqueDirectionLabels(demandes);

    uniqueLabels.forEach((label) => {
      directionStats[label] = 0;
    });

    const filteredDemandes = demandes.filter((demande) => {
      // Check if demande has traitement and get the status from the traitement
      if (demande.traitement && demande.traitement.length > 0) {
        // Get the last traitement status for this user
        const lastTraitement = demande.traitement[demande.traitement.length - 1];
        return lastTraitement.status === status;
      }
      return false;
    });

    filteredDemandes.forEach((demande) => {
      if (demande && demande.demandeur && demande.demandeur.direction) {
        const directionLibelle = demande.demandeur.direction.libelle;
        directionStats[directionLibelle]++;
      }
    });

    return uniqueLabels.map((label) => directionStats[label]);
  }
});




