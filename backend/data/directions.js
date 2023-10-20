import mongoose from "mongoose";

const directions = [
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Infrastructures et système d information",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Financiere",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "patremoine & Moyen generaux",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Achats",
  },
];

export default directions;
