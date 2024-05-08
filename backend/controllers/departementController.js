import asyncHandler from "express-async-handler";
import Departement from "../models/departementModel.js";
import Direction from "../models/directionModel.js";
import Utilisateur from "../models/utilisateurModel.js";

// @desc    Afficher tous les departements
// @route   GET /api/departements/:id
// @access  private
export const getServices = asyncHandler(async (req, res) => {
  const departements = await Departement.find().sort({ createdAt: -1 });
  res.json(departements);
});

// @desc    Recuperer les departements une direction par ID
// @route   GET /api/departements/direction/:id
// @access  private
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

// @desc    Recuperer un Departement par ID
// @route   GET /api/departements/:id
// @access  private
export const getDepartementByID = asyncHandler(async (req, res) => {
  const departement = await Departement.findById(req.params.id);
  if (departement) {
    res.json(departement);
  } else {
    res.status(404);
    throw new Error("departement introuvable !");
  }
});

// @desc    Creer un Departement
// @route   POST /api/departements
// @access  private
export const createService = asyncHandler(async (req, res) => {
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

// // @desc    Modifier un service
// // @route   PUT /api/services/:id
// // @access  private
// export const updateService = asyncHandler(async (req, res) => {
//   const { libelle, direction: directionId, chefService } = req.body;

//   const service = await Service.findById(req.params.id);
//   if (service) {
//     let direction = null;
//     let utilisateur = null;

//     if (directionId) {
//       direction = await Direction.findById(directionId);
//       if (!direction) {
//         res.status(404);
//         throw new Error("direction introuvable !");
//       }
//     }

//     if (chefService) {
//       utilisateur = await Utilisateur.findById(chefService);
//       if (!utilisateur) {
//         res.status(404);
//         throw new Error("utilisateur introuvable !");
//       }
//     }
//     let ffChefSrvOther = null;
//     if (utilisateur) {
//       ffChefSrvOther = await Service.findOne({
//         chefService: String(utilisateur._id),
//       });
//     }
//     if (!ffChefSrvOther) {
//       service.libelle = libelle || service.libelle;
//       service.direction = direction ? direction._id : service.direction;
//       console.log("chef service");
//       if (chefService) {
//         service.chefService = utilisateur
//           ? utilisateur._id
//           : service.chefService;
//       } else {
//         service.chefService = null;
//       }

//       const updatedService = await service.save();
//       await updatedService.populate("chefService");

//       res.json({
//         _id: updatedService.id,
//         libelle: updatedService.libelle,
//         direction: updatedService.direction,
//         chefService: updatedService.chefService,
//       });
//     } else {
//       res.status(400);
//       throw new Error("utilisateur est deja un chef se service");
//     }
//   } else {
//     res.status(404);
//     throw new Error("service introuvable !");
//   }
// });

// // @desc    Supprimer un service
// // @route   DELETE /api/services/:id
// // @access  private
// export const deleteService = asyncHandler(async (req, res) => {
//   const { deletedCount } = await Service.deleteOne({ _id: req.params.id });
//   if (deletedCount === 1) {
//     res.json({
//       message: "service supprimé !",
//     });
//   } else {
//     res.status(404);
//     throw new Error("service introuvable !");
//   }
// });
