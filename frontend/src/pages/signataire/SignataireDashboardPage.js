import React, { useEffect, useState } from "react";
import {
  DemandesLinesForDirecteur,
  DemandeByDirectionBarChartForDirecteur,
} from "../../components/charts";
import { Col, Row, Card, Container, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { MdRefresh } from "react-icons/md";

const SignataireDashboardPage = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin || {};
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();

  
  const signataireTranslations = {
    fr: {
      welcomeTitle: "Bienvenue",
      welcomeMessage: "Voici un aperçu de vos demandes et statistiques.",
      refresh: "Actualiser",
      testSignataire: "Test Signataire"
    },
    ar: {
      welcomeTitle: "مرحباً",
      welcomeMessage: "إليك لمحة عن طلباتك وإحصاءاتك.",
      refresh: "تحديث",
      testSignataire: "Test Signataire"
    }
  };

  const [translations, setTranslations] = useState(signataireTranslations[currentLanguage] || signataireTranslations.fr);

  
  useEffect(() => {
    setTranslations(signataireTranslations[currentLanguage] || signataireTranslations.fr);
  }, [currentLanguage]);

  const fullName = userInfo ? `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() : translations.testSignataire;

  
  const textAlignment = isRTL ? 'right' : 'left';

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="app-container-white">
      <style>{`
        .app-container-white {
          background: var(--bg-primary, #f8f9fa);
          min-height: 100vh;
          padding: 0;
        }

        .main-content-white {
          background: var(--bg-primary, #f8f9fa);
          min-height: 100vh;
          padding: var(--space-6, 2rem);
        }

        .dashboard-white {
          background: var(--bg-primary, #f8f9fa);
        }

        .dashboard-header-white {
          background: var(--bg-primary, #ffffff);
          padding: var(--space-6, 2rem);
          border-radius: var(--radius-lg, 12px);
          border: 1px solid var(--border-light, #e0e0e0);
          box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
          margin-bottom: var(--space-6, 2rem);
        }

        .dashboard-title {
          color: var(--text-primary, #333);
          font-size: var(--text-3xl, 2rem);
          font-weight: var(--font-weight-bold, 700);
          margin-bottom: var(--space-2, 0.5rem);
        }

        .dashboard-subtitle {
          color: var(--text-secondary, #666);
          font-size: var(--text-base, 1rem);
          margin-bottom: 0;
        }

        .refresh-button {
          border-radius: var(--radius-md, 6px);
          padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
          border: 1px solid var(--accent-blue, #007bff);
          color: var(--accent-blue, #007bff);
          background: transparent;
          transition: all var(--transition-normal, 0.3s ease);
        }

        .refresh-button:hover {
          background: var(--accent-blue, #007bff);
          color: white;
          transform: translateY(-1px);
        }

        /* Dark mode styles */
        body.dark-mode .app-container-white {
          background: var(--bg-primary, #1a202c);
        }

        body.dark-mode .main-content-white {
          background: var(--bg-primary, #1a202c);
        }

        body.dark-mode .dashboard-white {
          background: var(--bg-primary, #1a202c);
        }

        body.dark-mode .dashboard-header-white {
          background: var(--bg-primary, #2d3748);
          border-color: var(--border-light, #4a5568);
        }

        body.dark-mode .dashboard-title {
          color: var(--text-primary, #f7fafc);
        }

        body.dark-mode .dashboard-subtitle {
          color: var(--text-secondary, #a0aec0);
        }
      `}</style>
      <Container fluid className="main-content-white dashboard-white" style={{ padding: "var(--space-6)" }} dir={isRTL ? "rtl" : "ltr"}>
        {}
        <div className="dashboard-header-white mb-5">
          <Row className="align-items-center">
            <Col>
              <h1 className="dashboard-title" style={{ 
                color: "var(--text-primary)",
                fontSize: "var(--text-3xl)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-2)",
                textAlign: textAlignment
              }}>
                {translations.welcomeTitle} {fullName}
              </h1>
              <p className="dashboard-subtitle" style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-base)",
                marginBottom: "0",
                textAlign: textAlignment
              }}>
                {translations.welcomeMessage}
              </p>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-3">
                <Button
                  variant="outline-primary"
                  className="refresh-button"
                  onClick={handleRefresh}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--accent-blue)',
                    color: 'var(--accent-blue)',
                    background: 'transparent'
                  }}
                >
                  <MdRefresh size={18} className="me-2" />
                  {translations.refresh}
                </Button>
              </div>
            </Col>
          </Row>
      </div>

        {}
      <Row>
        <Col xl={6} lg={6} md={12} sm={12}>
          <DemandesLinesForDirecteur />
        </Col>
        <Col xl={6} lg={6} md={12} sm={12}>
          <DemandeByDirectionBarChartForDirecteur />
        </Col>
      </Row>
      </Container>
    </div>
  );
};

export default SignataireDashboardPage;
