import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";

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
  const demandes = await Demande.find()
    .populate({
      path: 'option',
      populate: {
        path: 'service',
        populate: {
          path: "direction"
        }
      }
    })

  const labels = demandes.map((demandes) => demandes.option.service.direction.libelle);
  let objToSend = {
    labels,
    dataEnCours: directions.map((direction) =>
      direction.services.reduce(
        (total, service) =>
          total +
          service.options.reduce(
            (demandeTotal, option) =>
              demandeTotal +
              option.demandes.filter((demande) => demande.status === 'en cours').length,
            0
          ),
        0
      )
    ),
    dataRefuse: directions.map((direction) =>
      direction.services.reduce(
        (total, service) =>
          total +
          service.options.reduce(
            (demandeTotal, option) =>
              demandeTotal +
              option.demandes.filter((demande) => demande.status === 'refuse').length,
            0
          ),
        0
      )
    ),
    dataApprouve: directions.map((direction) =>
      direction.services.reduce(
        (total, service) =>
          total +
          service.options.reduce(
            (demandeTotal, option) =>
              demandeTotal +
              option.demandes.filter((demande) => demande.status === 'approuve').length,
            0
          ),
        0
      )
    ),
  }

  res.json(objToSend);
});
