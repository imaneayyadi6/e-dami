import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import Demande from "../models/demandeModel.js";

export const getTypeAppOnCreate = async (optionId, userId) => {
  const option = await Option.findById(optionId).populate("service");
  const user = await Utilisateur.findById(userId);

  if (!option) {
    throw new Error("Option introuvable !");
  }

  if (!user) {
    throw new Error("Utilisateur introuvable !");
  }

  let code = "";
  let userID = "";

  // verfication de signataires (qui va signer le premier) :
  // verfication des cas possibles :

  /* ##################### CAS CHEF DE SERVICE ##################### */
  if (Array.from(option.signataires)[0] === "cds") {
    const demandeurService = await Service.findById(user.service);
    // si l'utilisateur a un service et son chef de service :
    if (demandeurService && demandeurService.chefService) {
      userID = demandeurService.chefService;
      code = "cds";
    } else {
      // si l'utilisateur n'a un service ou son chef de service :
      // envoyer la demande a son chef de departement :
      if (Array.from(option.signataires)[1] === "cdd") {
        let demandeurDepartement = await Departement.findById(user.departement);
        if (demandeurDepartement && demandeurDepartement.chefDeDepartement) {
          // verifier si le chef de departement et un pdd ou non :
          userID = demandeurDepartement.chefDeDepartement;
          code = "cds.cdd";
        }
        // si l'utilisateur n'a un departement ou son chef de departement :
        // envoyer la demande a son directeur :
        else if (Array.from(option.signataires)[2] === "hiq") {
          const demandeurDirection = await Direction.findById(user.direction);
          if (demandeurDirection && demandeurDirection.directeur) {
            // verfier est ce qu'il est un proprietaire de donnes :
            if (Array.from(option.signataires)[3] === "pdd") {
              let utilisateurPdd = await Utilisateur.findById(
                option.proprietaireDeDonnees
              );
              if (utilisateurPdd) {
                if (
                  String(utilisateurPdd._id) ===
                  String(demandeurDirection.directeur)
                ) {
                  userID = utilisateurPdd._id;
                  code = "cds.cdd.hiq.pdd";
                } else {
                  userID = demandeurDirection.directeur;
                  code = "cds.cdd.hiq";
                }
              } else {
                throw new Error(
                  "utilisateur proprietaire de donnees introuvable !"
                );
              }
            } else {
              // verifier le directeur hiarchique est ce qu'il est un directeur de l'entite  :
              if (Array.from(option.signataires)[3] === "dir") {
                const entiteDirection = await Direction.findById(
                  option.service.direction
                );
                if (entiteDirection) {
                  if (
                    entiteDirection.directeur &&
                    String(entiteDirection.directeur) ===
                      String(demandeurDirection.directeur)
                  ) {
                    userID = entiteDirection.directeur;
                    code = "cds.cdd.hiq.dir";
                  } else {
                    userID = demandeurDirection.directeur;
                    code = "cds.cdd.hiq";
                  }
                } else {
                  userID = demandeurDirection.directeur;
                  code = "cds.cdd.hiq";
                }
              } else {
              }
            }
          } else {
            throw new Error("demandeur n'a pas une direction ou un directeur");
          }
        }
        // envoyer la demande a son directeur hiarchique :
      } else if (Array.from(option.signataires)[1] === "hiq") {
        const demandeurDirection = await Direction.findById(user.direction);
        if (demandeurDirection && demandeurDirection.directeur) {
          // verfier si le directeur hiarchique est un pdd :
          if (Array.from(option.signataires)[2] === "pdd") {
            let utilisateurPdd = await Utilisateur.findById(
              option.proprietaireDeDonnees
            );
            if (utilisateurPdd) {
              if (
                String(utilisateurPdd._id) ===
                String(demandeurDirection.directeur)
              ) {
                // verfier si le directeur hiarchique est un pdd et directur de l'entite :
                const entiteDirection = await Direction.findById(
                  option.service.direction
                );
                if (entiteDirection) {
                  if (
                    entiteDirection.directeur &&
                    String(entiteDirection.directeur) ===
                      String(demandeurDirection.directeur)
                  ) {
                    userID = entiteDirection.directeur;
                    code = "cds.hiq.pdd.dir";
                  } else {
                    userID = utilisateurPdd._id;
                    code = "cds.hiq.pdd";
                  }
                } else {
                  throw new Error("option (DAMI) n'a pas de direction !!!!");
                }
              } else {
                userID = demandeurDirection.directeur;
                code = "cds.hiq";
              }
            } else {
              throw new Error(
                "utilisateur proprietaire de donnees introuvable !"
              );
            }
          } else {
            if (Array.from(option.signataires)[2] === "dir") {
              const entiteDirection = await Direction.findById(
                option.service.direction
              );
              if (entiteDirection) {
                if (
                  entiteDirection.directeur &&
                  String(entiteDirection.directeur) ===
                    String(demandeurDirection.directeur)
                ) {
                  userID = entiteDirection.directeur;
                  code = "cds.hiq.dir";
                } else {
                  userID = demandeurDirection.directeur;
                  code = "cds.hiq";
                }
              } else {
                userID = demandeurDirection.directeur;
                code = "cds.hiq";
              }
            } else {
              userID = demandeurDirection.directeur;
              code = "cds.hiq";
            }
          }
        } else {
          throw new Error("demandeur n'a pas une direction ou un directeur");
        }
      }
    }
  } else if (Array.from(option.signataires)[0] === "cdd") {
    /* ##################### CAS CHEF DE DEPARTEMENT ##################### */
    let demandeurDepartement = await Departement.findById(user.departement);
    if (demandeurDepartement && demandeurDepartement.chefDeDepartement) {
      // verifier si le chef de departement et un pdd ou non :
      userID = demandeurDepartement.chefDeDepartement;
      code = "cdd";
    }
    // si l'utilisateur n'a un departement ou son chef de departement :
    // envoyer la demande a son directeur :
    else if (Array.from(option.signataires)[1] === "hiq") {
      const demandeurDirection = await Direction.findById(user.direction);
      if (demandeurDirection && demandeurDirection.directeur) {
        // verfier est ce qu'il est un proprietaire de donnes :
        if (Array.from(option.signataires)[2] === "pdd") {
          let utilisateurPdd = await Utilisateur.findById(
            option.proprietaireDeDonnees
          );
          if (utilisateurPdd) {
            if (
              String(utilisateurPdd._id) ===
              String(demandeurDirection.directeur)
            ) {
              if (Array.from(option.signataires)[3] == "dir") {
                const entiteDirection = await Direction.findById(
                  option.service.direction
                );
                if (entiteDirection) {
                  if (
                    entiteDirection.directeur &&
                    String(entiteDirection.directeur) ===
                      String(demandeurDirection.directeur)
                  ) {
                    userID = entiteDirection.directeur;
                    code = "cdd.hiq.pdd.dir";
                  } else {
                    userID = utilisateurPdd._id;
                    code = "cdd.hiq.pdd";
                  }
                } else {
                  userID = utilisateurPdd._id;
                  code = "cdd.hiq.pdd";
                }
              } else {
                userId = utilisateurPdd._id;
                code = "cdd.hiq.pdd";
              }
            } else {
              userID = demandeurDirection.directeur;
              code = "cdd.hiq";
            }
          } else {
            throw new Error(
              "utilisateur proprietaire de donnees introuvable !"
            );
          }
        } else {
          // verifier le directeur hiarchique est ce qu'il est un directeur de l'entite  :
          if (Array.from(option.signataires)[2] === "dir") {
            const entiteDirection = await Direction.findById(
              option.service.direction
            );
            if (entiteDirection) {
              if (
                entiteDirection.directeur &&
                String(entiteDirection.directeur) ===
                  String(demandeurDirection.directeur)
              ) {
                userID = entiteDirection.directeur;
                code = "cdd.hiq.dir";
              } else {
                userID = demandeurDirection.directeur;
                code = "cdd.hiq";
              }
            } else {
              userID = demandeurDirection.directeur;
              code = "cdd.hiq";
            }
          } else {
          }
        }
      } else {
        throw new Error("demandeur n'a pas une direction ou un directeur");
      }
    }
  } else if (Array.from(option.signataires)[0] === "hiq") {
    /* ##################### CAS DIRECTEUR HIARCHIQUE ##################### */
    const demandeurDirection = await Direction.findById(user.direction);
    if (demandeurDirection && demandeurDirection.directeur) {
      // verfier est ce qu'il est un proprietaire de donnes :
      if (Array.from(option.signataires)[1] === "pdd") {
        let utilisateurPdd = await Utilisateur.findById(
          option.proprietaireDeDonnees
        );
        if (utilisateurPdd) {
          if (
            String(utilisateurPdd._id) === String(demandeurDirection.directeur)
          ) {
            if (Array.from(option.signataires)[2] == "dir") {
              const entiteDirection = await Direction.findById(
                option.service.direction
              );
              if (entiteDirection) {
                if (
                  entiteDirection.directeur &&
                  String(entiteDirection.directeur) ===
                    String(demandeurDirection.directeur)
                ) {
                  userID = entiteDirection.directeur;
                  code = "hiq.pdd.dir";
                } else {
                  userID = utilisateurPdd._id;
                  code = "hiq.pdd";
                }
              } else {
                userID = utilisateurPdd._id;
                code = "hiq.pdd";
              }
            } else {
              userId = utilisateurPdd._id;
              code = "hiq.pdd";
            }
          } else {
            userID = demandeurDirection.directeur;
            code = "hiq";
          }
        } else {
          throw new Error("utilisateur proprietaire de donnees introuvable !");
        }
      } else {
        // verifier le directeur hiarchique est ce qu'il est un directeur de l'entite  :
        if (Array.from(option.signataires)[1] === "dir") {
          const entiteDirection = await Direction.findById(
            option.service.direction
          );
          if (entiteDirection) {
            if (
              entiteDirection.directeur &&
              String(entiteDirection.directeur) ===
                String(demandeurDirection.directeur)
            ) {
              userID = entiteDirection.directeur;
              code = "hiq.dir";
            } else {
              userID = demandeurDirection.directeur;
              code = "hiq";
            }
          } else {
            userID = demandeurDirection.directeur;
            code = "hiq";
          }
        } else {
        }
      }
    } else {
      throw new Error("demandeur n'a pas une direction ou un directeur");
    }
  }

  return [code, String(userID)];
};

export const getNextTypeAppOnApp = async (optionId, demandeId, code) => {
  const option = await Option.findById(optionId).populate("service");
  const demande = await Demande.findById(demandeId).populate("demandeur");

  const utilisateur = await Utilisateur.findById(demande.demandeur._id);

  if (!option) throw new Error("option introuvable !");

  if (!demande) throw new Error("demande introuvable !");

  if (!utilisateur) throw new Error("utilisateur introuvable !");

  const demandeurDepartement = await Departement.findById(
    utilisateur.departement
  );

  const demandeurDirection = await Direction.findById(utilisateur.direction);

  const utilisateurPdd = await Utilisateur.findById(
    option.proprietaireDeDonnees
  );
  const directionEntite = await Direction.findById(option.service.direction);

  if (!utilisateurPdd)
    throw new Error("utilisateur proprietaire de données introuvable !");

  if (!directionEntite) throw new Error("option n'a pas direction (entite) !");

  let nextCode = "";
  let nextUserId = "";
  let arrayCode = code.split(".");

  if (arrayCode.length > 1) {
    const lastArrayCode = arrayCode[arrayCode.length - 1];
    const nextCodeIndex = Array.from(option.signataires).findIndex(
      (codeItem) => codeItem === lastArrayCode
    );
    if (Array.from(option.signataires)[nextCodeIndex + 1] === undefined) {
      nextCode = "fini";
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "cdd") {
      if (demandeurDepartement && demandeurDepartement.chefDeDepartement) {
        nextCode = "cdd";
        nextUserId = demandeurDepartement.chefDeDepartement;
      } else {
        if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "pdd" &&
          Array.from(option.signataires)[nextCodeIndex + 4] === "dir"
        ) {
          if (
            String(demandeurDirection.directeur) ===
              String(utilisateurPdd._id) &&
            String(demandeurDirection.directeur) ===
              String(directionEntite.directeur)
          ) {
            nextCode = "cdd.hiq.pdd.dir";
            nextUserId = demandeurDirection.directeur;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "pdd"
        ) {
          if (
            String(demandeurDirection.directeur) === String(utilisateurPdd._id)
          ) {
            nextCode = "cdd.hiq.pdd";
            nextUserId = utilisateurPdd._id;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "dir"
        ) {
          if (
            String(demandeurDirection.directeur) ===
            String(directionEntite.directeur)
          ) {
            nextCode = "cdd.hiq.dir";
            nextUserId = directionEntite.directeur;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq"
        ) {
          nextCode = "cdd.hiq";
          nextUserId = demandeurDirection.directeur;
        }
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "hiq") {
      if (
        Array.from(option.signataires)[nextCodeIndex + 2] === "pdd" &&
        Array.from(option.signataires)[nextCodeIndex + 3] === "dir"
      ) {
        if (
          String(demandeurDirection.directeur) === String(utilisateurPdd._id) &&
          String(demandeurDirection.directeur) ===
            String(directionEntite.directeur)
        ) {
          nextCode = "hiq.pdd.dir";
          nextUserId = demandeurDirection.directeur;
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "dir") {
        if (
          String(demandeurDirection.directeur) ===
          String(directionEntite.directeur)
        ) {
          nextCode = "hiq.dir";
          nextUserId = directionEntite.directeur;
        }
      } else {
        nextCode = "hiq";
        nextUserId = demandeurDirection.directeur;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdd") {
      if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
        if (String(utilisateurPdd._id) === String(directionEntite.directeur)) {
          nextCode = "pdd.dir";
          nextUserId = directionEntite.directeur;
        }
      } else {
        nextCode = "pdd";
        nextUserId = utilisateurPdd._id;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
      nextCode = "dir";
      nextUserId = demandeurDirection.directeur;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dg") {
      const dgUtilisateur = await Utilisateur.findOne({
        fonction: "directeur général",
      });
      nextCode = "dg";
      nextUserId = dgUtilisateur._id;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdg") {
      const pdgUtilisateur = await Utilisateur.findOne({
        fonction: "président directeur général",
      });
      nextCode = "pdg";
      nextUserId = pdgUtilisateur._id;
    }
  } else {
    const nextCodeIndex = Array.from(option.signataires).findIndex(
      (codeItem) => codeItem === code
    );
    if (Array.from(option.signataires)[nextCodeIndex + 1] === undefined) {
      nextCode = "fini";
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "cdd") {
      if (demandeurDepartement && demandeurDepartement.chefDeDepartement) {
        nextCode = "cdd";
        nextUserId = demandeurDepartement.chefDeDepartement;
      } else {
        if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "pdd" &&
          Array.from(option.signataires)[nextCodeIndex + 4] === "dir"
        ) {
          if (
            String(demandeurDirection.directeur) ===
              String(utilisateurPdd._id) &&
            String(demandeurDirection.directeur) ===
              String(directionEntite.directeur)
          ) {
            nextCode = "cdd.hiq.pdd.dir";
            nextUserId = demandeurDirection.directeur;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "pdd"
        ) {
          if (
            String(demandeurDirection.directeur) === String(utilisateurPdd._id)
          ) {
            nextCode = "cdd.hiq.pdd";
            nextUserId = utilisateurPdd._id;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq" &&
          Array.from(option.signataires)[nextCodeIndex + 3] === "dir"
        ) {
          if (
            String(demandeurDirection.directeur) ===
            String(directionEntite.directeur)
          ) {
            nextCode = "cdd.hiq.dir";
            nextUserId = directionEntite.directeur;
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq"
        ) {
          nextCode = "cdd.hiq";
          nextUserId = demandeurDirection.directeur;
        }
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "hiq") {
      if (
        Array.from(option.signataires)[nextCodeIndex + 2] === "pdd" &&
        Array.from(option.signataires)[nextCodeIndex + 3] === "dir"
      ) {
        if (
          String(demandeurDirection.directeur) === String(utilisateurPdd._id) &&
          String(demandeurDirection.directeur) ===
            String(directionEntite.directeur)
        ) {
          nextCode = "hiq.pdd.dir";
          nextUserId = demandeurDirection.directeur;
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "dir") {
        if (
          String(demandeurDirection.directeur) ===
          String(directionEntite.directeur)
        ) {
          nextCode = "hiq.dir";
          nextUserId = directionEntite.directeur;
        }
      } else {
        nextCode = "hiq";
        nextUserId = demandeurDirection.directeur;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdd") {
      if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
        if (String(utilisateurPdd._id) === String(directionEntite.directeur)) {
          nextCode = "pdd.dir";
          nextUserId = directionEntite.directeur;
        }
      } else {
        nextCode = "pdd";
        nextUserId = utilisateurPdd._id;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
      nextCode = "dir";
      nextUserId = demandeurDirection.directeur;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dg") {
      const dgUtilisateur = await Utilisateur.findOne({
        fonction: "directeur général",
      });
      nextCode = "dg";
      nextUserId = dgUtilisateur._id;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdg") {
      const pdgUtilisateur = await Utilisateur.findOne({
        fonction: "président directeur général",
      });
      nextCode = "pdg";
      nextUserId = pdgUtilisateur._id;
    }
  }

  console.log("nextCode : ", nextCode);

  return [nextCode, String(nextUserId)];
};
