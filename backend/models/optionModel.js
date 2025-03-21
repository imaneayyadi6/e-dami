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
    createur: {
      type: Schema.Types.ObjectId,
      ref: "utilisateur",
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
      ref: "utilisateur",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "service",
    },
    departement: {
      type: Schema.Types.ObjectId,
      ref: "departement",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    signataires: [{ type: String }],
    autreResponsableTitre: {
      type: String,
    },
    autreUtilisateur: {
      type: Schema.Types.ObjectId,
      ref: "utilisateur",
    },
    shouldAskAnyTime: {
      type: Boolean,
      default: false,
    },
    sectionCondtions: {
      type: Map,
      of: String
    },
    conditions: [
      {
        type: {
          type: String,
        },
        element: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Option = mongoose.model("option", optionSchema);
export default Option;
