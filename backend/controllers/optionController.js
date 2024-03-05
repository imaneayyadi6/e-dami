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

// @desc    Afficher tous les options
// @route   GET /api/options/crtop
// @access  private
export const getOptionsCrtOp = asyncHandler(async (req, res) => {
  const options = await Option.find({
    createur: req.user.id,
  })
    .populate("service")
    .populate("proprietaireDeDonnees")
    .populate("sousCategorie")
    .sort({ createdAt: -1 });
  res.json(options);
});

// @desc    Recuperer les options d'une sous-categorie par ID
// @route   GET /api/options/souscategorie
// @access  private
export const getOptionsBySousCategorieID = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sousCategorie: sousCategorieId } = req.query;

  const query = {};
  if (sousCategorieId) {
    const sousCategorie = await SousCategorie.findById(sousCategorieId);
    if (sousCategorie) query.sousCategorie = sousCategorieId;
    else {
      res.status(404);
      throw new Error("categorie introuvable !");
    }
  }

  const options = await Option.find({
    ...query,
    isDeleted: false,
  })
    .populate({
      path: "sousCategorie",
      populate: {
        path: "categorie",
      },
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Count total documents based on filters
  const count = await SousCategorie.countDocuments(query);

  // Calculate total pages
  const totalPages = Math.ceil(count / limit);

  // Respond with processed data
  res.json({
    options,
    totalPages,
    currentPage: page,
  });

  res.json(options);
});

// @desc    Recuperer une option par ID
// @route   GET /api/options/:id
// @access  private
export const getOptionByID = asyncHandler(async (req, res) => {
  let option = await Option.findById(req.params.id);
  if (option) {
    option = JSON.parse(JSON.stringify(option));
    const optionService = await Service.findById(option.service);
    if (optionService) {
      const optionDirection = await Direction.findById(optionService.direction);
      option.dirLibelle = optionDirection.libelle;
    }
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
  const option = await Option.findById(req.params.id);
  if (option) {
    if (!option.isDeleted) {
      option.isDeleted = true;
      await option.save();
      res.json({
        message: "option supprimé !",
      });
    } else {
      option.isDeleted = false;
      await option.save();
      res.json({
        message: "option supprimé !",
      });
    }
  } else {
    throw new Error("option introuvable !");
  }
});

// @desc    Creer une option
// @route   POST /api/options/crtop
// @access  private
export const createOptionCrOp = asyncHandler(async (req, res) => {
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
            createur: req.user.id,
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
          createur: req.user.id,
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
// @route   PUT /api/options/crtop/:id
// @access  private
export const updateOptionCrtOp = asyncHandler(async (req, res) => {
  const { libelle, typeProcessus, header, proprietaireDeDonnees, contenu } =
    req.body;

  const option = await Option.findById(req.params.id);
  if (option) {
    if (String(option.createur) === String(req.user.id)) {
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
      throw new Error("vous n'avez pas le droit de  modifier cette option");
    }
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});

// @desc    Supprimer une categorie
// @route   DELETE /api/options/crtop/:id
// @access  private
export const deleteOptionCrtOp = asyncHandler(async (req, res) => {
  const option = await Option.findById(req.params.id);
  if (option) {
    if (String(option.createur) === String(req.user.id)) {
      const { deletedCount } = await Option.deleteOne({ _id: req.params.id });
      if (deletedCount === 1) {
        res.json({
          message: "option supprimé !",
        });
      } else {
        res.status(404);
        throw new Error("option introuvable !");
      }
    } else {
      res.status(404);
      throw new Error("vous n'avez pas le droit de supprimer cette option");
    }
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});
