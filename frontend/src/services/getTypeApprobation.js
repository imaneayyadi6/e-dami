const getTypeApprobation = code => {
  switch (code) {
    case "cds":
      return "chef de service";
    case "hiq":
      return "directeur hiearchique";
    case "pdd":
      return "propriétaire de données";
    case "dir":
      return "directeur de l'entité";
    case "pdg":
      return "president-directeur generale";
    case "hiq.dir":
      return "directeur hiearchique - directeur de l'entité"
    case "hiq.pdd":
      return "directeur hiearchique - propriétaire de données"
    default:
      return "(pas de donnees)";
  }
};

export default getTypeApprobation;
