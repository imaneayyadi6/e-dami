const cssStringToObject = cssString => {
  // Create an empty object to store the style properties
  const styleObject = {};
  if (cssString) {
    // Split the string by semicolons to get individual property declarations
    const propertyDeclarations = cssString.split(";");
    // Loop through each property declaration
    for (const declaration of propertyDeclarations) {
      // Split each declaration by colon to separate property name and value
      const [property, value] = declaration.split(":");
      if (value) {
        // Trim any extra whitespace from property and value
        const propertyName = property.trim();
        const propertyValue = value.trim();

        // Add the property to the style object
        if (propertyName && propertyValue) {
          styleObject[propertyName] = propertyValue;
        }
      }
    }
  }

  return styleObject;
};

export default cssStringToObject;
