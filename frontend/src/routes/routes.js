import { ChangePassword, DashboardPage, RedirectPage } from "../pages";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
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

import {
  DamiEditPageCrtOp,
  OptionListPageCrtOp,
  DamiDetailsPageCrtOp,
} from "../pages/createurOption";

import {
  DemandeurDetailsDemande,
  FaireUneDemande,
  MesDemandesPage,
  FaireUneDemandeOption,
} from "../pages/demandeur";
import {
  DemandeDetailsPage,
  DemandesPage,
  SignataireDashboardPage,
} from "../pages/signataire";

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
    roles: ["crt"],
  },
  {
    path: "/",
    name: "Tableau de bord",
    element: <SignataireDashboardPage />,
    exact: true,
    roles: ["sig"],
  },
  {
    path: "/dashboard",
    name: "Tableau de bord",
    element: <DashboardPage />,
    exact: true,
    roles: ["crt"],
  },

  {
    path: "/profile",
    name: "Profile",
    element: <ProfilePage />,
    exact: true,
    roles: ["crt", "dmr", "sig"],
  },

  {
    path: "/changer-mdp",
    name: "Chnager le mot de passe",
    element: <ChangePassword />,
    exact: true,
    roles: ["crt", "dmr", "sig"],
  },

  {
    path: "/dashboard",
    name: "Tableau de bord",
    element: <SignataireDashboardPage />,
    exact: true,
    roles: ["sig"],
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
    path: "/creer-option/crt-op",
    name: "Creer Option",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["crt-op"],
  },
  {
    path: "/creer-option/crt-op/:id",
    name: "Creer Option",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["crt-op"],
  },
  {
    path: "/modifier-option/crt-op/:id",
    name: "Modifier option",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["crt-op"],
  },
  {
    path: "/details-option/crt-op/:id",
    name: "Details option",
    element: <DamiDetailsPageCrtOp />,
    exact: true,
    roles: ["crt-op"],
  },
  {
    path: "/options/crt-op",
    name: "Options",
    element: <OptionListPageCrtOp />,
    exact: true,
    roles: ["crt-op"],
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
    name: "Faire une demande",
    element: <FaireUneDemande />,
    exact: true,
    roles: ["dmr"],
  },
  {
    path: "/faire-une-demande/option/:id",
    name: "Faire une demande option ",
    element: <FaireUneDemandeOption />,
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
  {
    path: "/details-demande/:id",
    name: "Demandes",
    element: <DemandeurDetailsDemande />,
    exact: true,
    roles: ["dmr"],
  },
  {
    path: "/notifications",
    name: "notifications",
    exact: true,
    roles: ["dmr", "sig", "crt"],
    element: <NotificationsPage />,
  },
];

export default routes;
