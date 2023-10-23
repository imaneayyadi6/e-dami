import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";

// @desc    Faire une demande
// @route   POST /api/demandes
// @access  private
export const createDemande = asyncHandler(async (req, res) => {
  const { option: optionID, demandeur, contenu } = req.body;
  const option = await Option.findById(optionID);
  const user = await Utilisateur.findById(demandeur);
  if (option) {
    if (user) {
      const demande = new Demande({
        option: option._id,
        demandeur: user._id,
        contenu,
        traitement: [{}],
      });
      const createdDemande = await demande.save();
      res.status(201).json(createdDemande);
    } else {
      res.status(404);
      throw new Error("utilisateur introuvable !");
    }
  } else {
    res.status(404);
    throw new Error("option introuvable !");
  }
});
