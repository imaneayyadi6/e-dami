import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sousCategorieSchema = Schema(
  {
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de la sousCategorie)"],
    },
    categorie: {
      type: Schema.Types.ObjectId,
      ref: "categorie",
      required: [true, "veuillez entrer une categorie"],
    },
  },
  {
    timestamps: true,
  }
);

const SousCategorie = mongoose.model("sousCategorie", sousCategorieSchema);
export default SousCategorie;
