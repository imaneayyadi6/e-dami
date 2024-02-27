import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;
const utilisateurSchema = Schema(
  {
    nom: {
      type: String,
      required: [true, "veuillez saisir un nom"],
    },
    prenom: {
      type: String,
      required: [true, "veuillez saisir un prenom"],
    },
    fonction: {
      type: String,
    },
    email: {
      type: String,
      unique: [true, "email existe déjà"],
      required: [true, "veuillez saisir une adresse e-mail"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Format d'email invalide. veuillez fournir une adresse email valide.",
      ],
    },
    emailSent: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      required: [true, "veuillez saisir un mot de passe"],
    },
    matricule: {
      type: Number,
      unique: [true, " matricule existe déjà"],
      required: [true, "veuillez saisir un matricule"],
    },
    gsm: {
      type: String,
      // unique: [true, "gsm existe déjà"],
    },
    isChefDeService: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDirecteur: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    firstTimeLogin: {
      type: Boolean,
      required: true,
      default: true,
    },
    roles: [
      {
        role: {
          type: Schema.Types.ObjectId,
          ref: "role",
          required: true,
        },
      },
    ],
    service: {
      type: Schema.Types.ObjectId,
      ref: "service",
    },
    direction: {
      type: Schema.Types.ObjectId,
      ref: "direction",
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
utilisateurSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  const crppassword = await bcrypt.hash(this.password, salt);
  this.password = crppassword;
  next();
});

const Utilisateur = mongoose.model("utilisateur", utilisateurSchema);
export default Utilisateur;
