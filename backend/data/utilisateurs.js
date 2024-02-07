import mongoose from "mongoose";
import roles from "./roles.js";
import services from "./services.js";
import bcrypt from "bcryptjs";
import directions from "./directions.js";

const utilisateurs = [
  // // 0 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-09-05"),
  //   updatedAt: new Date("2023-09-05"),
  //   direction: directions[0]._id,
  //   nom: "doe",
  //   prenom: "jhon",
  //   fonction: "technicien en développement informatique",
  //   email: "j.doe@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 2003001,
  //   gsm: "+212 6 01 02 03 04",
  //   service: services[1]._id,
  //   roles: [
  //     {
  //       role: roles[1]._id,
  //     },
  //   ],
  // },
  // // 1 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-09-15"),
  //   updatedAt: new Date("2023-09-15"),
  //   direction: directions[0]._id,
  //   nom: "smith",
  //   prenom: "steve",
  //   fonction: "technicien en réseaux informatique",
  //   email: "s.smith@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 2003002,
  //   gsm: "+212 6 11 22 33 44",
  //   service: services[0]._id,
  //   roles: [
  //     {
  //       role: roles[1]._id,
  //     },
  //   ],
  // },
  // // 2 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-08-05"),
  //   updatedAt: new Date("2023-08-05"),
  //   direction: directions[0]._id,
  //   nom: "EL HARRAJ",
  //   prenom: "ABDESSELAM",
  //   fonction: "Directeur des infrastructures et des systèmes d'information",
  //   email: "a.elharraj@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 1426345,
  //   gsm: "+212 6 00 55 00 55",
  //   isDirecteur: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 3 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-07-05"),
  //   updatedAt: new Date("2023-07-05"),
  //   direction: directions[1]._id,
  //   nom: "MOUSSADIK",
  //   prenom: "Badr",
  //   fonction: "Directeur de la DIRECTION FINANCIERE",
  //   email: "b.moussadik@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 2065558,
  //   gsm: "+212 6 77 55 77 55",
  //   isDirecteur: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 4 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-07-05"),
  //   updatedAt: new Date("2023-07-05"),
  //   direction: directions[2]._id,
  //   nom: "EL KHATTABI",
  //   prenom: "ABDELLAH",
  //   fonction: "Directeur de la DIRECTION DU PATRIMOINE ET DES MOYENS GENERAUX",
  //   email: "a.elkhattabi@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 846679,
  //   gsm: "+212 6 31 55 31 55",
  //   isDirecteur: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 5 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-07-05"),
  //   updatedAt: new Date("2023-07-05"),
  //   direction: directions[3]._id,
  //   nom: "TOUIH",
  //   prenom: "KAMAL",
  //   fonction: "Directeur de la DIRECTION DES ACHATS",
  //   email: "k.touih@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 1286892,
  //   gsm: "+212 6 87 55 87 55",
  //   isDirecteur: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 6 :
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
  // //  7:
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-06-05"),
  //   updatedAt: new Date("2023-06-05"),
  //   direction: directions[0]._id,
  //   nom: "EZZINE",
  //   prenom: "Imane",
  //   email: "i.ezzine@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 2019209,
  //   fonction: "Chef de service production infromatique",
  //   gsm: "+212 6 00 88 88 00",
  //   service: services[1]._id,
  //   isChefDeService: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 8 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-06-05"),
  //   updatedAt: new Date("2023-06-05"),
  //   direction: directions[0]._id,
  //   nom: "BENADDI",
  //   prenom: "Hanane",
  //   email: "h.benaddi@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 1042871,
  //   fonction: "Chef de service DES SYSTEMES RESEAUX ET SECURITE",
  //   gsm: "+212 6 23 68 68 23",
  //   service: services[0]._id,
  //   isChefDeService: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 9 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-06-05"),
  //   updatedAt: new Date("2023-06-05"),
  //   direction: directions[1]._id,
  //   nom: "BENKIRANE",
  //   prenom: "NADA",
  //   email: "n.benkirane@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 1425923,
  //   fonction: "Chef de service TRESORIE",
  //   gsm: "+212 6 98 11 51 98",
  //   service: services[2]._id,
  //   isChefDeService: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
  // // 10 :
  // {
  //   _id: new mongoose.Types.ObjectId(),
  //   createdAt: new Date("2023-05-05"),
  //   updatedAt: new Date("2023-05-05"),
  //   direction: directions[1]._id,
  //   nom: "MISBAH",
  //   prenom: "Hassan",
  //   email: "h.misbah@snrt.ma",
  //   password: bcrypt.hashSync("123456", 10),
  //   matricule: 1425503,
  //   fonction: "Chef de service COMPTABILITE",
  //   gsm: "+212 6 90 10 01 67",
  //   service: services[3]._id,
  //   isChefDeService: true,
  //   roles: [
  //     {
  //       role: roles[2]._id,
  //     },
  //   ],
  // },
];

export default utilisateurs;
