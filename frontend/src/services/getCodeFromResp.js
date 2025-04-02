export const getCodeFromResp = (userInfo, demandeur, option) => {
  let code = "";
  if (userInfo.isChefDeService) {
    code = "cds";
  } else if (userInfo.isChefDeDepartement) {
    code = "cdd";
  } else if (userInfo.isDirecteurAdj) {
    code = "dir";
  } else if (userInfo.isDirecteur) {
    code = "dir";
  }

  // console.log("option.autreUtilisateur :", option.autreUtilisateur)

  if (option && option.autreUtilisateur) {
    if (String(option.autreUtilisateur) === String(userInfo.id)) {
      code = "atr";
    }
  }


  if (option && option.proprietaireDeDonnees) {
    if (String(option.proprietaireDeDonnees) === String(userInfo.id)) {
      code = "pdd";
    }
  }


  if (code === "dir") {
    if (demandeur.direction) {
      if (typeof demandeur.direction === "object") {
        if (
          demandeur.direction._id &&
          String(demandeur.direction._id) === String(userInfo.direction._id)
        ) {
          code = "hiq";
        }
      } else if (typeof demandeur.direction === "string") {
        if (String(demandeur.direction) === String(userInfo.direction._id)) {
          code = "hiq";
        }
      }
    }
  }




  return code;
};
