import mongoose from "mongoose";
import directions from "./directions.js";

const categories = [
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Informatique",
    direction: directions[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Moyen generaux",
    direction: directions[2]._id,
  },
];

export default categories;
