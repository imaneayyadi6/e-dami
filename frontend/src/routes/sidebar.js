let _nav = [
  
  {
    to: "/admin/dashboard",
    name: "Tableau de bord",
    icon: <i className="side-bar-icon fa-solid fa-gauge"></i>,
    roles: ["admin"],
  },
  {
    to: "/admin/options",
    name: "Options",
    icon: <i className="side-bar-icon fa-solid fa-clipboard-list"></i>,
    roles: ["admin"],
  },
  {
    to: "/admin/utilisateurs",
    name: "Utilisateurs",
    icon: <i className="side-bar-icon fa-solid fa-users"></i>,
    roles: ["admin"],
  },
  {
    to: "/admin/demandes/apercu",
    name: "Aperçu des demandes",
    icon: (
      <i className="fa-solid fa-address-book" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["admin"],
  },
  {
    to: "/admin/demandes/approbation",
    name: "Demandes d'approbation",
    icon: (
      <i className="fa-solid fa-check-circle" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["admin"],
  },
  {
    to: "/admin/categories",
    name: "Catégories & sous-catégories",
    icon: <i className="side-bar-icon fa-solid fa-tags"></i>,
    roles: ["admin"],
  },
  {
    to: "/admin/directions",
    name: "Directions",
    icon: <i className="side-bar-icon fa-solid fa-building"></i>,
    roles: ["admin"],
  },

 

  
  {
    to: "/signataire/dashboard",
    name: "Tableau de bord",
    icon: <i className="side-bar-icon fa-solid fa-gauge"></i>,
    roles: ["signataire"],
  },
  {
    to: "/signataire/demandes/apercu",
    name: "Aperçu les demandes",
    icon: (
      <i className="fa-solid fa-address-book" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["signataire"],
  },
  {
    to: "/signataire/demandes/approbation",
    name: "Demandes d'approbation",
    icon: (
      <i className="fa-solid fa-table-list" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["signataire"],
  },
  {
    to: "/signataire/options",
    name: "Options Dami",
    icon: <i className="side-bar-icon fa-solid fa-clipboard-list"></i>,
    roles: ["signataire"],
  },
  {
    to: "/signataire/definir/interim",
    name: "Définir un Interim",
    icon: <i className="fa-solid fa-users" style={{ fontSize: "14px" }}></i>,
    roles: ["signataire"],
  },

  
  {
    to: "/demandeur/mes-demandes",
    name: "Mes demandes",
    icon: <i className="fa-solid fa-bars" style={{ fontSize: "16px" }}></i>,
    roles: ["demandeur"],
  },
  {
    to: "/demandeur/faire-une-demande",
    name: "Faire une demande",
    icon: <i className="side-bar-icon fa-solid fa-file-pen"></i>,
    roles: ["demandeur"],
  },

  
  {
    to: "/createur/options",
    name: "Options Dami",
    icon: <i className="side-bar-icon fa-solid fa-clipboard-list"></i>,
    roles: ["createur"],
    excludeRoles: ["signataire"], 
  },
];

export default _nav;