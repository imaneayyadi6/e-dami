import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Card, 
  Row, 
  Col, 
  Container, 
  Button, 
  Badge, 
  Form, 
  InputGroup,
  Dropdown,
  Spinner
} from "react-bootstrap";
import {
  MdSearch,
  MdLanguage,
  MdAccountCircle,
  MdArrowUpward,
  MdArrowDownward,
  MdMoreVert,
  MdNotifications,
  MdDashboard,
  MdPeople,
  MdDescription,
  MdBusiness,
  MdTrendingUp,
  MdTrendingDown,
  MdRefresh,
  MdDownload,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdAssignment,
  MdCreate,
  MdSettings
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../hooks/useLanguageSync";
import { getDemandesPreviewTeamAll, getMesDemandes, getDashboardStats } from "../redux/demande/demandeActions";
import {
  UsersLineChart,
  DamiLineChart,
  DamiBySousCategorieDoughnutChart,
  DamiByServiceDoughnutChart,
  DemandeByDirectionBarChart,
  DemandeLineChart
} from "../components/charts";


const customStyles = `
  /* Use CSS variables for a modern, clean look */
  :root {
    --text-primary: #333;
    --text-secondary: #666;
    --text-tertiary: #999;
    --bg-primary: #fff;
    --bg-secondary: #f8f9fa;
    --border-light: #e9ecef;
    --border-medium: #ced4da;
    --accent-blue: #0d6efd;
    --success-main: #198754;
    --success-light: #d1e7dd;
    --warning-main: #ffc107;
    --warning-light: #fff3cd;
    --info-main: #0dcaf0;
    --info-light: #cff4fc;
    --error-main: #dc3545;
    --font-weight-bold: 700;
    --font-weight-semibold: 600;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --transition-normal: 0.2s ease-in-out;
  }

  /* Main container for the sticky footer */
  .app-container-white {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  /* Main content wrapper to push the footer down */
  .main-content-white {
    flex: 1;
  }

  /* Interactive hover effect for stat cards */
  .stat-card-white:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  }

`;



const DashboardPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  const { userInfo } = useSelector(state => state.userLogin);
  
  
  const { demandes: demandesPreviewTeamAll, loading: demandesLoading } = useSelector(state => state.demandePreviewTeamAdmin || { demandes: [], loading: false });
  
  
  const { demandes: mesDemandes, loading: mesDemandesLoading } = useSelector(state => state.mesDemandes || { demandes: [], loading: false });
  
  
  const { stats: dashboardStats, loading: statsLoading } = useSelector(state => state.dashboardStats || { stats: null, loading: false });
  
  
  console.log('=== REDUX STATE DEBUG ===');
  console.log('Full Redux state:', useSelector(state => state));
  console.log('demandePreviewTeamAdmin state:', useSelector(state => state.demandePreviewTeamAdmin));
  console.log('mesDemandes state:', useSelector(state => state.mesDemandes));
  console.log('========================');

  const [selectedChart, setSelectedChart] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  
  const getUserRoles = () => {
    if (!userInfo?.roles) return [];
    return userInfo.roles.map(role => role.role?.code || role.role?.libelle).filter(Boolean);
  };

  const userRoles = getUserRoles();
  const isAdmin = userRoles.includes('admin') || [2003003, 2003002].includes(userInfo?.matricule);
  const isSignataire = userRoles.includes('sig') || userRoles.includes('signataire');
  const isDemandeur = userRoles.includes('dmr') || userRoles.includes('demandeur');
  const isCreateur = userRoles.includes('crt') || userRoles.includes('createur');

  
  useEffect(() => {
    console.log('=== FETCHING DEMANDES DATA ===');
    console.log('isAdmin:', isAdmin);
    console.log('userInfo:', userInfo);
    
    if (isAdmin) {
      
      
      console.log('Dispatching getDemandesPreviewTeamAll...');
      dispatch(getDemandesPreviewTeamAll({ page: 1, limit: 10 }));
    } else {
      
      
      console.log('Dispatching getMesDemandes...');
      dispatch(getMesDemandes());
    }
    
    
    console.log('Dispatching getDashboardStats...');
    dispatch(getDashboardStats());
    
    console.log('==============================');
  }, [dispatch, isAdmin]);

  
  
  const stats = dashboardStats ? {
    activeUsers: dashboardStats.activeUsers || 0,
    pendingRequests: dashboardStats.pendingRequests || 0,
    directions: dashboardStats.directions || 0,
    approvalRate: dashboardStats.approvalRate || 0,
    changes: {
      users: dashboardStats.changes?.users || 0,
      requests: dashboardStats.changes?.requests || 0
    }
  } : {
    
    activeUsers: isAdmin ? 25 : isSignataire ? 12 : isDemandeur ? 8 : isCreateur ? 15 : 0,
    pendingRequests: isAdmin ? 18 : isSignataire ? 5 : isDemandeur ? 3 : isCreateur ? 8 : 0,
    directions: isAdmin ? 12 : isSignataire ? 2 : isDemandeur ? 1 : isCreateur ? 4 : 0,
    approvalRate: isAdmin ? 85 : isSignataire ? 92 : isDemandeur ? 75 : isCreateur ? 88 : 0,
    changes: {
      users: 12,
      requests: -5
    }
  };

  
  
  
  
  
  
  const getRecentRequests = () => {
    
    console.log('=== DASHBOARD DEBUG ===');
    console.log('isAdmin:', isAdmin);
    console.log('demandesPreviewTeamAll:', demandesPreviewTeamAll);
    console.log('demandesPreviewTeamAll length:', demandesPreviewTeamAll?.length);
    console.log('mesDemandes:', mesDemandes);
    console.log('mesDemandes length:', mesDemandes?.length);
    console.log('demandesLoading:', demandesLoading);
    console.log('mesDemandesLoading:', mesDemandesLoading);
    console.log('========================');
    
    if (isAdmin && demandesPreviewTeamAll && demandesPreviewTeamAll.length > 0) {
      
      return demandesPreviewTeamAll.slice(0, 5).map(demande => {
        
        console.log('Admin demande structure:', demande);
        
        let userName = 'Utilisateur inconnu';
        if (demande.demandeur) {
          
          if (demande.demandeur.prenom && demande.demandeur.nom) {
            userName = `${demande.demandeur.prenom} ${demande.demandeur.nom}`.trim();
          } else if (demande.demandeur.nom) {
            
            userName = demande.demandeur.nom;
          } else if (demande.demandeur.prenom) {
            
            userName = demande.demandeur.prenom;
          }
        }
        
        return {
          user: userName,
          type: demande.option ? (demande.option.libelle || demande.option.name || 'Type inconnu') : 'Type inconnu',
          date: demande.dateDemande ? new Date(demande.dateDemande).toLocaleDateString('fr-FR') : 
                demande.createdAt ? new Date(demande.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue',
          status: demande.status || demande.statut || 'en cours',
          
          contenu: demande.contenu || '',
          id: demande._id || '',
          traitement: demande.traitement || []
        };
      });
    } else if (!isAdmin && mesDemandes && mesDemandes.length > 0) {
      
      return mesDemandes.slice(0, 5).map(demande => {
        
        console.log('User demande structure:', demande);
        
        let userDisplayName = 'Vous';
        if (userInfo) {
          if (userInfo.prenom && userInfo.nom) {
            userDisplayName = `${userInfo.prenom} ${userInfo.nom}`.trim();
          } else if (userInfo.nom) {
            userDisplayName = userInfo.nom;
          } else if (userInfo.prenom) {
            userDisplayName = userInfo.prenom;
          }
        }
        
        return {
          user: userDisplayName,
          type: demande.option ? (demande.option.libelle || demande.option.name || 'Type inconnu') : 'Type inconnu',
          date: demande.dateDemande ? new Date(demande.dateDemande).toLocaleDateString('fr-FR') : 
                demande.createdAt ? new Date(demande.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue',
          status: demande.status || demande.statut || 'en cours',
          
          contenu: demande.contenu || '',
          id: demande._id || '',
          traitement: demande.traitement || []
        };
      });
    } else {
      
      
      return [];
    }
  };

  const recentRequests = getRecentRequests();

  
  const getChartOptions = () => {
    if (isAdmin) {
      return [
        { value: 'users', label: t('dashboard.usersEvolution') || 'Évolution des Utilisateurs', component: UsersLineChart },
        { value: 'demandes', label: t('dashboard.requestsEvolution') || 'Évolution des Demandes', component: DamiLineChart },
        { value: 'options', label: t('dashboard.optionsBySubcategory') || 'Options par Sous-catégorie', component: DamiBySousCategorieDoughnutChart },
        { value: 'services', label: t('dashboard.optionsByService') || 'Options par Service', component: DamiByServiceDoughnutChart },
        { value: 'directions', label: t('dashboard.requestsByDepartment') || 'Demandes par Direction', component: DemandeByDirectionBarChart },
        { value: 'demandes-line', label: t('dashboard.onlineRequests') || 'Demandes en Ligne', component: DemandeLineChart }
      ];
    } else if (isSignataire) {
      return [
        { value: 'demandes', label: t('dashboard.requestsEvolution') || 'Évolution des Demandes', component: DamiLineChart },
        { value: 'demandes-line', label: t('dashboard.onlineRequests') || 'Demandes en Ligne', component: DemandeLineChart }
      ];
    } else if (isDemandeur) {
      return [
        { value: 'demandes', label: t('dashboard.requestsEvolution') || 'Évolution des Demandes', component: DamiLineChart },
        { value: 'demandes-line', label: t('dashboard.onlineRequests') || 'Demandes en Ligne', component: DemandeLineChart }
      ];
    } else if (isCreateur) {
      return [
        { value: 'options', label: t('dashboard.optionsBySubcategory') || 'Options par Sous-catégorie', component: DamiBySousCategorieDoughnutChart },
        { value: 'services', label: t('dashboard.optionsByService') || 'Options par Service', component: DamiByServiceDoughnutChart }
      ];
    } else {
      return [
        { value: 'demandes', label: t('dashboard.requestsEvolution') || 'Évolution des Demandes', component: DamiLineChart }
      ];
    }
  };

  const chartOptions = getChartOptions();

  
  const handleRefresh = () => {
    console.log('=== MANUAL REFRESH ===');
    console.log('isAdmin:', isAdmin);
    
    if (isAdmin) {
      console.log('Refreshing admin demandes...');
      dispatch(getDemandesPreviewTeamAll({ page: 1, limit: 10 }));
    } else {
      console.log('Refreshing user demandes...');
      dispatch(getMesDemandes());
    }
    
    
    console.log('Refreshing dashboard statistics...');
    dispatch(getDashboardStats());
    
    console.log('======================');
  };

  const renderChart = () => {
    const selectedOption = chartOptions.find(option => option.value === selectedChart);
    if (selectedOption) {
      const ChartComponent = selectedOption.component;
      return <ChartComponent />;
    }
    return chartOptions.length > 0 ? React.createElement(chartOptions[0].component) : <div>No charts available</div>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'approuve': { color: 'success', text: t('dashboard.statusApproved') || 'Approuvé' },
      'refuse': { color: 'danger', text: t('dashboard.statusRejected') || 'Refusé' },
      'en cours': { color: 'warning', text: t('dashboard.statusInProgress') || 'En cours' },
      'pending': { color: 'warning', text: t('dashboard.statusPending') || 'En attente' }
    };

    const config = statusConfig[status] || statusConfig['en cours'];
    
    return (
      <Badge 
        bg={config.color}
        style={{ 
          fontSize: 'var(--text-xs)', 
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {config.text}
      </Badge>
    );
  };

  
  const textAlignment = isRTL ? 'right' : 'left';

  return (
    <div className="app-container-white">
      <style>{customStyles}</style>
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
                {t('dashboard.dashboardTitle') || 'Tableau de bord'}
              </h1>
              <p className="dashboard-subtitle" style={{
                color: "var(--text-secondary)",
                fontSize: "var(--text-base)",
                marginBottom: "0",
                textAlign: textAlignment
              }}>
                {t('dashboard.welcomeMessage', { user: userInfo?.prenom || userInfo?.nom || 'Utilisateur' }) || 
                 `Bienvenue, ${userInfo?.prenom || userInfo?.nom || 'Utilisateur'} !`}
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
                  {t('dashboard.refresh') || 'Actualiser'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {}
        <Row className="mb-5">
          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              pointerEvents: 'auto'
            }}>
              <Card.Body style={{ padding: 'var(--space-4)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="mb-1" style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      textAlign: textAlignment
                    }}>
                      {statsLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        stats.activeUsers
                      )}
                    </h3>
                    <p className="mb-2" style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      marginBottom: 'var(--space-2)',
                      textAlign: textAlignment
                    }}>
                      {isAdmin ? (t('dashboard.activeUsers') || 'Utilisateurs actifs') : 
                       isSignataire ? (t('dashboard.pendingRequests') || 'Demandes en cours') :
                       isDemandeur ? (t('dashboard.myRequests') || 'Mes demandes') :
                       isCreateur ? (t('dashboard.myOptions') || 'Mes options') : 'Données'}
                    </p>
                    <div className={`d-flex align-items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {stats.changes?.users > 0 ? (
                        <MdArrowUpward size={16} style={{ color: 'var(--success-main)' }} />
                      ) : (
                        <MdArrowDownward size={16} style={{ color: 'var(--error-main)' }} />
                      )}
                      <span style={{ 
                        fontSize: 'var(--text-xs)',
                        color: stats.changes?.users > 0 ? 'var(--success-main)' : 'var(--error-main)',
                        marginLeft: isRTL ? '0' : 'var(--space-1)',
                        marginRight: isRTL ? 'var(--space-1)' : '0'
                      }}>
                        {Math.abs(stats.changes?.users || 0)}% {t('dashboard.thisMonth') || 'ce mois'}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--info-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MdPeople size={24} style={{ color: 'var(--info-main)' }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              pointerEvents: 'auto'
            }}>
              <Card.Body style={{ padding: 'var(--space-4)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="mb-1" style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      textAlign: textAlignment
                    }}>
                      {stats.pendingRequests}
                    </h3>
                    <p className="mb-2" style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      marginBottom: 'var(--space-2)',
                      textAlign: textAlignment
                    }}>
                      {isAdmin ? (t('dashboard.pendingRequests') || 'Demandes en cours') : 
                       isSignataire ? (t('dashboard.approvedRequests') || 'Demandes approuvées') :
                       isDemandeur ? (t('dashboard.pendingRequests') || 'En attente') :
                       isCreateur ? (t('dashboard.activeOptions') || 'Options actives') : 'Données'}
                    </p>
                    <div className={`d-flex align-items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {stats.changes?.requests > 0 ? (
                        <MdArrowUpward size={16} style={{ color: 'var(--success-main)' }} />
                      ) : (
                        <MdArrowDownward size={16} style={{ color: 'var(--error-main)' }} />
                      )}
                      <span style={{ 
                        fontSize: 'var(--text-xs)',
                        color: stats.changes?.requests > 0 ? 'var(--success-main)' : 'var(--error-main)',
                        marginLeft: isRTL ? '0' : 'var(--space-1)',
                        marginRight: isRTL ? 'var(--space-1)' : '0'
                      }}>
                        {Math.abs(stats.changes?.requests || 0)}% {t('dashboard.thisMonth') || 'ce mois'}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--warning-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MdDescription size={24} style={{ color: 'var(--warning-main)' }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              pointerEvents: 'auto'
            }}>
              <Card.Body style={{ padding: 'var(--space-4)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="mb-1" style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      textAlign: textAlignment
                    }}>
                      {stats.directions}
                    </h3>
                    <p className="mb-2" style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      marginBottom: 'var(--space-2)',
                      textAlign: textAlignment
                    }}>
                      {isAdmin ? (t('dashboard.directions') || 'Directions') : 
                       isSignataire ? (t('dashboard.rejectedRequests') || 'Demandes refusées') :
                       isDemandeur ? (t('dashboard.approvedRequests') || 'Approuvées') :
                       isCreateur ? (t('dashboard.pendingOptions') || 'En attente') : 'Données'}
                    </p>
                    <div className={`d-flex align-items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span style={{ 
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)'
                      }}>
                        {t('dashboard.total') || 'Total'}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--success-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MdBusiness size={24} style={{ color: 'var(--success-main)' }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="stat-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              pointerEvents: 'auto'
            }}>
              <Card.Body style={{ padding: 'var(--space-4)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="mb-1" style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      textAlign: textAlignment
                    }}>
                      {stats.approvalRate}%
                    </h3>
                    <p className="mb-2" style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      marginBottom: 'var(--space-2)',
                      textAlign: textAlignment
                    }}>
                      {isAdmin ? (t('dashboard.approvalRate') || 'Taux d\'approbation') : 
                       isSignataire ? (t('dashboard.myOptions') || 'Mes options') :
                       isDemandeur ? (t('dashboard.rejectedRequests') || 'Refusées') :
                       isCreateur ? (t('dashboard.totalRequests') || 'Total demandes') : 'Données'}
                    </p>
                    <div className={`d-flex align-items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span style={{ 
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)'
                      }}>
                        {t('dashboard.thisMonth') || 'ce mois'}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MdTrendingUp size={24} style={{ color: 'white' }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {}
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="chart-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              height: '790px'
            }}>
              <Card.Header style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                padding: 'var(--space-4)',
                textAlign: textAlignment
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0" style={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    {t('dashboard.interactiveStats') || 'Statistiques interactives'}
                  </h5>
                  {chartOptions.length > 1 && (
                    <Dropdown align={isRTL ? "start" : "end"}>
                      <Dropdown.Toggle 
                        variant="outline-secondary" 
                        size="sm"
                        style={{ 
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {chartOptions.find(opt => opt.value === selectedChart)?.label || t('dashboard.selectChart') || 'Sélectionner'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)'
                      }}>
                        {chartOptions.map((option) => (
                          <Dropdown.Item 
                            key={option.value}
                            onClick={() => setSelectedChart(option.value)}
                            style={{
                              color: selectedChart === option.value ? 'var(--accent-blue)' : 'var(--text-primary)',
                              background: selectedChart === option.value ? 'var(--info-light)' : 'transparent',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {option.label}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </Card.Header>
              <Card.Body style={{ padding: 'var(--space-4)' }}>
                {renderChart()}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="recent-requests-card-white" style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              height: '400px'
            }}>
              <Card.Header style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                padding: 'var(--space-4)',
                textAlign: textAlignment
              }}>
                <h5 className="mb-0" style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  {isAdmin ? (t('dashboard.recentRequests') || 'Demandes récentes') : (t('dashboard.myRecentRequests') || 'Mes demandes récentes')}
                </h5>
              </Card.Header>
              <Card.Body style={{ 
                padding: 'var(--space-4)',
                overflowY: 'auto',
                maxHeight: '320px'
              }}>
                {(demandesLoading || mesDemandesLoading) ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    color: 'var(--text-secondary)'
                  }}>
                    <Spinner animation="border" size="sm" style={{ marginBottom: 'var(--space-3)' }} />
                    <p>{t('dashboard.loading') || 'Chargement des demandes...'}</p>
                  </div>
                ) : recentRequests && recentRequests.length > 0 ? (
                  <div className="recent-requests-list">
                    {recentRequests.map((request, index) => (
                      <div 
                        key={request.id || index}
                        className="request-item-white"
                        style={{
                          padding: 'var(--space-3)',
                          borderBottom: index < recentRequests.length - 1 ? '1px solid var(--border-light)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}
                      >
                        <div style={{ flex: 1, textAlign: textAlignment }}>
                          <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {request.user}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            {request.type}
                          </div>
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)'
                          }}>
                            {request.date}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    color: 'var(--text-secondary)'
                  }}>
                    <MdDescription size={48} style={{ marginBottom: 'var(--space-3)' }} />
                    <p>{t('dashboard.noRecentRequests') || 'Aucune demande récente trouvée dans la base de données'}</p>
                    <small style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      Les demandes s'afficheront automatiquement quand elles seront créées dans le système
                    </small>
                    <div style={{ 
                      marginTop: 'var(--space-3)', 
                      padding: 'var(--space-2)', 
                      background: 'var(--info-light)', 
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>Debug Info:</strong><br/>
                      Admin: {isAdmin ? 'Oui' : 'Non'}<br/>
                      Demandes Admin: {demandesPreviewTeamAll?.length || 0}<br/>
                      Mes Demandes: {mesDemandes?.length || 0}<br/>
                      Chargement: {demandesLoading || mesDemandesLoading ? 'Oui' : 'Non'}<br/>
                      <br/>
                      <strong>Statistiques Réelles:</strong><br/>
                      Utilisateurs Actifs: {dashboardStats?.activeUsers || 'N/A'}<br/>
                      Demandes en Cours: {dashboardStats?.pendingRequests || 'N/A'}<br/>
                      Directions: {dashboardStats?.directions || 'N/A'}<br/>
                      Taux Approbation: {dashboardStats?.approbationRate || 'N/A'}%<br/>
                      Chargement Stats: {statsLoading ? 'Oui' : 'Non'}<br/>
                      <br/>
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={handleRefresh}
                        style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
                      >
                        🔄 Tester Refresh
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;