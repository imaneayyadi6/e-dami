import mongoose from "mongoose";
const Schema = mongoose.Schema;

const servicechema = Schema(
  {
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de la service)"],
    },
    direction: {
      type: Schema.Types.ObjectId,
      ref: "direction",
    },
    departement: {
      type: Schema.Types.ObjectId,
      ref: "departement",
    },
    chefService: {
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

const Service = mongoose.model("service", servicechema);
export default Service;
