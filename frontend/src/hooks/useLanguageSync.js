import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../redux/language/languageActions';

export const useLanguageSync = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { current: currentLanguage } = useSelector((state) => state.language) || { current: 'fr' };
  const { userInfo } = useSelector((state) => state.userLogin) || {};

  
  const autoSwitchToArabic = () => {
    if (currentLanguage === 'fr') {
      console.log('🔄 Switch automatique vers l\'arabe pour la création d\'option');
      changeLanguage('ar');
    }
  };

  useEffect(() => {
    
    
    if (userInfo && userInfo.preferredLanguage) {
      
      
      if (!currentLanguage) {
        dispatch(setLanguage(userInfo.preferredLanguage));
        i18n.changeLanguage(userInfo.preferredLanguage);
        localStorage.setItem("userLanguage", userInfo.preferredLanguage);
      }
    } else {
      
      
      const savedLanguage = localStorage.getItem("userLanguage");
      if (savedLanguage && !currentLanguage) {
        dispatch(setLanguage(savedLanguage));
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [userInfo]); 

  useEffect(() => {
    
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [i18n, currentLanguage]);

  const changeLanguage = (language) => {
    console.log('Changing language to:', language);
    
    
    dispatch(setLanguage(language));
    
    
    i18n.changeLanguage(language);
    
    
    localStorage.setItem("userLanguage", language);
    
    
    if (userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        preferredLanguage: language
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      console.log('Updated userInfo with language:', language);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'fr' ? 'ar' : 'fr';
    changeLanguage(newLanguage);
  };

  
  const forceFrench = () => {
    console.log('🔄 Forçage du français pour éviter le switch automatique');
    changeLanguage('fr');
  };

  
  const resetLanguagePreference = () => {
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("appLanguage");
    if (userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        preferredLanguage: 'fr'
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
    }
    changeLanguage('fr');
  };

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    autoSwitchToArabic,
    forceFrench,
    resetLanguagePreference,
    isRTL: currentLanguage === 'ar'
  };
};


