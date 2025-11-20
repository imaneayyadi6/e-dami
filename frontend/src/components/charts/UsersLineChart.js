import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Row, Col, Collapse } from "react-bootstrap";
import Chart from "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartUsers } from "../../redux/chart/chartActions";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";
import { MdChevronRight, MdChevronLeft } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const UsersLineChart = () => {
  const [callOnce, setCallOnce] = useState(false);

  const chartRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openCustomFilter, setOpenCustomFilter] = useState(false);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguageSync();
  
  const chartGetUsers = useSelector(state => state.chartGetUsers);
  const {
    loading: loadingChartGetUsers,
    error: errorChartGetUsers,
    success: successChartGetUsers,
    data,
  } = chartGetUsers;

  
  const chartTranslations = {
    fr: {
      title: "Évolution des Utilisateurs",
      usersLabel: "Utilisateurs",
      startDate: "Début",
      endDate: "Fin",
      apply: "Appliquer",
      reset: "Vue par défaut (5 derniers mois)",
      noData: "Aucune donnée disponible.",
      quickFilters: {
        week: "Cette semaine",
        month: "Ce mois",
        quarter: "Ce trimestre",
        year: "Cette année"
      }
    },
    ar: {
      title: "تطور المستخدمين",
      usersLabel: "المستخدمون",
      startDate: "البداية",
      endDate: "النهاية",
      apply: "تطبيق",
      reset: "العرض الافتراضي (آخر 5 أشهر)",
      noData: "لا توجد بيانات متاحة.",
      quickFilters: {
        week: "هذا الأسبوع",
        month: "هذا الشهر",
        quarter: "هذا الربع",
        year: "هذا العام"
      }
    }
  };

  const currentTranslations = chartTranslations[currentLanguage] || chartTranslations.fr;

  const filterHandler = () => {
    dispatch(fetchChartUsers(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartUsers());
  };

  const quickFilterHandler = (period) => {
    const today = new Date();
    let startDate, endDate;
    
    switch(period) {
      case 'last_year':
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); 
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
        break;
      case '6_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
        break;
      case '3_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
        break;
      case '90_days':
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        endDate = new Date(); 
        break;
    }
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    dispatch(fetchChartUsers(startDateStr, endDateStr));
  };

  useEffect(() => {
    if (!callOnce) {
      dispatch(fetchChartUsers());
      setCallOnce(true);
    }
  }, [callOnce, dispatch]);

  useEffect(() => {
    if (successChartGetUsers && data && chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      
      
      const monthOrder = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];

      
      const sortedData = Array.isArray(data) ? [...data].sort((a, b) => {
        
        const parseMonth = (monthStr) => {
          const parts = monthStr.split(' ');
          const monthName = parts[0];
          const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
          const monthIndex = monthOrder.indexOf(monthName);
          return { year, monthIndex, monthName };
        };
        
        const monthA = parseMonth(a.month);
        const monthB = parseMonth(b.month);
        
        
        if (monthA.year !== monthB.year) {
          return monthA.year - monthB.year;
        }
        return monthA.monthIndex - monthB.monthIndex;
      }) : [];

      let labels = [];
      let counts = [];

      for (let item of sortedData) {
        labels.push(item.month);
        counts.push(Number(item.count));
      }

      const ctx = chartRef.current.getContext("2d");
      
      const objData = {
        labels: labels,
        datasets: [
          {
            label: currentTranslations.usersLabel,
            data: counts,
            borderColor: "rgba(0, 128, 0, 0.2)",
            backgroundColor: "rgba(0, 128, 0, 0.2)",
            borderWidth: 2,
            fill: false,
          },
        ],
      };

      
      chartRef.current.chart = new Chart(ctx, {
        type: "line",
        data: objData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "#333",
              },
            },
            tooltip: {
              rtl: isRTL,
              titleAlign: isRTL ? "right" : "left",
              bodyAlign: isRTL ? "right" : "left",
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#666" },
              grid: { color: "#eee" },
            },
            y: {
              beginAtZero: true,
              ticks: { color: "#666" },
              grid: { color: "#eee" },
            },
          },
        },
      });
    }

    return () => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [successChartGetUsers, data, currentTranslations.usersLabel, isRTL]);

  const chevronIcon = openCustomFilter ? (isRTL ? <MdChevronRight /> : <MdChevronLeft />) : (isRTL ? <MdChevronLeft /> : <MdChevronRight />);

  const chartContainerStyle = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)", 
    transition: "all 0.3s ease-in-out",
    height: "auto",
    padding: "24px",
    fontFamily: "inherit",
  };

  const chartHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f0f0f0", 
  };

  const chartTitleStyle = {
    color: "#333",
    fontWeight: "300",
    fontSize: "1.2rem",
  };

  const linkButtonStyle = {
    color: "#4287f5",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
  };

  const formLabelStyle = {
    fontSize: "0.875rem",
    color: "#666",
  };

  const formControlStyle = {
    borderRadius: "8px",
    borderColor: "#ccc",
    textAlign: isRTL ? "right" : "left",
  };

  return (
    <div
      style={chartContainerStyle}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        style={chartHeaderStyle}
      >
        <h4 className="mb-0" style={chartTitleStyle}>
          {currentTranslations.title}
        </h4>
        <Button
          variant="link"
          onClick={() => setOpenCustomFilter(!openCustomFilter)}
          aria-controls="custom-filter-collapse"
          aria-expanded={openCustomFilter}
          style={linkButtonStyle}
        >
          {isRTL ? `فترة مخصصة` : `Période personnalisée`}
          <span style={{ margin: "0 4px" }}>{chevronIcon}</span>
        </Button>
      </div>

      <div className={`d-flex flex-wrap gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("90_days")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {isRTL ? "90 يومًا" : "90 Jours"}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("3_months")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {isRTL ? "3 أشهر" : "3 Mois"}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("6_months")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {isRTL ? "6 أشهر" : "6 Mois"}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("last_year")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {isRTL ? "السنة الماضية" : "Dernière Année"}
        </Button>
      </div>

      <Collapse in={openCustomFilter}>
        <div id="custom-filter-collapse" className="mb-4">
          <hr style={{ borderColor: '#f0f0f0' }} />
          <Form>
            <Row className={`align-items-end g-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Col xs={12} md={5}>
                <Form.Group controlId="startDate">
                  <Form.Label style={formLabelStyle}>
                    {currentTranslations.startDate}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={formControlStyle}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={5}>
                <Form.Group controlId="endDate">
                  <Form.Label style={formLabelStyle}>
                    {currentTranslations.endDate}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={formControlStyle}
                  />
                </Form.Group>
              </Col>
              <Col xs={18} md={2}>
                <Button 
                    variant="primary" 
                    onClick={filterHandler} 
                    className="w-100" 
                    style={{ borderRadius: "8px", background: "#4287f5", padding: '0.7rem 0.7rem',border: "1px solid #4287f5", color: "#fff"  }}
                >
                  {isRTL ? "تصفية" : "Filtrer"}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Collapse>

      <Button
        variant="outline-secondary"
        size="sm"
        className="w-100 mb-4"
        onClick={resetFiltreHandler}
        style={{ 
            borderRadius: "8px", 
            borderColor: "#ccc", 
            color: "#666",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        }}
      >
        <MdChevronLeft style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {isRTL ? "العرض الافتراضي (5 أشهر)" : "Vue par défaut (5 mois)"}
      </Button>

      {errorChartGetUsers && <Message variant="danger">{errorChartGetUsers}</Message>}
      {loadingChartGetUsers && <Loader />}
      {data && data.length > 0 ? (
        <div style={{ height: "300px" }}>
          {chartRef && <canvas ref={chartRef} id={uuidv4()}></canvas>}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", color: "#999" }}>
          <p>{currentTranslations.noData}</p>
        </div>
      )}
    </div>
  );
};

export default UsersLineChart;
