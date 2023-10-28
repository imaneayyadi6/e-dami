import mongoose from "mongoose";

const Schema = mongoose.Schema;
const demandeSchema = Schema({
  dateDemande: {
    type: Date,
    required: [true, "veuillez saisir la date de la demande"],
    default: new Date(),
  },
  option: {
    type: Schema.Types.ObjectId,
    required: [true, "veuillez saisire l'id de l'option"],
    ref: "option",
  },
  demandeur: {
    type: Schema.Types.ObjectId,
    required: [true, "veuillez saisire l'id de l'utilisateur"],
    ref: "utilisateur",
  },
  contenu: {
    type: String,
    required: [true, "veuillez entrer le contenu de l'option"],
  },
  status: {
    type: String,
    required: [true, "veuillez saisir le status global de la demande"],
    default: "en cours",
  },
  traitement: [
    {
      dateEnvoi: {
        type: Date,
        required: [true, "veuillez saisir la date d'envoi"],
      },
      utilisateur: {
        type: Schema.Types.ObjectId,
        required: [true, "veuillez saisire l'utilisateur "],
        ref: "utilisateur",
      },
      code: {
        type: String,
        required: [true, "veuillez entrer le code de signature"],
      },
      status: {
        type: String,
        required: [true, "veuillez saisir le status de traitement"],
        default: "en cours",
      },
      dateTraitement: {
        type: Date,
      },
      motifRefus: {
        type: String,
      },
    },
  ],
});

const Demande = mongoose.model("demande", demandeSchema);
export default Demande;
