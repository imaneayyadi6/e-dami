const getTypeApprobation = code => {
  switch (code) {
    case "cds":
      return "chef de service";
    case "hiq":
      return "directeur hiearchique";
    case "pdd":
      return "proprietaire de donnees";
    case "dir":
      return "directeur de l'entite";
    case "pdg":
      return "president-directeur generale";
    default:
      return "(pas de donnees)";
  }
};

export default getTypeApprobation;
