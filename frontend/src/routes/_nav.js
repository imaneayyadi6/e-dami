let _nav = [
  {
    to: "/dashboard",
    name: "Tableau de bord",
    icon: <i className="side-bar-icon fa-solid fa-gauge"></i>,
    roles: ["crt", "sig"],
  },
  {
    to: "/demandes/apercu",
    name: "Aperçu les demandes de mon équipe",
    icon: (
      <i className="fa-solid fa-address-book" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["sig"],
  },
  {
    to: "/demandes",
    name: "Demandes d'approbation",
    icon: (
      <i className="fa-solid fa-table-list" style={{ fontSize: "14px" }}></i>
    ),
    roles: ["sig"],
  },
  {
    to: "/mes-demandes",
    name: "mes demandes",
    icon: <i className="fa-solid fa-bars" style={{ fontSize: "16px" }}></i>,
    roles: ["dmr"],
  },

  {
    to: "/faire-une-demande",
    name: "Faire une demande",
    icon: <i className="side-bar-icon fa-solid fa-file-pen"></i>,
    roles: ["dmr"],
  },
  {
    to: "/categories",
    name: "Categories & Sous-categories",
    icon: <i className="side-bar-icon fa-solid fa-list"></i>,
    roles: ["crt"],
  },
  {
    to: "/options",
    name: "options (dami's)",
    icon: <i className="side-bar-icon fa-solid fa-clipboard-list"></i>,
    roles: ["crt"],
  },
  {
    to: "/options/crt-op",
    name: "options (dami's)",
    icon: <i className="side-bar-icon fa-solid fa-clipboard-list"></i>,
    roles: ["crt-op"],
  },
  {
    to: "/directions",
    name: "Directions & services",
    icon: <i className="side-bar-icon fa-solid fa-table-list"></i>,
    roles: ["crt"],
  },
  {
    to: "/utilisateurs",
    name: "Utilisateurs",
    icon: <i className="side-bar-icon fas fa-users"></i>,
    roles: ["crt"],
  },
];

export default _nav;
