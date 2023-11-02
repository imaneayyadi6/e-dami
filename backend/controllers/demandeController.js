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
  const option = await Option.findById(optionID).populate("service");
  console.log(option);
  const user = await Utilisateur.findById(req.user.id);
  if (option) {
    if (user) {
      let code = "";
      let userID = "";

      if (option.signataires[0] === "cds") {
        const service = await Service.findById(user.service);
        if (service.chefService) {
          userID = service.chefService;
          code = "cds";
        } else {
          res.status(400);
          throw new Error("le service n'a pas de chef de service !");
        }
      } else if (option.signataires[0] === "hiq") {
        const direction = await Direction.findById(user.direction);
        if (direction) {
          if (direction.directeur) {
            userID = direction.directeur;
            if (option.signataires[1] === "dir") {
              const dirDirection = await Direction.findById(option.service.direction);
              if (dirDirection) {
                if (String(dirDirection.directeur) === String(direction.directeur)) {
                  code = "hiq.dir";
                }
              }
              else {
                res.status(400);
                throw new Error("proprietaire de donnees introuvable !");
              }

            }
            else if (option.signataires[1] === "pdd") {
              const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
              if (pddDirection) {
                if (String(pddDirection.directeur) === String(direction.directeur)) {
                  code = "hiq.pdd";
                }
              }
              else {
                res.status(400);
                throw new Error("proprietaire de donnees introuvable !");
              }

            }
            else {
              code = "hiq";
            }
          } else {
            res.status(400);
            throw new Error("la direction n'a pas de directeur !");
          }
        }
      }
      else {
        res.status(404);
        throw new Error("direction introuvable !");

      }

      const demande = new Demande({
        option: option._id,
        demandeur: user._id,
        contenu,
        traitement: [
          {
            dateEnvoi: new Date(),
            code: code,
            utilisateur: userID,
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

// @desc    Recuperer les demandes envoyer a un utilisateur pour le  traitee
// @route   GET /api/demandes/handle
// @access  private
export const getDemandesForHandling = asyncHandler(async (req, res) => {
  const demandes = await Demande.find({
    "traitement.utilisateur": req.user.id,
    "traitement.status": "en cours"
  })
    .populate("demandeur")
    .populate("option")
    .sort({ createdAt: -1 });

  res.json(demandes);
});

// @desc    Recuperer le details d'une demande par ID
// @route   GET /api/demandes/:id
// @access  private
export const getDemandesByID = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id)
    .populate("demandeur")
    .populate("option");
  // .populate("demandeur.service")
  if (demande) {
    const service = await Service.findById(demande.demandeur.service);
    const direction = await Direction.findById(demande.demandeur.direction);
    demande.demandeur.direction = direction;
    demande.demandeur.service = service;
    res.json(demande);
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});


// @desc    Approuver un traitemen de demande
// @route   PUT /api/demandes/:id/approuve/:idTraitement
// @access  private
export const approuverDemande = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id).populate("option");
  if (demande) {
    const traitement = demande.traitement.find(tr => String(tr._id) === String(req.params.idTraitement))
    if (traitement) {
      if (String(traitement.utilisateur) === String(req.user.id)) {
        demande.traitement.map(tr => {
          if (String(tr._id) === String(req.params.idTraitement)) {
            tr.status = "approuve";
          }
          return tr;
        })

        // const codeIndex = demande.option.signataires.findIndex(sg => String(sg) === String(traitement.code));
        // console.log(codeIndex);

        // demande.traitement.push({
        //   "dateEnvoi": "2023-10-30T12:37:42.055Z",
        //   "utilisateur": "653fa0a60f4c38271dd4fa98",
        //   "code": "hiq",
        //   "status": "approuve",
        //   "_id": "653fa396edc412be0bb1f6f7"
        // });
        res.json(traitement);
      }
      else {
        res.status(400);
        throw new Error("vous n'avez pas le droit d'approuver cette demande !");
      }
    }
    else {
      res.status(404);
      throw new Error("traitement introuvable");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable !");
  }

  res.json(demande);
});