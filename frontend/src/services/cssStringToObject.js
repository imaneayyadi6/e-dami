const cssStringToObject = cssString => {
  
  const styleObject = {};
  if (cssString) {
    
    const propertyDeclarations = cssString.split(";");
    
    for (const declaration of propertyDeclarations) {
      
      const [property, value] = declaration.split(":");
      if (value) {
        
        const propertyName = property.trim();
        const propertyValue = value.trim();

        
        if (propertyName && propertyValue) {
          styleObject[propertyName] = propertyValue;
        }
      }
    }
  }

  return styleObject;
};

export default cssStringToObject;
