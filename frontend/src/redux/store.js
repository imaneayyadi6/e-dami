import { combineReducers, configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { sidebarReducer } from "./sidebar/sidebarReducers";
import {
  userLoginReducer,
  userDirecteursListReducer,
  userChefServiceListReducer,
  userListReducer,
  userCreateReducer,
  userRemoveReducer,
  userUpdateReducer,
  userByIDReducer,
  userUpdatePasswordReducer,
  userGetAccountReducer,
  userValidateTokenReducer,
  userSetPasswordTokenReducer,
  userChangePasswordReducer,
  userSetNewPasswordReducer,
  userByDivisionReducer,
  userPutInterimReducer,
  userDeleteInterimReducer,
  userGetInterimReducer,
} from "./user/userReducers.js";
import { dialogReducer } from "./dialog/dialogReducers.js";
import { alertReducer } from "./alert/alertReducers.js";

import {
  directionListReducer,
  directionCreateReducer,
  directionRemoveReducer,
  directionUpdateReducer,
  directionByServiceIDReducer,
  directionSignatairesListReducer,
} from "./direction/directionReducers";
import {
  serviceListReducer,
  serviceListByDirectionIDReducer,
  serviceCreateReducer,
  serviceRemoveReducer,
  serviceUpdateReducer,
  serviceByIDReducer,
  serviceListByDepartementIDReducer,
} from "./service/serviceReducers";

import {
  departementListReducer,
  departementListByDirectionIDReducer,
  departementByIDReducer,
} from "./departement/departementReducers";

import {
  categorieListReducer,
  categorieCreateReducer,
  categorieRemoveReducer,
  categorieUpdateReducer,
} from "./categorie/categorieReducers";
import {
  sousCategorieListReducer,
  souscategorieListByCategorieIDReducer,
  sousCategorieCreateReducer,
  sousCategorieRemoveReducer,
  sousCategorieUpdateReducer,
} from "./sousCategorie/sousCategorieReducers";
import {
  optionListBySousCategorieIDReducer,
  optionByIDReducer,
  optionListReducer,
  optionCreateReducer,
  optionDeleteReducer,
  optionUpdateReducer,
  optionCrtOpListReducer,
  optionCrtOpCreateReducer,
  optionCrtOpDeleteReducer,
  optionCrtOpUpdateReducer,
} from "./option/optionReducers";

import {
  chartGetBarDemandeReducer,
  chartGetLineDemandesSignataireReducer,
  chartGetLineDemandeReducer,
  chartGetOptionsCountOfServicesReducer,
  chartGetOptionsCountOfSousCategorieReducer,
  chartGetOptionsReducer,
  chartGetUsersReducer,
  chartGetBarDemandesSignataireReducer,
} from "./chart/chartReducers";
import { toastReducer } from "./toast/toastReducers";
import languageReducer from "./language/languageReducers";
import {
  demandeByIdReducer,
  demandeCreateReducer,
  demandeToHandleReducer,
  demandeGetTraitementStatusReducer,
  demandeApprouveTraitementReducer,
  demandeRefuseTraitementReducer,
  mesDemandesReducer,
  demandeDemandeurByIdReducer,
  demandeToHandleFilterReducer,
  demandePreviewTeamReducer,
  demandePreviewTeamDetailsReducer,
  demandePreviewTeamAdminReducer,
  demandeUpdateReducer,
  demandeDeleteReducer,
  dashboardStatsReducer,
} from "./demande/demandeReducres";
import {
  notificationListReducer,
  notificationMakeItSeenReducer,
  notificationOnceToastMakeItSeenReducer,
  notificationToastMakeItSeenReducer,
  notificationToatsListReducer,
  notificationsNotSeenCountReducer,
} from "./notification/notificationReducers";
import { imageGenerateReducer, excelGenerateReducer } from "./generate/generateReducers";
import { dashboardReducer } from "./dashboard/dashboardReducers";

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const languageFromStorage = localStorage.getItem("appLanguage") || "fr";

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
  language: { current: languageFromStorage },
  sidebar: { show: true, collapsed: false }, 
};

const reducer = combineReducers({
  
  sidebar: sidebarReducer,
  
  dialog: dialogReducer,
  
  alert: alertReducer,
  
  toast: toastReducer,
  
  language: languageReducer,
  
  directionList: directionListReducer,
  directionCreate: directionCreateReducer,
  directionRemove: directionRemoveReducer,
  directionUpdate: directionUpdateReducer,
  directionByServiceID: directionByServiceIDReducer,
  directionSignatairesList: directionSignatairesListReducer,
  
  serviceList: serviceListReducer,
  serviceListByDirectionID: serviceListByDirectionIDReducer,
  serviceCreate: serviceCreateReducer,
  serviceRemove: serviceRemoveReducer,
  serviceUpdate: serviceUpdateReducer,
  serviceByID: serviceByIDReducer,
  serviceListByDepartementID: serviceListByDepartementIDReducer,
  
  departementList: departementListReducer,
  departementListByDirectionID: departementListByDirectionIDReducer,
  departementByID: departementByIDReducer,
  
  categorieCreate: categorieCreateReducer,
  categorieList: categorieListReducer,
  categorieRemove: categorieRemoveReducer,
  categorieUpdate: categorieUpdateReducer,
  
  sousCategorieList: sousCategorieListReducer,
  souscategorieListByCategorieID: souscategorieListByCategorieIDReducer,
  sousCategorieCreate: sousCategorieCreateReducer,
  sousCategorieRemove: sousCategorieRemoveReducer,
  sousCategorieUpdate: sousCategorieUpdateReducer,
  
  optionListBySousCategorieID: optionListBySousCategorieIDReducer,
  optionByID: optionByIDReducer,
  optionCreate: optionCreateReducer,
  optionList: optionListReducer,
  optionDelete: optionDeleteReducer,
  optionUpdate: optionUpdateReducer,

  optionCrtOpCreate: optionCrtOpCreateReducer,
  optionCrtOpList: optionCrtOpListReducer,
  optionCrtOpDelete: optionCrtOpDeleteReducer,
  optionCrtOpUpdate: optionCrtOpUpdateReducer,

  
  userLogin: userLoginReducer,
  userDirecteursList: userDirecteursListReducer,
  userChefServiceList: userChefServiceListReducer,
  userList: userListReducer,
  userCreate: userCreateReducer,
  userRemove: userRemoveReducer,
  userUpdate: userUpdateReducer,
  userByID: userByIDReducer,
  userUpdatePassword: userUpdatePasswordReducer,
  userGetAccount: userGetAccountReducer,
  userValidateToken: userValidateTokenReducer,
  userSetPassword: userSetPasswordTokenReducer,
  userChangePassword: userChangePasswordReducer,
  userSetNewPasswordToken: userSetNewPasswordReducer,
  userByDivision: userByDivisionReducer,
  userPutInterim: userPutInterimReducer,
  userDeleteInterim: userDeleteInterimReducer,
  userGetInterim: userGetInterimReducer,
  
  chartGetUsers: chartGetUsersReducer,
  chartGetOptions: chartGetOptionsReducer,
  chartGetOptionsCountOfSousCategorie:
    chartGetOptionsCountOfSousCategorieReducer,
  chartGetOptionsCountOfServices: chartGetOptionsCountOfServicesReducer,
  chartGetLineDemande: chartGetLineDemandeReducer,
  chartGetBarDemande: chartGetBarDemandeReducer,
  chartGetLineDemandesSignataire: chartGetLineDemandesSignataireReducer,
  chartGetBarDemandesSignataire: chartGetBarDemandesSignataireReducer,
  
  demandeCreate: demandeCreateReducer,
  demandesToHandle: demandeToHandleReducer,
  demandeById: demandeByIdReducer,
  demandeGetTraitementStatus: demandeGetTraitementStatusReducer,
  demandeApprouveTraitement: demandeApprouveTraitementReducer,
  demandeRefuseTraitement: demandeRefuseTraitementReducer,
  mesDemandes: mesDemandesReducer,
  demandeDemandeurById: demandeDemandeurByIdReducer,
  demandeToHandleFilter: demandeToHandleFilterReducer,
  demandePreviewTeam: demandePreviewTeamReducer,
  demandePreviewTeamDetails: demandePreviewTeamDetailsReducer,
  demandePreviewTeamAdmin: demandePreviewTeamAdminReducer,
  demandeUpdate: demandeUpdateReducer,
  demandeDelete: demandeDeleteReducer,
  dashboardStats: dashboardStatsReducer,
  
  notificationToatsList: notificationToatsListReducer,
  notificationToastMakeItSeen: notificationToastMakeItSeenReducer,
  notificationsNotSeenCount: notificationsNotSeenCountReducer,
  notificationList: notificationListReducer,
  notificationMakeItSeen: notificationMakeItSeenReducer,
  notificationOnceToastMakeItSeen: notificationOnceToastMakeItSeenReducer,
  
  imageGenerate: imageGenerateReducer,
  excelGenerate: excelGenerateReducer,
  
  dashboard: dashboardReducer,
});

const store = configureStore({
  reducer,
  preloadedState: initialState,
  middleware: [thunk],
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
