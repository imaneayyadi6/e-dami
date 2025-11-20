import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Role from "../models/roleModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import { sendNotification } from "../services/notificationService.js";
import mongoose from "mongoose";
import {
  getNextTypeAppOnApp,
  getTypeAppOnCreate,
} from "../services/getTypeApp.js";

import fs from "fs";
import path from "path";

const getCv = (cv) => {
  if (cv === "F") return "Mme";
  else return "Mr";
};


const isUserFromAuthorizedService = async (userId) => {
  const user = await Utilisateur.findById(userId).populate("service");
  if (!user || !user.service) return false;
  
  const authorizedServices = [
    "SERVICE MAINTENANCE ASSISTANCE ET FORMATION",
    "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT"
  ];
  
  return authorizedServices.includes(user.service.libelle);
};




export const getMesDemandes = asyncHandler(async (req, res) => {
  let demandes = await Demande.find({
    demandeur: req.user.id,
  })
    .populate("option")
    .sort({ dateDemande: -1 });

  res.json(demandes);
});




export const getDemandesForHandling = asyncHandler(async (req, res) => {
  
  const { page = 1, limit = 20, ...filters } = req.query;

  
  const userFilter = {
    "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
  };

  
  if (filters.status) userFilter["traitement.status"] = String(filters.status);

  if (filters.dateDemande) {
    const startDate = new Date(filters.dateDemande);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    userFilter["dateDemande"] = { $gte: startDate, $lte: endDate };
  }

  if (filters.demandeur) userFilter["demandeur"] = filters.demandeur;

  if (filters.typeApp) userFilter["traitement.code"] = filters.typeApp;

  if (filters.option) userFilter["option"] = filters.option;

  let demandes = JSON.parse(
    JSON.stringify(
      await Demande.find(userFilter)
        .populate({
          path: "option",
          select: "libelle autreResponsableTitre",
          populate: [
            {
              path: "service",
              populate: {
                path: "direction",
                select: "libelle"
              }
            },
            {
              path: "departement",
              populate: {
                path: "direction",
                select: "libelle"
              }
            }
          ]
        })
        .populate({
          path: "demandeur",
          populate: {
            path: "direction",
            select: "libelle"
          }
        })
        .sort({ "traitement.dateEnvoi": -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .exec()
    )
  );

  
  const currentUser = await Utilisateur.findById(req.user.id).populate('direction');
  
  let traitements = demandes.flatMap((demande) =>
    demande.traitement
      .filter((tr) => String(tr.utilisateur) === String(req.user.id))
      .reduce((acc, tr) => {
        if (!acc.some((dtr) => String(dtr.idTraitement) === String(tr._id))) {
          if (demande.demandeur) {
            acc.push({
              idDemande: demande._id,
              idTraitement: tr._id,
              code: tr.code,
              status: tr.status,
              dateEnvoi: tr.dateEnvoi,
              dateDemande: demande.dateDemande,
              demandeur:
                demande &&
                demande.demandeur &&
                `${demande.demandeur.prenom} ${demande.demandeur.nom}`,
              demandeurObj: demande.demandeur, 
              option: demande.option,
              directeur: currentUser, 
            });
          }
        }
        return acc;
      }, [])
  );

  traitements.sort((a, b) => {
    return new Date(b.dateEnvoi) - new Date(a.dateEnvoi);
  });

  if (filters.status)
    traitements = traitements.filter(
      (tr) => String(tr.status) === String(filters.status)
    );

  
  const count = await Demande.countDocuments(userFilter);

  
  const totalPages = Math.ceil(count / parseInt(limit)); 

  
  res.json({
    traitements,
    totalPages,
    currentPage: parseInt(page), 
  });
});




export const getFilterOptionsDemandes = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.id);

  
  const aggregationPipeline = [
    {
      $match: {
        "traitement.utilisateur": userObjectId,
      },
    },
    {
      $facet: {
        uniqueOptions: [
          {
            $match: {
              "traitement.utilisateur": userObjectId,
            },
          },
          {
            $group: {
              _id: "$option",
            },
          },
        ],
        uniqueDemandeurs: [
          {
            $match: {
              "traitement.utilisateur": userObjectId,
            },
          },
          {
            $group: {
              _id: "$demandeur",
            },
          },
        ],
        uniqueTypeApps: [
          {
            $match: {
              "traitement.utilisateur": userObjectId,
            },
          },
          {
            $group: {
              _id: "$traitement.code",
            },
          },
        ],
      },
    },
  ];

  const [aggregationResult] = await Demande.aggregate(aggregationPipeline);
  console.log(aggregationResult);

  const optionIds = aggregationResult.uniqueOptions.map((result) => result._id);
  const demandeurIds = aggregationResult.uniqueDemandeurs.map(
    (result) => result._id
  );
  let typeApp = Array.from(
    new Set(aggregationResult.uniqueTypeApps.flatMap((result) => result._id))
  );

  const [options, demandeurs] = await Promise.all([
    Option.find({ _id: { $in: optionIds } }),
    Utilisateur.find({ _id: { $in: demandeurIds } }),
  ]);

  res.json({ options, demandeurs, typeApp });
});




export const createDemande = asyncHandler(async (req, res) => {
  
  const { option: optionID, contenu } = req.body;
  const option = await Option.findById(optionID).populate("service");
  const user = await Utilisateur.findById(req.user.id);
  if (option) {
    if (user) {
      
      const checkDemande = await Demande.findOne({
        demandeur: user._id,
        option: option._id,
        status: "en cours",
      });
      if (checkDemande && !option.shouldAskAnyTime) {
        res.status(400);
        throw new Error("Vous avez déjà demandé cette demande !");
      }
      
      const currentDate = new Date();
      let demandeObj = {
        option: option._id,
        demandeur: user._id,
        contenu,
        dateDemande: currentDate,
      };
      
      let objTraitement = {
        dateEnvoi: currentDate,
      };

      
      
      const filterMessage = {
        
        pdd: " veuillez la traiter en tant que propriétaire de données",
        
        cds: " veuillez la traiter en tant que chef de service",
        
        cdd: " veuillez la traiter en tant que chef de derpatement",
        "cds.cdd":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et chef de derpatement",
        
        atr: ` veuillez la traiter en tant que '${option.autreResponsableTitre ? String(option.autreResponsableTitre).toLowerCase() : 'autre responsable'}'`,
        
        hiq: " veuillez la traiter en tant que directeur hiarchique",
        "cds.hiq":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et directeur hiarchique",
        "cdd.hiq":
          " veuillez la traiter en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>' et directeur hiarchique",
        "cds.cdd.hiq":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>' et directeur hiarchique",
        "hiq.pdd":
          " veuillez la traiter en tant que directeur hiarchique et propriétaire de données",
        "cds.hiq.pdd":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique et propriétaire de données",
        "cdd.hiq.pdd":
          " veuillez la traiter en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et propriétaire de données",
        "cds.cdd.hiq.pdd":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et propriétaire de données",
        "hiq.dir":
          " veuillez la traiter en tant que directeur hiarchique et directeur de l'entité",
        "cds.hiq.dir":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique et directeur de l'entité",
        "cdd.hiq.dir":
          " veuillez la traiter en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et directeur de l'entité",
        "cds.cdd.hiq.dir":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et directeur de l'entité",
        "hiq.pdd.dir":
          " veuillez la traiter en tant que directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cds.hiq.pdd.dir":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cdd.hiq.pdd.dir":
          " veuillez la traiter en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique, propriétaire de données et directeur de l'entité",
      };

      const [code, userID, isInterim] = await getTypeAppOnCreate(
        option._id,
        user._id
      );

      if (!userID) {
        res.status(400);
        throw new Error("Aucun signataire trouvé pour cette demande. Vérifiez la configuration de l'option.");
      }

      
      let traitements = [];
      
      
      const traitementSignataire = {
        ...objTraitement,
        code: code,
        utilisateur: userID,
        interim: isInterim,
        type: 'signataire'
      };
      traitements.push(traitementSignataire);
      
      
      const adminUser = await Utilisateur.findOne({ role: 'admin' });
      if (adminUser) {
        const traitementAdmin = {
          dateEnvoi: currentDate, 
          code: 'admin',
          utilisateur: adminUser._id,
          interim: false,
          type: 'admin'
        };
        traitements.push(traitementAdmin);
      }

      demandeObj.traitement = traitements;

      const demande = new Demande(demandeObj);
      await demande.save();
      await demande.populate("demandeur");
      const isInterimtext = isInterim ? "(interim)":"";
      
      
      for (const traitement of demande.traitement) {
      let messageContent = `<p> Une <a style='font-weight:bold' `;
        messageContent += `href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}/traitement/${traitement._id}">demande</a>`;
        messageContent += ` a été faite par <strong style='font-weight:bold'>${user.prenom ? String(user.prenom).toLowerCase() : 'utilisateur'}</strong> <strong style='font-weight:bold'>${user.nom ? String(user.nom).toLowerCase() : 'inconnu'}</strong>, `;
        
        if (traitement.type === 'admin') {
          messageContent += "veuillez la traiter en tant qu'administrateur</p>";
        } else {
          messageContent += filterMessage[traitement.code] + " " + isInterimtext + "</p>";
        }

      sendNotification(
          traitement.utilisateur,
        messageContent,
          `Demande fait par ${user.prenom ? String(user.prenom).toLowerCase() : 'utilisateur'} ${user.nom ? String(user.nom).toLowerCase() : 'inconnu'}`
      );
      }

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




export const getDemandesByID = asyncHandler(async (req, res) => {
  let demande = await Demande.findOne({
    _id: req.params.id,
    "traitement._id": req.params.idTraitement,
  })
    .populate("demandeur")
    .populate("option");

  if (demande) {
    demande = JSON.parse(JSON.stringify(demande));
    const index = demande.traitement.findIndex(
      (tr) => String(tr._id) === String(req.params.idTraitement)
    );
    if (String(demande.traitement[index].utilisateur) === String(req.user.id)) {
      const service = await Service.findById(
        demande.demandeur.service
      ).populate("chefService");

      const direction = await Direction.findById(
        demande.demandeur.direction
      ).populate("directeur");

      const optionService = await Service.findById(
        demande.option.service
      ).populate({
        path: "chefService",
      });

      const optionDirection = await Direction.findById(
        optionService.direction
      ).populate("directeur");

      demande.dirLibelle = optionDirection.libelle;

      let sig = [];
      for (const s of demande.option.signataires) {
        let traitement = demande.traitement.find((tr) => tr.code === s);

        if (traitement) {
          let obj = null;
          let status = traitement.status;

          const traitementUtilisateur = await Utilisateur.findById(
            traitement.utilisateur
          );
          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;

            if (s === "cds") {
              obj = {
                code: "cds",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }

            if (s === "cdd") {
              obj = {
                code: "cdd",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }

            if (s === "hiq") {
              obj = {
                code: "hiq",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "atr") {
              obj = {
                code: "atr",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "pdd") {
              obj = {
                code: "pdd",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "dg") {
              obj = {
                code: "dg",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "pdg") {
              obj = {
                code: "pdg",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "dir") {
              obj = {
                code: "dir",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            sig.push(obj);
          }
        } else {
          for (const tr of demande.traitement) {
            const arrCode = tr.code.split(".");
            if (arrCode.length > 1) {
              for (const item of arrCode) {
                let traitement = tr;
                if (traitement) {
                  let obj = null;
                  let status = traitement.status;
                  const traitementUtilisateur = await Utilisateur.findById(
                    traitement.utilisateur
                  );
                  if (status && status !== "en cours") {
                    let dateTraitement = traitement.dateTraitement;

                    if (item === "cds") {
                      obj = {
                        code: "cds",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "cdd") {
                      obj = {
                        code: "cdd",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "hiq") {
                      obj = {
                        code: "hiq",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "atr") {
                      obj = {
                        code: "atr",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "pdd") {
                      obj = {
                        code: "pdd",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }

                    if (item === "dir") {
                      obj = {
                        code: "dir",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                      if (s === "dg") {
                        obj = {
                          code: "dg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          
                        };
                      }
                      if (s === "pdg") {
                        obj = {
                          code: "pdg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          
                        };
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
      res.json({
        message:
          "vous n'avez pas le droit de traiter ou de  consulter ce traitement de cette demande",
        not: true,
      });
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});




export const getStatusTraitementDeDemande = asyncHandler(async (req, res) => {
  const demande = await Demande.findOne({
    _id: req.params.id,
    "traitement._id": req.params.idTraitement,
  });

  if (demande) {
    const index = demande.traitement.findIndex(
      (tr) => String(tr._id) === String(req.params.idTraitement)
    );
    if (String(demande.traitement[index].utilisateur) === String(req.user.id)) {
      return res.json({ status: demande.traitement[index].status });
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});




export const approuverDemande = asyncHandler(async (req, res) => {
  let demande = await Demande.findById(String(req.params.id))
    .populate({
      path: "option",
      populate: {
        path: "service",
      },
    })
    .populate("demandeur");

  if (demande) {
    if (demande.status === "en cours") {
      
      
      const demandeurFilterMessage = {
        
        dg: " en tant que directeur général",
        
        pdg: " en tant que président directeur général",
        
        pdd: " en tant que propriétaire de données",
        
        cds: " en tant que chef de service",
        
        atr: ` en tant que '${demande.option.autreResponsableTitre ? demande.option.autreResponsableTitre.toLowerCase() : 'autre responsable'}'`,
        
        cdd: " en tant que chef de derpatement",
        "cds.cdd": " en tant que chef de service et chef de derpatement",
        
        hiq: " en tant que directeur hiarchique",
        dir: " en tant que directeur l'entité",
        "cds.hiq": " en tant que chef de service et directeur hiarchique",
        "cdd.hiq": " en tant que chef de departement et directeur hiarchique",
        "cds.cdd.hiq":
          " en tant que chef de service, chef de departement et directeur hiarchique",
        "hiq.pdd":
          " en tant que directeur hiarchique et propriétaire de données",
        "cds.hiq.pdd":
          "  en tant que chef de service, directeur hiarchique et propriétaire de données",
        "cdd.hiq.pdd":
          " en tant que chef de departement  directeur hiarchique et propriétaire de données",
        "cds.cdd.hiq.pdd":
          " en tant que chef de service, chef de departement  directeur hiarchique et propriétaire de données",
        "hiq.dir": " en tant que directeur hiarchique et directeur de l'entité",
        "cds.hiq.dir":
          " en tant que chef de service, directeur hiarchique et directeur de l'entité",
        "cdd.hiq.dir":
          " en tant que chef de departement  directeur hiarchique et directeur de l'entité",
        "cds.cdd.hiq.dir":
          " en tant que chef de service, chef de departement  directeur hiarchique et directeur de l'entité",
        "hiq.pdd.dir":
          " en tant que directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cds.hiq.pdd.dir":
          " en tant que chef de service, directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cdd.hiq.pdd.dir":
          " en tant que chef de departement  directeur hiarchique, propriétaire de données et directeur de l'entité",
      };

      
      const signataireFilterMessage = {
        
        dg: " veuillez l'approuvez ou la refusez en tant que directeur général",
        
        pdg: " veuillez l'approuvez ou la refusez en tant que président directeur général",
        
        pdd: " veuillez l'approuvez ou la refusez en tant que propriétaire de données",
        
        cds: " veuillez l'approuvez ou la refusez en tant que chef de service",
        
        atr: ` veuillez l'approuvez ou la refusez en tant que '${demande.option.autreResponsableTitre ? demande.option.autreResponsableTitre.toLowerCase() : 'autre responsable'}'`,
        
        cdd: " veuillez l'approuvez ou la refusez en tant que chef de derpatement",
        "cds.cdd":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et chef de derpatement",
        
        hiq: " veuillez l'approuvez ou la refusez en tant que directeur hiarchique",
        dir: " veuillez l'approuvez ou la refusez en tant que directeur l'entité",
        "cds.hiq":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et directeur hiarchique",
        "cdd.hiq":
          " veuillez l'approuvez ou la refusez en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>' et directeur hiarchique",
        "cds.cdd.hiq":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>' et directeur hiarchique",
        "hiq.pdd":
          " veuillez l'approuvez ou la refusez en tant que directeur hiarchique et propriétaire de données",
        "cds.hiq.pdd":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique et propriétaire de données",
        "cdd.hiq.pdd":
          " veuillez l'approuvez ou la refusez en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et propriétaire de données",
        "cds.cdd.hiq.pdd":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et propriétaire de données",
        "hiq.dir":
          " veuillez l'approuvez ou la refusez en tant que directeur hiarchique et directeur de l'entité",
        "cds.hiq.dir":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique et directeur de l'entité",
        "cdd.hiq.dir":
          " veuillez l'approuvez ou la refusez en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et directeur de l'entité",
        "cds.cdd.hiq.dir":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique et directeur de l'entité",
        "hiq.pdd.dir":
          " veuillez l'approuvez ou la refusez en tant que directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cds.hiq.pdd.dir":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>', directeur hiarchique, propriétaire de données et directeur de l'entité",
        "cdd.hiq.pdd.dir":
          " veuillez l'approuvez ou la refusez en tant que chef de departement '<i>(le demandeur n'a pas un chef de departement ou n'a pas été affecté à un departement)</i>', directeur hiarchique, propriétaire de données et directeur de l'entité",
      };
      let sigInterim = false;
      
      let traitement = demande.traitement.find(
        (tr) => String(tr._id) === String(req.params.idTraitement)
      );

      if (traitement) {
        if (String(traitement.utilisateur) === String(req.user.id)) {
          if (traitement.status === "en cours") {
            
            for (let tr of demande.traitement) {
              if (String(tr._id) === String(req.params.idTraitement)) {
                tr.status = "approuve";
                tr.dateTraitement = new Date(); 
                tr.motifValidation = req.body.motifValidation || "Demande approuvée";
                if (tr.interim) sigInterim = true;
                break;
              }
            }

            
            let nextCode, nextUserId, isInterim;
            try {
              [nextCode, nextUserId, isInterim] = await getNextTypeAppOnApp(
                demande.option._id,
                demande._id,
                traitement.code
              );
            } catch (error) {
              console.error('Error in getNextTypeAppOnApp:', error);
              
              nextCode = "fini";
              nextUserId = null;
              isInterim = false;
            }

            
            let currentUser;
            try {
              currentUser = await Utilisateur.findById(req.user.id);
            } catch (error) {
              console.error('Error finding current user:', error);
              currentUser = null;
            }

            let messageDemandeur = `<p> Votre <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}">demande</a>`;
            if (currentUser) {
              messageDemandeur += ` a été approuvée par <b style='font-weight:bold'>${getCv(
                currentUser.civilite
              )}.</b>`;
              messageDemandeur += ` <b style='font-weight:bold'>${currentUser.prenom ? currentUser.prenom.toLowerCase() : 'utilisateur'} ${currentUser.nom ? currentUser.nom.toLowerCase() : 'inconnu'}${
                sigInterim ? " (interim)" : ""
              }</b> `;
            } else {
              messageDemandeur += ` a été approuvée par <b style='font-weight:bold'>un utilisateur</b> `;
            }
            
            
            if (traitement.type === 'admin') {
              messageDemandeur += " en tant qu'administrateur";
            } else {
            messageDemandeur += `${demandeurFilterMessage[traitement.code]}`;
            }

            
            if (req.body.motifValidation && req.body.motifValidation.trim() !== "") {
              messageDemandeur += `<br><b style='font-weight:bold'>Motif de validation : </b> "${req.body.motifValidation}"`;
            }

            
            if (traitement.type === 'admin') {
              messageDemandeur += " et pour cela, elle a été finalisée et traitée avec succès";
              demande.status = "approuvée";
            } else {
            
            if (nextCode === "fini") {
              messageDemandeur +=
                " et pour cela, tous les signataires possibles approuvent votre demande. votre demande est maintenant prête à être traitée par les utilisateurs concernés";
                demande.status = "approuvée";
            } else {
              
              demande.traitement.push({
                utilisateur: new mongoose.Types.ObjectId(nextUserId),
                  dateEnvoi: new Date(), 
                status: "en cours",
                code: nextCode,
                interim: isInterim,
              });
              }
            }
            if (req.body.docContent) {
              demande.contenu = req.body.docContent;
            }
            
            await demande.save();

            messageDemandeur += "</p>";
            
            sendNotification(
              demande.demandeur._id,
              messageDemandeur,
              `Votre demande a été approuvée`
            );

            
            if (
              traitement.code === "cds" &&
              nextCode === "hiq" &&
              demande.option.service.libelle ===
                "SERVICE PRODUCTION INFORMATIQUE"
            ) {
              let prodCddmessage = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
              prodCddmessage += ` par <b style='font-weight:bold'>${getCv(
                demande.demandeur.civilite
              )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
              prodCddmessage += ` a été approuvée par son chef de service.  DAMI : ('<i>${demande.option.libelle ? demande.option.libelle.toLowerCase() : 'option'}</i>')</p>`;

              const prodService = await Service.findById(
                demande.option.service._id
              ).populate("departement");

              sendNotification(
                prodService.departement.chefDeDepartement,
                prodCddmessage,
                `Une demande fait par ${demande.demandeur.prenom ? demande.demandeur.prenom.toLowerCase() : 'utilisateur'} ${demande.demandeur.nom ? demande.demandeur.nom.toLowerCase() : 'inconnu'}.`
              );
            }

            
            if (nextCode !== "fini") {
              let codeIndex = Array.from(demande.traitement).findIndex(
                (cd) => String(cd.code) === String(nextCode)
              );
              let traitementItem = demande.traitement[codeIndex];
              if (traitementItem) {
                let messageSignataire = `<p>Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}/traitement/${traitementItem._id}">demande</a>`;
                messageSignataire += ` a été faite par <b style='font-weight:bold'>${demande.demandeur.prenom ? demande.demandeur.prenom.toLowerCase() : 'utilisateur'}</b> <b style='font-weight:bold'>${demande.demandeur.nom ? demande.demandeur.nom.toLowerCase() : 'inconnu'}</b>, ${
                  signataireFilterMessage[nextCode]
                } ${isInterim ? "(interim)" : ""}</p>`;

                sendNotification(
                  nextUserId,
                  messageSignataire,
                  `Une demande fait par ${demande.demandeur.prenom ? demande.demandeur.prenom.toLowerCase() : 'utilisateur'} ${demande.demandeur.nom ? demande.demandeur.nom.toLowerCase() : 'inconnu'}.`
                );
              }
            }

            if (nextCode === "fini") {
              let optionService = await Service.findById(
                demande.option.service
              );
              let optionDepartement = await Departement.findById(
                optionService.departement
              );

              let optionDirection = await Direction.findById(
                optionService.direction
              );

              let optionPdd = await Utilisateur.findById(
                optionService.proprietaireDeDonnees
              );

              if (optionService && optionService.chefService) {
                let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                message += ` par <b style='font-weight:bold'>${getCv(
                  demande.demandeur.civilite
                )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en tant que chef de service, et votre service sera celui qui va traiter la DAMI. ('<i>${demande.option.libelle.toLowerCase()}</i>')</p>`;

                sendNotification(
                  optionService.chefService,
                  message,
                  `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                );
              }

              if (optionDepartement && optionDepartement.chefDeDepartement) {
                let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                message += ` par <b style='font-weight:bold'>${getCv(
                  demande.demandeur.civilite
                )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en tant que chef de departement, et votre departement sera celui qui va traiter la DAMI. ('<i>${demande.option.libelle.toLowerCase()}</i>')</p>`;

                sendNotification(
                  optionDepartement.chefDeDepartement,
                  message,
                  `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                );
              }

              if (optionPdd) {
                let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                message += ` par <b style='font-weight:bold'>${getCv(
                  demande.demandeur.civilite
                )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en propriétaire de données de la DAMI ('<i>${demande.option.libelle.toLowerCase()}</i>')</p>`;

                sendNotification(
                  optionPdd._id,
                  message,
                  `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                );
              }

              
              if (
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE D'UN PERIPHERIQUE INFORMATIQUE" ||
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE D'UN POSTE DE TRAVAIL INFORMATIQUE" ||
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE DE CONSOMMABLES POUR IMPRIMANTE" ||
                String(demande.option.libelle).toUpperCase() ===
                  "DEMANDE DE CONSOMMABLES POUR IMPRIMANTE" ||
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE DE CONSOMMABLES POUR IMPRIMANTE"
              ) {
                let serviceMagasin = await Service.findOne({
                  libelle: "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT",
                }).populate("chefService");

                if (serviceMagasin) {
                  let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                  message += ` par <b style='font-weight:bold'>${getCv(
                    demande.demandeur.civilite
                  )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                  message += ` a été approuvée par ses supérieurs et tous les signataires possibles.  DAMI : ('<i>${demande.option.libelle.toLowerCase()}</i>')</p>`;
                  
                  const chefServiceMagasin = await Utilisateur.findById(
                    serviceMagasin.chefService._id
                  );
                  
                  if (chefServiceMagasin.interim) {
                    sendNotification(
                      chefServiceMagasin.interim,
                      message,
                      `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                    );
                  } else {
                    sendNotification(
                      chefServiceMagasin._id,
                      message,
                      `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                    );
                  }
                }
              }

              
              const chefDeService = await Utilisateur.findById(
                optionService.chefService
              );

              const chefDeDepartement = await Utilisateur.findById(
                optionDepartement.chefDeDepartement
              );

              const directeur = await Utilisateur.findById(
                optionDirection.directeur
              );

              const demandeurService = await Service.findById(
                demande.demandeur.service
              );
              const demandeurDepartement = await Departement.findById(
                demande.demandeur.departement
              );
              const demandeurDirection = await Direction.findById(
                demande.demandeur.direction
              );
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
            }

            
            await demande.save();

            res.json({ message: "demande approvee avec success !" });
          } else {
            res.status(400);
            throw new Error("demande deja traitée");
          }
        } else {
          res.status(400);
          throw new Error(
            "vous n'avez pas le droit d'approuver cette demande !"
          );
        }
      } else {
        res.status(404);
        throw new Error("traitement introuvable");
      }
    } else {
      res.status(400);
      throw new Error("demande deja traitée");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable !");
  }
});




export const refuserDemande = asyncHandler(async (req, res) => {
  let demande = await Demande.findById(req.params.id).populate("option");
  if (demande) {
    if (demande.status === "en cours") {
      const traitement = demande.traitement.find(
        (tr) => String(tr._id) === String(req.params.idTraitement)
      );
      let interim = false;

      if (traitement.status === "en cours") {
        if (traitement) {
          if (String(traitement.utilisateur) === String(req.user.id)) {
            if (traitement.status === "en cours") {
              
              const canUploadFile = await isUserFromAuthorizedService(req.user.id);
              let fichierMotifRefus = null;

              
              if (canUploadFile && req.file) {
                fichierMotifRefus = req.file.path;
              }

              for (let tr of demande.traitement) {
                if (String(tr._id) === String(req.params.idTraitement)) {
                  tr.motifRefus = req.body.motif || req.body.motifRefus;
                  tr.status = "refuse";
                  tr.dateTraitement = new Date(); 
                  
                  
                  if (fichierMotifRefus) {
                    tr.fichierMotifRefus = fichierMotifRefus;
                  }

                  if (tr.interim) {
                    interim = true;
                  }

                  break;
                }
              }

              
              if (traitement.type === 'admin') {
                demande.status = "refusée";
              } else {
              demande.status = "refuse";
              }
              await demande.save();

              
              let signataireUser = await Utilisateur.findById(
                req.user.id
              );

              
              
              
              const demandeurFilterMessage = {
                
                dg: " en tant que directeur général",
                
                pdg: " en tant que président directeur général",
                
                pdd: " en tant que propriétaire de données",
                
                cds: " en tant que chef de service",
                
                cdd: " en tant que chef de derpatement",
                "cds.cdd":
                  " en tant que chef de service et chef de derpatement",
                
                hiq: " en tant que directeur hiarchique",
                "cds.hiq":
                  " en tant que chef de service et directeur hiarchique",
                "cdd.hiq":
                  " en tant que chef de departement et directeur hiarchique",
                "cds.cdd.hiq":
                  " en tant que chef de service, chef de departement et directeur hiarchique",
                "hiq.pdd":
                  " en tant que directeur hiarchique et propriétaire de données",
                "cds.hiq.pdd":
                  "  en tant que chef de service, directeur hiarchique et propriétaire de données",
                "cdd.hiq.pdd":
                  " en tant que chef de departement  directeur hiarchique et propriétaire de données",
                "cds.cdd.hiq.pdd":
                  " en tant que chef de service, chef de departement  directeur hiarchique et propriétaire de données",
                "hiq.dir":
                  " en tant que directeur hiarchique et directeur de l'entité",
                "cds.hiq.dir":
                  " en tant que chef de service, directeur hiarchique et directeur de l'entité",
                "cdd.hiq.dir":
                  " en tant que chef de departement  directeur hiarchique et directeur de l'entité",
                "cds.cdd.hiq.dir":
                  " en tant que chef de service, chef de departement  directeur hiarchique et directeur de l'entité",
                "hiq.pdd.dir":
                  " en tant que directeur hiarchique, propriétaire de données et directeur de l'entité",
                "cds.hiq.pdd.dir":
                  " en tant que chef de service, directeur hiarchique, propriétaire de données et directeur de l'entité",
                "cdd.hiq.pdd.dir":
                  " en tant que chef de departement  directeur hiarchique, propriétaire de données et directeur de l'entité",
              };
              let messageDemandeur = `<p> Votre <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}">demande</a>`;
              messageDemandeur += ` a été refuseée par <b style='font-weight:bold'>${getCv(
                signataireUser.civilite
              )}.</b>`;
              messageDemandeur += ` <b style='font-weight:bold'>${signataireUser.prenom ? signataireUser.prenom.toLowerCase() : 'utilisateur'} ${signataireUser.nom ? signataireUser.nom.toLowerCase() : 'inconnu'}${
                interim ? " (interim)" : ""
              }</b> `;
              
              
              if (traitement.type === 'admin') {
                messageDemandeur += " en tant qu'administrateur";
              } else {
              messageDemandeur += `${demandeurFilterMessage[traitement.code]}`;
              }
              
              messageDemandeur += `. <b style='font-weight:bold'>Motif de refus : </b> "${req.body.motif || req.body.motifRefus}"`;
              
              
              if (fichierMotifRefus) {
                const serverUrl = process.env.NODE_ENV === "production" 
                  ? process.env.SERVER_URL || "https://e-dami.snrt.ma"
                  : "http://localhost:4000";
                messageDemandeur += `<br><b style='font-weight:bold'>Fichier joint : </b> <a href="${serverUrl}/${fichierMotifRefus}" target="_blank">Voir le fichier</a>`;
              }
              
              messageDemandeur += "</p>";

              sendNotification(
                demande.demandeur,
                messageDemandeur,
                `Votre demande a été refusée`
              );

              
              await demande.save();

              res.json({ message: "demande refuse!" });
            } else {
              res.status(400);
              throw new Error("demande deja traitée");
            }
          } else {
            res.status(400);
            throw new Error(
              "vous n'avez pas le droit de refuser cette demande !"
            );
          }
        } else {
          res.status(404);
          throw new Error("traitement introuvable");
        }
      } else {
        res.status(400);
        throw new Error("demande deja traitée");
      }
    } else {
      res.status(400);
      throw new Error("demande deja traitée");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable !");
  }

  res.json(demande);
});




export const getDemandeurDemandeByID = asyncHandler(async (req, res) => {
  let demande = await Demande.findOne({
    _id: req.params.id,
  })
    .populate("demandeur")
    .populate("option")
    .populate("traitement.utilisateur");

  if (demande) {
    if (String(demande.demandeur._id) === String(req.user.id)) {
      demande = JSON.parse(JSON.stringify(demande));

      const service = await Service.findById(
        demande.demandeur.service
      ).populate("chefService");

      const departement = await Departement.findById(
        demande.demandeur.departement
      ).populate("chefDeDepartement");

      const direction = await Direction.findById(
        demande.demandeur.direction
      ).populate("directeur");
      
      const optionService = await Service.findById(
        demande.option.service
      ).populate("chefService");

      let optionPDD = null;
      if (demande.option.proprietaireDeDonnees)
        optionPDD = await Utilisateur.findById(
          demande.option.proprietaireDeDonnees
        );

      let optionATR = null;
      if (demande.option.autreUtilisateur)
        optionATR = await Utilisateur.findById(
          demande.option.autreUtilisateur
        );

      demande.demandeur.direction = direction;
      demande.demandeur.service = service;
      demande.demandeur.departement = departement;

      
      const sig = [];
      if (demande.traitement && demande.traitement.length > 0) {
        for (const tr of demande.traitement) {
          if (tr && tr.code) {
            const arrCode = tr.code.split(".");
            for (const s of arrCode) {
              let obj = {};
              const status = tr.status;
              const dateTraitement = tr.dateTraitement;
              const traitementUtilisateur = tr.utilisateur;

            if (s === "atr") {
              obj = {
                code: "atr",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
              };
            }
            if (s === "pdd") {
              obj = {
                code: "pdd",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
              };
            }
            if (s === "dir") {
              obj = {
                code: "dir",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                };
              }
              if (s === "cds") {
                      obj = {
                        code: "cds",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                      };
                    }
              if (s === "cdd") {
                      obj = {
                        code: "cdd",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                      };
                    }
              if (s === "hiq") {
                      obj = {
                        code: "hiq",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                };
              }
              if (Object.keys(obj).length > 0) {
                    sig.push(obj);
              }
            }
          }
        }
      }

      demande.sig = sig;
      demande.traitement.sort((a, b) => {
        return new Date(b.dateEnvoi) - new Date(a.dateEnvoi);
      });

      res.json(demande);
    } else {
      res.status(400);
      throw new Error(
        "Vous n'êtes pas le demandeur de cette requête, vous ne pouvez pas consulter cette demande !"
      );
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }
});




export const getDemandesForPreview = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, demandeur, option, status, fonction, dateDemande, dateEnvoiTraitement } = req.query;
  let utilisateur = await Utilisateur.findById(req.user.id);
  
  if (!utilisateur) {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }

  
  let pipeline = [
    {
      $lookup: {
        from: "utilisateurs",
        localField: "demandeur",
        foreignField: "_id",
        as: "demandeur",
      },
    },
    {
      $unwind: "$demandeur",
    },
    {
      $lookup: {
        from: "options",
        localField: "option",
        foreignField: "_id",
        as: "option",
      },
    },
    {
      $unwind: "$option",
    },
  ];

  
  let matchConditions = {
    "demandeur._id": {
      $ne: new mongoose.Types.ObjectId(utilisateur._id),
    },
  };

  
  if (utilisateur.role === 'admin' || ['2003003','2003002'].includes(String(utilisateur.matricule))) {
    
    
  } else if (utilisateur.role === 'sig' || utilisateur.matricule === '2003005') {
    
    
  } else if (utilisateur.isDirecteur || utilisateur.isDirecteurAdj) {
    
    matchConditions["demandeur.direction"] = new mongoose.Types.ObjectId(utilisateur.direction);
  } else if (utilisateur.isChefDeDepartement) {
    matchConditions["demandeur.departement"] = new mongoose.Types.ObjectId(utilisateur.departement);
  } else if (utilisateur.isChefDeService) {
    matchConditions["demandeur.service"] = new mongoose.Types.ObjectId(utilisateur.service);
  } else {
    res.status(400);
    throw new Error("vous n'avez pas le droit de voir les demandes !");
  }

  
  if (demandeur) {
    matchConditions.$or = [
      { "demandeur.nom": { $regex: demandeur, $options: "i" } },
      { "demandeur.prenom": { $regex: demandeur, $options: "i" } },
    ];
  }

  if (option) {
    matchConditions["option._id"] = new mongoose.Types.ObjectId(option);
  }

  if (status) {
    
    let s = String(status || '').toLowerCase().trim();
    s = s.replace(/_/g, ' ')
         .normalize('NFD')
         .replace(/\p{Diacritic}/gu, '');

    if (s.includes('approuv')) {
      
      matchConditions.status = { $regex: /^approuv/i };
    } else if (s.includes('refus')) {
      
      matchConditions.status = { $regex: /^refus/i };
    } else if (s.replace(/\s+/g, '') === 'encours' || s === 'en cours') {
      matchConditions.status = 'en cours';
    } else if (s.includes('attent')) {
      
      matchConditions.status = { $in: ['en_attente', 'en attente'] };
    } else if (s.includes('term')) {
      
      matchConditions.status = { $regex: /^termin/i };
    } else {
      matchConditions.status = status;
    }
  }

  if (fonction) {
    matchConditions["demandeur.fonction"] = { $regex: fonction, $options: "i" };
  }

  if (dateDemande) {
    const dateDemandeStart = new Date(dateDemande);
    const dateDemandeEnd = new Date(dateDemande);
    dateDemandeStart.setHours(0, 0, 0, 0);
    dateDemandeEnd.setHours(23, 59, 59, 999);
    
    matchConditions["dateDemande"] = {
      $gte: dateDemandeStart,
      $lte: dateDemandeEnd
    };
  }

  if (dateEnvoiTraitement) {
    const dateEnvoiStart = new Date(dateEnvoiTraitement);
    const dateEnvoiEnd = new Date(dateEnvoiTraitement);
    dateEnvoiStart.setHours(0, 0, 0, 0);
    dateEnvoiEnd.setHours(23, 59, 59, 999);
    
    matchConditions["traitement.dateEnvoi"] = {
      $gte: dateEnvoiStart,
      $lte: dateEnvoiEnd
    };
  }

  
  pipeline.push({ $match: matchConditions });

  
  pipeline.push({
    $sort: {
      dateDemande: -1,
    },
  });

  
  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await Demande.aggregate(totalPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  
  pipeline.push(
    { $skip: (page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) }
  );

  
  let demandes = await Demande.aggregate(pipeline);

  
  const optionsPipeline = [
    {
      $lookup: {
        from: "utilisateurs",
        localField: "demandeur",
        foreignField: "_id",
        as: "demandeur",
      },
    },
    {
      $unwind: "$demandeur",
    },
    {
      $match: {
        "demandeur._id": {
          $ne: new mongoose.Types.ObjectId(utilisateur._id),
        },
        ...(utilisateur.isDirecteur || utilisateur.isDirecteurAdj
          ? { "demandeur.direction": new mongoose.Types.ObjectId(utilisateur.direction) }
          : utilisateur.isChefDeDepartement
          ? { "demandeur.departement": new mongoose.Types.ObjectId(utilisateur.departement) }
          : { "demandeur.service": new mongoose.Types.ObjectId(utilisateur.service) }
        ),
      },
    },
    {
      $group: {
        _id: "$option",
      },
    },
  ];

  const uniqueOptions = await Demande.aggregate(optionsPipeline);
  const optionIds = uniqueOptions.map(opt => opt._id);
  const teamOptions = await Option.find({ _id: { $in: optionIds } }).select('_id libelle');

  
  demandes = await Promise.all(
    demandes.map(async (demande) => {
      const populatedDemande = await Demande.findById(demande._id)
        .populate("traitement.utilisateur", "nom prenom direction")
        .populate("option", "autreResponsableTitre")
        .lean();
      
      
      const getSignataireTitle = async (code, option, utilisateur) => {
        
        if (code && code.includes('.')) {
          const codes = code.split('.');
          const titles = [];
          
          for (const singleCode of codes) {
            switch (singleCode.toLowerCase().trim()) {
              case "cds":
                titles.push("Chef de Service");
                break;
              case "cdd":
                titles.push("Chef de Département");
                break;
              case "dir":
                if (utilisateur && utilisateur.direction) {
                  try {
                    const direction = await Direction.findById(utilisateur.direction);
                    titles.push(direction ? `Directeur de ${direction.libelle}` : "Directeur Hiérarchique");
                  } catch (error) {
                    titles.push("Directeur Hiérarchique");
                  }
                } else {
                  titles.push("Directeur Hiérarchique");
                }
                break;
              case "pdd":
                titles.push("Propriétaire de Données");
                break;
              case "atr":
                titles.push(option?.autreResponsableTitre || "Autre Responsable");
                break;
              case "hiq":
                titles.push("Directeur Hiérarchique");
                break;
              case "dg":
                titles.push("Directeur Général");
                break;
              case "pdg":
                titles.push("Président Directeur Général");
                break;
              default:
                
                break;
            }
          }
          
          return titles.length > 0 ? titles.join(" et ") : "Signataire";
        }
        
        
        if (!code) return "Signataire";
        
        const cleanCode = code.toLowerCase().trim();
        
        switch (cleanCode) {
          case "cds":
            return "Chef de Service";
          case "cdd":
            return "Chef de Département";
          case "dir":
            if (utilisateur && utilisateur.direction) {
              try {
                const direction = await Direction.findById(utilisateur.direction);
                return direction ? `Directeur de ${direction.libelle}` : "Directeur Hiérarchique";
              } catch (error) {
                return "Directeur Hiérarchique";
              }
            }
            return "Directeur Hiérarchique";
          case "pdd":
            return "Propriétaire de Données";
          case "atr":
            return option?.autreResponsableTitre || "Autre Responsable";
          case "dg":
            return "Directeur Général";
          case "pdg":
            return "Président Directeur Général";
          case "hiq":
            return "Directeur Hiérarchique";
          case "":
          case null:
          case undefined:
            return "Signataire";
          default:
            
            console.warn(`Code de signature inconnu: ${code}`);
            return `Signataire (${code})`;
        }
      };
    
      
      const signataires = await Promise.all(
        populatedDemande.traitement.map(async (traitement) => {
          
          if (!traitement.utilisateur) {
            console.log(`⚠️ Traitement sans utilisateur: ${traitement.code}`);
            return {
              nom: 'N/A',
              prenom: 'N/A',
              code: traitement.code,
              status: traitement.status,
              titre: 'N/A'
            };
          }
          
          console.log(`🔍 Processing signature code: "${traitement.code}" for user: ${traitement.utilisateur.nom} ${traitement.utilisateur.prenom}`);
          const titre = await getSignataireTitle(traitement.code, populatedDemande.option, traitement.utilisateur);
          console.log(`✅ Generated title: "${titre}"`);
          
          return {
            nom: traitement.utilisateur.nom,
            prenom: traitement.utilisateur.prenom,
            code: traitement.code,
            status: traitement.status,
            titre: titre
          };
        })
      );
      
      return {
        ...demande,
        signataires,
        traitement: populatedDemande.traitement
      };
    })
  );

  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    demandes,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    },
    teamOptions, 
  });
});




export const getDemandeForPreviewByID = asyncHandler(async (req, res) => {
  let demandes = await Demande.findOne({
    _id: req.params.id,
  })
    .populate({
      path: "option",
      populate: {
        path: "service",
        populate: {
          path: "departement",
        },
      },
    })

    .populate("traitement.utilisateur")
    .populate("demandeur");

  if (demandes) {
    let isChefDeService = false;
    let isChefDeDepartement = false;
    let isDirecteur = false;
    let isPDG = false;
    let isDG = false;

    if (req.user.isChefDeService) {
      let service = await Service.findOne(req.user.service);
      if (service && String(demandes.demandeur.service) === String(service._id))
        isChefDeService = true;
    }
    if (req.user.isChefDeDepartement) {
      let departement = await Departement.findOne(req.user.departement);
      if (
        departement &&
        String(demandes.demandeur.departement) === String(departement._id)
      )
        isChefDeDepartement = true;
    }

    if (req.user.isDirecteur || req.user.isDirecteurAdj) {
      let direction = await Direction.findOne(req.user.direction);
      if (
        direction &&
        String(demandes.demandeur.direction) === String(direction._id)
      )
        isDirecteur = true;
    }

    if (req.user.fonction === "directeur général") isDG = true;

    if (req.user.fonction === "président directeur général") isPDG = true;

    let supService = await Service.findById(demandes.option.service._id);
    let supDepratement = await Service.findById(
      demandes.option.service.deparatement
    );

    let supPdd = await Utilisateur.findById(
      demandes.option.proprietaireDeDonnees
    );

    let adminRole = await Role.findOne({
      code: "crt",
    });

    if (
      req.user.roles.findIndex(
        (r) => String(r.role) === String(adminRole._id)
      ) !== -1 ||
      isChefDeService ||
      isChefDeDepartement ||
      isDirecteur ||
      supService ||
      supDepratement ||
      supPdd ||
      isDG ||
      isPDG
    ) {
      demandes = JSON.parse(JSON.stringify(demandes));
      const service = await Service.findById(
        demandes.demandeur.service
      ).populate("chefService");
      const direction = await Direction.findById(
        demandes.demandeur.direction
      ).populate("directeur");

      const optionService = await Service.findById(
        demandes.option.service
      ).populate({
        path: "chefService",
      });

      let optionPDD = null;
      if (demandes.option.proprietaireDeDonnees)
        optionPDD = await Utilisateur.findById(
          demandes.option.proprietaireDeDonnees
        );

      const optionDirection = await Direction.findById(
        optionService.direction
      ).populate("directeur");

      demandes.dirLibelle = optionDirection.libelle;

      let sig = [];
      for (const s of demandes.option.signataires) {
        let traitement = demandes.traitement.find((tr) => tr.code === s);

        if (traitement) {
          let obj = null;
          let status = traitement.status;
          const traitementUtilisateur = await Utilisateur.findById(
            traitement.utilisateur
          );
          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;

            if (s === "cdd") {
              let departement = null;
              let demandeur = await Utilisateur.findById(
                demandes.demandeur._id
              );
              if (demandeur) {
                departement = await Departement.findById(
                  demandeur.departement
                ).populate("chefDeDepartement");
                obj = {
                  code: "cdd",
                  nom: traitementUtilisateur.nom,
                  prenom: traitementUtilisateur.prenom,
                  approuve: status === "approuve" ? true : false,
                  refuse: status === "refuse" ? true : false,
                  dateTraitement: dateTraitement,
                  
                };
              }
            }

            if (s === "cds") {
              obj = {
                code: "cds",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }

            if (s === "hiq") {
              obj = {
                code: "hiq",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "atr") {
              obj = {
                code: "atr",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }
            if (s === "pdd") {
              obj = {
                code: "pdd",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
            }

            if (s === "dir") {
              obj = {
                code: "dir",
                nom: traitementUtilisateur.nom,
                prenom: traitementUtilisateur.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                
              };
              if (s === "dg") {
                obj = {
                  code: "dg",
                  nom: traitementUtilisateur.nom,
                  prenom: traitementUtilisateur.prenom,
                  approuve: status === "approuve" ? true : false,
                  refuse: status === "refuse" ? true : false,
                  dateTraitement: dateTraitement,
                  
                };
              }
              if (s === "pdg") {
                obj = {
                  code: "pdg",
                  nom: traitementUtilisateur.nom,
                  prenom: traitementUtilisateur.prenom,
                  approuve: status === "approuve" ? true : false,
                  refuse: status === "refuse" ? true : false,
                  dateTraitement: dateTraitement,
                  
                };
              }
            }
            sig.push(obj);
          }
        } else {
          for (const tr of demandes.traitement) {
            const arrCode = tr.code.split(".");
            if (arrCode.length > 1) {
              for (const item of arrCode) {
                let traitement = tr;
                if (traitement) {
                  const traitementUtilisateur = await Utilisateur.findById(
                    traitement.utilisateur
                  );
                  let obj = null;
                  let status = traitement.status;

                  if (status && status !== "en cours") {
                    let dateTraitement = traitement.dateTraitement;

                    if (item === "cds") {
                      obj = {
                        code: "cds",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }

                    if (item === "cdd") {
                      obj = {
                        code: "cdd",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }

                    if (item === "hiq") {
                      obj = {
                        code: "hiq",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "atr") {
                      obj = {
                        code: "atr",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }
                    if (item === "pdd") {
                      obj = {
                        code: "pdd",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                    }

                    if (item === "dir") {
                      obj = {
                        code: "dir",
                        nom: traitementUtilisateur.nom,
                        prenom: traitementUtilisateur.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        
                      };
                      if (s === "dg") {
                        obj = {
                          code: "dg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          
                        };
                      }
                      if (s === "pdg") {
                        obj = {
                          code: "pdg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          
                        };
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

      demandes.sig = sig;
      demandes.demandeur.direction = direction;
      demandes.demandeur.service = service;

      demandes.traitement.sort((a, b) => {
        return new Date(b.dateEnvoi) - new Date(a.dateEnvoi);
      });
      res.json(demandes);
    } else {
      res.status(400);
      throw new Error("vous n'avez pas le droit de consulter cette demande !");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }
});




export const getDemandesForPreviewAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, demandeur, option, status, fonction, dateDemande, dateEnvoiTraitement } = req.query;
  
  
  const currentUser = await Utilisateur.findById(req.user.id);
  if (!currentUser) {
    res.status(404);
    throw new Error("Utilisateur introuvable");
  }

  
  let pipeline = [
    {
      $lookup: {
        from: "utilisateurs",
        localField: "demandeur",
        foreignField: "_id",
        as: "demandeur",
      },
    },
    {
      $unwind: "$demandeur",
    },
    {
      $lookup: {
        from: "options",
        localField: "option",
        foreignField: "_id",
        as: "option",
      },
    },
    {
      $unwind: "$option",
    },
  ];

  
  let matchConditions = {
    "demandeur._id": {
      $ne: new mongoose.Types.ObjectId(req.user.id),
    },
  };

  
  if (currentUser.role === 'admin' || ['2003003','2003002'].includes(String(currentUser.matricule))) {
    
    
  } else if (currentUser.role === 'sig' || currentUser.matricule === '2003005') {
    
    
  } else {
    
    if (currentUser.isDirecteur || currentUser.isDirecteurAdj) {
      matchConditions["demandeur.direction"] = new mongoose.Types.ObjectId(currentUser.direction);
    } else if (currentUser.isChefDeDepartement) {
      matchConditions["demandeur.departement"] = new mongoose.Types.ObjectId(currentUser.departement);
    } else if (currentUser.isChefDeService) {
      matchConditions["demandeur.service"] = new mongoose.Types.ObjectId(currentUser.service);
    } else {
      res.status(400);
      throw new Error("Vous n'avez pas le droit de voir les demandes !");
    }
  }

  
  if (demandeur) {
    matchConditions.$or = [
      { "demandeur.nom": { $regex: demandeur, $options: "i" } },
      { "demandeur.prenom": { $regex: demandeur, $options: "i" } },
    ];
  }

  if (option) {
    matchConditions["option._id"] = new mongoose.Types.ObjectId(option);
  }

  if (status) {
    matchConditions.status = status;
  }

  if (fonction) {
    matchConditions["demandeur.fonction"] = { $regex: fonction, $options: "i" };
  }

  if (dateDemande) {
    const dateDemandeStart = new Date(dateDemande);
    const dateDemandeEnd = new Date(dateDemande);
    dateDemandeStart.setHours(0, 0, 0, 0);
    dateDemandeEnd.setHours(23, 59, 59, 999);
    
    matchConditions["dateDemande"] = {
      $gte: dateDemandeStart,
      $lte: dateDemandeEnd
    };
  }

  if (dateEnvoiTraitement) {
    const dateEnvoiStart = new Date(dateEnvoiTraitement);
    const dateEnvoiEnd = new Date(dateEnvoiTraitement);
    dateEnvoiStart.setHours(0, 0, 0, 0);
    dateEnvoiEnd.setHours(23, 59, 59, 999);
    
    matchConditions["traitement.dateEnvoi"] = {
      $gte: dateEnvoiStart,
      $lte: dateEnvoiEnd
    };
  }

  
  pipeline.push({ $match: matchConditions });

  
  pipeline.push({
    $sort: {
      dateDemande: -1,
    },
  });

  
  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await Demande.aggregate(totalPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  
  pipeline.push(
    { $skip: (page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) }
  );

  
  let demandes = await Demande.aggregate(pipeline);

  
  demandes = await Promise.all(
    demandes.map(async (demande) => {
      const populatedDemande = await Demande.findById(demande._id)
        .populate("traitement.utilisateur", "nom prenom direction")
        .populate("option", "autreResponsableTitre")
        .lean();
      
              
        const getSignataireTitle = async (code, option, utilisateur) => {
          
          if (code && code.includes('.')) {
            const codes = code.split('.');
            const titles = [];
            
            for (const singleCode of codes) {
              switch (singleCode.toLowerCase().trim()) {
                case "cds":
                  titles.push("Chef de Service");
                  break;
                case "cdd":
                  titles.push("Chef de Département");
                  break;
                case "dir":
                  if (utilisateur && utilisateur.direction) {
                    try {
                      const direction = await Direction.findById(utilisateur.direction);
                      titles.push(direction ? `Directeur de ${direction.libelle}` : "Directeur Hiérarchique");
                    } catch (error) {
                      titles.push("Directeur Hiérarchique");
                    }
                  } else {
                    titles.push("Directeur Hiérarchique");
                  }
                  break;
                case "pdd":
                  titles.push("Propriétaire de Données");
                  break;
                case "atr":
                  titles.push(option?.autreResponsableTitre || "Autre Responsable");
                  break;
                case "hiq":
                  titles.push("Directeur Hiérarchique");
                  break;
                case "dg":
                  titles.push("Directeur Général");
                  break;
                case "pdg":
                  titles.push("Président Directeur Général");
                  break;
                default:
                  
                  break;
              }
            }
            
            return titles.length > 0 ? titles.join(" et ") : "Signataire";
          }
          
          
          if (!code) return "Signataire";
          
          const cleanCode = code.toLowerCase().trim();
          
          switch (cleanCode) {
            case "cds":
              return "Chef de Service";
            case "cdd":
              return "Chef de Département";
            case "dir":
              if (utilisateur && utilisateur.direction) {
                try {
                  const direction = await Direction.findById(utilisateur.direction);
                  return direction ? `Directeur de ${direction.libelle}` : "Directeur Hiérarchique";
                } catch (error) {
                  return "Directeur Hiérarchique";
                }
              }
              return "Directeur Hiérarchique";
            case "pdd":
              return "Propriétaire de Données";
            case "atr":
              return option?.autreResponsableTitre || "Autre Responsable";
            case "dg":
              return "Directeur Général";
            case "pdg":
              return "Président Directeur Général";
                            case "hiq":
                  return "Directeur Hiérarchique";
            case "":
            case null:
            case undefined:
              return "Signataire";
            default:
              
              console.warn(`Code de signature inconnu: ${code}`);
              return `Signataire (${code})`;
          }
        };
      
      
      const signataires = await Promise.all(
        populatedDemande.traitement.map(async (traitement) => {
          
          if (!traitement.utilisateur) {
            console.log(`⚠️ Traitement sans utilisateur: ${traitement.code}`);
            return {
              nom: 'N/A',
              prenom: 'N/A',
              code: traitement.code,
              status: traitement.status,
              titre: 'N/A'
            };
          }
          
          console.log(`🔍 Processing signature code: "${traitement.code}" for user: ${traitement.utilisateur.nom} ${traitement.utilisateur.prenom}`);
          const titre = await getSignataireTitle(traitement.code, populatedDemande.option, traitement.utilisateur);
          console.log(`✅ Generated title: "${titre}"`);
          
          return {
            nom: traitement.utilisateur.nom,
            prenom: traitement.utilisateur.prenom,
            code: traitement.code,
            status: traitement.status,
            titre: titre
          };
        })
      );
      
      return {
        ...demande,
        signataires,
        traitement: populatedDemande.traitement
      };
    })
  );

  
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    demandes,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage,
    },
  });
});




export const generateDemandePDF = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id)
    .populate('option')
    .populate('demandeur')
    .populate('traitement.utilisateur');

  if (!demande) {
    res.status(404);
    throw new Error('Demande non trouvée');
  }

  try {
    
    const { createPDFFromDemande } = await import('../services/convertDamiToMedia.js');
    
    
    const language = req.query.lang || 'fr';
    
    
    const pdfBuffer = await createPDFFromDemande(demande, language);
    
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="demande_${demande._id}_${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Demande - ${demande.option?.libelle || 'DAMI'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .content { margin-top: 20px; }
          .status { padding: 5px 10px; border-radius: 5px; color: white; }
          .status.approuvée { background-color: #28a745; }
          .status.refusée { background-color: #dc3545; }
          .status.en-cours { background-color: #007bff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Demande DAMI</h1>
          <h2>${demande.option?.libelle || 'DAMI'}</h2>
        </div>
        
        <div class="info">
          <p><strong>Demandeur:</strong> ${demande.demandeur?.prenom || ''} ${demande.demandeur?.nom || ''}</p>
          <p><strong>Date de demande:</strong> ${new Date(demande.dateDemande).toLocaleDateString('fr-FR')}</p>
          <p><strong>Statut:</strong> <span class="status ${demande.status}">${demande.status}</span></p>
        </div>
        
        <div class="content">
          <h3>Contenu de la demande:</h3>
          <div>${demande.contenu || 'Aucun contenu disponible'}</div>
        </div>
      </body>
      </html>
    `;

    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="demande_${demande._id}.html"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(html);
  }
});




export const updateDemande = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const demande = await Demande.findById(id);
    
    if (!demande) {
      res.status(404);
      throw new Error("Demande non trouvée");
    }

    
    const canModify = req.user.roles.some(role => 
      role.role?.code === 'admin' || 
      (role.role?.code === 'demandeur' && String(demande.demandeur) === String(req.user._id))
    );

    if (!canModify) {
      res.status(403);
      throw new Error("Non autorisé à modifier cette demande");
    }

    
    if (demande.statut === 'approuvée' || demande.statut === 'refusée') {
      res.status(400);
      throw new Error("Impossible de modifier une demande déjà traitée");
    }

    
    const updatedDemande = await Demande.findByIdAndUpdate(
      id,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('demandeur', 'nom prenom email matricule')
     .populate('option', 'libelle typeProcessus')
     .populate('service', 'libelle')
     .populate('departement', 'libelle')
     .populate('direction', 'libelle');

    res.json(updatedDemande);
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la modification: ${error.message}`);
  }
});




export const deleteDemande = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const demande = await Demande.findById(id);
    
    if (!demande) {
      res.status(404);
      throw new Error("Demande non trouvée");
    }

    
    const canDelete = req.user.roles.some(role => 
      role.role?.code === 'admin' || 
      (role.role?.code === 'demandeur' && String(demande.demandeur) === String(req.user._id))
    );

    if (!canDelete) {
      res.status(403);
      throw new Error("Non autorisé à supprimer cette demande");
    }

    
    if (demande.statut === 'approuvée' || demande.statut === 'refusée') {
      res.status(400);
      throw new Error("Impossible de supprimer une demande déjà traitée");
    }

    
    await Demande.findByIdAndDelete(id);

    res.json({ message: "Demande supprimée avec succès" });
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
});




export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    
    const activeUsers = await Utilisateur.countDocuments({ 
      isDeleted: { $ne: true } 
    });

    
    const pendingRequests = await Demande.countDocuments({
      status: { $in: ['en cours', 'pending'] }
    });

    
    const directions = await Direction.countDocuments({ 
      isDeleted: { $ne: true } 
    });

    
    const totalDemandes = await Demande.countDocuments();
    const approvedDemandes = await Demande.countDocuments({
      status: 'approuve'
    });
    
    const approvalRate = totalDemandes > 0 
      ? Math.round((approvedDemandes / totalDemandes) * 100) 
      : 0;

    
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    
    const usersThisMonth = await Utilisateur.countDocuments({
      createdAt: { $gte: thisMonth },
      isDeleted: { $ne: true }
    });

    
    const usersLastMonth = await Utilisateur.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
      isDeleted: { $ne: true }
    });

    
    const usersChange = usersLastMonth > 0 
      ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : usersThisMonth > 0 ? 100 : 0;

    
    const requestsThisMonth = await Demande.countDocuments({
      dateDemande: { $gte: thisMonth }
    });

    
    const requestsLastMonth = await Demande.countDocuments({
      dateDemande: { $gte: lastMonth, $lt: thisMonth }
    });

    
    const requestsChange = requestsLastMonth > 0 
      ? Math.round(((requestsThisMonth - requestsLastMonth) / requestsLastMonth) * 100)
      : requestsThisMonth > 0 ? 100 : 0;

    const stats = {
      activeUsers,
      pendingRequests,
      directions,
      approvalRate,
      changes: {
        users: usersChange,
        requests: requestsChange
      },
      
      debug: {
        totalDemandes,
        approvedDemandes,
        usersThisMonth,
        usersLastMonth,
        requestsThisMonth,
        requestsLastMonth
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500);
    throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
  }
});
