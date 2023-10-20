import mongoose from "mongoose";
const Schema = mongoose.Schema;

const categorieSchema = Schema(
  {
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de la categorie)"],
    },
    direction: {
      type: Schema.Types.ObjectId,
      ref: "direction",
      required: [true, "veuillez entrer une direction"],
    },
  },
  {
    timestamps: true,
  }
);

const Categorie = mongoose.model("categorie", categorieSchema);
export default Categorie;
