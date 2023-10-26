import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";

// @desc    Faire une demande
// @route   POST /api/demandes
// @access  private
export const createDemande = asyncHandler(async (req, res) => {
  const { option: optionID, contenu } = req.body;
  const option = await Option.findById(optionID);
  const user = await Utilisateur.findById(req.user.id);
  if (option) {
    if (user) {
      const code = option.signataires[0];
      let userID = "";

      if (code === "cds") {
        const service = await Service.findById(user.service);
        if (service.chefService) {
          userID = service.chefService;
        } else {
          res.status(400);
          throw new Error("le service n'a pas de chef de service !");
        }
      } else if (code === "hiq") {
        const direction = await Direction.findById(user.direction);
        if (direction.directeur) {
          userID = direction.directeur;
        } else {
          res.status(400);
          throw new Error("la direction n'a pas de directeur !");
        }
      }

      const demande = new Demande({
        option: option._id,
        demandeur: user._id,
        contenu,
        traitement: [
          {
            dateEnvoi: new Date(),
            code: code,
            user: userID,
          },
        ],
      });
      await demande.save();
      res.status(201).json({ message: "demande a été effectuée avec succès" });
    } else {
      res.status(404);
      throw new Error("utilisateur introuvable !");
    }
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});
