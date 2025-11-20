import { ChangePassword, DashboardPage, RedirectPage } from "../pages";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import TestAdmin from "../components/TestAdmin";
import {
  CategorieListPage,
  DamiEditPage,
  DirectionListPage,
  ServiceListPage,
  OptionListPage,
  UtilisateurListPage,
  DamiDetailsPage,
  UtilisateurUpdatePage,
  UtilisateurCreatePage,
  UtilisateurDetailsPage,
} from "../pages/admin";
import OptionListPageAdmin from "../pages/admin/OptionListPageAdmin";
import DemandesListPage from "../pages/admin/DemandesListPage";
import DemandesPreviewAdminPage from "../pages/admin/DemandesPreviewAdminPage";

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
} from "../pages/signataire";
import DefinirInterimePage from "../pages/signataire/DefinirInterimePage";
import DemandesPreviewDetailsPage from "../pages/signataire/DemandesPreviewDetailsPage";
import DemandesPreviewPage from "../pages/signataire/DemandesPreviewPage";
import SignataireDashboardPage from "../pages/signataire/SignataireDashboardPage";

const routes = [
  {
    path: "*",
    name: "Not found",
    element: <RedirectPage />,
    exact: true,
    roles: ["admin", "demandeur", "signataire", "createur"],
  },
  
  
  {
    path: "/admin/dashboard",
    name: "Tableau de bord Admin",
    element: <DashboardPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/options",
    name: "Options Admin",
    element: <OptionListPageAdmin />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/utilisateurs",
    name: "Utilisateurs Admin",
    element: <UtilisateurListPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/demandes/apercu",
    name: "Aperçu des demandes Admin",
    element: <DemandesPreviewAdminPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/demandes/approbation",
    name: "Demandes d'approbation Admin",
    element: <DemandesPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/categories",
    name: "Catégories Admin",
    element: <CategorieListPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/directions",
    name: "Directions Admin",
    element: <DirectionListPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/services",
    name: "Services Admin",
    element: <ServiceListPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/creer-option",
    name: "Créer Option Admin",
    element: <DamiEditPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/creer-option/:id",
    name: "Créer Option Admin avec ID",
    element: <DamiEditPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/modifier-option/:id",
    name: "Modifier Option Admin",
    element: <DamiEditPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/details-option/:id",
    name: "Détails Option Admin",
    element: <DamiDetailsPage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/creer-utilisateur",
    name: "Créer Utilisateur Admin",
    element: <UtilisateurCreatePage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/modifier-utilisateur/:id",
    name: "Modifier Utilisateur Admin",
    element: <UtilisateurUpdatePage />,
    exact: true,
    roles: ["admin"],
  },
  {
    path: "/admin/details-utilisateur/:id",
    name: "Détails Utilisateur Admin",
    element: <UtilisateurDetailsPage />,
    exact: true,
    roles: ["admin"],
  },

  
  {
    path: "/signataire/dashboard",
    name: "Tableau de bord Signataire",
    element: <SignataireDashboardPage />,
    exact: true,
    roles: ["signataire"],
  },
  {
    path: "/signataire/demandes/apercu",
    name: "Aperçu des demandes Signataire",
    element: <DemandesPreviewPage />,
    exact: true,
    roles: ["signataire"],
  },
  {
    path: "/signataire/demandes",
    name: "Demandes Signataire",
    element: <DemandesPage />,
    exact: true,
    roles: ["signataire"],
  },
  {
    path: "/signataire/demandes/approbation",
    name: "Demandes d'Approbation Signataire",
    element: <DemandesPage />,
    exact: true,
    roles: ["signataire"],
  },
  {
    path: "/signataire/options",
    name: "Options Signataire",
    element: <OptionListPageCrtOp />,
    exact: true,
    roles: ["signataire"],
  },
  {
    path: "/signataire/definir/interim",
    name: "Définir Interim Signataire",
    element: <DefinirInterimePage />,
    exact: true,
    roles: ["signataire"],
  },

  
  {
    path: "/demandeur/mes-demandes",
    name: "Mes demandes",
    element: <MesDemandesPage />,
    exact: true,
    roles: ["demandeur"],
  },
  {
    path: "/demandeur/faire-une-demande",
    name: "Faire une demande",
    element: <FaireUneDemande />,
    exact: true,
    roles: ["demandeur"],
  },
  {
    path: "/demandeur/faire-une-demande/option/:id",
    name: "Faire une demande option",
    element: <FaireUneDemandeOption />,
    exact: true,
    roles: ["demandeur"],
  },

  
  {
    path: "/createur/options",
    name: "Options Createur",
    element: <OptionListPageCrtOp />,
    exact: true,
    roles: ["createur"],
  },
  {
    path: "/createur/creer-option",
    name: "Creer Option Createur",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["createur"],
  },
  {
    path: "/createur/creer-option/:id",
    name: "Creer Option Createur",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["createur"],
  },
  {
    path: "/createur/modifier-option/:id",
    name: "Modifier option Createur",
    element: <DamiEditPageCrtOp />,
    exact: true,
    roles: ["createur"],
  },
  {
    path: "/createur/details-option/:id",
    name: "Details option Createur",
    element: <DamiDetailsPageCrtOp />,
    exact: true,
    roles: ["createur"],
  },

  
  {
    path: "/profile",
    name: "Profile",
    element: <ProfilePage />,
    exact: true,
    roles: ["admin", "demandeur", "signataire", "createur"],
  },
  {
    path: "/changer-mdp",
    name: "Changer le mot de passe",
    element: <ChangePassword />,
    exact: true,
    roles: ["admin", "demandeur", "signataire"],
  },
  {
    path: "/notifications",
    name: "Notifications",
    exact: true,
    roles: ["demandeur", "signataire", "admin", "createur"],
    element: <NotificationsPage />,
  },
  {
    path: "/details-demande/:id",
    name: "Détails demande demandeur",
    element: <DemandeurDetailsDemande />,
    exact: true,
    roles: ["demandeur"],
  },
  {
    path: "/details-demande/:id/traitement/:idTraitement",
    name: "Détails demande signataire/admin",
    element: <DemandesPreviewDetailsPage />,
    exact: true,
    roles: ["signataire", "admin"],
  },
  {
    path: "/demandes/apercu/details/:id",
    name: "Aperçu demande details",
    element: <DemandesPreviewDetailsPage />,
    exact: true,
    roles: ["signataire", "admin", "demandeur"],
  },
];

export default routes;