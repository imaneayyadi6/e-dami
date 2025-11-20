import asyncHandler from "express-async-handler";
import SousCategorie from "../models/sousCategorieModel.js";
import Categorie from "../models/categorieModel.js";




export const getSousCategories = asyncHandler(async (req, res) => {
  const catgeories = await SousCategorie.find();
  res.json(catgeories);
});




export const getSousCategoriesByCategorieID = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);
  if (categorie) {
    const souscategories = await SousCategorie.find({
      categorie: req.params.id,
    }).sort({
      createdAt: -1,
    });
    res.json(souscategories);
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});




export const getSousCategorieByID = asyncHandler(async (req, res) => {
  const sousCategorie = await SousCategorie.findById(req.params.id);
  if (sousCategorie) {
    res.json(sousCategorie);
  } else {
    res.status(404);
    throw new Error("sous-categorie introuvable !");
  }
});




export const createSousCategorie = asyncHandler(async (req, res) => {
  const { libelle, categorie: categorieId } = req.body;
  const categorie = await Categorie.findById(categorieId);

  if (categorie) {
    const sousCategorie = new SousCategorie({
      libelle: libelle,
      categorie: categorie._id,
    });
    const createdSousCategorie = await sousCategorie.save();
    res.status(201).json(createdSousCategorie);
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});




export const updateSousCategorie = asyncHandler(async (req, res) => {
  const { libelle, categorie: categorieId } = req.body;
  const sousCategorie = await SousCategorie.findById(req.params.id);
  if (sousCategorie) {
    if (categorieId) {
      const categorie = await Categorie.findById(categorieId);
      if (categorie) {
        sousCategorie.libelle = libelle || sousCategorie.libelle;
        sousCategorie.categorie = categorie._id;
        const updatedSousCategorie = await sousCategorie.save();
        res.json({
          _id: updatedSousCategorie.id,
          libelle: updatedSousCategorie.libelle,
          categorie: updatedSousCategorie.categorie,
        });
      } else {
        res.status(404);
        throw new Error("categorie introuvable !");
      }
    } else {
      sousCategorie.libelle = libelle || sousCategorie.libelle;
      const updatedsouCatgeorie = await sousCategorie.save();
      res.json({
        _id: updatedsouCatgeorie.id,
        libelle: updatedsouCatgeorie.libelle,
        categorie: updatedsouCatgeorie.categorie,
      });
    }
  } else {
    res.status(404);
    throw new Error("sous-categorie introuvable !");
  }
});




export const deleteSousCategorie = asyncHandler(async (req, res) => {
  const { deletedCount } = await SousCategorie.deleteOne({
    _id: req.params.id,
  });
  if (deletedCount === 1) {
    res.json({
      message: "sous-categorie supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("sous-categorie introuvable !");
  }
});
