import { DashboardPage, RedirectPage } from "../pages";
import {
  CategorieListPage,
  DamiEditPage,
  DirectionListPage,
  OptionListPage,
  UtilisateurListPage,
  DamiDetailsPage,
  UtilisateurUpdatePage,
  UtilisateurCreatePage,
  UtilisateurDetailsPage,
} from "../pages/admin";
import { FaireUneDemande, MesDemandesPage } from "../pages/demandeur";
import { DemandeDetailsPage, DemandesPage } from "../pages/signataire";

const routes = [
  {
    path: "*",
    name: "Not found",
    element: <RedirectPage />,
    exact: true,
    roles: ["crt", "dmr", "sig"],
  },
  {
    path: "/",
    name: "Tableau de bord",
    element: <DashboardPage />,
    exact: true,
    roles: ["crt", "sig"],
  },
  {
    path: "/dashboard",
    name: "Tableau de bord",
    element: <DashboardPage />,
    exact: true,
    roles: ["crt", "sig"],
  },
  {
    path: "/Categories",
    name: "Categories",
    element: <CategorieListPage />,
    roles: ["crt"],
  },
  {
    path: "/creer-option",
    name: "Creer Option",
    element: <DamiEditPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/creer-option/:id",
    name: "Creer Option",
    element: <DamiEditPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/modifier-option/:id",
    name: "Modifier option",
    element: <DamiEditPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/details-option/:id",
    name: "Details option",
    element: <DamiDetailsPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/options",
    name: "Options",
    element: <OptionListPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/directions",
    name: "Directions",
    element: <DirectionListPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/utilisateurs",
    name: "Utilisateurs",
    element: <UtilisateurListPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/modifier-utilisateur/:id",
    name: "Modifier Utilisateur",
    element: <UtilisateurUpdatePage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/creer-utilisateur",
    name: "Creer Utilisateur",
    element: <UtilisateurCreatePage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/details-utilisateur/:id",
    name: "Details Utilisateur",
    element: <UtilisateurDetailsPage />,
    exact: true,
    roles: ["crt"],
  },
  {
    path: "/mes-demandes",
    name: "Mes demandes",
    element: <MesDemandesPage />,
    exact: true,
    roles: ["dmr"],
  },
  {
    path: "/faire-une-demande",
    name: "Faire une dmeande",
    element: <FaireUneDemande />,
    exact: true,
    roles: ["dmr"],
  },
  {
    path: "/demandes",
    name: "Demandes",
    element: <DemandesPage />,
    exact: true,
    roles: ["sig"],
  },
  {
    path: "/details-demande/:id/traitement/:idTraitement",
    name: "Demandes",
    element: <DemandeDetailsPage />,
    exact: true,
    roles: ["sig"],
  },
];

export default routes;
