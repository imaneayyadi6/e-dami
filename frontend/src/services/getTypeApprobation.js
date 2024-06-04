const getTypeApprobation = (code) => {
  switch (code) {
    case "cds":
      return "chef de service";
    case "cdd":
      return "chef de departement";
    case "cds.cdd":
      return "chef de service '<i>(le demandeur n'a pas un chef de service ou n'a pas été affecté à un service)</i>' et chef de departement";
    case "hiq":
      return "directeur hiearchique";
    case "pdd":
      return "propriétaire de données";
    case "dir":
      return "directeur de l'entité";
    case "pdg":
      return "president-directeur generale";
    case "hiq.dir":
      return "directeur hiearchique - directeur de l'entité";
    case "pdd.dir":
      return "propriétaire de données - directeur de l'entité";
    case "hiq.pdd":
      return "directeur hiearchique - propriétaire de données";
    case "hiq.pdd.dir":
      return "directeur hiearchique - propriétaire de données - directeur de l'entité";
    default:
      return "(pas de donnees)";
  }
};

export default getTypeApprobation;
