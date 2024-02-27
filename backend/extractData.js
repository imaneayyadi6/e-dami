import colors from "colors";

import fs from "fs";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Direction from "./models/directionModel.js";
import Service from "./models/serviceModel.js";
import Utilisateur from "./models/utilisateurModel.js";

import connectDB from "./config/database.js";

dotenv.config();
connectDB();

function generatePassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

const main = async () => {
  try {
    const sequelize = new Sequelize({
      username: process.env.SQLSERVER_USER_NAME,
      password: process.env.SQLSERVER_PASSWORD,
      database: process.env.SQLSERVER_DATABASE,
      host: process.env.SQLSERVER_SERVER_NAME,
      dialect: "mssql",
      dialectOptions: {
        options: {
          instanceName: "SQLEXPRESS",
          trustServerCertificate: true, // Add this line to accept self-signed certificates
          encrypt: false, // Add this line to enable encryption
          crypto: {
            // Add a compatible cipher suite
            minVersion: "TLSv1.2",
            cipherName: "AES128-GCM-SHA256",
          },
        },
      },
      ssl: false, // You can remove this line or set it to true based on your needs
    });

    /******************************   DIRECTIONS   ******************************/
    const query1 =
      "select SIGLE,UO from dbo.UNITE_ORG WHERE SIGLE like 'direction%'";
    const resSql1 = await sequelize.query(query1, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let directions = resSql1.map((item) => {
      return {
        _id: new mongoose.Types.ObjectId(),
        libelle: item.SIGLE,
        uo: item.UO,
      };
    });

    /******************************   SERVICES   ******************************/
    const query2 = `SELECT DISTINCT dir.UO 'UO_direction', dir.SIGLE 'direction', srv.UO 'UO_service',  srv.SIGLE 'service'
          FROM dbo.UNITE_ORG  as srv inner join dbo.UNITE_ORG  as dep
          on srv.UO_RATTACHEMENT = dep.UO
          inner join dbo.UNITE_ORG as dir
          on dep.UO_RATTACHEMENT = dir.UO
          WHERE srv.SIGLE like 'service%'
          group by dir.UO, dir.SIGLE , srv.SIGLE ,srv.UO`;

    let resSql2 = await sequelize.query(query2, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let services = resSql2.map((item) => {
      return {
        _id: new mongoose.Types.ObjectId(),
        libelle: item.service,
        uo: item.UO_service,
        direction: directions.find(
          (dir) => String(dir.uo) === String(item.UO_direction)
        )._id,
      };
    });

    /******************************  CHEFS DE SERVICES   ******************************/
    let query4 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU
          from dbo.AGENT ag inner join dbo.ADRESSE adr
          on adr.MATRICULE = ag.MATRICULE
          inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
          inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
          inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
          inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO
          INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
          WHERE  YEAR(cog.FIN_VALIDITE) =  YEAR(GETDATE()) and MONTH(cog.FIN_VALIDITE) = 12 and DAY(cog.FIN_VALIDITE) = 31
          and cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE
          WHERE Table_name = 'responsabilite') and tr.INTITULE like 'CHEF DE SERVICE%'`;

    const resSql4 = await sequelize.query(query4, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let chefdeservices = resSql4.map((item) => {
      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );
      if (service && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();
        services = services.map((srv) => {
          if (String(srv.uo) === String(item.LIEU)) srv.chefService = id;
          return srv;
        });
        return {
          _id: id,
          isActive: true,
          firstTimeLogin: true,
          nom: item.NOM,
          prenom: item.PRENOM,
          matricule: Number(item.MATRICULE),
          civilite: item.CIVILITE,
          fonction: item.INTITULE,
          isChefDeService: true,
          email: item.EMAIL,
          password: bcrypt.hashSync(generatePassword(6), 10),
          roles: [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
              _id: new mongoose.Types.ObjectId(),
            },

            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
              _id: new mongoose.Types.ObjectId(),
            },

            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a13a"),
              _id: new mongoose.Types.ObjectId(),
            },
          ],
          service: services.find((srv) => String(srv.uo) === String(item.LIEU))
            ._id,
          direction: services.find(
            (srv) => String(srv.uo) === String(item.LIEU)
          ).direction,
        };
      }
    });

    /******************************  DIRECTEURS  ******************************/
    let query5 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU
          from dbo.AGENT ag inner join dbo.ADRESSE adr
          on adr.MATRICULE = ag.MATRICULE
          inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
          inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
          inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
          inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO
          INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
          WHERE  YEAR(cog.FIN_VALIDITE) =  YEAR(GETDATE()) and MONTH(cog.FIN_VALIDITE) = 12 and DAY(cog.FIN_VALIDITE) = 31
          and   cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE WHERE Table_name = 'responsabilite') and tr.INTITULE like 'DIRECTEUR%'`;

    const resSql5 = await sequelize.query(query5, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let directeurs = resSql5.map((item) => {
      const direction = directions.find(
        (dir) => String(dir.uo) === String(item.LIEU)
      );
      if (direction && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();
        directions = directions.map((dir) => {
          if (String(dir.uo) === String(item.LIEU)) dir.directeur = id;
          return dir;
        });

        return {
          _id: id,
          isActive: true,
          firstTimeLogin: true,
          nom: item.NOM,
          prenom: item.PRENOM,
          matricule: Number(item.MATRICULE),
          civilite: item.CIVILITE,
          fonction: item.INTITULE,
          isDirecteur: true,
          email: item.EMAIL,
          password: bcrypt.hashSync(generatePassword(6), 10),
          roles: [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
              _id: new mongoose.Types.ObjectId(),
            },

            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
              _id: new mongoose.Types.ObjectId(),
            },
          ],
          direction: direction._id,
        };
      }
    });

    /******************************  UTILISATEURS NORMAL  ******************************/
    let query3 = `SELECT DISTINCT ag.MATRICULE, ag.NOM, ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL, cl.QUALIFICATION, af.LIEU, dir.SIGLE AS 'service'
          FROM dbo.AGENT ag INNER JOIN dbo.ADRESSE adr ON adr.MATRICULE = ag.MATRICULE
          INNER JOIN CLASSIFICATION cl ON ag.MATRICULE = cl.MATRICULE
          INNER JOIN dbo.AFFECTATION af ON af.MATRICULE = ag.MATRICULE
          INNER JOIN dbo.UNITE_ORG dir ON af.LIEU = dir.UO
          INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
          where YEAR(cog.FIN_VALIDITE) =  YEAR(GETDATE()) and MONTH(cog.FIN_VALIDITE) = 12 and DAY(cog.FIN_VALIDITE) = 31`;

    const resSql3 = await sequelize.query(query3, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let utilisateurs = resSql3.map((item) => {
      const findIsChefDeService = chefdeservices.findIndex(
        (cdf) =>
          cdf && Number(cdf ? cdf.matricule : 0) === Number(item.MATRICULE)
      );
      const findIsDirecteur = directeurs.findIndex(
        (dir) =>
          dir && Number(dir ? dir.matricule : 0) === Number(item.MATRICULE)
      );
      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );

      if (item.EMAIL && findIsChefDeService === -1 && findIsDirecteur === -1) {
        return {
          _id: new mongoose.Types.ObjectId(),
          isActive: true,
          firstTimeLogin: true,
          nom: item.NOM,
          prenom: item.PRENOM,
          matricule: Number(item.MATRICULE),
          civilite: item.CIVILITE,
          fonction: item.QUALIFICATION,
          isChefDeService: true,
          email: item.EMAIL,
          password: bcrypt.hashSync(generatePassword(6), 10),
          roles: [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
              _id: new mongoose.Types.ObjectId(),
            },
          ],
          service: service ? service._id : null,
          direction: service ? service.direction : null,
        };
      }
    });

    /******************************  INSERT DATA IN DATABASE  ******************************/
    const options = {
      ordered: false, // Continue inserting other documents even if one fails
      raw: true, // Return the raw result from the MongoDB driver
      wtimeout: 15000, // Set the write concern timeout (in milliseconds)
    };

    await Direction.insertMany(directions, options);
    await Service.insertMany(services, options);
    await Utilisateur.insertMany(directeurs, options);
    await Utilisateur.insertMany(chefdeservices, options);
    await Utilisateur.insertMany(utilisateurs, options);

    console.log(`Data Inserted succcessfully !`.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error : ${error}`.red.inverse);
    process.exit();
  }
};
main();
