import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import mongoose from "mongoose";
// @desc    recuperer utilisateur par moi
// @route   GET /api/charts/users
// @access  private
export const chartGetUsers = asyncHandler(async (req, res) => {
  let result = null;
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    result = await Utilisateur.aggregate([
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
            month: { $dateToString: { format: "%B", date: "$createdAt" } },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    result = await Utilisateur.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%B", date: "$createdAt" } },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  }
  res.json(result);
});

// @desc    recuperer option&dami par moi
// @route   GET /api/charts/options
// @access  private
export const chartGetOptions = asyncHandler(async (req, res) => {
  let result = null;
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    result = await Option.aggregate([
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
            month: { $dateToString: { format: "%B", date: "$createdAt" } },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    result = await Option.aggregate([
      {
        $match: {
          createdAt: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%B", date: "$createdAt" } },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  }
  res.json(result);
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
  let result = null;
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    result = await Demande.aggregate([
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
            month: { $dateToString: { format: "%B", date: "$dateDemande" } },
            year: { $year: "$dateDemande" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  } else {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    result = await Demande.aggregate([
      {
        $match: {
          dateDemande: { $gte: fiveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%B", date: "$dateDemande" } },
            year: { $year: "$dateDemande" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          _id: 0,
          year: "$_id.year",
          count: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);
  }
  res.json(result);
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
  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

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
          month: { $month: "$dateDemande" },
          traitement: "$traitement.status",
        },
      },
      {
        $unwind: "$traitement",
      },
      {
        $group: {
          _id: { month: "$month", status: "$traitement" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          statusCounts: 1,
        },
      },
    ];

    // Use the aggregate method to apply the pipeline to your model
    const result = await Demande.aggregate(aggregatePipeline);

    const formattedResult = {};
    result.forEach((item) => {
      const statusCounts = {};
      item.statusCounts.forEach((statusItem) => {
        statusCounts[statusItem.status] = Number(statusItem.count);
      });
      formattedResult[item.month] = statusCounts;
    });
    res.json(formattedResult);
  } else {
    const aggregatePipeline = [
      {
        $match: {
          "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
          dateDemande: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
          },
        },
      },
      {
        $project: {
          month: { $month: "$dateDemande" },
          traitement: "$traitement.status",
        },
      },
      {
        $unwind: "$traitement",
      },
      {
        $group: {
          _id: { month: "$month", status: "$traitement" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          statusCounts: 1,
        },
      },
    ];
    // Use the aggregate method to apply the pipeline to your model
    const result = await Demande.aggregate(aggregatePipeline);

    const formattedResult = {};
    result.forEach((item) => {
      const statusCounts = {};
      item.statusCounts.forEach((statusItem) => {
        statusCounts[statusItem.status] = Number(statusItem.count);
      });
      formattedResult[item.month] = statusCounts;
    });
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
    const demandes = await Demande.find({
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
