import asyncHandler from "express-async-handler";
import Categorie from "../models/categorieModel.js";
import Direction from "../models/directionModel.js";




export const getCategories = asyncHandler(async (req, res) => {
  const catgeories = await Categorie.find()
    .populate("direction")
    .sort({ createdAt: -1 });
  res.json(catgeories);
});




export const getCategorieByID = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);
  if (categorie) {
    res.json(categorie);
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});




export const createCategorie = asyncHandler(async (req, res) => {
  const { libelle, direction: directionId } = req.body;
  const direction = await Direction.findById(directionId);

  if (direction) {
    const categorie = new Categorie({
      libelle: libelle,
      direction: direction._id,
    });
    const createdCategorie = await categorie.save();
    await createdCategorie.populate("direction");
    res.status(201).json(createdCategorie);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




export const updateCategorie = asyncHandler(async (req, res) => {
  const { libelle, direction: directionId } = req.body;
  const categorie = await Categorie.findById(req.params.id);
  if (categorie) {
    if (directionId) {
      const direction = await Direction.findById(directionId);
      if (direction) {
        categorie.libelle = libelle || categorie.libelle;
        categorie.direction = direction._id || categorie.direction;
        const updatedCategorie = await categorie.save();
        await updatedCategorie.populate("direction");
        res.json({
          _id: updatedCategorie._id,
          libelle: updatedCategorie.libelle,
          direction: updatedCategorie.direction,
        });
      } else {
        res.status(404);
        throw new Error("direction introuvable !");
      }
    } else {
      categorie.libelle = libelle || categorie.libelle;
      const updatedCategorie = await categorie.save();
      await updatedCategorie.populate("direction");
      res.json({
        _id: updatedCategorie._id,
        libelle: updatedCategorie.libelle,
        direction: updatedCategorie.direction,
      });
    }
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});




export const deleteCategorie = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findOne({ _id: req.params.id });
  if (categorie) {
    categorie.isDeleted = true;
    await categorie.save();

    res.json({
      message: "categorie supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});
