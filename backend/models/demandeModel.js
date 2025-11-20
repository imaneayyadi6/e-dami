import mongoose from "mongoose";
import { type } from "os";

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
      fichierMotifRefus: {
        type: String,
      },
      interim: {
        type: Boolean,
        default: false,
      },
      motifValidation: {
        type: String,
      },
    },
  ],
});


demandeSchema.index({ demandeur: 1 });
demandeSchema.index({ option: 1 });
demandeSchema.index({ status: 1 });
demandeSchema.index({ dateDemande: -1 });
demandeSchema.index({ "traitement.utilisateur": 1 });
demandeSchema.index({ "traitement.status": 1 });
demandeSchema.index({ "traitement.dateEnvoi": -1 });


demandeSchema.index({ demandeur: 1, status: 1 });
demandeSchema.index({ status: 1, dateDemande: -1 });
demandeSchema.index({ option: 1, status: 1 });
demandeSchema.index({ "traitement.utilisateur": 1, "traitement.status": 1 });

const Demande = mongoose.model("demande", demandeSchema);
export default Demande;
