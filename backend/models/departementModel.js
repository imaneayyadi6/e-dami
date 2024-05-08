import mongoose from "mongoose";
const Schema = mongoose.Schema;

const departementSchema = Schema(
  {
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de departement)"],
    },
    direction: {
      type: Schema.Types.ObjectId,
      ref: "direction",
      required: [true, "veuillez entrer une direction"],
    },
    chefDeDepartement: {
      type: Schema.Types.ObjectId,
      ref: "utilisateur",
    },
    uo: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Departement = mongoose.model("departement", departementSchema);
export default Departement;
