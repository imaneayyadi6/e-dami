function moisEnFrancais(input) {
  const mois = [
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

  const moisAnglais = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  if (typeof input === "number") {
    if (input >= 1 && input <= 12) {
      return mois[input - 1];
    } else {
      return "Numéro de mois invalide. Veuillez entrer un nombre entre 1 et 12.";
    }
  } else if (typeof input === "string") {
    const moisIndex = moisAnglais.indexOf(input.toLowerCase());
    if (moisIndex !== -1) {
      return mois[moisIndex];
    } else {
      return "Nom de mois invalide. Veuillez entrer un nom de mois valide en anglais.";
    }
  } else {
    return "Entrée invalide. Veuillez entrer un nombre ou un nom de mois en anglais.";
  }
}

export default moisEnFrancais;
