import mongoose from "mongoose";

const Schema = mongoose.Schema;
const roleSchema = Schema({
  libelle: {
    type: String,
    required: [true, "veuillez saisir une libelle (nom de role)"],
  },
  code: {
    type: String,
    required: [true, "veuillez saisir le code de role"],
    unique: true,
  },
});

const Role = mongoose.model("role", roleSchema);
export default Role;
