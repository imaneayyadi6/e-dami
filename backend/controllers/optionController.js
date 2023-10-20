import asyncHandler from "express-async-handler";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import SousCategorie from "../models/sousCategorieModel.js";
import Service from "../models/serviceModel.js";

// @desc    Afficher tous les options
// @route   GET /api/options/
// @access  private
export const getOptions = asyncHandler(async (req, res) => {
  const options = await Option.find()
    .populate("service")
    .populate("proprietaireDeDonnees")
    .populate("sousCategorie")
    .sort({ createdAt: -1 });
  res.json(options);
});

// @desc    Recuperer les options d'une sous-categorie par ID
// @route   GET /api/options/souscategorie/:id
// @access  private
export const getOptionsBySousCategorieID = asyncHandler(async (req, res) => {
  const sousCategorie = await SousCategorie.findById(req.params.id);
  if (sousCategorie) {
    const options = await Option.find({
      sousCategorie: req.params.id,
    }).populate("proprietaireDeDonnees");
    res.json(options);
  } else {
    res.status(404);
    throw new Error("categorie introuvable !");
  }
});

// @desc    Recuperer une option par ID
// @route   GET /api/options/:id
// @access  private
export const getOptionByID = asyncHandler(async (req, res) => {
  const option = await Option.findById(req.params.id);
  if (option) {
    res.json(option);
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});

// @desc    Creer une option
// @route   POST /api/options
// @access  private
export const createOption = asyncHandler(async (req, res) => {
  const {
    libelle,
    typeProcessus,
    header: { document, classification, creation, maj },
    proprietaireDeDonnees,
    contenu,
  } = req.body;

  const sousCategorie = await SousCategorie.findById(req.body.sousCategorie);
  if (sousCategorie) {
    const service = await Service.findById(req.body.service);
    if (service) {
      if (proprietaireDeDonnees) {
        const direction = await Direction.findById(proprietaireDeDonnees);
        if (direction) {
          const option = new Option({
            libelle: libelle,
            typeProcessus,
            proprietaireDeDonnees: direction._id,
            header: { document, classification, creation, maj },
            sousCategorie: sousCategorie._id,
            service: service._id,
            contenu,
            signataires: req.body.signataires,
          });
          const createdOption = await option.save();
          res.status(201).json(createdOption);
        } else {
          res.status(404);
          throw new Error("direction introuvable !");
        }
      } else {
        const option = new Option({
          libelle: libelle,
          typeProcessus,
          header: { document, classification, creation, maj },
          sousCategorie: sousCategorie._id,
          service: service._id,
          contenu,
          signataires: req.body.signataires,
        });
        const createdOption = await option.save();
        res.status(201).json(createdOption);
      }
    } else {
      res.status(404);
      throw new Error("service introuvable !");
    }
  } else {
    res.status(404);
    throw new Error("sous-categories introuvable !");
  }
});

// @desc    Modifier une option
// @route   PUT /api/options/:id
// @access  private
export const updateOption = asyncHandler(async (req, res) => {
  const { libelle, typeProcessus, header, proprietaireDeDonnees, contenu } =
    req.body;

  const option = await Option.findById(req.params.id);
  if (option) {
    option.libelle = libelle || option.libelle;
    option.typeProcessus = typeProcessus || option.typeProcessus;
    if (header) {
      option.header = {
        document: header.document || option.header.document,
        classification: header.classification || option.header.classification,
        creation: header.creation || option.header.creation,
        maj: header.maj || option.header.maj,
      };
    }

    option.contenu = contenu || option.contenu;
    if (proprietaireDeDonnees) {
      const direction = await Direction.findById(proprietaireDeDonnees);
      if (direction) {
        option.proprietaireDeDonnees = direction._id;
      } else {
        res.status(404);
        throw new Error("direction introuvable !");
      }
    }

    if (req.body.service) {
      const service = await Service.findById(req.body.service);
      if (service) {
        option.service = service._id;
      } else {
        res.status(404);
        throw new Error("service introuvable !");
      }
    }
    if (req.body.sousCategorie) {
      const sousCategorie = await SousCategorie.findById(
        req.body.sousCategorie
      );
      if (sousCategorie) {
        option.sousCategorie = sousCategorie._id;
      } else {
        res.status(404);
        throw new Error("sous-categorie introuvable !");
      }
    }

    option.signataires = req.body.signataires || option.signataires;

    const updatedOption = await option.save();
    res.json({
      _id: updatedOption.id,
      libelle: updatedOption.libelle,
      typeProcessus: updatedOption.typeProcessus,
      header: updatedOption.header,
      proprietaireDeDonnees: updatedOption.proprietaireDeDonnees,
      contenu: updatedOption.contenu,
      sousCategorie: updatedOption.sousCategorie,
      service: updatedOption.service,
      signataires: updatedOption.signataires,
    });
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});

// @desc    Supprimer une categorie
// @route   DELETE /api/options/:id
// @access  private
export const deleteOption = asyncHandler(async (req, res) => {
  const { deletedCount } = await Option.deleteOne({ _id: req.params.id });
  if (deletedCount === 1) {
    res.json({
      message: "option supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});
