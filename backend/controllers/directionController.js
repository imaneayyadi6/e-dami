import asyncHandler from "express-async-handler";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Utilisateur from "../models/utilisateurModel.js";
import mongoose from "mongoose";
import Demande from "../models/demandeModel.js";



export const getDirections = asyncHandler(async (req, res) => {
  const directions = await Direction.find()
    .populate("directeur")
    .sort({ createdAt: -1 });
  res.json(directions);
});




export const getDirectionByID = asyncHandler(async (req, res) => {
  const direction = await Direction.findById(req.params.id);
  if (direction) {
    res.json(direction);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




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




export const getDirectionByServiceID = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate("direction");
  if (service) {
    res.json(service.direction);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




export const getDirectionSignataires = asyncHandler(async (req, res) => {
  let directions = [];

  const query = {
    "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
  };

  let demandes = JSON.parse(
    JSON.stringify(
      await Demande.find(query).populate({
        path: "demandeur",
        populate: {
          path: "direction",
        },
      })
    )
  );

  for (let demande of demandes) {
    const findDirection = directions.findIndex(
      (dir) => String(dir._id) === String(demande.demandeur.direction._id)
    );

    if (findDirection === -1) {
      directions.push(demande.demandeur.direction);
    }
  }

  res.json(directions);
});
