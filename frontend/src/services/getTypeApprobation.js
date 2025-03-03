const getTypeApprobation = (code) => {
  switch (code) {
    case "cds":
      return "chef de service";
    case "cdd":
      return "chef de departement";
    case "cds.cdd":
      return "chef de service  et chef de departement";
    case "hiq":
      return "directeur hiearchique";
    case "cds.hiq":
      return "chef de service et directeur hiearchique";
    case "cdd.hiq":
      return "chef de departement et directeur hiearchique";
    case "cds.cdd.hiq":
      return "chef de service, chef de departement et directeur hiearchique";
    case "pdd":
      return "propriétaire de données";
    case "cds.cdd.hiq.pdd":
      return "chef de service, chef de departement, directeur hiearchique et propriétaire de données";
    case "cdd.hiq.pdd":
      return "chef de departement, directeur hiearchique et propriétaire de données";
    case "dir":
      return "directeur de l'entité";
    case "cdd.hiq.dir":
      return "chef de departement, directeur hiearchique et directeur de l'entité";
    case "cds.cdd.hiq.dir":
      return "chef de service, chef de departement, directeur hiearchique et directeur de l'entité";
    case "dg":
      return "directeur generale";
    case "pdg":
      return "president-directeur generale";
    case "hiq.dir":
      return "directeur hiearchique et directeur de l'entité";
    case "pdd.dir":
      return "propriétaire de données et directeur de l'entité";
    case "hiq.pdd":
      return "directeur hiearchique et propriétaire de données";
    case "hiq.pdd.dir":
      return "directeur hiearchique, propriétaire de données et directeur de l'entité";
    default:
      return "N/A";
  }
};

export default getTypeApprobation;
