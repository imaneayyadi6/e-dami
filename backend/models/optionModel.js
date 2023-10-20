import mongoose from "mongoose";
const Schema = mongoose.Schema;

const optionSchema = Schema(
  {
    header: {
      document: {
        type: String,
        required: [true, "veuillez saisir le code de document"],
      },
      classification: {
        type: String,
        required: [true, "veuillez saisir le type de classification"],
      },
      creation: {
        type: Date,
        required: [true, "veuillez la date de creation"],
      },
      maj: {
        type: Date,
        required: [true, "veuillez saisir la date de mise a jour "],
      },
    },
    libelle: {
      type: String,
      required: [true, "veuillez saisir une libelle (nom de l'option)"],
    },
    typeProcessus: {
      type: String,
      required: [true, "veuillez saisir le type de processus"],
    },

    contenu: {
      type: String,
      required: [true, "veuillez entrer le contenu de l'option"],
    },
    sousCategorie: {
      type: Schema.Types.ObjectId,
      ref: "sousCategorie",
      required: [true, "veuillez entrer une sous-categorie"],
    },
    proprietaireDeDonnees: {
      type: Schema.Types.ObjectId,
      ref: "direction",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "service",
    },
    signataires: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Option = mongoose.model("option", optionSchema);
export default Option;
