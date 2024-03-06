import { useState, useEffect } from "react";

const useFrenchMonth = (input) => {
  const [output, setOutput] = useState("");

  useEffect(() => {
    const convertToFrenchMonth = (input) => {
      const months = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ];

      if (typeof input === "number" && input >= 1 && input <= 12) {
        setOutput(months[input - 1]);
      } else if (typeof input === "string") {
        const lowercasedInput = input.toLowerCase();
        const index = months.findIndex((month) =>
          month.startsWith(lowercasedInput)
        );
        if (index !== -1) {
          setOutput(months[index]);
        } else {
          setOutput("");
        }
      } else {
        setOutput("");
      }
    };

    convertToFrenchMonth(input);
  }, [input]);

  return output;
};

export default useFrenchMonth;
