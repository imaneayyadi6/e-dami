import mongoose from "mongoose";
import roles from "./roles.js";
import services from "./services.js";
import bcrypt from "bcryptjs";
import directions from "./directions.js";

const utilisateurs = [
  {
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date("2023-06-05"),
    updatedAt: new Date("2023-06-05"),
    nom: "admin",
    prenom: "admin",
    email: "admin@snrt.ma",
    password: bcrypt.hashSync("123456", 10),
    matricule: 2003003,
    roles: [
      {
        role: {
          "$oid": "65c34e0c4d1e2f50c262a137"
        },
      },
    ],
  },


];

export default utilisateurs;
