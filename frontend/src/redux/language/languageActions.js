import { SET_LANGUAGE, TOGGLE_LANGUAGE } from "./languageTypes";

export const setLanguage = (language) => {
  return {
    type: SET_LANGUAGE,
    payload: language,
  };
};

export const toggleLanguage = () => {
  return {
    type: TOGGLE_LANGUAGE,
  };
};
