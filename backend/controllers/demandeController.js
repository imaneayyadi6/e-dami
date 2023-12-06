import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";


// @desc    Recuperer les demandes envoyer a un utilisateur pour le  traitee
// @route   GET /api/demandes/handle
// @access  private
export const getDemandesForHandling = asyncHandler(async (req, res) => {
  let demandes = await Demande.find({
    "traitement.utilisateur": req.user.id,
  })
    .populate("option")
    .populate("demandeur")
    .sort({ dateDemande: -1 });

  for (const demande of demandes) {
    console.log(demande.traitement);
  }

  for (const demande of demandes) {
    demande.traitement = demande.traitement.filter(tr => String(tr.utilisateur) === String(req.user.id));
  }

  res.json(demandes);
});

// @desc    Faire une demande
// @route   POST /api/demandes
// @access  private
export const createDemande = asyncHandler(async (req, res) => {
  // creation de la demande :
  const { option: optionID, contenu } = req.body;
  const option = await Option.findById(optionID).populate("service");
  const user = await Utilisateur.findById(req.user.id);
  if (option) {
    if (user) {
      let code = "";
      let userID = "";

      // verification de code de signataires :
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
            console.log("directeur : ", direction.directeur)
            if (option.signataires[1] === "pdd" && option.signataires[2] === "dir") {
              const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
              const dirDirection = await Direction.findById(option.service.direction);
              if (dirDirection && pddDirection) {
                if (String(pddDirection.directeur) === String(direction.directeur) &&
                  String(dirDirection.directeur) === String(direction.directeur)) {
                  code = "hiq.pdd.dir";
                }
                else {
                  if (option.signataires[1] === "dir") {
                    const dirDirection = await Direction.findById(option.service.direction);
                    if (dirDirection) {
                      if (String(dirDirection.directeur) === String(direction.directeur)) {
                        code = "hiq.dir";
                      }
                      else {
                        code = "hiq";
                      }
                    }
                    else {
                      res.status(400);
                      throw new Error("directeur de  l'entité introuvable !");
                    }
                  }
                  else if (option.signataires[1] === "pdd") {
                    const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
                    if (pddDirection) {
                      if (String(pddDirection.directeur) === String(direction.directeur)) {
                        code = "hiq.pdd";
                      } else {
                        code = "hiq";
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
                };
              }
              else {
                if (!pddDirection) {
                  res.status(400);
                  throw new Error("proprietaire de donnees introuvable !");
                }
                if (!dirDirection) {
                  res.status(400);
                  throw new Error("directeur de  l'entité introuvable !");
                }
              }
            }
            else {
              if (option.signataires[1] === "dir") {
                const dirDirection = await Direction.findById(option.service.direction);
                if (dirDirection) {
                  if (String(dirDirection.directeur) === String(direction.directeur)) {
                    code = "hiq.dir";
                  }
                  else {
                    code = "hiq";
                  }
                }
                else {
                  res.status(400);
                  throw new Error("directeur de  l'entité introuvable !");
                }
              }
              else if (option.signataires[1] === "pdd") {
                const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
                if (pddDirection) {
                  if (String(pddDirection.directeur) === String(direction.directeur)) {
                    code = "hiq.pdd";
                  } else {
                    code = "hiq";
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


// @desc    Recuperer le details d'une demande par ID
// @route   GET /api/demandes/:id/traitement/:idTraitement
// @access  private
export const getDemandesByID = asyncHandler(async (req, res) => {
  const demande = await Demande.findOne({
    _id: req.params.id,
    "traitement._id": req.params.idTraitement
  })
    .populate("demandeur")
    .populate("option");

  if (demande) {
    const index = demande.traitement.findIndex(tr => String(tr._id) === String(req.params.idTraitement));
    if (String(demande.traitement[index].utilisateur) === String(req.user.id)) {
      const service = await Service.findById(demande.demandeur.service);
      const direction = await Direction.findById(demande.demandeur.direction);
      demande.demandeur.direction = direction;
      demande.demandeur.service = service;
      res.json(demande);
    }
    else {
      res.json({ message: "vous n'avez pas le droit de traiter ou de  consulter ce traitement de cette demande", not: true, })
    }

  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});


// @desc    Recuperer le status de traitement
// @route   PUT /api/demandes/:id/status/:idTraitement
// @access  private
export const getStatusTraitementDeDemande = asyncHandler(async (req, res) => {
  const demande = await Demande.findOne({
    _id: req.params.id,
    "traitement._id": req.params.idTraitement
  });

  if (demande) {
    const index = demande.traitement.findIndex(tr => String(tr._id) === String(req.params.idTraitement));
    if (String(demande.traitement[index].utilisateur) === String(req.user.id)) {
      return res.json({ status: demande.traitement[index].status })
    }
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
  let demande = await Demande.findById(req.params.id).populate("option");
  if (demande) {
    if (demande.status === "en cours") {
      const traitement = demande.traitement.find(tr => String(tr._id) === String(req.params.idTraitement))
      if (traitement) {
        if (String(traitement.utilisateur) === String(req.user.id)) {
          for (let tr of demande.traitement) {
            if (String(tr._id) === String(req.params.idTraitement)) {
              tr.status = "approuve";
            }
          }
          const codeArr = traitement.code.split(".");
          if (codeArr.length > 1) {
            let code = codeArr[codeArr.length - 1];
            const codeIndex = demande.option.signataires.findIndex(sg => String(sg) === String(code));
            if (codeIndex !== -1) {
              if (codeIndex + 1 === demande.option.signataires.length) {
                demande.status = "approuve";
                await demande.save();
                res.json({ message: "demande approuve" });
              }
              else {
                let dirUserID = '';
                let nextCode = demande.option.signataires[codeIndex + 1]
                if (nextCode === "hiq") {
                  const directionID = await Utilisateur.findById(req.user.id).direction;
                  const direction = await Direction.findById(directionID);
                  if (direction) {
                    dirUserID = direction.directeur;
                  }
                }
                else if (nextCode === "pdd") {
                  const direction = await Direction.findById(String(demande.option.proprietaireDeDonnees));
                  if (direction) {
                    dirUserID = direction.directeur;
                  }
                }
                else if (nextCode === "dir") {
                  const service = await Service.findById(demande.option.service)
                  const direction = await Direction.findById(String(service.direction));
                  if (direction) {
                    dirUserID = direction.directeur;
                  }
                }

                demande.traitement.push({
                  utilisateur: dirUserID,
                  dateEnvoi: new Date(),
                  status: 'en cours',
                  code: nextCode,
                });

                await demande.save();

                res.json(demande);
              }
            }
            else {
              res.status(500);
              throw new Error("pas de code !");
            }
          }
          else {
            const codeIndex = demande.option.signataires.findIndex(sg => String(sg) === String(traitement.code));
            if (codeIndex !== -1) {
              if (codeIndex + 1 === demande.option.signataires.length) {
                demande.status = "approuve";
                await demande.save();
                res.json({ message: "demande approuve " });
              }
              else {
                let dirUserID = '';
                let nextCode = demande.option.signataires[codeIndex + 1]
                if (nextCode) {
                  if (nextCode === "hiq") {
                    const directionID = await Utilisateur.findById(req.user.id).direction;
                    const direction = await Direction.findById(directionID);
                    if (direction) {
                      dirUserID = direction.directeur;
                    }
                  }
                  else if (nextCode === "pdd") {
                    const direction = await Direction.findById(String(demande.option.proprietaireDeDonnees));
                    if (direction) {
                      dirUserID = direction.directeur;
                    }
                  }
                  else if (nextCode === "dir") {
                    const service = await Service.findById(demande.option.service)
                    const direction = await Direction.findById(String(service.direction));
                    if (direction) {
                      dirUserID = direction.directeur;
                    }
                  }
                  demande.traitement.push({
                    utilisateur: dirUserID,
                    dateEnvoi: new Date(),
                    status: 'en cours',
                    code: nextCode,
                  });
                }
                await demande.save();
                res.json({ message: "demade approvee avec success !" });
              }
            }
            else {
              res.status(500);
              throw new Error("pas de code !");
            }
          }

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
    }
    else {
      res.status(400);
      throw new Error("demande deja traitée");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable !");
  }

  res.json(demande);
});


