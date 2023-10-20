import React, { useEffect } from "react";

const StepsProgress = ({ steps = [], activeStep = 0 }) => {
  useEffect(() => {}, []);
  return (
    <div className="row  mb-5 px-5">
      <div className="col-md-12 mb-5 px-md-5 px-sm-0">
        <div className="d-flex flex-row justify-content-between align-items-center align-content-center px-md-5 px-sm-0">
          {steps.map((step, index) => (
            <>
              <span
                className={`dot d-flex justify-content-center align-items-center ${
                  activeStep <= index - 1 && "nn-dot"
                }`}
                key={index + 1}
              >
                {activeStep > index - 1 && <i className="fas fa-check"></i>}
                <small>{step}</small>
              </span>

              {index !== steps.length - 1 && (
                <span
                  className={`flex-fill track-line ${
                    activeStep < index + 1 && "nn-track-line"
                  }`}
                />
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepsProgress;
