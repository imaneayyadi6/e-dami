import React, { useEffect } from "react";
import { useLanguageSync } from "../hooks/useLanguageSync";

const StepsProgress = ({ steps = [], activeStep = 0 }) => {
  const { isRTL } = useLanguageSync();
  
  
  const stepIcons = [
    "fas fa-file-alt",      
    "fas fa-cogs",          
    "fas fa-signature",     
    "fas fa-list-alt",      
    "fas fa-check-circle"   
  ];

  useEffect(() => {}, []);
  
  return (
    <div className="row mb-4 px-3">
      <div className="col-12">
        <div 
          className={`d-flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-content-between align-items-center`}
          style={{ 
            direction: isRTL ? 'rtl' : 'ltr',
            minHeight: '80px'
          }}
        >
          {steps && steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="d-flex flex-column align-items-center position-relative">
                {}
                <div
                  className={`step-circle d-flex justify-content-center align-items-center ${
                    activeStep >= index ? 'step-active' : 'step-inactive'
                  }`}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: activeStep >= index ? '#007bff' : '#e9ecef',
                    color: activeStep >= index ? 'white' : '#6c757d',
                    border: `3px solid ${activeStep >= index ? '#007bff' : '#dee2e6'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: activeStep >= index ? '0 4px 8px rgba(0,123,255,0.3)' : 'none',
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  {activeStep > index ? (
                    <i className="fas fa-check" style={{ fontSize: '16px' }}></i>
                  ) : (
                    <i className={stepIcons[index] || "fas fa-circle"} style={{ fontSize: '14px' }}></i>
                  )}
                </div>
                
                {}
                <div 
                  className="step-label mt-2 text-center"
                  style={{
                    fontSize: '12px',
                    fontWeight: activeStep >= index ? '600' : '400',
                    color: activeStep >= index ? '#007bff' : '#6c757d',
                    maxWidth: '100px',
                    lineHeight: '1.2',
                    transition: 'all 0.3s ease',
                    direction: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'center'
                  }}
                >
                  {step}
                </div>
              </div>

              {}
              {index !== steps.length - 1 && (
                <div
                  className="step-connector flex-fill"
                  style={{
                    height: '3px',
                    backgroundColor: activeStep > index ? '#007bff' : '#dee2e6',
                    margin: isRTL ? '0 10px 0 0' : '0 0 0 10px',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    top: '-25px'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepsProgress;
