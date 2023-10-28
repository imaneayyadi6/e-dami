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
} from "./user/userReducers.js";
import { dialogReducer } from "./dialog/dialogReducers.js";
import { alertReducer } from "./alert/alertReducers.js";

import {
  directionListReducer,
  directionCreateReducer,
  directionRemoveReducer,
  directionUpdateReducer,
  directionByServiceIDReducer,
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
  optionListReducer,
  optionCreateReducer,
  optionByIDReducer,
  optionDeleteReducer,
  optionUpdateReducer,
} from "./option/optionReducers";

import {
  chartGetOptionsCountOfServicesReducer,
  chartGetOptionsCountOfSousCategorieReducer,
  chartGetOptionsReducer,
  chartGetUsersReducer,
} from "./chart/chartReducers";
import { toastReducer } from "./toast/toastReducers";
import {
  demandeByIdReducer,
  demandeCreateReducer,
  demandesToHandleReducer,
} from "./demande/demandeReducres";

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
  optionCreate: optionCreateReducer,
  optionListBySousCategorieID: optionListBySousCategorieIDReducer,
  optionList: optionListReducer,
  optionByID: optionByIDReducer,
  optionDelete: optionDeleteReducer,
  optionUpdate: optionUpdateReducer,
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
  // chart :
  chartGetUsers: chartGetUsersReducer,
  chartGetOptions: chartGetOptionsReducer,
  chartGetOptionsCountOfSousCategorie:
    chartGetOptionsCountOfSousCategorieReducer,
  chartGetOptionsCountOfServices: chartGetOptionsCountOfServicesReducer,
  // demande :
  demandeCreate: demandeCreateReducer,
  demandesToHandle: demandesToHandleReducer,
  demandeById: demandeByIdReducer,
});

const store = configureStore({
  reducer,
  preloadedState: initialState,
  middleware: [thunk],
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
