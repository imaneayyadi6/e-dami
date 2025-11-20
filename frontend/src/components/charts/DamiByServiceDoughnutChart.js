import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartOptionsCountOfServices } from "../../redux/chart/chartActions";
import Message from "../Message";
import Loader from "../Loader";
import { v4 as uuidv4 } from "uuid";
import { useLanguageSync } from "../../hooks/useLanguageSync";

const DamiByServiceDoughnutChart = () => {
  const chartRef = useRef(null);

  const dispatch = useDispatch();
  const chartGetOptionsCountOfServices = useSelector(
    (state) => state.chartGetOptionsCountOfServices
  );
  const {
    loading: loadingChartGetOptionsCountOfService,
    error: errorChartGetOptionsCountOfService,
    success: successChartGetOptionsCountOfService,
    data,
  } = chartGetOptionsCountOfServices;

  const { isRTL, currentLanguage } = useLanguageSync();

  
  const translations = {
    fr: {
      chartTitle: "Options par service",
      loading: "Chargement des données du graphique...",
      error: "Erreur lors du chargement des données du graphique.",
      noData: "Aucune donnée disponible.",
    },
    ar: {
      chartTitle: "الخيارات حسب الخدمة",
      loading: "جارٍ تحميل بيانات الرسم البياني...",
      error: "حدث خطأ أثناء تحميل بيانات الرسم البياني.",
      noData: "لا توجد بيانات متاحة.",
    },
  };

  const t = translations[currentLanguage] || translations.fr;

  const generateColors = (number) => {
    const colors = [];
    const crypto = window.crypto || window.msCrypto;

    for (let i = 0; i < number; i++) {
      const redArray = new Uint8Array(1);
      const greenArray = new Uint8Array(1);
      const blueArray = new Uint8Array(1);

      
      crypto.getRandomValues(redArray);
      crypto.getRandomValues(greenArray);
      crypto.getRandomValues(blueArray);

      
      const red = redArray[0]; 
      const green = greenArray[0]; 
      const blue = blueArray[0]; 
      const alpha = 0.2;

      const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      colors.push(color);
    }

    return colors;
  };

  useEffect(() => {
    dispatch(fetchChartOptionsCountOfServices());
    return () => {
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (successChartGetOptionsCountOfService && data) {
      if (chartRef.current) {
        
        if (chartRef.current.chart) {
          chartRef.current.chart.destroy();
        }
        let labels = [];
        let counts = [];

        for (let item of Array.isArray(data) ? data : []) {
          labels.push(item.service);
          counts.push(Number(item.count));
        }

        const ctx = chartRef.current.getContext("2d");
        const chartdata = {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: generateColors(data.length),
            },
          ],
        };
        
        chartRef.current.chart = new Chart(ctx, {
          type: "doughnut",
          data: chartdata,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  color: "#333",
                  padding: 20,
                  usePointStyle: true,
                },
              },
              tooltip: {
                rtl: isRTL,
                titleAlign: isRTL ? "right" : "left",
                bodyAlign: isRTL ? "right" : "left",
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  },
                },
              },
            },
          },
        });
      }
    }
  }, [successChartGetOptionsCountOfService, data, isRTL]);

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
    justifyContent: "center",
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
      </div>

      {errorChartGetOptionsCountOfService && <Message variant="danger">{t.error}</Message>}
      {loadingChartGetOptionsCountOfService && <Loader />}
      {data && data.length > 0 ? (
        <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
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

export default DamiByServiceDoughnutChart;