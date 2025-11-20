import asyncHandler from "express-async-handler";
import Departement from "../models/departementModel.js";
import Direction from "../models/directionModel.js";
import Utilisateur from "../models/utilisateurModel.js";




export const getDepartements = asyncHandler(async (req, res) => {
  const departements = await Departement.find().sort({ createdAt: -1 });
  res.json(departements);
});




export const getDepartementsByDirectionID = asyncHandler(async (req, res) => {
  const direction = await Direction.findById(req.params.id);
  if (direction) {
    const departements = await Departement.find({
      direction: req.params.id,
    })
      .populate("chefDeDepartement")
      .sort({ createdAt: -1 });

    res.json(departements);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




export const getDepartementByID = asyncHandler(async (req, res) => {
  const departement = await Departement.findById(req.params.id);
  if (departement) {
    res.json(departement);
  } else {
    res.status(404);
    throw new Error("departement introuvable !");
  }
});




export const createDepartement = asyncHandler(async (req, res) => {
  const { libelle, direction: directionId, chefDeDepartement } = req.body;
  const direction = await Direction.findById(directionId);
  if (direction) {
    if (chefDeDepartement) {
      const utilisateur = await Utilisateur.findById(chefDeDepartement);
      if (utilisateur) {
        const ffChefDepOther = await Departement.findOne({
          chefDeDepartement: String(utilisateur._id),
        });
        if (!ffChefDepOther) {
          const departement = new Departement({
            libelle: libelle,
            direction: direction._id,
            chefDeDepartement: utilisateur._id,
          });
          const createdDepartement = await departement.save();
          await createdDepartement.populate("chefDeDepartement");
          res.status(201).json(createdDepartement);
        } else {
          res.status(400);
          throw new Error("utilisateur est deja un chef de departement");
        }
      } else {
        res.status(404);
        throw new Error("utilisateur introuvable !");
      }
    } else {
      const departement = new Departement({
        libelle: libelle,
        direction: direction._id,
      });
      const createdDepartement = await departement.save();
      await createdDepartement.populate("chefDeDepartement");
      res.status(201).json(createdDepartement);
    }
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});














































































