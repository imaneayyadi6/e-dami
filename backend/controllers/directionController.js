import asyncHandler from "express-async-handler";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Utilisateur from "../models/utilisateurModel.js";

// @desc    Afficher tous les directions
// @route   GET /api/directions/:id
// @access  private
export const getDirections = asyncHandler(async (req, res) => {
  const directions = await Direction.find()
    .populate("directeur")
    .sort({ createdAt: -1 });
  res.json(directions);
});

// @desc    Recuperer une direction par ID
// @route   GET /api/directions/:id
// @access  private
export const getDirectionByID = asyncHandler(async (req, res) => {
  const direction = await Direction.findById(req.params.id);
  if (direction) {
    res.json(direction);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});

// @desc    Creer une direction
// @route   POST /api/directions
// @access  private
export const createDirection = asyncHandler(async (req, res) => {
  const { libelle, directeur } = req.body;
  if (directeur) {
    const utilisateur = await Utilisateur.findById(directeur);
    if (utilisateur) {
      const direction = new Direction({
        libelle: libelle,
        directeur: utilisateur._id,
      });
      const createdDirection = await direction.save();
      await createdDirection.populate("directeur");
      res.status(201).json(createdDirection);
    } else {
      res.status(404);
      throw new Error("utilisateur introuvable !");
    }
  } else {
    const direction = new Direction({
      libelle: libelle,
    });
    const createdDirection = await direction.save();
    await createdDirection.populate("directeur");
    res.status(201).json(createdDirection);
  }
});

// @desc    Modifier une direction
// @route   PUT /api/directions/:id
// @access  private
export const updateDirection = asyncHandler(async (req, res) => {
  const { libelle, directeur } = req.body;
  const direction = await Direction.findById(req.params.id);
  if (direction) {
    if (directeur) {
      const utilisateur = await Utilisateur.findById(directeur);
      if (utilisateur) {
        direction.libelle = libelle || direction.libelle;
        direction.directeur = utilisateur._id || direction.directeur;
        const updatedDirection = await direction.save();
        await updatedDirection.populate("directeur");
        res.json({
          _id: updatedDirection.id,
          libelle: updatedDirection.libelle,
          directeur: updatedDirection.directeur,
        });
      } else {
        res.status(404);
        throw new Error("utilisateur introuvable !");
      }
    } else {
      direction.libelle = libelle || direction.libelle;
      direction.directeur = null;
      const updatedDirection = await direction.save();
      await updatedDirection.populate("directeur");
      res.json({
        _id: updatedDirection.id,
        libelle: updatedDirection.libelle,
        directeur: updatedDirection.directeur,
      });
    }
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});

// @desc    Supprimer une direction
// @route   DELETE /api/directions/:id
// @access  private
export const deleteDirection = asyncHandler(async (req, res) => {
  const { deletedCount } = await Direction.deleteOne({ _id: req.params.id });
  if (deletedCount === 1) {
    res.json({
      message: "direction supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});

// @desc    Recuperer une direction par ID d'un service
// @route   GET /api/directions/service/:id
// @access  private
export const getDirectionByServiceID = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate("direction");
  if (service) {
    res.json(service.direction);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});
