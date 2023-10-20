import mongoose from "mongoose";
import directions from "./directions.js";

const services = [
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Systèmes réseaux et sécurité",
    direction: directions[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Production infromatique",
    direction: directions[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Tresosire",
    direction: directions[1]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Comptabilité",
    direction: directions[1]._id,
  },
];

export default services;
