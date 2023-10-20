import React from "react";

const Divider = ({ children1, children2, id, removeChild1, removeChild2 }) => {
  return (
    <div className="divider">
      <div className="divider-child">
        {children1 &&
          children1.length > 0 &&
          children1.map((child) => (
            <div key={child.id} id={`child1-${child.id}`}>
              <div
                className="d-flex justify-content-end btn-remove-child"
                onClick={(e) => removeChild1(id, child.id)}
              >
                <span className="btn-remove-divider-children">
                  <i className="fas fa-times"></i>
                </span>
              </div>
              <div className={`child-type-${child.type}`}>
                {child.component}
              </div>
            </div>
          ))}
      </div>
      <div className="divider-child">
        {children2 &&
          children2.length > 0 &&
          children2.map((child) => (
            <div
              key={child.id}
              id={`child2-${child.id}`}
              className={`child-type-${child.type}`}
            >
              <div
                className="d-flex justify-content-end btn-remove-child"
                onClick={(e) => removeChild2(id, child.id)}
              >
                <span className="btn-remove-divider-children">
                  <i className="fas fa-times"></i>
                </span>
              </div>
              <div className={`child-type-${child.type}`}>
                {child.component}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Divider;
