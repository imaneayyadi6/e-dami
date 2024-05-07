import colors from "colors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Direction from "./models/directionModel.js";
import Service from "./models/serviceModel.js";
import Utilisateur from "./models/utilisateurModel.js";
import Departement from "./models/demandeModel.js";
import connectDB from "./config/database.js";
import cron from "node-cron";

dotenv.config();
connectDB();
// Define the uploads as static folder :
const __dirname = path.resolve();
const logFilePath = path.join(__dirname, "logs", "e-dami-aghir-data-log.txt");

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

    let directions = [];

    for (let item of resSql1) {
      let newDirection = {
        _id: new mongoose.Types.ObjectId(),
        libelle: item.SIGLE,
        uo: item.UO,
      };

      let findDirection = await Direction.findOne({
        uo: item.UO,
      });
      if (findDirection) {
        findDirection.libelle = item.SIGLE;
        findDirection.uo = item.UO;
        await findDirection.save();
        directions.push(JSON.parse(JSON.stringify(findDirection)));
      } else {
        await new Direction(newDirection).save();
        directions.push(newDirection);
      }
    }
    /******************************   DEPARTEMENTS   ******************************/
    const query6 = `SELECT DISTINCT dir.UO 'UO_direction', dir.SIGLE 'direction', dep.UO 'UO_departement',  dep.SIGLE 'departement'
    FROM dbo.UNITE_ORG  as dep inner join dbo.UNITE_ORG as dir
    on dep.UO_RATTACHEMENT = dir.UO
    WHERE dep.SIGLE like 'departement%'
    group by dir.UO, dir.SIGLE , dep.UO,  dep.SIGLE`;

    let resSql6 = await sequelize.query(query6, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let departements = [];

    for (let item of resSql6) {
      let direction = directions.find(
        (dir) => String(dir.uo) === String(item.UO_direction)
      );

      let newDepartement = {
        _id: new mongoose.Types.ObjectId(),
        libelle: item.service,
        uo: item.UO_service,
        direction: direction ? direction._id : null,
      };

      let findDepartement = await Departement.findOne({
        uo: item.UO_service,
      });

      if (findDepartement) {
        findDepartement.libelle = item.departement;
        findDepartement.uo = item.UO_departement;
        findDepartement.direction = direction ? direction._id : null;
        await findDepartement.save();
        departements.push(JSON.parse(JSON.stringify(findDepartement)));
      } else {
        await new Departement(newDepartement).save();
        departements.push(newDepartement);
      }
    }

    /******************************   SERVICES   ******************************/
    const query2 = `SELECT DISTINCT dir.UO 'UO_direction', dir.SIGLE 'direction', dep.UO 'UO_departement',  dep.SIGLE 'departement', srv.UO 'UO_service',  srv.SIGLE 'service'
    FROM dbo.UNITE_ORG  as srv inner join dbo.UNITE_ORG  as dep
    on srv.UO_RATTACHEMENT = dep.UO
    inner join dbo.UNITE_ORG as dir
    on dep.UO_RATTACHEMENT = dir.UO
    WHERE srv.SIGLE like 'service%' 
    group by dir.UO, dir.SIGLE ,dep.UO,  dep.SIGLE, srv.SIGLE ,srv.UO`;

    let resSql2 = await sequelize.query(query2, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let services = [];
    for (let item of resSql2) {
      let direction = directions.find(
        (dir) => String(dir.uo) === String(item.UO_direction)
      );

      let departement = departements.find(
        (dir) => String(dir.uo) === String(item.UO_departement)
      );

      let newService = {
        _id: new mongoose.Types.ObjectId(),
        libelle: item.service,
        uo: item.UO_service,
        departement: departement ? departement._id : null,
        direction: direction ? direction._id : null,
      };

      let findService = await Service.findOne({
        uo: item.UO_service,
      });

      if (findService) {
        findService.libelle = item.service;
        findService.uo = item.UO_service;
        findService.departement = departement ? departement._id : null;
        findService.direction = direction ? direction._id : null;
        await findService.save();
        services.push(JSON.parse(JSON.stringify(findService)));
      } else {
        await new Service(newService).save();
        services.push(newService);
      }
    }

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

    let chefdeservices = [];

    for (let item of resSql4) {
      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );
      if (service && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();

        let newChefDeService = {
          _id: id,
          isActive: true,
          firstTimeLogin: true,
          createdAt: new Date(),
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
          departement: services.find(
            (srv) => String(srv.uo) === String(item.LIEU)
          ).departement,
          direction: services.find(
            (srv) => String(srv.uo) === String(item.LIEU)
          ).direction,
        };

        let findChefService = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findChefService) {
          services = services.map((srv) => {
            if (String(srv.uo) === String(item.LIEU))
              srv.chefService = findChefService._id;
            return srv;
          });

          findChefService.fonction = item.INTITULE;
          findChefService.isChefDeService = true;
          findChefService.isDirecteur = false;
          findChefService.service = service ? service._id : null;
          findChefService.direction = service ? service.direction : null;
          findChefService.departement = service ? service.departement : null;

          findChefService.roles = findChefService.roles;
          findChefService.updatedAt = new Date();

          await findChefService.save();

          const updatedService = await Service.findOne({
            uo: item.LIEU,
          });
          if (updatedService) {
            updatedService.chefService = findChefService._id;
            await updatedService.save();
          }

          chefdeservices.push(JSON.parse(JSON.stringify(findChefService)));
        } else {
          await new Utilisateur(newChefDeService).save();
          const updatedService = await Service.findOne({
            uo: item.LIEU,
          });
          if (updatedService) {
            updatedService.chefService = newChefDeService._id;
            await updatedService.save();
          }
          chefdeservices.push(newChefDeService);
        }
      }
    }

    /******************************  CHEFS DE DEPARTEMENTS   ******************************/
    let query7 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU
    from dbo.AGENT ag inner join dbo.ADRESSE adr
    on adr.MATRICULE = ag.MATRICULE
    inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
    inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
    inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
    inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO
    INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
    WHERE  YEAR(cog.FIN_VALIDITE) =  YEAR(GETDATE()) and MONTH(cog.FIN_VALIDITE) = 12 and DAY(cog.FIN_VALIDITE) = 31  
    and cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE
    WHERE Table_name = 'responsabilite') and tr.INTITULE like 'CHEF DE DEPARTEMENT%'`;

    const resSql7 = await sequelize.query(query7, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let chefDeDepartements = [];

    for (let item of resSql7) {
      const departement = departements.find(
        (dep) => String(dep.uo) === String(item.LIEU)
      );
      if (departement && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();

        let newChefDeDepartement = {
          _id: id,
          isActive: true,
          firstTimeLogin: true,
          createdAt: new Date(),
          nom: item.NOM,
          prenom: item.PRENOM,
          matricule: Number(item.MATRICULE),
          civilite: item.CIVILITE,
          fonction: item.INTITULE,
          isChefDeDepartement: true,
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
          departement: departement ? departement._id : null,
          direction: departement ? departement.direction : null,
        };

        let findChefDepartement = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findChefDepartement) {
          departements = departements.map((dep) => {
            if (String(dep.uo) === String(item.LIEU))
              srv.chefDeDepartement = findChefDepartement._id;
            return dep;
          });

          findChefDepartement.fonction = item.INTITULE;
          findChefDepartement.isChefDeService = true;
          findChefDepartement.isDirecteur = false;
          findChefDepartement.departement = departement
            ? departement._id
            : null;
          findChefDepartement.direction = departement
            ? departement.direction
            : null;
          findChefDepartement.roles = findChefDepartement.roles;
          findChefDepartement.updatedAt = new Date();

          await findChefDepartement.save();

          const updatedDepatement = await Service.findOne({
            uo: item.LIEU,
          });
          if (updatedDepatement) {
            updatedDepatement.chefDeDepartement = findChefDepartement._id;
            await updatedDepatement.save();
          }
          chefDeDepartements.push(
            JSON.parse(JSON.stringify(findChefDepartement))
          );
        } else {
          await new Utilisateur(newChefDeDepartement).save();
          const updatedDepatement = await Departement.findOne({
            uo: item.LIEU,
          });
          if (updatedDepatement) {
            updatedDepatement.chefDeDepartement = newChefDeDepartement._id;
            await updatedDepatement.save();
          }
          chefDeDepartements.push(newChefDeDepartement);
        }
      }
    }

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

    let directeurs = [];

    for (let item of resSql5) {
      const direction = directions.find(
        (dir) => String(dir.uo) === String(item.LIEU)
      );

      if (direction && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();
        directions = directions.map((dir) => {
          if (String(dir.uo) === String(item.LIEU)) dir.directeur = id;
          return dir;
        });
        let newDirecteur = {
          _id: id,
          isActive: true,
          firstTimeLogin: true,
          createdAt: new Date(),
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

        let findDirecteur = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findDirecteur) {
          directions = directions.map((dir) => {
            if (String(dir.uo) === String(item.LIEU))
              dir.directeur = findDirecteur._id;
            return dir;
          });

          findDirecteur.fonction = item.INTITULE;
          findDirecteur.isDirecteur = true;
          findDirecteur.isChefDeService = false;
          findDirecteur.direction = direction._id;
          findDirecteur.roles = findDirecteur.roles;
          findDirecteur.updatedAt = new Date();

          const updatedDirection = await Direction.findOne({
            uo: item.LIEU,
          });
          if (updatedDirection) {
            updatedDirection.directeur = findDirecteur._id;
            await updatedDirection.save();
          }

          await findDirecteur.save();
          directeurs.push(JSON.parse(JSON.stringify(findDirecteur)));
        } else {
          await new Utilisateur(newDirecteur).save();
          const updatedDirection = await Direction.findOne({
            uo: item.LIEU,
          });
          if (updatedDirection) {
            updatedDirection.directeur = newDirecteur._id;
            await updatedDirection.save();
          }
          directeurs.push(newDirecteur);
        }
      }
    }

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

    let utilisateurs = [];

    for (let item of resSql3) {
      const findIsChefDeService = chefdeservices.findIndex(
        (cdf) => cdf && String(cdf.email) === String(item.EMAIL)
      );
      const findIsDirecteur = directeurs.findIndex(
        (dir) => dir && String(dir.email) === String(item.EMAIL)
      );
      const findIsChefDeDepartement = chefDeDepartements.findIndex(
        (cdp) => dir && String(cdp.email) === String(item.EMAIL)
      );
      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );

      if (
        findIsChefDeDepartement === -1 &&
        findIsChefDeService === -1 &&
        findIsDirecteur === -1 &&
        item.EMAIL
      ) {
        let newUtilisateur = {
          _id: new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          isActive: true,
          firstTimeLogin: true,
          nom: item.NOM,
          prenom: item.PRENOM,
          matricule: Number(item.MATRICULE),
          civilite: item.CIVILITE,
          fonction: item.QUALIFICATION,
          isChefDeService: false,
          isChefDeDepartement: false,
          isDirecteur: false,
          email: item.EMAIL,
          password: bcrypt.hashSync(generatePassword(6), 10),
          roles: [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
              _id: new mongoose.Types.ObjectId(),
            },
          ],
          service: service ? service._id : null,
          direction: service ? service.direction : null,
          departement: service ? service.departement : null,
        };

        let findUtilisateur = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findUtilisateur) {
          findUtilisateur.fonction = item.QUALIFICATION;
          findUtilisateur.isDirecteur = false;
          findUtilisateur.isChefDeService = false;
          findUtilisateur.service = service ? service._id : null;
          findUtilisateur.direction = service ? service.direction : null;
          findUtilisateur.departement = service ? service.departement : null;
          findUtilisateur.roles = findUtilisateur.roles;
          findUtilisateur.updatedAt = new Date();

          await findUtilisateur.save();

          utilisateurs.push(JSON.parse(JSON.stringify(findUtilisateur)));
        } else {
          let find = await Utilisateur.findOne({
            email: item.EMAIL,
          });
          if (!find) {
            let createdUser = new Utilisateur(newUtilisateur);
            await createdUser.save();
            utilisateurs.push(createdUser);
          }
        }
      }
    }

    let findAdmin = await Utilisateur.findOne({
      email: "admin@snrt.ma",
    });

    if (!findAdmin) {
      await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "admin",
        prenom: "admin",
        email: "admin@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 2003003,
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a137"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
      }).save();
    }

    const dataToWrite = `[DATA INSERT] : ${new Date()} ============> Data Inserted succcessfully \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("The data was appended to the file!");
    });

    console.log(`Data Inserted succcessfully !`.green.inverse);
  } catch (error) {
    const dataToWrite = `[ERROR] : ${new Date()} ============> ${error} \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("The data was appended to the file!");
    });
    console.log(`Error : ${error}`.red.inverse);
  }
};

cron.schedule("0 */12 * * *", async () => {
  try {
    main();
    console.log(
      "Hello, this is a sample JavaScript file executed by cron every 10 minute."
    );
  } catch (error) {
    console.error("CRON ERROR:", error);
  }
});
