import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";
import Demande from "../models/demandeModel.js";

/**
 * Récupère l'ID du directeur hiérarchique d'un demandeur.
 *
 * @param {String} demandeurId - L'ID de l'utilisateur demandeur.
 * @returns {String|null} - L'ID du directeur hiérarchique ou null si non trouvé.
 */
const getDirecteurHiarchique = async (demandeurId) => {
  const demandeur = await Utilisateur.findById(demandeurId);
  let dirHiqID = null;
  let findDirHiq = false;
  const demandeurDirection = await Direction.findById(demandeur.direction);
  if (demandeur && demandeur.direction) {
    if (demandeurDirection && demandeurDirection.directeur) {
      const demandeurDirecteur = await Utilisateur.findById(
        demandeurDirection.directeur
      );
      if (demandeurDirecteur) {
        if (
          Number(demandeurDirecteur.matricule) ===
          Number(demandeur.matriculeSupN1)
        ) {
          dirHiqID = demandeurDirecteur._id;
          findDirHiq = true;
        } else if (
          Number(demandeurDirecteur.matricule) ===
          Number(demandeur.matriculeSupN2)
        ) {
          dirHiqID = demandeurDirecteur._id;
          findDirHiq = true;
        } else if (
          Number(demandeurDirecteur.matricule) ===
          Number(demandeur.matriculeSupN3)
        ) {
          dirHiqID = demandeurDirecteur._id;
          findDirHiq = true;
        }
      }
    }

    if (
      !findDirHiq &&
      demandeurDirection &&
      demandeurDirection.directeursAdjoints &&
      demandeurDirection.directeursAdjoints.length > 0
    ) {
      const dirAdjIds = demandeurDirection.directeursAdjoints;
      for (const dirAdjId of dirAdjIds) {
        console.log("dirAdjId : ",dirAdjId);
        const directeurAdjoint = await Utilisateur.findById(dirAdjId);
        if (directeurAdjoint && directeurAdjoint.matricule) {
          if (
            Number(directeurAdjoint.matricule) ===
            Number(demandeur.matriculeSupN1)
          ) {
            dirHiqID = directeurAdjoint._id;
            findDirHiq = true;
          } else if (
            Number(directeurAdjoint.matricule) ===
            Number(demandeur.matriculeSupN2)
          ) {
            dirHiqID = directeurAdjoint._id;
            findDirHiq = true;
          } else if (
            Number(directeurAdjoint.matricule) ===
            Number(demandeur.matriculeSupN3)
          ) {
            dirHiqID = directeurAdjoint._id;
            findDirHiq = true;
          }
        }
      }
    }
  }

  if (!findDirHiq) {
    if (demandeurDirection && demandeurDirection.directeur) {
      dirHiqID = demandeurDirection.directeur;
    }
  }
  console.log("dirHiqID : ", dirHiqID);
  return dirHiqID;
};

const getCode = async (demandeurId, option) => {
  let code = "";
  let userId = "";

  const demandeur = await Utilisateur.findById(demandeurId);
  const demandeurHiq =
    demandeur && demandeur.direction
      ? await Direction.findById(demandeur.direction)
      : null;
  const demandeurService =
    demandeur && demandeur.service
      ? await Service.findById(demandeur.service)
      : null;
  const demandeurDepartement =
    demandeur && demandeur.departement
      ? await Departement.findById(demandeur.departement)
      : null;

  const optionDirection = await Direction.findById(option.service.direction);

  const dirHiqId = await getDirecteurHiarchique(demandeurId);

  if (option.signataires.length > 0) {
    for (let cd of option.signataires) {
      switch (cd) {
        case "cds":
          code = "cds";
          if (demandeurService && demandeurService.chefService)
            userId = demandeurService.chefService;
          break;
        case "cdd":
          if (!userId) {
            if (code == "") code = "cdd";
            else code += ".cdd";
            if (demandeurDepartement)
              userId = demandeurDepartement.chefDeDepartement;
          }
          break;
        case "hiq":
          if (!userId) {
            console.log("hiq");
            if (code == "") code = "hiq";
            else code += ".hiq";
            if (demandeurHiq) {
              const dirHiqId = await getDirecteurHiarchique(demandeurId);
              userId = dirHiqId;
            }
          } else {
            if (
              String(userId) === String(demandeurHiq.directeurAdjoint) ||
              String(userId) === String(demandeurHiq.directeur)
            ) {
              code += ".hiq";
              const dirHiqId = await getDirecteurHiarchique(demandeurId);
              userId = dirHiqId;
            }
          }
          break;
        case "pdd":
          if (!userId) {
            if (code == "") code = "pdd";
            else code += ".pdd";
            if (option.proprietaireDeDonnees)
              userId = option.proprietaireDeDonnees;
          } else {
            if (String(userId) === String(option.proprietaireDeDonnees)) {
              code += ".pdd";
              userId = option.proprietaireDeDonnees;
            }
          }
          break;
        case "dir":
          if (!userId) {
            if (code == "") code = "dir";
            else code += ".dir";
            if (optionDirection) {
              const dirHiqId = await getDirecteurHiarchique(demandeurId);
              userId = dirHiqId;
            }
          } else {
            if (
              String(userId) === String(optionDirection.directeurAdjoint) ||
              String(userId) === String(optionDirection.directeur)
            ) {
              code += ".dir";
              const dirHiqId = await getDirecteurHiarchique(demandeurId);
              userId = dirHiqId;
            }
          }
          break;
      }
    }
  }

  console.log("the code : ", code);
  console.log("the user ID : ", userId);

  return [userId, code];
};

export const getTypeAppOnCreate = async (optionId, userId) => {
  const option = await Option.findById(optionId).populate("service");
  const user = await Utilisateur.findById(userId);

  if (!option) {
    throw new Error("Option introuvable !");
  }

  if (!user) {
    throw new Error("Utilisateur introuvable !");
  }

  let [userID, code] = await getCode(user.id, option);

  const userInterim = await Utilisateur.findById(userID);
  if (userInterim && userInterim.interim) {
    userID = userInterim.interim;
  }

  return [code, String(userID)];
};

export const getNextTypeAppOnApp = async (optionId, demandeId, code) => {
  const option = await Option.findById(optionId).populate({
    path: "service",
    populate: {
      path: "direction",
    },
  });
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
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
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
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq"
        ) {
          nextCode = "cdd.hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "hiq") {
      let isOnlyHiq = true;
      if (
        Array.from(option.signataires)[nextCodeIndex + 2] === "pdd" &&
        Array.from(option.signataires)[nextCodeIndex + 3] === "dir"
      ) {
        if (
          String(demandeurDirection.directeur) === String(utilisateurPdd._id) &&
          String(demandeurDirection.directeur) ===
            String(directionEntite.directeur)
        ) {
          isOnlyHiq = false;
          nextCode = "hiq.pdd.dir";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "dir") {
        if (
          String(demandeurDirection.directeur) ===
          String(directionEntite.directeur)
        ) {
          isOnlyHiq = false;
          nextCode = "hiq.dir";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        } else {
          nextCode = "hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "pdd") {
        if (
          String(demandeurDirection.directeur) === String(utilisateurPdd._id)
        ) {
          isOnlyHiq = false;
          nextCode = "hiq.pdd";
          nextUserId = utilisateurPdd._id;
        } else {
          nextCode = "hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else {
        nextCode = "hiq";
        nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
      }
      if (isOnlyHiq) {
        nextCode = "hiq";
        nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdd") {
      if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
        if (String(utilisateurPdd._id) === String(directionEntite.directeur)) {
          nextCode = "pdd.dir";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else {
        nextCode = "pdd";
        nextUserId = utilisateurPdd._id;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
      nextCode = "dir";
      nextUserId = option.service.direction.directeur;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "atr") {
      nextCode = "atr";
      nextUserId = option.autreUtilisateur;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dg") {
      const dgUtilisateur = await Utilisateur.findOne({
        fonction: "directeur général",
      });
      console.log(dgUtilisateur);
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
    console.log(
      "nextCode Item:",
      Array.from(option.signataires)[nextCodeIndex + 1]
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
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
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
          } else {
            nextCode = "cdd.hiq";
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
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
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
          } else {
            nextCode = "cdd.hiq";
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
          }
        } else if (
          Array.from(option.signataires)[nextCodeIndex + 2] === "hiq"
        ) {
          nextCode = "cdd.hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
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
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        } else {
          if (
            String(demandeurDirection.directeur) === String(utilisateurPdd._id)
          ) {
            nextCode = "hiq.pdd";
            nextUserId = utilisateurPdd._id;
          } else {
            nextCode = "hiq";
            nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
          }
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "pdd") {
        if (
          String(demandeurDirection.directeur) === String(utilisateurPdd._id)
        ) {
          nextCode = "hiq.pdd";
          nextUserId = utilisateurPdd._id;
        } else {
          nextCode = "hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else if (Array.from(option.signataires)[nextCodeIndex + 2] === "dir") {
        if (
          String(demandeurDirection.directeur) ===
          String(directionEntite.directeur)
        ) {
          nextCode = "hiq.dir";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        } else {
          nextCode = "hiq";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else {
        nextCode = "hiq";
        nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "pdd") {
      if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
        if (String(utilisateurPdd._id) === String(directionEntite.directeur)) {
          nextCode = "pdd.dir";
          nextUserId = await getDirecteurHiarchique(demande.demandeur._id);
        }
      } else {
        nextCode = "pdd";
        nextUserId = utilisateurPdd._id;
      }
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "dir") {
      nextCode = "dir";
      nextUserId = option.service.direction.directeur;
    } else if (Array.from(option.signataires)[nextCodeIndex + 1] === "atr") {
      nextCode = "atr";
      nextUserId = option.autreUtilisateur;
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

  console.log("nextUserId : ", nextUserId);

  if (nextUserId) {
    const userInterim = await Utilisateur.findById(nextUserId);
    if (userInterim && userInterim.interim) {
      nextUserId = String(userInterim.interim);
    }
  } else {
    if (nextCode != "fini") {
      throw new Error("next utilisateur introuvable !");
    }
  }

  return [nextCode, String(nextUserId)];
};
