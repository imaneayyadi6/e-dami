import asyncHandler from "express-async-handler";
import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Demande from "../models/demandeModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import { sendNotification } from "../services/notificationService.js";
import mongoose from "mongoose";
import Departement from "../models/departementModel.js";

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
        .populate("option demandeur")
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
          acc.push({
            idDemande: demande._id,
            idTraitement: tr._id,
            code: tr.code,
            status: tr.status,
            dateEnvoi: tr.dateEnvoi,
            dateDemande: demande.dateDemande,
            demandeur: `${demande.demandeur.prenom} ${demande.demandeur.nom}`,
            option: demande.option.libelle,
          });
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
      const checkDemande = await Demande.findOne({
        demandeur: user._id,
        option: option._id,
        status: "en cours",
      });
      if (checkDemande) {
        res.status(400);
        throw new Error("vous avez deja demander cette demande !");
      } else {
        let code = "";
        let userID = "";
        let typeApp = "";
        // verification de code de signataires :
        if (option.signataires[0] === "cds") {
          const service = await Service.findById(user.service);
          if (service) {
            if (service.chefService) {
              userID = service.chefService;
              code = "cds";
              typeApp = "chef de service";
            } else {
              res.status(400);
              throw new Error("le service n'a pas de chef de service !");
            }
          } else {
            throw new Error("Vous n'appartenez à aucun service !");
          }
        } else if (option.signataires[0] === "cdd") {
          const departement = await Departement.findById(user.departement);
          if (departement) {
            if (departement.chefDeDepartement) {
              userID = departement.chefDeDepartement;
              code = "cdd";
              typeApp = "chef de departement";
            } else {
              res.status(400);
              throw new Error(
                "le departement n'a pas de chef de departement !"
              );
            }
          } else {
            throw new Error("vous n'avez pas de departement !");
          }
        } else if (option.signataires[0] === "hiq") {
          const direction = await Direction.findById(user.direction);
          if (direction) {
            if (direction.directeur) {
              userID = direction.directeur;
              if (
                option.signataires[1] === "pdd" &&
                option.signataires[2] === "dir"
              ) {
                const pddDirection = await Direction.findById(
                  String(option.proprietaireDeDonnees)
                );
                const dirDirection = await Direction.findById(
                  option.service.direction
                );
                if (dirDirection && pddDirection) {
                  if (
                    String(pddDirection.directeur) ===
                      String(direction.directeur) &&
                    String(dirDirection.directeur) ===
                      String(direction.directeur)
                  ) {
                    code = "hiq.pdd.dir";
                    typeApp =
                      "directeur hiérarchique, propriétaire de données et directeur de l'entité";
                  } else {
                    if (option.signataires[1] === "dir") {
                      const dirDirection = await Direction.findById(
                        option.service.direction
                      );
                      if (dirDirection) {
                        if (
                          String(dirDirection.directeur) ===
                          String(direction.directeur)
                        ) {
                          code = "hiq.dir";
                          typeApp =
                            "directeur hiérarchique et directeur de l'entité";
                        } else {
                          code = "hiq";
                          typeApp = "directeur hiérarchique";
                        }
                      } else {
                        res.status(400);
                        throw new Error("directeur de  l'entité introuvable !");
                      }
                    } else if (option.signataires[1] === "pdd") {
                      const pddDirection = await Direction.findById(
                        String(option.proprietaireDeDonnees)
                      );
                      if (pddDirection) {
                        if (
                          String(pddDirection.directeur) ===
                          String(direction.directeur)
                        ) {
                          code = "hiq.pdd";
                          typeApp =
                            "directeur hiérarchique et propriétaire de données";
                        } else {
                          code = "hiq";
                          typeApp = "directeur hiérarchique";
                        }
                      } else {
                        res.status(400);
                        throw new Error(
                          "proprietaire de donnees introuvable !"
                        );
                      }
                    } else {
                      code = "hiq";
                      typeApp = "directeur hiérarchique";
                    }
                  }
                } else {
                  if (!pddDirection) {
                    res.status(400);
                    throw new Error("proprietaire de donnees introuvable !");
                  }
                  if (!dirDirection) {
                    res.status(400);
                    throw new Error("directeur de  l'entité introuvable !");
                  }
                }
              } else {
                if (option.signataires[1] === "dir") {
                  const dirDirection = await Direction.findById(
                    option.service.direction
                  );
                  if (dirDirection) {
                    if (
                      String(dirDirection.directeur) ===
                      String(direction.directeur)
                    ) {
                      code = "hiq.dir";
                      typeApp =
                        "directeur hiérarchique et directeur de l'entité";
                    } else {
                      code = "hiq";
                      typeApp = "directeur hiérarchique";
                    }
                  } else {
                    res.status(400);
                    throw new Error("directeur de l'entité introuvable !");
                  }
                } else if (option.signataires[1] === "pdd") {
                  const pddDirection = await Direction.findById(
                    String(option.proprietaireDeDonnees)
                  );
                  if (pddDirection) {
                    if (
                      String(pddDirection.directeur) ===
                      String(direction.directeur)
                    ) {
                      code = "hiq.pdd";
                      typeApp =
                        "directeur hiérarchique et propriétaire de données";
                    } else {
                      code = "hiq";
                      typeApp = "directeur hiérarchique";
                    }
                  } else {
                    res.status(400);
                    throw new Error("proprietaire de donnees introuvable !");
                  }
                } else {
                  code = "hiq";
                  typeApp = "directeur hiérarchique";
                }
              }
            } else {
              res.status(400);
              throw new Error("la direction n'a pas de directeur !");
            }
          }
        } else {
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
        await demande.populate("demandeur");
        const messageContent = `<p>Une <a style='font-weight:bold' href="${
          process.env.CLIENT_ADDRESS
        }/details-demande/${demande._id}/traitement/${
          demande.traitement[0]._id
        }">demande</a> a été faite par ${user.prenom.toLowerCase()} ${user.nom.toLowerCase()}, veuillez la traiter en tant que ${typeApp} </p>`;
        sendNotification(
          userID,
          messageContent,
          `Demande fait par ${demande.demandeur.prenom} ${demande.demandeur.nom}`
        );
        res
          .status(201)
          .json({ message: "demande a été effectuée avec succès" });
      }
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

      let optionPDD = null;
      if (demande.option.proprietaireDeDonnees)
        optionPDD = await Direction.findById(
          demande.option.proprietaireDeDonnees
        ).populate("directeur");

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

          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;

            if (s === "cdd") {
              let departement = null;
              if (service && service.departement) {
                departement = await Departement.findById(
                  service.departement
                ).populate("chefDeDepartement");
              } else {
                let demandeur = await Utilisateur.findById(
                  demande.demandeur._id
                );

                if (demandeur) {
                  if (demandeur.isChefDeDepartement) {
                    departement = await Departement.findById(
                      demandeur.departement
                    ).populate("chefDeDepartement");
                    obj = {
                      code: "cdd",
                      nom: departement.chefDeDepartement.nom,
                      prenom: departement.chefDeDepartement.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    };
                  } else {
                    res.status(400);
                    throw new Error("departement introuvable !");
                  }
                } else {
                  res.status(400);
                  throw new Error("demadneur introuvable !");
                }
              }
            }

            if (s === "cds") {
              obj = {
                code: "cds",
                nom: service.chefService.nom,
                prenom: service.chefService.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              };
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
              };
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
              };
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
                      };
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
                      };
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
                      };
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
      // recuperer le traitement :
      const traitement = demande.traitement.find(
        (tr) => String(tr._id) === String(req.params.idTraitement)
      );

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
              }).populate("directeur");

              console.log(req.user.id);

              console.log("direction");

              if (direction) {
                if (crtfCode === "hiq.pdd") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}">demande</a> 
                  a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiarchique et propritaire de donnes `;
                }

                if (crtfCode === "pdd.dir") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}">demande</a> 
                  a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que propritaire de donnes et directeur de l entite`;
                }

                if (crtfCode === "hiq.dir") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}">demande</a> 
                  a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que directeur hiarchique et directeur de l entite`;
                }

                if (crtfCode === "hiq.pdd.dir") {
                  contenu = `<p>
                  Votre <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}">demande</a> 
                  a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiarchique, propritaire de donnes et directeur de l entite`;
                }
              } else {
                res.status(404);
                throw Error("direction introuvable !");
              }
            } else {
              if (crtfCode === "cds") {
                let service = await Service.findOne({
                  chefService: req.user.id,
                }).populate("chefService");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été approuvée par le chef de service ${service.libelle.toLowerCase()} en tant que votre chef de service`;
              } else if (crtfCode === "cdd") {
                let departement = await Departement.findOne({
                  chefDeDepartement: req.user.id,
                }).populate("chefDeDepartement");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été approuvée par le chef de departement ${departement.libelle.toLowerCase()} en tant que votre chef de departement`;
              } else if (crtfCode === "hiq") {
                let direction = await Direction.findOne({
                  directeur: req.user.id,
                }).populate("directeur");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiérarchique`;
              } else if (crtfCode === "pdd") {
                let direction = await Direction.findOne({
                  directeur: req.user.id,
                }).populate("directeur");

                contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que propriétaire de données`;
              } else if (crtfCode === "dir") {
                let direction = await Direction.findOne({
                  directeur: req.user.id,
                }).populate("directeur");
                contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été approuvée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que directeur de l'entité`;
              }
            }

            // envoyer le demande a un autre utilisateur pour la traiter :
            // est ce que le code traitement et muptiple ou non :
            const codeArr = traitement.code.split(".");
            if (codeArr.length > 1) {
              let code = codeArr[codeArr.length - 1];
              const codeIndex = demande.option.signataires.findIndex(
                (sg) => String(sg) === String(code)
              );
              if (codeIndex !== -1) {
                // finalise le traitement global de la demande :
                if (codeIndex + 1 === demande.option.signataires.length) {
                  demande.status = "approuve";
                  await demande.save();
                  contenu +=
                    " et pour cela, elle a été finalisée et approuvée avec succès </p>";
                  sendNotification(
                    demande.demandeur._id,
                    contenu,
                    `Votre demande a été approuvée et finalisée`
                  );
                  let supService = await Service.findById(
                    demande.option.service._id
                  );
                  let supDepratement = await Departement.findById(
                    demande.option.service.deparatement
                  );

                  let supContent = `une demande fait par ${demande.demandeur.prenom} ${demande.demandeur.nom} a été approuvée par ses supérieurs. Veuillez traiter cette demande. <b><a href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">details demande</a></b> `;
                  if (supService) {
                    sendNotification(
                      supService.chefService,
                      supContent,
                      "traitement de la demande"
                    );
                  }

                  if (supDepratement) {
                    sendNotification(
                      supDepratement.chefDeDepartement,
                      supContent,
                      "traitement de la demande"
                    );
                  }

                  res.json({ message: "demande approuve" });
                } else {
                  // verfication de qu'est le directeur qui va traiter cette demande selon le code:
                  let dirUserID = "";
                  let nextCode = demande.option.signataires[codeIndex + 1];

                  if (nextCode === "cdd") {
                    const departementID = await Utilisateur.findById(
                      req.user.id
                    ).departement;

                    const departement = await Departement.findById(
                      departementID
                    );
                    if (departement) {
                      dirUserID = departement.chefDeDepartement;
                      typeApp = `chef de departement`;
                    }
                  } else if (nextCode === "hiq") {
                    const directionID = await Utilisateur.findById(req.user.id)
                      .direction;
                    const direction = await Direction.findById(directionID);
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = `directeur hiérarchique`;
                    }
                  } else if (nextCode === "pdd") {
                    const direction = await Direction.findById(
                      String(demande.option.proprietaireDeDonnees)
                    );
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = "propriétaire de données";
                    }
                  } else if (nextCode === "dir") {
                    const service = await Service.findById(
                      demande.option.service
                    );
                    const direction = await Direction.findById(
                      String(service.direction)
                    );
                    if (direction) {
                      dirUserID = direction.directeur;
                      typeApp = "directeur de l'entité";
                    }
                  }

                  // envoyer le traitement :
                  demande.traitement.push({
                    utilisateur: dirUserID,
                    dateEnvoi: new Date(),
                    status: "en cours",
                    code: nextCode,
                  });

                  await demande.save();
                  await demande.populate("demandeur");
                  // envoyer les notifications :
                  contenu += "</p>";
                  sendNotification(
                    demande.demandeur._id,
                    contenu,
                    `Votre demande a été approuvée`
                  );
                  let dirContenu = `<p>Une <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}/traitement/${
                    demande.traitement[codeIndex]._id
                  }">demande</a> a été faite par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}, veuillez la traiter en tant que ${typeApp}</p>`;
                  sendNotification(
                    dirUserID,
                    dirContenu,
                    `Demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}`
                  );

                  res.json(demande);
                }
              } else {
                res.status(500);
                throw new Error("pas de code !");
              }
            } else {
              const codeIndex = demande.option.signataires.findIndex(
                (sg) => String(sg) === String(traitement.code)
              );
              if (codeIndex !== -1) {
                // finalise le traitement global de la demande :
                if (codeIndex + 1 === demande.option.signataires.length) {
                  demande.status = "approuve";
                  await demande.save();
                  contenu +=
                    " et pour cela, elle a été finalisée et approuvée avec succès </p>";
                  sendNotification(
                    demande.demandeur._id,
                    contenu,
                    `Votre demande a été approuvée`
                  );

                  let supService = await Service.findById(
                    demande.option.service._id
                  );
                  let supDepratement = await Departement.findById(
                    demande.option.service.departement
                  );

                  let supContent = `une demande fait par ${demande.demandeur.prenom} ${demande.demandeur.nom} a été approuvée par ses supérieurs. Veuillez traiter cette demande. <b><a href="${process.env.CLIENT_ADDRESS}/demandes/apercu/details/${demande._id}">details demande</a></b> `;
                  if (supService) {
                    sendNotification(
                      supService.chefService,
                      supContent,
                      "traitement de la demande"
                    );
                  }

                  if (supDepratement) {
                    sendNotification(
                      supDepratement.chefDeDepartement,
                      supContent,
                      "traitement de la demande"
                    );
                  }

                  res.json({ message: "demande approuve " });
                } else {
                  // verfication de qu'est le directeur qui va traiter cette demande selon le code :
                  let dirUserID = "";
                  let nextCode1 = demande.option.signataires[codeIndex + 1];
                  let envCode = "";
                  if (nextCode1) {
                    if (nextCode1 === "cdd") {
                      console.log(
                        JSON.parse(
                          JSON.stringify(
                            await Utilisateur.findById(demande.demandeur._id)
                          )
                        )
                      );

                      const departementID = JSON.parse(
                        JSON.stringify(
                          await Utilisateur.findById(demande.demandeur._id)
                        )
                      ).departement;

                      const deparatement = await Departement.findById(
                        departementID
                      );

                      console.log("dep :", JSON.stringify(deparatement));

                      if (deparatement) {
                        dirUserID = deparatement.chefDeDepartement;
                        typeApp = "chef de departement";
                        envCode = "cdd";
                      } else {
                        res.status(404);
                        throw Error("deparatement introuvable !");
                      }
                    } else if (nextCode1 === "hiq") {
                      const directionID = JSON.parse(
                        JSON.stringify(
                          await Utilisateur.findById(demande.demandeur._id)
                        )
                      ).direction;

                      const hiqDirection = await Direction.findById(
                        directionID
                      );

                      if (hiqDirection) {
                        let nextCode2 =
                          demande.option.signataires[codeIndex + 2];
                        if (nextCode2) {
                          if (nextCode2 === "pdd") {
                            const pddDirection = await Direction.findById(
                              String(demande.option.proprietaireDeDonnees)
                            );
                            if (pddDirection) {
                              if (
                                String(hiqDirection._id) ===
                                String(pddDirection._id)
                              ) {
                                let nextCode3 =
                                  demande.option.signataires[codeIndex + 3];
                                if (nextCode3) {
                                  if (nextCode3 === "dir") {
                                    const service = await Service.findById(
                                      demande.option.service
                                    );
                                    const dirDirection =
                                      await Direction.findById(
                                        String(service.direction)
                                      );
                                    if (dirDirection) {
                                      if (
                                        String(hiqDirection._id) ===
                                        String(dirDirection._id)
                                      ) {
                                        dirUserID = hiqDirection.directeur;
                                        typeApp =
                                          "directeur hiérarchique, propriétaire de données et directeur de l'entité ";
                                        envCode = "hiq.pdd.dir";
                                      } else {
                                        dirUserID = hiqDirection.directeur;
                                        typeApp =
                                          "directeur hiérarchique et propriétaire de données";
                                        envCode = "hiq.pdd";
                                      }
                                    } else {
                                      res.status(404);
                                      throw Error("direction introuvable !");
                                    }
                                  } else {
                                    dirUserID = hiqDirection.directeur;
                                    typeApp =
                                      "directeur hiérarchique et propriétaire de données";
                                    envCode = "hiq.pdd";
                                  }
                                } else {
                                  dirUserID = hiqDirection.directeur;
                                  typeApp =
                                    "directeur hiérarchique et propriétaire de données";
                                  envCode = "hiq.pdd";
                                }
                              } else {
                                dirUserID = hiqDirection.directeur;
                                typeApp = "directeur hiérarchique";
                                envCode = "hiq";
                              }
                            } else {
                              res.status(404);
                              throw Error("direction introuvable !");
                            }
                          } else if (nextCode2 === "dir") {
                            const service = await Service.findById(
                              demande.option.service
                            );
                            const dirDirection = await Direction.findById(
                              String(service.direction)
                            );
                            if (dirDirection) {
                              dirUserID = hiqDirection.directeur;
                              typeApp =
                                "directeur hiérarchique et directeur de l'entité";
                              envCode = "hiq.dir";
                            } else {
                              res.status(404);
                              throw Error("direction introuvable !");
                            }
                          } else {
                            dirUserID = hiqDirection.directeur;
                            typeApp = "directeur hiérarchique";
                            envCode = "hiq";
                          }
                        } else {
                          dirUserID = hiqDirection.directeur;
                          typeApp = "directeur hiérarchique";
                          envCode = "hiq";
                        }
                      } else {
                        res.status(404);
                        throw Error("direction introuvable !");
                      }
                    } else if (nextCode1 === "pdd") {
                      const pddDirection = await Direction.findById(
                        String(demande.option.proprietaireDeDonnees)
                      );
                      if (pddDirection) {
                        let nextCode2 =
                          demande.option.signataires[codeIndex + 2];
                        if (nextCode2) {
                          if (nextCode2 === "dir") {
                            const service = await Service.findById(
                              demande.option.service
                            );
                            const dirDirection = await Direction.findById(
                              service.direction
                            );
                            if (dirDirection) {
                              if (
                                String(pddDirection._id) ===
                                String(dirDirection._id)
                              ) {
                                dirUserID = pddDirection.directeur;
                                typeApp =
                                  "propriétaire de données et directeur de l'entité ";
                                envCode = "pdd.dir";
                              } else {
                                dirUserID = pddDirection.directeur;
                                typeApp = "propriétaire de données";
                                envCode = "pdd";
                              }
                            } else {
                              res.status(404);
                              throw Error("direction introuvable !");
                            }
                          } else {
                            dirUserID = pddDirection.directeur;
                            typeApp = "propriétaire de données";
                            envCode = "pdd";
                          }
                        } else {
                          dirUserID = pddDirection.directeur;
                          typeApp = "propriétaire de données";
                          envCode = "pdd";
                        }
                      } else {
                        res.status(404);
                        throw Error("direction introuvable !");
                      }
                    } else if (nextCode1 === "dir") {
                      const service = await Service.findById(
                        demande.option.service
                      );
                      const direction = await Direction.findById(
                        String(service.direction)
                      );
                      if (direction) {
                        dirUserID = direction.directeur;
                        typeApp = "directeur de l'entité";
                        envCode = "dir";
                      }
                    }
                    // envoyer le traitement :
                    demande.traitement.push({
                      utilisateur: dirUserID,
                      dateEnvoi: new Date(),
                      status: "en cours",
                      code: envCode,
                    });
                  }
                  await demande.save();
                  contenu += "</p>";
                  // envoyer les notifications :
                  sendNotification(
                    demande.demandeur._id,
                    contenu,
                    `Votre demande a été approuvée`
                  );
                  let dirContenu = `<p>Une <a style='font-weight:bold' href="${
                    process.env.CLIENT_ADDRESS
                  }/details-demande/${demande._id}/traitement/${
                    demande.traitement[codeIndex + 1]._id
                  }">demande</a> a été faite par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}, veuillez la traiter en tant que ${typeApp}</p>`;
                  sendNotification(
                    dirUserID,
                    dirContenu,
                    `Une demande fait par ${demande.demandeur.prenom.toLowerCase()} ${demande.demandeur.nom.toLowerCase()}.`
                  );
                  res.json({ message: "demande approvee avec success !" });
                }
              } else {
                res.status(500);
                throw new Error("pas de code !");
              }
            }
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
              let crtfCode = null;
              for (let tr of demande.traitement) {
                if (String(tr._id) === String(req.params.idTraitement)) {
                  crtfCode = tr.code;
                  tr.motifRefus = req.body.motif;
                  tr.status = "refuse";
                  tr.dateTraitement = new Date();
                  break;
                }
              }

              demande.status = "refuse";
              await demande.save();
              let contenu = "";
              // ecrit le contenu de la notification selon le type d'approbation :
              const arrCrtCode = crtfCode.split(".");
              if (arrCrtCode.length > 1) {
                const direction = await Direction.findOne({
                  directeur: req.user.id,
                }).populate("directeur");

                if (direction) {
                  if (crtfCode === "hiq.pdd") {
                    contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiarchique et propritaire de données. motif de refus: ${
                      req.body.motif
                    } </p>`;
                  }

                  if (crtfCode === "pdd.dir") {
                    contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que propritaire de donnes et directeur de l'entité. motif de refus: ${
                      req.body.motif
                    } </p>`;
                  }

                  if (crtfCode === "hiq.dir") {
                    contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que directeur hiarchique et directeur de l'entite. motif de refus: ${
                      req.body.motif
                    } </p>`;
                  }

                  if (crtfCode === "hiq.pdd.dir") {
                    contenu = `<p>
                    Votre <a style='font-weight:bold' href="${
                      process.env.CLIENT_ADDRESS
                    }/details-demande/${demande._id}">demande</a> 
                    a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiarchique, propritaire de données et directeur de l'entite. motif de refus: ${
                      req.body.motif
                    } </p>`;
                  }
                } else {
                  res.status(404);
                  throw Error("direction introuvable !");
                }
              } else {
                if (crtfCode === "cds") {
                  let service = await Service.findOne({
                    chefService: req.user.id,
                  }).populate("chefService");

                  contenu = `<p>
                      Votre <a style='font-weight:bold' href="${
                        process.env.CLIENT_ADDRESS
                      }/details-demande/${demande._id}">demande</a> 
                      a été refusée par le chef de service ${service.libelle.toLowerCase()} en tant que votre chef de service. motif de refus: ${
                    req.body.motif
                  } </p>`;
                } else if (crtfCode === "cdd") {
                  let departement = await Departement.findOne({
                    chefDeDepartement: req.user.id,
                  }).populate("chefDeDepartement");

                  contenu = `<p>
                      Votre <a style='font-weight:bold' href="${
                        process.env.CLIENT_ADDRESS
                      }/details-demande/${demande._id}">demande</a> 
                      a été refusée par le chef de service ${departement.libelle.toLowerCase()} en tant que votre chef de departement. motif de refus: ${
                    req.body.motif
                  } </p>`;
                } else if (crtfCode === "hiq") {
                  let direction = await Direction.findOne({
                    directeur: req.user.id,
                  }).populate("directeur");

                  contenu = `<p>
                      Votre <a style='font-weight:bold' href="${
                        process.env.CLIENT_ADDRESS
                      }/details-demande/${demande._id}">demande</a> 
                      a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que votre directeur hiérarchique. motif de refus: ${
                    req.body.motif
                  } </p>`;
                } else if (crtfCode === "pdd") {
                  let direction = await Direction.findOne({
                    directeur: req.user.id,
                  }).populate("directeur");

                  contenu = `<p>
                      Votre <a style='font-weight:bold' href="${
                        process.env.CLIENT_ADDRESS
                      }/details-demande/${demande._id}">demande</a> 
                      a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que propriétaire de données. motif de refus: ${
                    req.body.motif
                  } </p>`;
                } else if (crtfCode === "dir") {
                  let direction = await Direction.findOne({
                    directeur: req.user.id,
                  }).populate("directeur");
                  contenu = `<p>
                      Votre <a style='font-weight:bold' href="${
                        process.env.CLIENT_ADDRESS
                      }/details-demande/${demande._id}">demande</a> 
                      a été refusée par le directeur de la direction '${direction.libelle.toLowerCase()}' en tant que directeur de l'entité. motif de refus: ${
                    req.body.motif
                  } </p>`;
                }
              }

              sendNotification(
                demande.demandeur,
                contenu,
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
      const direction = await Direction.findById(
        demande.demandeur.direction
      ).populate("directeur");
      const optionService = await Service.findById(
        demande.option.service
      ).populate("chefService");

      let optionPDD = null;
      if (demande.option.proprietaireDeDonnees)
        optionPDD = await Direction.findById(
          demande.option.proprietaireDeDonnees
        ).populate("directeur");

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
          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;
            if (s === "cds") {
              obj = {
                code: "cds",
                nom: service.nom,
                prenom: service.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              };
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
              };
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
              };
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

                  if (status && status !== "en cours") {
                    let dateTraitement = traitement.dateTraitement;

                    if (item === "cds") {
                      obj = {
                        code: "cds",
                        nom: service.nom,
                        prenom: service.prenom,
                        approuve: status === "approuve" ? true : false,
                        refuse: status === "refuse" ? true : false,
                        dateTraitement: dateTraitement,
                        // date:trai
                      };
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
                      };
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
                      };
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
  let demande = await Demande.findOne({
    _id: req.params.id,
  })

    .populate({
      path: "option",
      populate: {
        path: "service",
      },
    })
    .populate("demandeur");

  if (demande) {
    let isChefDeService = false;
    let isChefDeDepartement = false;
    let isDirecteur = false;

    if (req.user.isChefDeService) {
      let service = await Service.findOne(req.user.service);
      if (service && String(demande.demandeur.service) === String(service._id))
        isChefDeService = true;
    }
    if (req.user.isChefDeDepartement) {
      let departement = await Departement.findOne(req.user.departement);
      if (
        departement &&
        String(demande.demandeur.departement) === String(departement._id)
      )
        isChefDeDepartement = true;
    }

    if (req.user.isDirecteur) {
      let direction = await Direction.findOne(req.user.direction);
      if (
        direction &&
        String(demande.demandeur.direction) === String(direction._id)
      )
        isDirecteur = true;
    }

    let supService = await Service.findById(demande.option.service._id);
    let supDepratement = await Service.findById(
      demande.option.service.deparatement
    );

    if (
      isChefDeService ||
      isChefDeDepartement ||
      isDirecteur ||
      supService ||
      supDepratement
    ) {
      demande = JSON.parse(JSON.stringify(demande));
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

      let optionPDD = null;
      if (demande.option.proprietaireDeDonnees)
        optionPDD = await Direction.findById(
          demande.option.proprietaireDeDonnees
        ).populate("directeur");

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

          if (status && status !== "en cours") {
            let dateTraitement = traitement.dateTraitement;

            if (s === "cdd") {
              let departement = null;
              if (service && service.departement) {
                departement = await Departement.findById(
                  service.departement
                ).populate("chefDeDepartement");
              } else {
                let demandeur = await Utilisateur.findById(
                  demande.demandeur._id
                );

                if (demandeur) {
                  if (demandeur.isChefDeDepartement) {
                    departement = await Departement.findById(
                      demandeur.departement
                    ).populate("chefDeDepartement");
                    obj = {
                      code: "cdd",
                      nom: departement.chefDeDepartement.nom,
                      prenom: departement.chefDeDepartement.prenom,
                      approuve: status === "approuve" ? true : false,
                      refuse: status === "refuse" ? true : false,
                      dateTraitement: dateTraitement,
                      // date:trai
                    };
                  } else {
                    res.status(400);
                    throw new Error("departement introuvable !");
                  }
                } else {
                  res.status(400);
                  throw new Error("demadneur introuvable !");
                }
              }
            }

            if (s === "cds") {
              obj = {
                code: "cds",
                nom: service.chefService.nom,
                prenom: service.chefService.prenom,
                approuve: status === "approuve" ? true : false,
                refuse: status === "refuse" ? true : false,
                dateTraitement: dateTraitement,
                // date:trai
              };
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
              };
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
              };
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
                      };
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
                      };
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
                      };
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

      res.json(demande);
    } else {
      res.status(400);
      throw new Error("vous n'avez pas le droit de consulter cette demande !");
    }
  } else {
    res.status(404);
    throw new Error("demande introuvable");
  }

  res.json(demande);
});
