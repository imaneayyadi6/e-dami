import mongoose from "mongoose";
import categories from "./categories.js";
const sousCategories = [
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "JD Edwards",
    categorie: categories[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Post de travaille",
    categorie: categories[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "Reseaux et telecom",
    categorie: categories[0]._id,
  },
];

export default sousCategories;
