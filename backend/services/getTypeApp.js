import Utilisateur from "../models/utilisateurModel.js";
import Option from "../models/optionModel.js";
import Direction from "../models/directionModel.js";
import Service from "../models/serviceModel.js";
import Departement from "../models/departementModel.js";

export const getTypeApp = async (optionId, userId) => {
  const option = await Option.findById(optionId).populate("service");
  const user = await Utilisateur.findById(userId);

  if (!option) {
    res.status(404);
    throw new Error("Option introuvable !");
  }

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur introuvable !");
  }

  let code = "";
  let userID = "";

  let notHaveService = false;
  let notHaveDepartement = false;

  switch (Array.from(option.signataires)[0]) {
    case "pdd":
      userID = option.proprietaireDeDonnees;
      code = "pdd";
      break;
    case "cds":
      const service = await Service.findById(user.service);
      if (
        service &&
        String(service._id) === String(option.service) &&
        service.chefService
      ) {
        if (Array.from(option.signataires)[1] === "pdd") {
          const pddUser = await Utilisateur.findById(
            option.proprietaireDeDonnees
          );
          if (pddUser && String(pddUser._id) === String(service.chefService)) {
            userID = service.chefService;
            code = "cds.pdd";
            break;
          } else {
            userID = service.chefService;
            code = "cds";
            break;
          }
        } else {
          userID = service.chefService;
          code = "cds";
          break;
        }
      } else notHaveService = true;
    case "cdd":
      const departement = await Departement.findById(user.departement);
      if (
        departement &&
        String(departement._id) &&
        departement.chefDeDepartement
      ) {
        if (notHaveService) {
          if (Array.from(option.signataires)[1] === "pdd") {
            const pddUser = await Utilisateur.findById(
              option.proprietaireDeDonnees
            );
            if (
              pddUser &&
              String(pddUser._id) === String(departement.chefDeDepartement)
            ) {
              userID = departement.chefDeDepartement;
              code = "cds.cdd.pdd";
              break;
            } else {
              userID = departement.chefDeDepartement;
              code = "cds.cdd";
              break;
            }
          } else {
            userID = departement.chefDeDepartement;
            code = "cds.cdd";
            break;
          }
        } else {
          if (Array.from(option.signataires)[1] === "pdd") {
            const pddUser = await Utilisateur.findById(
              option.proprietaireDeDonnees
            );
            if (
              pddUser &&
              String(pddUser._id) === String(departement.chefDeDepartement)
            ) {
              userID = departement.chefDeDepartement;
              code = "cdd.pdd";
              break;
            } else {
              userID = departement.chefDeDepartement;
              code = "cdd";
              break;
            }
          } else {
            userID = departement.chefDeDepartement;
            code = "cdd";
            break;
          }
        }
      } else {
        notHaveDepartement = true;
      }
    case "hiq":
      const direction = await Direction.findById(user.direction);
      if (direction && direction.directeur) {
        if (
          option.signataires[1] === "pdd" &&
          option.signataires[2] === "dir"
        ) {
          const pddUser = await Utilisateur.findById(
            option.proprietaireDeDonnees
          );
          const dirDirection = await Direction.findById(
            option.service.direction
          );
          if (
            pddUser &&
            dirDirection &&
            String(pddUser._id) === String(direction.directeur) &&
            String(dirDirection.directeur) === String(direction.directeur)
          ) {
            if (notHaveService) {
              userID = dirDirection.directeur;
              code = "cds.hiq.pdd.dir";
              break;
            } else if (notHaveDepartement) {
              userID = dirDirection.directeur;
              code = "cdd.hiq.pdd.dir";
              break;
            } else {
              userID = dirDirection.directeur;
              code = "hiq.pdd.dir";
              break;
            }
          }
        }
        if (option.signataires[1] === "dir") {
          const dirDirection = await Direction.findById(
            option.service.direction
          );
          if (
            dirDirection &&
            String(dirDirection.directeur) === String(direction.directeur)
          ) {
            if (notHaveService && notHaveDepartement) {
              code = "cds.cdd.hiq.dir";
              userID = direction.directeur;
              break;
            } else {
              if (notHaveDepartement) {
                code = "cdd.hiq.dir";
                userID = direction.directeur;
                break;
              } else if (notHaveService) {
                code = "cds.hiq.dir";
                userID = direction.directeur;
                break;
              } else {
                code = "hiq.dir";
                userID = direction.directeur;
                break;
              }
            }
          }
        }
        if (option.signataires[1] === "pdd") {
          const pddUser = await Utilisateur.findById(
            option.proprietaireDeDonnees
          );
          if (pddUser && String(pddUser._id) === String(direction.directeur)) {
            if (notHaveService && notHaveDepartement) {
              code = "cds.cdd.hiq.pdd";
              userID = direction.directeur;
              break;
            } else {
              if (notHaveDepartement) {
                code = "cdd.hiq.pdd";
                userID = direction.directeur;
                break;
              } else if (notHaveService) {
                code = "cds.hiq.pdd";
                userID = direction.directeur;
                break;
              } else {
                code = "hiq.pdd";
                userID = direction.directeur;
                break;
              }
            }
          }
        }

        if (
          option.signataires[1] !== "pdd" &&
          option.signataires[2] !== "dir"
        ) {
          if (notHaveService && notHaveDepartement) {
            code = "cds.cdd.hiq";
            userID = direction.directeur;
            break;
          } else {
            if (notHaveDepartement) {
              code = "cdd.hiq";
              userID = direction.directeur;
              break;
            } else if (notHaveService) {
              code = "cds.hiq";
              userID = direction.directeur;
              break;
            } else {
              code = "hiq";
              userID = direction.directeur;
              break;
            }
          }
        }
      }
  }
  return [code, String(userID)];
};
