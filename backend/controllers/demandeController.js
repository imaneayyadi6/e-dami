import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import { sendNotification } from "../services/notificationService.js"


// @desc    Recuperer les demandes de demandeur
// @route   GET /api/demandes/mesdemandes
// @access  private
export const getMesDemandes = asyncHandler(async (req, res) => {
  let demandes = await Demande.find({
    "demandeur": req.user.id,
  })
    .populate("option")
    .sort({ "dateDemande": -1 });

  res.json(demandes);

});

// @desc    Recuperer les demandes envoyer a un utilisateur pour le  traitee
// @route   GET /api/demandes/handle
// @access  private
export const getDemandesForHandling = asyncHandler(async (req, res) => {
  let demandes = await Demande.find({
    "traitement.utilisateur": req.user.id,
  })
    .populate("option")
    .populate("demandeur")
    .sort({ "traitement.dateEnvoi": -1 });


  let traitements = [];
  for (const demande of demandes) {
    const index = demande.traitement.findIndex(tr => String(tr.utilisateur) === String(req.user.id))
    if (index !== -1) {

      let demandeTraitements = [];
      for (let traitement of demande.traitement) {
        if (String(traitement.utilisateur) === String(req.user.id)) {
          traitement = JSON.parse(JSON.stringify(traitement))
          demandeTraitements.push({
            ...traitement,
            idTraitement: traitement._id,
            idDemande: demande._id,
            dateDemande: demande.dateDemande,
            demandeur: demande.demandeur.prenom + " " + demande.demandeur.nom,
            option: demande.option.libelle,
          })
        }
      }


      traitements = [...traitements, ...demandeTraitements];

    }
  }

  traitements.sort((a, b) => {
    return new Date(b.dateEnvoi) - new Date(a.dateEnvoi);
  });


  res.json(traitements);
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
      let typeApp = "";
      // verification de code de signataires :
      if (option.signataires[0] === "cds") {
        const service = await Service.findById(user.service);
        if (service.chefService) {
          userID = service.chefService;
          code = "cds";
          typeApp = "chef de service";
        } else {
          res.status(400);
          throw new Error("le service n'a pas de chef de service !");
        }
      } else if (option.signataires[0] === "hiq") {
        const direction = await Direction.findById(user.direction);
        if (direction) {
          if (direction.directeur) {
            userID = direction.directeur;

            if (option.signataires[1] === "pdd" && option.signataires[2] === "dir") {
              const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
              const dirDirection = await Direction.findById(option.service.direction);
              if (dirDirection && pddDirection) {
                if (String(pddDirection.directeur) === String(direction.directeur) &&
                  String(dirDirection.directeur) === String(direction.directeur)) {
                  code = "hiq.pdd.dir";
                  typeApp = "directeur hiérarchique, propriétaire de données et directeur de l'entité";
                }
                else {
                  if (option.signataires[1] === "dir") {
                    const dirDirection = await Direction.findById(option.service.direction);
                    if (dirDirection) {
                      if (String(dirDirection.directeur) === String(direction.directeur)) {
                        code = "hiq.dir";
                        typeApp = "directeur hiérarchique et directeur de l'entité";
                      }
                      else {
                        code = "hiq";
                        typeApp = "directeur hiérarchique";
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
                        typeApp = "directeur hiérarchique et propriétaire de données";
                      } else {
                        code = "hiq";
                        typeApp = "directeur hiérarchique";
                      }
                    }
                    else {
                      res.status(400);
                      throw new Error("proprietaire de donnees introuvable !");
                    }
                  }
                  else {
                    code = "hiq";
                    typeApp = "directeur hiérarchique";
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
                    typeApp = "directeur hiérarchique et directeur de l'entité";
                  }
                  else {
                    code = "hiq";
                    typeApp = "directeur hiérarchique";
                  }
                }
                else {
                  res.status(400);
                  throw new Error("directeur de l'entité introuvable !");
                }
              }
              else if (option.signataires[1] === "pdd") {
                const pddDirection = await Direction.findById(String(option.proprietaireDeDonnees));
                if (pddDirection) {
                  if (String(pddDirection.directeur) === String(direction.directeur)) {
                    code = "hiq.pdd";
                    typeApp = "directeur hiérarchique et propriétaire de données";
                  } else {
                    code = "hiq";
                    typeApp = "directeur hiérarchique";
                  }
                }
                else {
                  res.status(400);
                  throw new Error("proprietaire de donnees introuvable !");
                }

              }
              else {
                code = "hiq";
                typeApp = "directeur hiérarchique";
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
        dateDemande: new Date(),
        traitement: [
          {
            dateEnvoi: new Date(),
            code: code,
            utilisateur: userID,
          },
        ],
      });

      await demande.save();
      const messageContent = `<p>Une <a style='font-weight:bold' href="/details-demande/${demande._id}/traitement/${demande.traitement[0]._id}">demande</a> a été faite par ${user.prenom.toLowerCase()} ${user.nom.toLowerCase()}, veuillez la traiter en tant que ${typeApp} </p>`
      sendNotification(userID, messageContent)
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
  let demande = await Demande.findOne({
    _id: req.params.id,
    "traitement._id": req.params.idTraitement
  })
    .populate("demandeur")
    .populate("option");

  if (demande) {
    demande = JSON.parse(JSON.stringify(demande));
    const index = demande.traitement.findIndex(tr => String(tr._id) === String(req.params.idTraitement));
    if (String(demande.traitement[index].utilisateur) === String(req.user.id)) {
      const service = await Service.findById(demande.demandeur.service).populate("chefService");
      const direction = await Direction.findById(demande.demandeur.direction).populate("directeur");
      const optionService = await Service.findById(demande.option.service).populate("chefService");
      let optionPDD = null;
      if (demande.option.proprietaireDeDonnees)
        optionPDD = await Direction.findById(demande.option.proprietaireDeDonnees).populate("directeur");

      const optionDirection = await Direction.findById(optionService.direction).populate("directeur");

      demande.dirLibelle = optionDirection.libelle;

      let sig = [];
      for (const s of demande.option.signataires) {

        let traitement = demande.traitement.find(tr => tr.code === s);

        if (traitement) {

          let obj = null;
          let status = traitement.status;

          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;

            if (s === "cds") {
              obj = {
                code: "cds",
                nom: service.chefService.nom,
                prenom: service.chefService.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              }
            }

            if (s === "hiq") {
              obj = {
                code: "hiq",
                nom: direction.directeur.nom,
                prenom: direction.directeur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              }
            }

            if (s === "pdd") {
              obj = {
                code: "pdd",
                nom: optionPDD.directeur.nom,
                prenom: optionPDD.directeur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              }
            }

            if (s === "dir") {
              obj = {
                code: "dir",
                nom: optionDirection.directeur.nom,
                prenom: optionDirection.directeur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              }
            }
            sig.push(obj);
          }

        }
        else {
          for (const tr of demande.traitement) {
            const arrCode = tr.code.split(".");
            if (arrCode.length > 1) {
              for (const item of arrCode) {
                let traitement = tr;
                if (traitement) {
                  let obj = null;
                  let status = traitement.status;

                  if (status && status !== "en cours") {
                    let dateTraitement = traitement.dateTraitement;

                    if (item === "cds") {
                      obj = {
                        code: "cds",
                        nom: service.chefService.nom,
                        prenom: service.chefService.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        // date:trai
                      }
                    }

                    if (item === "hiq") {
                      obj = {
                        code: "hiq",
                        nom: direction.directeur.nom,
                        prenom: direction.directeur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        // date:trai
                      }
                    }

                    if (item === "pdd") {
                      obj = {
                        code: "pdd",
                        nom: optionPDD.directeur.nom,
                        prenom: optionPDD.directeur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        // date:trai
                      }
                    }

                    if (item === "dir") {
                      obj = {
                        code: "dir",
                        nom: optionDirection.directeur.nom,
                        prenom: optionDirection.directeur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        // date:trai
                      }
                    }
                    sig.push(obj);
                  }

                }
              }
            }
          }
        }
      }

      demande.sig = sig;
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
  let demande = await Demande.findById(req.params.id).populate("option").populate("demandeur");
  if (demande) {
    if (demande.status === "en cours") {
      // recuperer le traitement :
      const traitement = demande.traitement.find(tr => String(tr._id) === String(req.params.idTraitement))

      if (traitement) {
        if (String(traitement.utilisateur) === String(req.user.id)) {
          if (traitement.status === "en cours") {

            let crtfCode = "";
            // changer le status de traitement :
            for (let tr of demande.traitement) {
              if (String(tr._id) === String(req.params.idTraitement)) {
                crtfCode = tr.code;
                tr.status = "approuve";
                tr.dateTraitement = new Date();
                break;
              }
            }

            let contenu = "";
            let typeApp = null;
            // ecrit le contenu de la notification selon le type d'approbation :
            const arrCrtCode = crtfCode.split(".");
            if (arrCrtCode.length > 1) {
              const direction = await Direction.findOne({
                directeur: req.user.id,
              }).populate("directeur")

              if (direction) {
                if (crtfCode === "hiq.pdd") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                  a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que votre directeur hiarchique et propritaire de donnes `;
                }

                if (crtfCode === "pdd.dir") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                  a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que propritaire de donnes et directeur de l entite`;
                }

                if (crtfCode === "hiq.pdd.dir") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                  a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que votre directeur hiarchique, propritaire de donnes et directeur de l entite`;

                }
              }
              else {
                res.status(404);
                throw Error("direction introuvable !")
              }

            }
            else {
              if (crtfCode === "cds") {
                let service = await Service.findOne({
                  chefService: req.user.id
                }).populate("chefService");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                    a été approuvée par M. ${service.chefService.prenom.toLowerCase()} ${service.chefService.nom.toLowerCase()} chef de service ${chefService.libelle.toLowerCase()} en tant que votre chef de service`;
              }
              else if (crtfCode === "hiq") {
                let direction = await Direction.findOne({
                  directeur: req.user.id
                }).populate("directeur");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                    a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que votre directeur hiérarchique`;
              }
              else if (crtfCode === "pdd") {
                let direction = await Direction.findOne({
                  directeur: req.user.id
                }).populate("directeur");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                    a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que propriétaire de données`;
              }
              else if (crtfCode === "dir") {
                let direction = await Direction.findOne({
                  directeur: req.user.id
                }).populate("directeur");
                contenu = `<p>
                    Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                    a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que directeur de l'entité`;
              }
            }

            // envoyer le demande a un autre utilisateur pour la traiter :
            // est ce que le code traitement et muptiple ou non :
            const codeArr = traitement.code.split(".");
            if (codeArr.length > 1) {
              let code = codeArr[codeArr.length - 1];
              const codeIndex = demande.option.signataires.findIndex(sg => String(sg) === String(code));
              if (codeIndex !== -1) {
                // finalise le traitement global de la demande :
                if (codeIndex + 1 === demande.option.signataires.length) {
                  demande.status = "approuve";
                  await demande.save();
                  contenu += " et pour cela, elle a été finalisée et traitée avec succès </p>";
                  sendNotification(demande.demandeur._id, contenu);
                  res.json({ message: "demande approuve" });
                }
                else {
                  // verfication de qu'est le directeur qui va traiter cette demande selon le code: 
                  let dirUserID = '';
                  let nextCode = demande.option.signataires[codeIndex + 1]
                  if (nextCode === "hiq") {
                    const directionID = await Utilisateur.findById(req.user.id).direction;
                    const direction = await Direction.findById(directionID);
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = `directeur hiérarchique`
                    }
                  }
                  else if (nextCode === "pdd") {
                    const direction = await Direction.findById(String(demande.option.proprietaireDeDonnees));
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = "propriétaire de données";
                    }
                  }
                  else if (nextCode === "dir") {
                    const service = await Service.findById(demande.option.service)
                    const direction = await Direction.findById(String(service.direction));
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = "directeur de l'entité";
                    }
                  }
                  // envoyer le traitement :
                  demande.traitement.push({
                    utilisateur: dirUserID,
                    dateEnvoi: new Date(),
                    status: 'en cours',
                    code: nextCode,
                  });


                  await demande.save();
                  // envoyer les notifications :
                  contenu += "</p>"
                  sendNotification(demande.demandeur._id, contenu);
                  let dirContenu = `<p>Une <a style='font-weight:bold' href="/details-demande/${demande._id}/traitement/${demande.traitement[codeIndex]._id}">demande</a> a été faite par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}, veuillez la traiter en tant que ${typeApp}</p>`
                  sendNotification(dirUserID, dirContenu);

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
                // finalise le traitement global de la demande :
                if (codeIndex + 1 === demande.option.signataires.length) {
                  demande.status = "approuve";
                  await demande.save();
                  contenu += " et pour cela, elle a été finalisée et traitée avec succès </p>";
                  sendNotification(demande.demandeur._id, contenu);
                  res.json({ message: "demande approuve " });
                }
                else {
                  // verfication de qu'est le directeur qui va traiter cette demande selon le code : 
                  let dirUserID = '';
                  let nextCode = demande.option.signataires[codeIndex + 1]
                  if (nextCode) {
                    // verfier est ce que le traitement est multiple :
                    const arrNextCode = nextCode.split(".");
                    if (arrNextCode.length > 1) {
                      if (nextCode === "hiq.pdd") {
                        typeApp = "directeur hiarchique et propritaire de données";
                      }

                      if (nextCode === "pdd.dir") {
                        typeApp = "propritaire de donnes et directeur de l entite";
                      }

                      if (nextCode === "hiq.pdd.dir") {
                        contenu = `<p>
                        Votre <a style='font-weight:bold' href="/details-demande/${demande._id}">demande</a> 
                        a été approuvée par M. ${direction.directeur.prenom.toLowerCase()} ${direction.directeur.nom.toLowerCase()} directeur de la direction ${direction.libelle.toLowerCase()} en tant que votre directeur hiarchique, propritaire de donnes et directeur de l entite`;

                      }
                    } else {
                      if (nextCode === "hiq") {
                        const directionID = await Utilisateur.findById(req.user.id).direction;
                        const direction = await Direction.findById(directionID);
                        if (direction) {
                          dirUserID = direction.directeur;
                          typeApp = `directeur hiérarchique`
                        }
                      }
                      else if (nextCode === "pdd") {
                        const direction = await Direction.findById(String(demande.option.proprietaireDeDonnees));
                        if (direction) {
                          dirUserID = direction.directeur;
                          typeApp = "propriétaire de données";
                        }
                      }
                      else if (nextCode === "dir") {
                        const service = await Service.findById(demande.option.service)
                        const direction = await Direction.findById(String(service.direction));
                        if (direction) {
                          dirUserID = direction.directeur;
                          typeApp = "directeur de l'entité";
                        }
                      }
                    }
                    // envoyer le traitement :
                    demande.traitement.push({
                      utilisateur: dirUserID,
                      dateEnvoi: new Date(),
                      status: 'en cours',
                      code: nextCode,
                    });
                  }
                  await demande.save();
                  contenu += "</p>";
                  // envoyer les notifications :
                  sendNotification(demande.demandeur._id, contenu);
                  let dirContenu = `<p>Une <a style='font-weight:bold' href="/details-demande/${demande._id}/traitement/${demande.traitement[codeIndex]._id}">demande</a> a été faite par ${demande.demandeur.prenom} ${demande.demandeur.nom}, veuillez la traiter en tant que ${typeApp}</p>`
                  sendNotification(dirUserID, dirContenu);
                  res.json({ message: "demande approvee avec success !" });
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
            throw new Error("demande deja traitée");
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

});

// @desc    Approuver un traitemen de demande
// @route   PUT /api/demandes/:id/refuse/:idTraitement
// @access  private
export const refuserDemande = asyncHandler(async (req, res) => {
  let demande = await Demande.findById(req.params.id).populate("option");
  if (demande) {
    if (demande.status === "en cours") {
      const traitement = demande.traitement.find(tr => String(tr._id) === String(req.params.idTraitement))
      if (traitement.status === "en cours") {
        if (traitement) {
          if (String(traitement.utilisateur) === String(req.user.id)) {
            if (traitement.status === "en cours") {
              for (let tr of demande.traitement) {
                if (String(tr._id) === String(req.params.idTraitement)) {
                  tr.motifRefus = req.body.motif;
                  tr.status = "refuse";
                  tr.dateTraitement = new Date();
                  break;
                }
              }

              demande.status = "refuse";
              await demande.save();
              res.json({ message: "demande refuse!" })
            }
            else {
              res.status(400);
              throw new Error("demande deja traitée");
            }
          }
          else {
            res.status(400);
            throw new Error("vous n'avez pas le droit de refuser cette demande !");
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



// @desc    Recuperer le details d'une demande par ID
// @route   GET /api/demandes/:id
// @access  private
export const getDemandeurDemandeByID = asyncHandler(async (req, res) => {
  let demande = await Demande.findOne({
    _id: req.params.id,
  })
    .populate("demandeur")
    .populate("option");

  if (demande) {
    demande = JSON.parse(JSON.stringify(demande));

    const service = await Service.findById(demande.demandeur.service).populate("chefService");
    const direction = await Direction.findById(demande.demandeur.direction).populate("directeur");
    const optionService = await Service.findById(demande.option.service).populate("chefService");
    let optionPDD = null;
    if (demande.option.proprietaireDeDonnees)
      optionPDD = await Direction.findById(demande.option.proprietaireDeDonnees).populate("directeur");

    const optionDirection = await Direction.findById(optionService.direction).populate("directeur"); demande.dirLibelle = optionDirection.libelle;

    let sig = [];
    for (const s of demande.option.signataires) {
      let traitement = demande.traitement.find(tr => tr.code === s);
      if (traitement) {
        let obj = null;
        let status = traitement.status;
        if (status && status !== "en cours") {
          let dateTraitement = traitement.dateTraitement;
          if (s === "cds") {
            obj = {
              code: "cds",
              nom: service.chefService.nom,
              prenom: service.chefService.prenom,
              approuve: status === "approuve" ? true : false,
              refuse: status === "refuse" ? true : false,
              dateTraitement: dateTraitement,
              // date:trai
            }
          }

          if (s === "hiq") {
            obj = {
              code: "hiq",
              nom: direction.directeur.nom,
              prenom: direction.directeur.prenom,
              approuve: status === "approuve" ? true : false,
              refuse: status === "refuse" ? true : false,
              dateTraitement: dateTraitement,
              // date:trai
            }
          }

          if (s === "pdd") {
            obj = {
              code: "pdd",
              nom: optionPDD.directeur.nom,
              prenom: optionPDD.directeur.prenom,
              approuve: status === "approuve" ? true : false,
              refuse: status === "refuse" ? true : false,
              dateTraitement: dateTraitement,
              // date:trai
            }
          }

          if (s === "dir") {
            obj = {
              code: "dir",
              nom: optionDirection.directeur.nom,
              prenom: optionDirection.directeur.prenom,
              approuve: status === "approuve" ? true : false,
              refuse: status === "refuse" ? true : false,
              dateTraitement: dateTraitement,
              // date:trai
            }
          }
          sig.push(obj);
        }

      }
      else {
        for (const tr of demande.traitement) {
          const arrCode = tr.code.split(".");
          if (arrCode.length > 1) {
            for (const item of arrCode) {
              let traitement = tr;
              if (traitement) {
                let obj = null;
                let status = traitement.status;

                if (status && status !== "en cours") {
                  let dateTraitement = traitement.dateTraitement;

                  if (item === "cds") {
                    obj = {
                      code: "cds",
                      nom: service.chefService.nom,
                      prenom: service.chefService.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    }
                  }

                  if (item === "hiq") {
                    obj = {
                      code: "hiq",
                      nom: direction.directeur.nom,
                      prenom: direction.directeur.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    }
                  }

                  if (item === "pdd") {
                    obj = {
                      code: "pdd",
                      nom: optionPDD.directeur.nom,
                      prenom: optionPDD.directeur.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    }
                  }

                  if (item === "dir") {
                    obj = {
                      code: "dir",
                      nom: optionDirection.directeur.nom,
                      prenom: optionDirection.directeur.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    }
                  }
                  sig.push(obj);
                }

              }
            }
          }
        }
      }
    }

    demande.sig = sig;
    demande.demandeur.direction = direction;
    demande.demandeur.service = service;

    res.json(demande);

  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});

