import asyncHandler from "express-async-handler";
import Service from "../models/serviceModel.js";
import Direction from "../models/directionModel.js";
import Utilisateur from "../models/utilisateurModel.js";
import Departement from "../models/departementModel.js";




export const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
});




export const getServicesByDirectionID = asyncHandler(async (req, res) => {
  const direction = await Direction.findById(req.params.id);
  if (direction) {
    const services = await Service.find({
      direction: req.params.id,
    })
      .populate("chefService")
      .sort({ createdAt: -1 });
    res.json(services);
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




export const getServicesByDepartementID = asyncHandler(async (req, res) => {
  const departement = await Departement.findById(req.params.id);
  if (departement) {
    const departements = await Service.find({
      departement: req.params.id,
    })
      .populate("chefService")
      .sort({ createdAt: -1 });
   
    res.json(departements);
  } else {
    res.status(404);
    throw new Error("departement introuvable !");
  }
});




export const getServiceByID = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service) {
    res.json(service);
  } else {
    res.status(404);
    throw new Error("service introuvable !");
  }
});




export const createService = asyncHandler(async (req, res) => {
  const { libelle, direction: directionId, chefService } = req.body;
  const direction = await Direction.findById(directionId);
  if (direction) {
    if (chefService) {
      const utilisateur = await Utilisateur.findById(chefService);
      if (utilisateur) {
        const ffChefSrvOther = await Service.findOne({
          chefService: String(utilisateur._id),
        });
        if (!ffChefSrvOther) {
          const service = new Service({
            libelle: libelle,
            direction: direction._id,
            chefService: utilisateur._id,
          });
          const createdService = await service.save();
          await createdService.populate("chefService");
          res.status(201).json(createdService);
        } else {
          res.status(400);
          throw new Error("utilisateur est deja un chef se service");
        }
      } else {
        res.status(404);
        throw new Error("utilisateur introuvable !");
      }
    } else {
      const service = new Service({
        libelle: libelle,
        direction: direction._id,
      });
      const createdService = await service.save();
      await createdService.populate("chefService");
      res.status(201).json(createdService);
    }
  } else {
    res.status(404);
    throw new Error("direction introuvable !");
  }
});




export const updateService = asyncHandler(async (req, res) => {
  const { libelle, direction: directionId, chefService } = req.body;

  const service = await Service.findById(req.params.id);
  if (service) {
    let direction = null;
    let utilisateur = null;

    if (directionId) {
      direction = await Direction.findById(directionId);
      if (!direction) {
        res.status(404);
        throw new Error("direction introuvable !");
      }
    }

    if (chefService) {
      utilisateur = await Utilisateur.findById(chefService);
      if (!utilisateur) {
        res.status(404);
        throw new Error("utilisateur introuvable !");
      }
    }
    let ffChefSrvOther = null;
    if (utilisateur) {
      ffChefSrvOther = await Service.findOne({
        chefService: String(utilisateur._id),
      });
    }
    if (!ffChefSrvOther) {
      service.libelle = libelle || service.libelle;
      service.direction = direction ? direction._id : service.direction;
      console.log("chef service");
      if (chefService) {
        service.chefService = utilisateur
          ? utilisateur._id
          : service.chefService;
      } else {
        service.chefService = null;
      }

      const updatedService = await service.save();
      await updatedService.populate("chefService");

      res.json({
        _id: updatedService.id,
        libelle: updatedService.libelle,
        direction: updatedService.direction,
        chefService: updatedService.chefService,
      });
    } else {
      res.status(400);
      throw new Error("utilisateur est deja un chef se service");
    }
  } else {
    res.status(404);
    throw new Error("service introuvable !");
  }
});




export const deleteService = asyncHandler(async (req, res) => {
  const { deletedCount } = await Service.deleteOne({ _id: req.params.id });
  if (deletedCount === 1) {
    res.json({
      message: "service supprimé !",
    });
  } else {
    res.status(404);
    throw new Error("service introuvable !");
  }
});
