import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Row, Col, Collapse } from "react-bootstrap";
import Chart from "chart.js/auto";
import { useSelector, useDispatch } from "react-redux";
import { fetchDirectionsSignataires } from "../../redux/direction/directionActions";
import Message from "../Message";
import { fetchChartLineDemandeSignataire } from "../../redux/chart/chartActions";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";
import { MdChevronRight, MdChevronLeft } from "react-icons/md";

const DemandesLinesForDirecteur = () => {
  const chartRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openCustomFilter, setOpenCustomFilter] = useState(false);

  const dispatch = useDispatch();
  const directionSignatairesList = useSelector(
    (state) => state.directionSignatairesList
  );

  const chartGetLineDemandesSignataire = useSelector(
    (state) => state.chartGetLineDemandesSignataire
  );
  const {
    loading: loadingchartGetLineDemandesSignataire,
    error: errorchartGetLineDemandesSignataire,
    success: successchartGetLineDemandesSignataire,
    data,
  } = chartGetLineDemandesSignataire;

  const { current: currentLanguage } = useSelector((state) => state.language);
  const isRTL = currentLanguage === "ar";

  
  const translations = {
    fr: {
      chartTitle: "Demandes par direction et dates",
      last90Days: "90 Jours",
      last3Months: "3 Mois",
      last6Months: "6 Mois",
      lastYear: "Dernière Année",
      defaultView: "Vue par défaut (4 mois)",
      filter: "Filtrer",
      resetFilter: "Réinitialiser le filtre",
      startDate: "Date de début",
      endDate: "Date de fin",
      enCoursLabel: "En cours",
      refuseLabel: "Refusée",
      approuveLabel: "Approuvée",
      loading: "Chargement des données du graphique...",
      error: "Erreur lors du chargement des données du graphique.",
      noData: "Aucune donnée disponible pour la période sélectionnée.",
      customFilter: "Période personnalisée",
    },
    ar: {
      chartTitle: "الطلبات حسب الاتجاه والتاريخ",
      last90Days: "90 يومًا",
      last3Months: "3 أشهر",
      last6Months: "6 أشهر",
      lastYear: "السنة الماضية",
      defaultView: "العرض الافتراضي (4 أشهر)",
      filter: "تصفية",
      resetFilter: "إعادة تعيين التصفية",
      startDate: "تاريخ البدء",
      endDate: "تاريخ الانتهاء",
      enCoursLabel: "قيد المراجعة",
      refuseLabel: "مرفوضة",
      approuveLabel: "موافق عليها",
      loading: "جارٍ تحميل بيانات الرسم البياني...",
      error: "حدث خطأ أثناء تحميل بيانات الرسم البياني.",
      noData: "لا توجد بيانات متاحة للفترة المحددة.",
      customFilter: "تاريخ مخصص",
    },
  };

  const t = translations[currentLanguage] || translations.fr;

  const filterHandler = () => {
    dispatch(fetchChartLineDemandeSignataire(startDate, endDate));
  };

  const resetFiltreHandler = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchChartLineDemandeSignataire());
  };

  const quickFilterHandler = (period) => {
    setOpenCustomFilter(false);
    const today = new Date();
    let calculatedStartDate, calculatedEndDate;

    switch (period) {
      case "last_year":
        calculatedStartDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        calculatedEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "6_months":
        calculatedStartDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        calculatedEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "3_months":
        calculatedStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        calculatedEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "90_days":
      default:
        calculatedEndDate = new Date();
        calculatedStartDate = new Date(calculatedEndDate.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
    }

    const formatDate = (date) => date.toISOString().split("T")[0];
    const startDateStr = formatDate(calculatedStartDate);
    const endDateStr = formatDate(calculatedEndDate);

    setStartDate(startDateStr);
    setEndDate(endDateStr);
    dispatch(fetchChartLineDemandeSignataire(startDateStr, endDateStr));
  };

  useEffect(() => {
    dispatch(fetchChartLineDemandeSignataire());
    return () => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (successchartGetLineDemandesSignataire && data) {
      if (chartRef.current) {
        if (chartRef.current.chart) {
          chartRef.current.chart.destroy();
        }

        const monthOrder = [
          "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
          "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];

        let months = data && typeof data === 'object' ? Object.keys(data) : [];
        
        months.sort((a, b) => {
          const parseMonth = (monthStr) => {
            const parts = monthStr.split(' ');
            const monthName = parts[0];
            const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
            const monthIndex = monthOrder.indexOf(monthName);
            return { year, monthIndex, monthName };
          };
          
          const monthA = parseMonth(a);
          const monthB = parseMonth(b);
          
          if (monthA.year !== monthB.year) {
            return monthA.year - monthB.year;
          }
          return monthA.monthIndex - monthB.monthIndex;
        });

        const resultObject = {};
        const allStatuses = ["en cours", "refuse", "approuve"];
        allStatuses.forEach(status => {
          resultObject[status] = [];
        });

        for (const month of months) {
          allStatuses.forEach(status => {
            const value = (data && data[month] && data[month][status]) || 0;
            resultObject[status].push(value);
          });
        }

        const chartData = {
          labels: months,
          datasets: [
            {
              label: t.enCoursLabel,
              data: resultObject["en cours"],
              fill: false,
              backgroundColor: "rgba(255, 165, 0, 0.2)",
              borderColor: "rgba(255, 165, 0, 1)",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: t.refuseLabel,
              data: resultObject["refuse"],
              fill: false,
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              borderColor: "rgba(255, 0, 0, 1)",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: t.approuveLabel,
              data: resultObject["approuve"],
              fill: false,
              backgroundColor: "rgba(0, 128, 0, 0.2)",
              borderColor: "rgba(0, 128, 0, 1)",
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        };

        const ctx = chartRef.current.getContext("2d");
        chartRef.current.chart = new Chart(ctx, {
          type: "line",
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: isRTL ? "right" : "left",
                labels: {
                  color: "#333",
                },
              },
              tooltip: {
                rtl: isRTL,
                titleAlign: isRTL ? "right" : "left",
                bodyAlign: isRTL ? "right" : "left",
                callbacks: {
                  title: (context) => context[0].label,
                  label: (context) => `${context.dataset.label}: ${context.raw}`,
                },
              },
            },
            scales: {
              x: {
                ticks: { color: "#666" },
                grid: { color: "#eee" },
                title: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#666" },
                grid: { color: "#eee" },
                title: { display: false },
              },
            },
          },
        });
      }
    }
  }, [successchartGetLineDemandesSignataire, data, currentLanguage, t, isRTL]);

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
          {t.chartTitle}
        </h4>
        <Button
          variant="link"
          onClick={() => setOpenCustomFilter(!openCustomFilter)}
          aria-controls="custom-filter-collapse"
          aria-expanded={openCustomFilter}
          style={linkButtonStyle}
        >
          {t.customFilter}
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
          {t.last90Days}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("3_months")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {t.last3Months}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("6_months")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {t.last6Months}
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => quickFilterHandler("last_year")}
          style={{ borderRadius: "8px", flexGrow: 1, borderColor: "#ccc", color: "#666" }}
        >
          {t.lastYear}
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
                    {t.startDate}
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
                    {t.endDate}
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
                  {t.filter}
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
        {t.defaultView}
      </Button>

      {errorchartGetLineDemandesSignataire && <Message variant="danger">{t.error}</Message>}
      {loadingchartGetLineDemandesSignataire && <Loader />}
      {data && Object.keys(data).length > 0 ? (
        <div style={{ height: "300px" }}>
          <canvas ref={chartRef} id={uuidv4()}></canvas>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", color: "#999" }}>
          <p>{t.noData}</p>
        </div>
      )}
    </div>
  );
};

export default DemandesLinesForDirecteur;