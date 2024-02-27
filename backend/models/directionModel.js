import mongoose from "mongoose";
const Schema = mongoose.Schema;

const directionSchema = Schema(
  {
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de la direction)"],
    },
    directeur: {
      type: Schema.Types.ObjectId,
      ref: "utilisateur",
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

const Direction = mongoose.model("direction", directionSchema);
export default Direction;
