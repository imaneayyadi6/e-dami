import mongoose from "mongoose";
const roles = [
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "créateur",
    code: "crt",
  },

  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "demandeur",
    code: "dmr",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "signataire",
    code: "sig",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    libelle: "créateur d'option",
    code: "crt-op",
  },

];

export default roles;
