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
    civilite: {
      type: String,
    },
    email: {
      type: String,
      unique: [true, "email existe déjà"],
      required: [true, "veuillez saisir une adresse e-mail"],
      
      
      
      
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
      
    },
    isChefDeService: {
      type: Boolean,
      required: true,
      default: false,
    },
    isChefDeDepartement: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDirecteurAdj: {
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
    departement: {
      type: Schema.Types.ObjectId,
      ref: "departement",
    },
    direction: {
      type: Schema.Types.ObjectId,
      ref: "direction",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    interim: {
      type: Schema.Types.ObjectId,
      ref: "utilisateur",
    },
    matriculeSupN1:{
      type: Number,
    },
    matriculeSupN2:{
      type: Number,
    },
    matriculeSupN3:{
      type: Number,
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


utilisateurSchema.index({ email: 1 });
utilisateurSchema.index({ matricule: 1 });
utilisateurSchema.index({ isActive: 1 });
utilisateurSchema.index({ direction: 1 });
utilisateurSchema.index({ service: 1 });
utilisateurSchema.index({ departement: 1 });
utilisateurSchema.index({ "roles.role": 1 });
utilisateurSchema.index({ isChefDeService: 1 });
utilisateurSchema.index({ isDirecteur: 1 });
utilisateurSchema.index({ createdAt: -1 });


utilisateurSchema.index({ isActive: 1, direction: 1 });
utilisateurSchema.index({ isActive: 1, service: 1 });
utilisateurSchema.index({ isActive: 1, "roles.role": 1 });

const Utilisateur = mongoose.model("utilisateur", utilisateurSchema);
export default Utilisateur;
