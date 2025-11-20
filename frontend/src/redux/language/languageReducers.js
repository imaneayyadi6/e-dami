import { SET_LANGUAGE, TOGGLE_LANGUAGE } from "./languageTypes";


const getInitialLanguage = () => {
  
  const userLanguage = localStorage.getItem("userLanguage");
  const appLanguage = localStorage.getItem("appLanguage");
  return userLanguage || appLanguage || "fr";
};

const initialState = {
  current: getInitialLanguage(), 
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      
      localStorage.setItem("userLanguage", action.payload);
      localStorage.setItem("appLanguage", action.payload);
      
      document.documentElement.dir = action.payload === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = action.payload;
      return {
        ...state,
        current: action.payload,
      };
    case TOGGLE_LANGUAGE:
      const newLanguage = state.current === "fr" ? "ar" : "fr";
      
      localStorage.setItem("userLanguage", newLanguage);
      localStorage.setItem("appLanguage", newLanguage);
      
      document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLanguage;
      return {
        ...state,
        current: newLanguage,
      };
    default:
      return state;
  }
};

export default languageReducer;
