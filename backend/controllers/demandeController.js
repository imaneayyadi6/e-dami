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
import { createItopTicket } from "../services/createItopTicketService.js";

const getCv = (cv) => {
  if (cv === "F") return "Mme";
  else return "Mr";
};

// @desc    Recuperer les demandes de demandeur
// @route   GET /api/demandes/mesdemandes
// @access  private
export const getMesDemandes = asyncHandler(async (req, res) => {
  let demandes = await Demande.find({
    demandeur: req.user.id,
  })
    .populate("option")
    .sort({ dateDemande: -1 });

  res.json(demandes);
});

// @desc    Recuperer les demandes envoyer a un utilisateur pour le  traitee
// @route   GET /api/demandes/handle
// @access  private
export const getDemandesForHandling = asyncHandler(async (req, res) => {
  // Destructure query parameters with default values
  const { page = 1, limit = 20, ...filters } = req.query;

  // Define base filter for user-specific requests
  const userFilter = {
    "traitement.utilisateur": new mongoose.Types.ObjectId(req.user.id),
  };

  // Update filter based on query parameters
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
        .populate("option")
        .populate("demandeur")
        .sort({ "traitement.dateEnvoi": -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .exec()
    )
  );

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
              option: demande.option.libelle,
            });
          }
        }
        return acc;
      }, [])
  );

  traitements.sort((a, b) => {
    return new Date(a.dateEnvoi) - new Date(b.dateEnvoi);
  });

  if (filters.status)
    traitements = traitements.filter(
      (tr) => String(tr.status) === String(filters.status)
    );

  // Count total documents based on filters
  const count = await Demande.countDocuments(userFilter);

  // Calculate total pages
  const totalPages = Math.ceil(count / parseInt(limit)); // Ensure that limit is parsed as an integer

  // Respond with processed data
  res.json({
    traitements,
    totalPages,
    currentPage: parseInt(page), // Ensure that page is parsed as an integer
  });
});

// @desc    Recuperer les elements de filter
// @route   GET /api/demandes/handle/filter
// @access  private
export const getFilterOptionsDemandes = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.id);

  // Aggregate unique options, demandeurs, and typeApps in a single pipeline
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
      // verfier est ce que le demandeur a deja fait une demande :
      const checkDemande = await Demande.findOne({
        demandeur: user._id,
        option: option._id,
        status: "en cours",
      });
      if (checkDemande && !option.shouldAskAnyTime) {
        res.status(400);
        throw new Error("Vous avez déjà demandé cette demande !");
      }
      // demande obj pour creer la demande dans mongodb:
      let demandeObj = {
        option: option._id,
        demandeur: user._id,
        contenu,
        dateDemande: new Date(),
      };
      // l'objet traitement signifie le process de la demande :
      let objTraitement = {
        dateEnvoi: new Date(),
      };

      // creer un obj pour avoir un filter de message :
      // les cas possible de traitement d'une demande et le message que le signataire doit recevoire :
      const filterMessage = {
        // proprietaire de donnees :
        pdd: " veuillez la traiter en tant que propriétaire de données",
        /*
         les cas possibles pour un chef de service ===>  :
                    - il peut etre juste un chef de service .
         */
        cds: " veuillez la traiter en tant que chef de service",
        /*
         les cas possibles pour un chef de departement ===>  :
                  - il peut etre juste un chef de departement .
                  - il peut un chef de service et chef de departement.     
         */
        cdd: " veuillez la traiter en tant que chef de derpatement",
        "cds.cdd":
          " veuillez la traiter en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et chef de derpatement",
        /*
         les cas possibles pour un autre utilisateur ===>  :
                    - il peut etre juste un autre utilisateur .
         */
        atr: ` veuillez la traiter en tant que ${option.autreResponsableTitre}`,
        /*
         les cas possibles pour un directeur ===>  :
                  - il peut etre juste un directeur hiarchique .
                  - il peut un chef de service et directeur hiarchique
                  - il peut un chef de departement et directeur hiarchique 
                  - il peut un chef de service, chef de departement et directeur hiarchique
                  - il peut un directeur hiarchique et un pdd
                  - il peut un chef de service, un directeur hiarchique et un pdd
                  - il peut un chef de departement, un directeur hiarchique et un pdd
                  - il peut un chef de service, chef de departement, un directeur hiarchique et un pdd
                  - il peut un directeur hiarchique et directeur de l'entite
                  - il peut un chef de service,directeur hiarchique et directeur de l'entite
                  - il peut un chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un chef de service, chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un directeur hiarchique, un pdd, et directeur de l'entite
                  - il peut un chef de service, un pdd, directeur hiarchique et directeur de l'entite
                  - il peut un chef de department, un pdd, directeur hiarchique et directeur de l'entite
         */
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

      const [code, userID] = await getTypeAppOnCreate(option._id, user._id);

      objTraitement.code = code;
      objTraitement.utilisateur = userID;

      demandeObj.traitement = [objTraitement];

      const demande = new Demande(demandeObj);
      await demande.save();
      await demande.populate("demandeur");

      // message pour que le signataires va recevoire :
      let messageContent = `<p> Une <a style='font-weight:bold' `;
      messageContent += `href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}/traitement/${demande.traitement[0]._id}">demande</a>`;
      messageContent += ` a été faite par <strong style='font-weight:bold'>${user.prenom.toLowerCase()}</strong> <strong style='font-weight:bold'>${user.nom.toLowerCase()}</strong>, `;
      messageContent += filterMessage[code] + "</p>";

      sendNotification(
        userID,
        messageContent,
        `Demande fait par ${user.prenom.toLowerCase()} ${user.nom.toLowerCase()}`
      );

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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
                      };
                      if (s === "dg") {
                        obj = {
                          code: "dg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          // date:trai
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
                          // date:trai
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

// @desc    Recuperer le status de traitement
// @route   PUT /api/demandes/:id/status/:idTraitement
// @access  private
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

// @desc    Approuver un traitemen de demande
// @route   PUT /api/demandes/:id/approuve/:idTraitement
// @access  private
export const approuverDemande = asyncHandler(async (req, res) => {
  let demande = await Demande.findById(req.params.id)
    .populate({
      path: "option",
      populate: {
        path: "service",
      },
    })
    .populate("demandeur");

  if (demande) {
    if (demande.status === "en cours") {
      // creer des obj's pour avoir un filter de message :
      // les cas possible de traitement d'une demande et le message que le demandeur doit recevoire :
      const demandeurFilterMessage = {
        // directeur generale :
        dg: " en tant que directeur général",
        // president directeur generale :
        pdg: " en tant que président directeur général",
        // proprietaire de donnees :
        pdd: " en tant que propriétaire de données",
        /*
         les cas possibles pour un chef de service ===>  :
                    - il peut etre juste un chef de service .
         */
        cds: " en tant que chef de service",
        /*
         les cas possibles pour un autre utilisateur ===>  :
                    - il peut etre juste un autre utilisateur .
         */
        atr: ` en tant que ${demande.option.autreResponsableTitre}`,
        /*
         les cas possibles pour un chef de departement ===>  :
                  - il peut etre juste un chef de departement .
                  - il peut un chef de service et chef de departement.     
         */
        cdd: " en tant que chef de derpatement",
        "cds.cdd": " en tant que chef de service et chef de derpatement",
        /*
         les cas possibles pour un directeur ===>  :
                  - il peut etre juste un directeur hiarchique .
                  - il peut un chef de service et directeur hiarchique
                  - il peut un chef de departement et directeur hiarchique 
                  - il peut un chef de service, chef de departement et directeur hiarchique
                  - il peut un directeur hiarchique et un pdd
                  - il peut un chef de service, un directeur hiarchique et un pdd
                  - il peut un chef de departement, un directeur hiarchique et un pdd
                  - il peut un chef de service, chef de departement, un directeur hiarchique et un pdd
                  - il peut un directeur hiarchique et directeur de l'entite
                  - il peut un chef de service,directeur hiarchique et directeur de l'entite
                  - il peut un chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un chef de service, chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un directeur hiarchique, un pdd, et directeur de l'entite
                  - il peut un chef de service, un pdd, directeur hiarchique et directeur de l'entite
                  - il peut un chef de department, un pdd, directeur hiarchique et directeur de l'entite
         */
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

      // les cas possible de traitement d'une demande et le message que le signataires doit recevoire :
      const signataireFilterMessage = {
        // directeur generale :
        dg: " veuillez l'approuvez ou la refusez en tant que directeur général",
        // president directeur generale :
        pdg: " veuillez l'approuvez ou la refusez en tant que président directeur général",
        // proprietaire de donnees :
        pdd: " veuillez l'approuvez ou la refusez en tant que propriétaire de données",
        /*
         les cas possibles pour un chef de service ===>  :
                    - il peut etre juste un chef de service .
         */
        cds: " veuillez l'approuvez ou la refusez en tant que chef de service",
        /*
         les cas possibles pour un autre utilisateur ===>  :
                    - il peut etre juste un autre utilisateur .
         */
        atr: ` veuillez l'approuvez ou la refusez en tant que ${demande.option.autreResponsableTitre}`,
        /*
         les cas possibles pour un chef de departement ===>  :
                  - il peut etre juste un chef de departement .
                  - il peut un chef de service et chef de departement.     
         */
        cdd: " veuillez l'approuvez ou la refusez en tant que chef de derpatement",
        "cds.cdd":
          " veuillez l'approuvez ou la refusez en tant que chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et chef de derpatement",
        /*
         les cas possibles pour un directeur ===>  :
                  - il peut etre juste un directeur hiarchique .
                  - il peut un chef de service et directeur hiarchique
                  - il peut un chef de departement et directeur hiarchique 
                  - il peut un chef de service, chef de departement et directeur hiarchique
                  - il peut un directeur hiarchique et un pdd
                  - il peut un chef de service, un directeur hiarchique et un pdd
                  - il peut un chef de departement, un directeur hiarchique et un pdd
                  - il peut un chef de service, chef de departement, un directeur hiarchique et un pdd
                  - il peut un directeur hiarchique et directeur de l'entite
                  - il peut un chef de service,directeur hiarchique et directeur de l'entite
                  - il peut un chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un chef de service, chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un directeur hiarchique, un pdd, et directeur de l'entite
                  - il peut un chef de service, un pdd, directeur hiarchique et directeur de l'entite
                  - il peut un chef de department, un pdd, directeur hiarchique et directeur de l'entite
         */
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

      // recuperer le traitement :
      let traitement = demande.traitement.find(
        (tr) => String(tr._id) === String(req.params.idTraitement)
      );

      if (traitement) {
        if (String(traitement.utilisateur) === String(req.user.id)) {
          if (traitement.status === "en cours") {
            // changer le status de traitement :
            for (let tr of demande.traitement) {
              if (String(tr._id) === String(req.params.idTraitement)) {
                tr.status = "approuve";
                tr.dateTraitement = new Date();
                break;
              }
            }

            // recuperer le type d'approubation et le signataire qui va signier
            const [nextCode, nextUserId] = await getNextTypeAppOnApp(
              demande.option._id,
              demande._id,
              traitement.code
            );

            let nextSignataire = await Utilisateur.findById(
              traitement.utilisateur
            );

            let messageDemandeur = `<p> Votre <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}">demande</a>`;
            messageDemandeur += ` a été approuvée par <b style='font-weight:bold'>${getCv(
              nextSignataire.civilite
            )}.</b>`;
            messageDemandeur += ` <b style='font-weight:bold'>${nextSignataire.prenom.toLowerCase()} ${nextSignataire.nom.toLowerCase()}</b> `;
            messageDemandeur += `${demandeurFilterMessage[traitement.code]}`;

            // verfier est ce que la demande a ete fini le traitement :
            if (nextCode === "fini") {
              messageDemandeur +=
                " et pour cela, tous les signataires possibles approuvent votre demande. votre demande est maintenant prête à être traitée par les utilisateurs concernés";
              demande.status = "approuve";
            } else {
              // envoyer la demande au signataire prochaine pour la traiter :
              demande.traitement.push({
                utilisateur: new mongoose.Types.ObjectId(nextUserId),
                dateEnvoi: new Date(),
                status: "en cours",
                code: nextCode,
              });
            }

            // sauvgarder le chnagement :
            await demande.save();

            messageDemandeur += "</p>";
            // envoyer le message au demandeur :
            sendNotification(
              demande.demandeur._id,
              messageDemandeur,
              `Votre demande a été approuvée`
            );

            // envoyer un email au chef de departement si le demandeur a demander une demande de prouction informatique:
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
              prodCddmessage += ` a été approuvée par son chef de service.  DAMI : ('<i>${demande.option.libelle}</i>')</p>`;

              const prodService = await Service.findById(
                demande.option.service._id
              ).populate("departement");

              sendNotification(
                prodService.departement.chefDeDepartement,
                prodCddmessage,
                `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
              );
            }

            // envoyer le message au signataire :
            if (nextCode !== "fini") {
              let codeIndex = Array.from(demande.traitement).findIndex(
                (cd) => String(cd.code) === String(nextCode)
              );
              let traitementItem = demande.traitement[codeIndex];
              if (traitementItem) {
                let messageSignataire = `<p>Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/details-demande/${demande._id}/traitement/${traitementItem._id}">demande</a>`;
                messageSignataire += ` a été faite par <b style='font-weight:bold'>${demande.demandeur.prenom.toLowerCase()}</b> <b style='font-weight:bold'>${demande.demandeur.nom.toLowerCase()}</b>, ${
                  signataireFilterMessage[nextCode]
                }</p>`;

                sendNotification(
                  nextUserId,
                  messageSignataire,
                  `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
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

              let optionPdd = await Utilisateur.findById(
                optionService.proprietaireDeDonnees
              );

              if (optionService && optionService.chefService) {
                let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                message += ` par <b style='font-weight:bold'>${getCv(
                  demande.demandeur.civilite
                )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en tant que chef de service, et votre service sera celui qui va traiter la DAMI. ('<i>${demande.option.libelle}</i>')</p>`;
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
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en tant que chef de departement, et votre departement sera celui qui va traiter la DAMI. ('<i>${demande.option.libelle}</i>')</p>`;
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
                message += ` a été approuvée par ses supérieurs et tous les signataires possibles. Veuillez traiter cette demande en propriétaire de données de la DAMI ('<i>${demande.option.libelle}</i>')</p>`;
                sendNotification(
                  optionPdd._id,
                  message,
                  `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                );
              }

              // Notifier le responsable de service magazin si un demandeur a demander 'DEMANDE D'UN PERIPHERIQUE INFORMATIQUE' || 'DEMANDE D'UN POSTE DE TRAVAIL INFORMATIQUE' :
              if (
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE D'UN PERIPHERIQUE INFORMATIQUE" ||
                String(demande.option.libelle).toUpperCase() ===
                  "E-DAMI - DEMANDE D'UN POSTE DE TRAVAIL INFORMATIQUE"
              ) {
                let serviceMagasin = await Service.findOne({
                  libelle: "SERVICE MAGAZIN A LA DIRECTION D'EQUIPEMENT",
                }).populate("chefService");

                if (serviceMagasin) {
                  let message = `<p> Une <a style='font-weight:bold' href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">demande</a> fait`;
                  message += ` par <b style='font-weight:bold'>${getCv(
                    demande.demandeur.civilite
                  )}.${demande.demandeur.prenom} ${demande.demandeur.nom}</b> `;
                  message += ` a été approuvée par ses supérieurs et tous les signataires possibles.  DAMI : ('<i>${demande.option.libelle}</i>')</p>`;
                  // recuperer le chef de service de magasin :
                  const chefServiceMagasin = await Utilisateur.findById(
                    serviceMagasin.chefService._id
                  );
                  // verfier est ce que l' utilisateur a un interim ou non :
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

              // CREER UN TICKET SUR ITOP :
              const chefDeService = await Utilisateur.findById(
                optionService.chefService
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
              // ...
              createItopTicket({
                title: demande.option.libelle,
                lien: `https://e-dami.snrt.ma/demandes/apercu/details/${demande._id}`,
                client_matricule: demande.demandeur.matricule,
                client_service: demandeurService ? demandeurService.uo : null,
                client_departement: demandeurDepartement
                  ? demandeurDepartement.uo
                  : null,
                client_direction: demandeurDirection
                  ? demandeurDirection.uo
                  : null,
                agent_service: optionService.uo,
                agent_matricule: chefDeService.matricule,
              });
            }

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

// @desc    Approuver un traitemen de demande
// @route   PUT /api/demandes/:id/refuse/:idTraitement
// @access  private
export const refuserDemande = asyncHandler(async (req, res) => {
  let demande = await Demande.findById(req.params.id).populate("option");
  if (demande) {
    if (demande.status === "en cours") {
      const traitement = demande.traitement.find(
        (tr) => String(tr._id) === String(req.params.idTraitement)
      );
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

              let signataireUser = await Utilisateur.findById(
                traitement.utilisateur
              );

              // ecrit le contenu de la notification selon le type d'approbation :
              // creer des obj's pour avoir un filter de message :
              // les cas possible de traitement d'une demande et le message que le demandeur doit recevoire :
              const demandeurFilterMessage = {
                // directeur generale :
                dg: " en tant que directeur général",
                // president directeur generale :
                pdg: " en tant que président directeur général",
                // proprietaire de donnees :
                pdd: " en tant que propriétaire de données",
                /*
         les cas possibles pour un chef de service ===>  :
                    - il peut etre juste un chef de service .
         */
                cds: " en tant que chef de service",
                /*
         les cas possibles pour un chef de departement ===>  :
                  - il peut etre juste un chef de departement .
                  - il peut un chef de service et chef de departement.     
         */
                cdd: " en tant que chef de derpatement",
                "cds.cdd":
                  " en tant que chef de service et chef de derpatement",
                /*
         les cas possibles pour un directeur ===>  :
                  - il peut etre juste un directeur hiarchique .
                  - il peut un chef de service et directeur hiarchique
                  - il peut un chef de departement et directeur hiarchique 
                  - il peut un chef de service, chef de departement et directeur hiarchique
                  - il peut un directeur hiarchique et un pdd
                  - il peut un chef de service, un directeur hiarchique et un pdd
                  - il peut un chef de departement, un directeur hiarchique et un pdd
                  - il peut un chef de service, chef de departement, un directeur hiarchique et un pdd
                  - il peut un directeur hiarchique et directeur de l'entite
                  - il peut un chef de service,directeur hiarchique et directeur de l'entite
                  - il peut un chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un chef de service, chef de departement, directeur hiarchique et directeur de l'entite
                  - il peut un directeur hiarchique, un pdd, et directeur de l'entite
                  - il peut un chef de service, un pdd, directeur hiarchique et directeur de l'entite
                  - il peut un chef de department, un pdd, directeur hiarchique et directeur de l'entite
         */
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
              messageDemandeur += ` <b style='font-weight:bold'>${signataireUser.prenom.toLowerCase()} ${signataireUser.nom.toLowerCase()}</b> `;
              messageDemandeur += `${demandeurFilterMessage[traitement.code]}`;
              messageDemandeur += `. <b style='font-weight:bold'>Motif de refus : </b> "${req.body.motif}"`;
              messageDemandeur += "</p>";
              sendNotification(
                demande.demandeur,
                messageDemandeur,
                `Votre demande a été refusée`
              );
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

// @desc    Recuperer le details d'une demande par ID
// @route   GET /api/demandes/:id
// @access  private
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
                      };
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

  res.json(demande);
});

// @desc    Recuperer les demandes pour appercu de superieur
// @route   GET /api/demandes/for/preview/team
// @access  private
export const getDemandesForPreview = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, ...filters } = req.query;
  let utilisateur = await Utilisateur.findById(req.user.id);
  if (utilisateur) {
    if (utilisateur.isDirecteur) {
      let demandes = await Demande.aggregate([
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
        {
          $sort: {
            dateDemande: -1,
          },
        },

        {
          $match: {
            "demandeur.direction": new mongoose.Types.ObjectId(
              utilisateur.direction
            ),
            "demandeur._id": {
              $ne: new mongoose.Types.ObjectId(utilisateur._id),
            },
          },
        },
      ]);
      res.json(demandes);
    } else if (utilisateur.isChefDeDepartement) {
      let demandes = await Demande.aggregate([
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
        {
          $sort: {
            dateDemande: -1,
          },
        },
        {
          $match: {
            "demandeur.departement": new mongoose.Types.ObjectId(
              utilisateur.departement
            ),
            "demandeur._id": {
              $ne: new mongoose.Types.ObjectId(utilisateur._id),
            },
          },
        },
      ]);
      res.json(demandes);
    } else if (utilisateur.isChefDeService) {
      let demandes = await Demande.aggregate([
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
        {
          $sort: {
            dateDemande: -1,
          },
        },
        {
          $match: {
            "demandeur.service": new mongoose.Types.ObjectId(
              utilisateur.service
            ),
            "demandeur._id": {
              $ne: new mongoose.Types.ObjectId(utilisateur._id),
            },
          },
        },
      ]);
      res.json(demandes);
    } else {
      res.status(400);
      throw new Error("vous n'a avez pas le droit de voire les demandes !");
    }
  } else {
    res.status(404);
    throw new Error("utilisateur introuvable !");
  }
});

// @desc    Recuperer details demande pour appercu de superieur
// @route   GET /api/demandes/for/preview/team/details/:id
// @access  private
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

    if (req.user.isDirecteur) {
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
                  // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
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
                // date:trai
              };
              if (s === "dg") {
                obj = {
                  code: "dg",
                  nom: traitementUtilisateur.nom,
                  prenom: traitementUtilisateur.prenom,
                  approuve: status === "approuve" ? true : false,
                  refuse: status === "refuse" ? true : false,
                  dateTraitement: dateTraitement,
                  // date:trai
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
                  // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
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
                        // date:trai
                      };
                      if (s === "dg") {
                        obj = {
                          code: "dg",
                          nom: traitementUtilisateur.nom,
                          prenom: traitementUtilisateur.prenom,
                          approuve: status === "approuve" ? true : false,
                          refuse: status === "refuse" ? true : false,
                          dateTraitement: dateTraitement,
                          // date:trai
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
                          // date:trai
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

// @desc    Recuperer les demandes pour appercu de superieur
// @route   GET /api/demandes/for/preview/team/all
// @access  private
export const getDemandesForPreviewAll = asyncHandler(async (req, res) => {
  let demandes = await Demande.aggregate([
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
    {
      $sort: {
        dateDemande: -1,
      },
    },

    {
      $match: {
        "demandeur._id": {
          $ne: new mongoose.Types.ObjectId(req.user.id),
        },
      },
    },
  ]);
  res.json(demandes);
});
