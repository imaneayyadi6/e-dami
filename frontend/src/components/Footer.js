import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageSync } from '../hooks/useLanguageSync';

const Footer = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  
  const footerTranslations = {
    fr: {
      copyright: "© 2025 E-Dami. Tous droits réservés."
    },
    ar: {
      copyright: "© 2025 E-Dami. جميع الحقوق محفوظة."
    }
  };

  const currentTranslations = footerTranslations[currentLanguage] || footerTranslations.fr;

  return (
    <footer 
      className="footer"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        marginTop: 'auto',
        textAlign: 'center',
        width: '100%',
        flexShrink: 0,
        transition: 'all 0.3s ease'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container-fluid px-0">
        <div className="row g-0">
          <div className="col-12">
            <small 
              className="text-muted d-block text-responsive"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: '1.4',
                wordBreak: 'break-word'
              }}
            >
              {currentTranslations.copyright}
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
