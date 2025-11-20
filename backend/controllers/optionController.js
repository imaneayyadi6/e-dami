import asyncHandler from "express-async-handler";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import SousCategorie from "../models/sousCategorieModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import Utilisateur from "../models/utilisateurModel.js";




export const getOptions = asyncHandler(async (req, res) => {
  const options = await Option.find()
    .populate("service")
    .populate("proprietaireDeDonnees")
    .populate("sousCategorie")
    .sort({ createdAt: -1 });
  res.json(options);
});




export const getOptionsCrtOp = asyncHandler(async (req, res) => {
  
  const options = await Option.find({
    $or: [
      { createur: req.user.id }, 
      { service: req.user.service }, 
      { proprietaireDeDonnees: req.user.id }, 
      { autreUtilisateur: req.user.id } 
    ]
  })
    .populate("service")
    .populate("proprietaireDeDonnees")
    .populate("sousCategorie")
    .populate("createur")
    .sort({ createdAt: -1 });
  res.json(options);
});




export const getOptionsBySousCategorieID = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sousCategorie: sousCategorieId,
    libelle,
  } = req.query;

  const query = {};
  if (sousCategorieId) {
    const sousCategorie = await SousCategorie.findById(sousCategorieId);
    if (sousCategorie) query.sousCategorie = sousCategorieId;
    else {
      res.status(404);
      throw new Error("categorie introuvable !");
    }
  }

  if (libelle) {
    query.libelle = {
      $regex: libelle,
      $options: "i",
    };
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
    .sort({ createdAt: -1 })
    .exec();

  
  const count = await Option.countDocuments({
    ...query,
    isDeleted: false,
  });

  
  const totalPages = Math.ceil(count / limit);

  
  res.json({
    options,
    totalPages,
    currentPage: page,
  });
});




export const getOptionByID = asyncHandler(async (req, res) => {
  console.log("getOptionByID - Request params:", req.params);
  console.log("getOptionByID - Request headers:", req.headers);
  console.log("getOptionByID - User:", req.user?.id);
  
  
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    console.error("getOptionByID - Invalid ObjectId format:", req.params.id);
    res.status(400);
    throw new Error("Format d'ID invalide");
  }
  
  console.log("getOptionByID - Searching for option with ID:", req.params.id);
  let option = await Option.findById(req.params.id)
    .populate("proprietaireDeDonnees")
    .populate("autreUtilisateur");
  if (option) {
    console.log("getOptionByID - Option found:", option._id);
    option = JSON.parse(JSON.stringify(option));
    const optionService = await Service.findById(option.service);
    if (optionService) {
      const optionDirection = await Direction.findById(optionService.direction);
      option.dirLibelle = optionDirection.libelle;
    }
    if (!option.departement) {
      let departement = optionService.departement;
      option.departement = departement;
    }

    console.log("getOptionByID - Returning option data");
    res.json(option);
  } else {
    console.error("getOptionByID - Option not found with ID:", req.params.id);
    res.status(404);
    throw new Error("option introuvable !");
  }
});




export const createOption = asyncHandler(async (req, res) => {
  const {
    libelle,
    typeProcessus,
    header: { document, classification, creation, maj },
    contenu,
  } = req.body;

  const sousCategorie = await SousCategorie.findById(req.body.sousCategorie);
  if (sousCategorie) {
    
    
    const serviceId = req.body.service && String(req.body.service).trim() !== "" ? req.body.service : req.user?.service;
    const isAdmin = req.user.roles.some(role => 
      role.role?.code === 'admin' || 
      role.role?.code === 'crt' || 
      (role.role?.libelle && role.role.libelle.toLowerCase().includes('admin'))
    );
    
    if (!serviceId && !isAdmin) {
      res.status(400);
      throw new Error("service requis");
    }
    const service = serviceId ? await Service.findById(serviceId) : null;
    if (service || isAdmin) {
      if (req.body.proprietaireDeDonnees) {
        const utilisateur = await Utilisateur.findById(
          req.body.proprietaireDeDonnees
        );
        if (utilisateur) {
          const option = new Option({
            libelle: libelle,
            typeProcessus,
            proprietaireDeDonnees: utilisateur._id,
            header: { document, classification, creation, maj },
            sousCategorie: sousCategorie._id,
            service: service ? service._id : null,
            departement: service ? service.departement : null,
            contenu,
            signataires: req.body.signataires,
            conditions: req.body.conditions,
            shouldAskAnyTime: req.body.shouldAskAnyTime,
          });
          if (req.body.autreResponsableTitre) {
            option.autreResponsableTitre = req.body.autreResponsableTitre;
          }
          if (req.body.autreUtilisateur) {
            option.autreUtilisateur = req.body.autreUtilisateur;
          }

          if (req.body.sectionConditions) {
            option.sectionConditions = req.body.sectionConditions;
          }

          const createdOption = await option.save();
          res.status(201).json(createdOption);
        } else {
          res.status(404);
          throw new Error("utilisateur introuvable !");
        }
      } else {
        const option = new Option({
          libelle: libelle,
          typeProcessus,
          header: { document, classification, creation, maj },
          sousCategorie: sousCategorie._id,
          service: service._id,
          departement: service.departement,
          contenu,
          signataires: req.body.signataires,
          conditions: req.body.conditions,
          shouldAskAnyTime: req.body.shouldAskAnyTime,
        });

        if (req.body.autreResponsableTitre) {
          option.autreResponsableTitre = req.body.autreResponsableTitre;
        }

        if (req.body.autreUtilisateur) {
          option.autreUtilisateur = req.body.autreUtilisateur;
        }

        if (req.body.sectionConditions) {
          option.sectionConditions = req.body.sectionConditions;
        }
        option.createur = req.user.id;
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


function isValidDate(value) {
  if (typeof value === "string" || value instanceof Date) {
    const date = new Date(value);
    console.log(!isNaN(date.getTime()));
    return !isNaN(date.getTime());
  }
  return false;
}




export const updateOption = asyncHandler(async (req, res) => {
  
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Format d'ID invalide");
  }
  
  const { libelle, typeProcessus, header, proprietaireDeDonnees, contenu } =
    req.body;

  const option = await Option.findById(req.params.id);
  if (option) {
    option.libelle = libelle || option.libelle;
    option.typeProcessus = typeProcessus || option.typeProcessus;

    
    if (header) {
      option.header.document = header.document || option.header.document;
      option.header.classification =
        header.classification || option.header.classification;
      option.header.creation = isValidDate(header.creation)
        ? Date(header.creation)
        : option.header.creation;

      option.header.maj = isValidDate(header.maj)
        ? Date(header.maj)
        : option.header.maj;
    }
    option.contenu = contenu || option.contenu;
    if (proprietaireDeDonnees) {
      const pddUser = await Utilisateur.findById(proprietaireDeDonnees);
      if (pddUser) {
        option.proprietaireDeDonnees = pddUser._id;
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

    if (req.body.departement) {
      const departement = await Departement.findById(req.body.departement);
      if (departement) {
        option.departement = departement._id;
      } else {
        res.status(404);
        throw new Error("departement introuvable !");
      }
    }

    option.signataires = req.body.signataires || option.signataires;
    option.conditions = req.body.conditions || option.conditions;
    option.autreResponsableTitre =
      req.body.autreResponsableTitre || option.autreResponsableTitre;
    option.autreUtilisateur =
      req.body.autreUtilisateur || option.autreUtilisateur;

    option.sectionConditions =
      req.body.sectionConditions || option.sectionConditions;

    if (
      req.body.shouldAskAnyTime !== undefined &&
      req.body.shouldAskAnyTime !== null
    ) {
      option.shouldAskAnyTime = req.body.shouldAskAnyTime;
    }

    option.createdAt =
      option.createdAt && isValidDate(option.createdAt)
        ? new Date(option.createdAt)
        : new Date();
    option.updatedAt = new Date();

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
      autreResponsableTitre: updatedOption.autreResponsableTitre,
      autreUtilisateur: updatedOption.autreUtilisateur,
    });
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});




export const deleteOption = asyncHandler(async (req, res) => {
  
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Format d'ID invalide");
  }
  
  const option = await Option.findById(req.params.id);
  if (option) {
    if (!option.isDeleted) {
      option.createdAt =
        option.createdAt && isValidDate(option.createdAt)
          ? new Date(option.createdAt)
          : new Date();
      option.updatedAt = new Date();

      option.isDeleted = true;
      await option.save();
      res.json({
        message: "option supprimé !",
      });
    } else {
      option.createdAt =
        option.createdAt && isValidDate(option.createdAt)
          ? new Date(option.createdAt)
          : new Date();
      option.updatedAt = new Date();

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




export const createOptionCrtOp = asyncHandler(async (req, res) => {
  const {
    libelle,
    typeProcessus,
    header: { document, classification, creation, maj },
    
    contenu,
  } = req.body;

  const sousCategorie = await SousCategorie.findById(req.body.sousCategorie);
  if (sousCategorie) {
    const serviceId = req.body.service && String(req.body.service).trim() !== "" ? req.body.service : req.user?.service;
    const isAdmin = req.user.roles.some(role => 
      role.role?.code === 'admin' || 
      role.role?.code === 'crt' || 
      (role.role?.libelle && role.role.libelle.toLowerCase().includes('admin'))
    );
    
    if (!serviceId && !isAdmin) {
      res.status(400);
      throw new Error("service requis");
    }
    const service = serviceId ? await Service.findById(serviceId) : null;
    if (service || isAdmin) {
      if (req.body.proprietaireDeDonnees) {
        const utilisateur = await Utilisateur.findById(
          req.body.proprietaireDeDonnees
        );
        if (utilisateur) {
          const option = new Option({
            libelle: libelle,
            createur: req.user.id,
            typeProcessus,
            proprietaireDeDonnees: utilisateur._id,
            header: { document, classification, creation, maj },
            sousCategorie: sousCategorie._id,
            service: service ? service._id : null,
            departement: service ? service.departement : null,
            contenu,
            signataires: req.body.signataires,
            shouldAskAnyTime: req.body.shouldAskAnyTime,
          });
          if (req.body.autreResponsableTitre) {
            option.autreResponsableTitre = req.body.autreResponsableTitre;
          }
          if (req.body.autreUtilisateur) {
            option.autreUtilisateur = req.body.autreUtilisateur;
          }
          const createdOption = await option.save();
          res.status(201).json(createdOption);
        } else {
          res.status(404);
          throw new Error("utilisateur introuvable !");
        }
      } else {
        const option = new Option({
          libelle: libelle,
          createur: req.user.id,
          typeProcessus,
          header: { document, classification, creation, maj },
          sousCategorie: sousCategorie._id,
          service: service._id,
          departement: service.departement,
          contenu,
          signataires: req.body.signataires,
          shouldAskAnyTime: req.body.shouldAskAnyTime,
        });
        if (req.body.autreResponsableTitre) {
          option.autreResponsableTitre = req.body.autreResponsableTitre;
        }
        if (req.body.autreUtilisateur) {
          option.autreUtilisateur = req.body.autreUtilisateur;
        }
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




export const updateOptionCrtOp = asyncHandler(async (req, res) => {
  
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Format d'ID invalide");
  }
  
  const { libelle, typeProcessus, header, proprietaireDeDonnees, contenu } =
    req.body;

  const option = await Option.findById(req.params.id);
  if (option) {
    if (String(option.service) === String(req.user.service)) {
      option.libelle = libelle || option.libelle;
      option.typeProcessus = typeProcessus || option.typeProcessus;
      if (header) {
        option.header.document = header.document || option.header.document;
        option.header.classification =
          header.classification || option.header.classification;
        console.log(Date(header.creation));
        option.header.creation = isValidDate(header.creation)
          ? Date(header.creation)
          : option.header.creation;

        option.header.maj = isValidDate(header.maj)
          ? Date(header.maj)
          : option.header.maj;
      }

      option.contenu = contenu || option.contenu;
      if (proprietaireDeDonnees) {
        const utilisateur = await Utilisateur.findById(proprietaireDeDonnees);
        if (utilisateur) {
          option.proprietaireDeDonnees = utilisateur._id;
        } else {
          res.status(404);
          throw new Error("utilisateur introuvable !");
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
      if (req.body.departement) {
        const departement = await Departement.findById(req.body.departement);
        if (departement) {
          option.departement = departement._id;
        } else {
          res.status(404);
          throw new Error("departement introuvable !");
        }
      }
      option.signataires = req.body.signataires || option.signataires;
      option.autreResponsableTitre =
        req.body.autreResponsableTitre || option.autreResponsableTitre;
      option.autreUtilisateur =
        req.body.autreUtilisateur || option.autreUtilisateur;
      if (
        req.body.shouldAskAnyTime !== undefined &&
        req.body.shouldAskAnyTime !== null
      ) {
        option.shouldAskAnyTime = req.body.shouldAskAnyTime;
      }

      option.createdAt =
        option.createdAt && isValidDate(option.createdAt)
          ? new Date(option.createdAt)
          : new Date();
      option.updatedAt = new Date();

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




export const deleteOptionCrtOp = asyncHandler(async (req, res) => {
  
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Format d'ID invalide");
  }
  
  const option = await Option.findById(req.params.id);
  if (option) {
    if (String(option.createur) === String(req.user.id)) {
      if (!option.isDeleted) {
        option.createdAt =
          option.createdAt && isValidDate(option.createdAt)
            ? new Date(option.createdAt)
            : new Date();
        option.updatedAt = new Date();

        option.isDeleted = true;
        await option.save();
        res.json({
          message: "option supprimé !",
        });
      } else {
        option.createdAt =
          option.createdAt && isValidDate(option.createdAt)
            ? new Date(option.createdAt)
            : new Date();
        option.updatedAt = new Date();

        option.isDeleted = false;
        await option.save();
        res.json({
          message: "option supprimé !",
        });
      }
    } else {
      res.status(404);
      throw new Error("vous n'avez pas le droit de supprimer cette option");
    }
  } else {
    throw new Error("option introuvable !");
  }
});
