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
} from "./service/serviceReducers";
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
import {
  demandeByIdReducer,
  demandeCreateReducer,
  demandeToHandleReducer,
  demandeGetTraitementStatusReducer,
  demandeApprouveTraitementReducer,
  demanderRefuseTraitementReducer,
  mesDemandesReducer,
  demandeDemandeurByIdReducer,
  demandeToHandleFilterReducer,
} from "./demande/demandeReducres";
import {
  notificationListReducer,
  notificationMakeItSeenReducer,
  notificationOnceToastMakeItSeenReducer,
  notificationToastMakeItSeenReducer,
  notificationToatsListReducer,
  notificationsNotSeenCountReducer,
} from "./notification/notificationReducers";
import { imageGenerateReducer } from "./generate/generateReducers";

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
};

const reducer = combineReducers({
  // sidebar:
  sidebar: sidebarReducer,
  // dialog:
  dialog: dialogReducer,
  // alert :
  alert: alertReducer,
  // toast :
  toast: toastReducer,
  // direction:
  directionList: directionListReducer,
  directionCreate: directionCreateReducer,
  directionRemove: directionRemoveReducer,
  directionUpdate: directionUpdateReducer,
  directionByServiceID: directionByServiceIDReducer,
  directionSignatairesList: directionSignatairesListReducer,
  //services :
  serviceList: serviceListReducer,
  serviceListByDirectionID: serviceListByDirectionIDReducer,
  serviceCreate: serviceCreateReducer,
  serviceRemove: serviceRemoveReducer,
  serviceUpdate: serviceUpdateReducer,
  serviceByID: serviceByIDReducer,
  // categorie :
  categorieCreate: categorieCreateReducer,
  categorieList: categorieListReducer,
  categorieRemove: categorieRemoveReducer,
  categorieUpdate: categorieUpdateReducer,
  // sous-categorie :
  sousCategorieList: sousCategorieListReducer,
  souscategorieListByCategorieID: souscategorieListByCategorieIDReducer,
  sousCategorieCreate: sousCategorieCreateReducer,
  sousCategorieRemove: sousCategorieRemoveReducer,
  sousCategorieUpdate: sousCategorieUpdateReducer,
  // options :
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
  
  // user :
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
  // chart :
  chartGetUsers: chartGetUsersReducer,
  chartGetOptions: chartGetOptionsReducer,
  chartGetOptionsCountOfSousCategorie:
    chartGetOptionsCountOfSousCategorieReducer,
  chartGetOptionsCountOfServices: chartGetOptionsCountOfServicesReducer,
  chartGetLineDemande: chartGetLineDemandeReducer,
  chartGetBarDemande: chartGetBarDemandeReducer,
  chartGetLineDemandesSignataire: chartGetLineDemandesSignataireReducer,
  chartGetBarDemandesSignataire: chartGetBarDemandesSignataireReducer,
  // demande :
  demandeCreate: demandeCreateReducer,
  demandesToHandle: demandeToHandleReducer,
  demandeById: demandeByIdReducer,
  demandeGetTraitementStatus: demandeGetTraitementStatusReducer,
  demandeApprouveTraitement: demandeApprouveTraitementReducer,
  demanderRefuseTraitement: demanderRefuseTraitementReducer,
  mesDemandes: mesDemandesReducer,
  demandeDemandeurById: demandeDemandeurByIdReducer,
  demandeToHandleFilter: demandeToHandleFilterReducer,
  // notifications :
  notificationToatsList: notificationToatsListReducer,
  notificationToastMakeItSeen: notificationToastMakeItSeenReducer,
  notificationsNotSeenCount: notificationsNotSeenCountReducer,
  notificationList: notificationListReducer,
  notificationMakeItSeen: notificationMakeItSeenReducer,
  notificationOnceToastMakeItSeen: notificationOnceToastMakeItSeenReducer,
  // generate :
  imageGenerate: imageGenerateReducer,
});

const store = configureStore({
  reducer,
  preloadedState: initialState,
  middleware: [thunk],
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
