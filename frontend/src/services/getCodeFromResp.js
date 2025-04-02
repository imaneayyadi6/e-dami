export const getCodeFromResp = (userInfo, demandeur) => {
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
