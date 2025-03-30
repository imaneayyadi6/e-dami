export const getCodeFromResp = (userInfo) => {
  if (userInfo.isChefDeService) {
    return "cds";
  } else if (userInfo.isChefDeDepartement) {
    return "cdd";
  } else if (userInfo.isDirecteurAdj) {
    return "dir";
  } else if (userInfo.isDirecteur) {
    return "dir";
  }
  return null;
};
