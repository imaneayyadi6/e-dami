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
    ref: "user",
  },
  contenu: {
    type: String,
    required: [true, "veuillez entrer le contenu de l'option"],
  },
  traitement: [
    {
      dateEnvoi: {
        type: Date,
        required: [true, "veuillez saisir la date d'envoi"],
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
