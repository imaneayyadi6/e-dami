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
import Departement from "./models/departementModel.js";
import Role from "./models/roleModel.js";
import connectDB from "./config/database.js";
import cron from "node-cron";
import crypto from "crypto";

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
    const randomIndex = crypto.randomInt(0, charset.length); // Secure random index
    password += charset.charAt(randomIndex);
  }

  return password;
}

const main = async () => {
  try {
    // config base de donnees sql serveur AGHIR
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

    const adminRole = await Role.findOne({ code: "crt" });

    /******************************   DIRECTIONS   ******************************/
    // requette :
    const query1 = `select SIGLE,UO from dbo.UNITE_ORG
                    WHERE SIGLE not like 'service%' 
                    and SIGLE not like 'departement%'
                    AND SIGLE not like 'DEPARTEMNT%'
                    AND SIGLE not like 'REDACTEUR%'
                    and SIGLE not like '%CENTRE%'
                    and SIGLE not like '%CENTRALE%'
                    and SIGLE not like '%UNITE%'
                    and SIGLE not like '%CELLULE%'
                    and SIGLE not like '%STATION%'
                    and SIGLE not like '%SECRETARIAT%'
                    and SIGLE not like '%RESPONSABLE%'`;

    // executer la requette :
    const resSql1 = await sequelize.query(query1, {
      type: Sequelize.QueryTypes.SELECT,
    });

    // les direction sous fourmat JAVASCRIPT :
    let directions = [];
    // loop
    for (let item of resSql1) {
      let findDirection = await Direction.findOne({
        uo: item.UO,
      });
      if (findDirection) {
        findDirection.libelle = item.SIGLE;
        findDirection.uo = item.UO;
        await findDirection.save();
        directions.push(JSON.parse(JSON.stringify(findDirection)));
      } else {
        let newDirection = {
          _id: new mongoose.Types.ObjectId(),
          libelle: item.SIGLE,
          uo: item.UO,
        };
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
      if (direction) {
        let newDepartement = {
          _id: new mongoose.Types.ObjectId(),
          libelle: item.departement,
          uo: item.UO_departement,
          direction: direction ? direction._id : null,
        };

        let findDepartement = await Departement.findOne({
          uo: item.UO_departement,
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
    }

    /******************************   SERVICES   ******************************/
    const query2 = `SELECT DISTINCT dir.UO AS 'UO_direction', dir.SIGLE AS 'direction', dep.UO AS 'UO_departement',   dep.SIGLE AS 'departement',  srv.UO AS 'UO_service',  srv.SIGLE AS 'service'
                    FROM dbo.UNITE_ORG AS srv LEFT JOIN dbo.UNITE_ORG AS dep ON srv.UO_RATTACHEMENT = dep.UO AND dep.SIGLE LIKE 'departement%' LEFT JOIN dbo.UNITE_ORG AS dir ON (dep.UO_RATTACHEMENT = dir.UO OR srv.UO_RATTACHEMENT = dir.UO)
                    WHERE srv.SIGLE LIKE 'service%' and dir.SIGLE not like 'DEPARTEMENT%'
                    GROUP BY dir.UO, dir.SIGLE, dep.UO, dep.SIGLE, srv.SIGLE, srv.UO`;

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
        let newService = {
          _id: new mongoose.Types.ObjectId(),
          libelle: item.service,
          uo: item.UO_service,
          departement: departement ? departement._id : null,
          direction: direction ? direction._id : null,
        };
        await new Service(newService).save();
        services.push(newService);
      }
    }

    /******************************  CHEFS DE SERVICES   ******************************/
    let query4 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU,af.MATRIC_SUPERIEUR,af.MATRIC_SUP_1,af.MATRIC_SUP_2 
                  from dbo.AGENT ag inner join dbo.ADRESSE adr
                  on adr.MATRICULE = ag.MATRICULE
                  inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
                  inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
                  inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
                  inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO
                  INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
                  INNER JOIN dbo.CONTRAT ct on ag.MATRICULE = ct.MATRICULE
                  WHERE   cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE
                  WHERE Table_name = 'responsabilite') and tr.INTITULE like 'CHEF DE SERVICE%'  AND ct.SITUAT_EFFECTIF = '1'`;

    const resSql4 = await sequelize.query(query4, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let chefdeservices = [];

    for (let item of resSql4) {
      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );

      let departement = null;
      if (service && service.departement) {
        departement = departements.find(
          (dep) => String(dep._id) === String(service.departement)
        );
      } else {
        departement = departements.find(
          (dep) => String(dep.uo) === String(item.LIEU)
        );
      }

      let direction = null;

      if (departement && departement.direction) {
        direction = directions.find(
          (dir) => String(dir._id) === String(departement.direction)
        );
      } else {
        direction = directions.find(
          (dir) => String(dir.uo) === String(item.LIEU)
        );
      }

      let haveUO = direction || departement || service;

      if (haveUO && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();

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
          findChefService.civilite = item.CIVILITE;
          findChefService.isChefDeService = true;
          findChefService.isDirecteur = false;
          findChefService.service = service && service._id;
          findChefService.departement = departement && departement._id;
          findChefService.direction = direction && direction._id;
          findChefService.matriculeSupN1 = item.MATRIC_SUPERIEUR;
          findChefService.matriculeSupN2 = item.MATRIC_SUP_1;
          findChefService.matriculeSupN3 = item.MATRIC_SUP_2;
          findChefService.roles = findChefService.roles.filter(
            (r) => r != null
          );
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
            service: service && service._id,
            departement: departement && departement._id,
            direction: direction && direction._id,
            matriculeSupN1: item.MATRIC_SUPERIEUR,
            matriculeSupN2: item.MATRIC_SUP_1,
            matriculeSupN3: item.MATRIC_SUP_2,
          };
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
    let query7 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU,af.MATRIC_SUPERIEUR,af.MATRIC_SUP_1,af.MATRIC_SUP_2 
                from dbo.AGENT ag inner join dbo.ADRESSE adr
                on adr.MATRICULE = ag.MATRICULE
                inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
                inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
                inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
                inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO
                INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
                INNER JOIN dbo.CONTRAT ct on ag.MATRICULE = ct.MATRICULE
                WHERE cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE
                WHERE Table_name = 'responsabilite') and tr.INTITULE like 'CHEF DE DEPARTEMENT%'  AND ct.SITUAT_EFFECTIF = '1'`;

    const resSql7 = await sequelize.query(query7, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let chefDeDepartements = [];

    for (let item of resSql7) {
      let departement = departements.find(
        (dep) => String(dep.uo) === String(item.LIEU)
      );

      let direction = null;

      if (departement && departement.direction) {
        direction = directions.find(
          (dir) => String(dir._id) === String(departement.direction)
        );
      } else {
        direction = directions.find(
          (dir) => String(dir.uo) === String(item.LIEU)
        );
      }

      let haveUO = direction || departement;

      if (haveUO && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();

        let findChefDepartement = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findChefDepartement) {
          departements = departements.map((dep) => {
            if (String(dep.uo) === String(item.LIEU))
              dep.chefDeDepartement = findChefDepartement._id;
            return dep;
          });

          findChefDepartement.fonction = item.INTITULE;
          findChefDepartement.civilite = item.CIVILITE;
          findChefDepartement.isChefDeService = false;
          findChefDepartement.isDirecteur = false;
          findChefDepartement.isChefDeDepartement = true;
          findChefDepartement.departement = departement && departement._id;
          findChefDepartement.direction = direction && direction._id;
          findChefDepartement.matriculeSupN1 = item.MATRIC_SUPERIEUR;
          findChefDepartement.matriculeSupN2 = item.MATRIC_SUP_1;
          findChefDepartement.matriculeSupN3 = item.MATRIC_SUP_2;
          findChefDepartement.roles = findChefDepartement.roles.filter(
            (r) => r != null
          );
          findChefDepartement.updatedAt = new Date();

          await findChefDepartement.save();

          const updatedDepatement = await Departement.findOne({
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
            departement: departement && departement._id,
            direction: direction && direction._id,
            matriculeSupN1: item.MATRIC_SUPERIEUR,
            matriculeSupN2: item.MATRIC_SUP_1,
            matriculeSupN3: item.MATRIC_SUP_2,
          };
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
    let query5 = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU,af.MATRIC_SUPERIEUR,af.MATRIC_SUP_1,af.MATRIC_SUP_2 
                from dbo.AGENT ag inner join dbo.ADRESSE adr
                on adr.MATRICULE = ag.MATRICULE
                inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
                inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
                inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
                inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO 
                INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
                INNER JOIN dbo.CONTRAT ct on ag.MATRICULE = ct.MATRICULE
                WHERE cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE WHERE Table_name = 'responsabilite') 
                and tr.INTITULE like 'DIRECTEUR%' and tr.INTITULE  not like '%ADJOINT%'  AND ct.SITUAT_EFFECTIF = '1'
                and ag.MATRICULE not in ('351712')`;

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
          findDirecteur.civilite = item.CIVILITE;
          findDirecteur.isDirecteur = true;
          findDirecteur.isChefDeService = false;
          findDirecteur.isDirecteurAdj = false;
          findDirecteur.isChefDeDepartement = false;
          findDirecteur.isChefDeService = false;
          findDirecteur.direction = direction._id;
          findDirecteur.matriculeSupN1 = item.MATRIC_SUPERIEUR;
          findDirecteur.matriculeSupN2 = item.MATRIC_SUP_1;
          findDirecteur.matriculeSupN3 = item.MATRIC_SUP_2;
          findDirecteur.roles = [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
              _id: new mongoose.Types.ObjectId(),
            },

            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
              _id: new mongoose.Types.ObjectId(),
            },
          ];
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
            matriculeSupN1: item.MATRIC_SUPERIEUR,
            matriculeSupN2: item.MATRIC_SUP_1,
            matriculeSupN3: item.MATRIC_SUP_2,
          };
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

    /******************************  DIRECTEURS ADJOINT  ******************************/
    let queryDirAdj = `SELECT distinct ag.MATRICULE,ag.NOM,ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,cl.QUALIFICATION ,tr.INTITULE, af.LIEU,af.MATRIC_SUPERIEUR,af.MATRIC_SUP_1,af.MATRIC_SUP_2 
                      from dbo.AGENT ag inner join dbo.ADRESSE adr
                      on adr.MATRICULE = ag.MATRICULE
                      inner join CLASSIFICATION cl on ag.MATRICULE = cl.MATRICULE
                      inner join TABLE_REFERENCE tr on tr.CODE=cl.NIV_RESPONSABILITE
                      inner join dbo.AFFECTATION af on af.MATRICULE = ag.MATRICULE
                      inner join dbo.UNITE_ORG dir on af.LIEU = dir.UO 
                      INNER JOIN dbo.CONGES cog on cog.MATRICULE = ag.MATRICULE
                      INNER JOIN dbo.CONTRAT ct on ag.MATRICULE = ct.MATRICULE
                      WHERE  cl.NIV_RESPONSABILITE IN (SELECT CODE FROM TABLE_REFERENCE WHERE Table_name = 'responsabilite') 
                      and tr.INTITULE like 'DIRECTEUR ADJOINT%' and  ct.SITUAT_EFFECTIF = '1'`;

    const resSqlDirAdj = await sequelize.query(queryDirAdj, {
      type: Sequelize.QueryTypes.SELECT,
    });

    let directeursAdjoints = [];

    for (let item of resSqlDirAdj) {
      const direction = directions.find(
        (dir) => String(dir.uo) === String(item.LIEU)
      );

      if (direction && item.EMAIL) {
        const id = new mongoose.Types.ObjectId();
        directeursAdjoints = directions.map((dir) => {
          if (String(dir.uo) === String(item.LIEU)) dir.directeur = id;
          return dir;
        });

        let findDirecteurAdjoint = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findDirecteurAdjoint) {
          directions = directions.map((dir) => {
            if (String(dir.uo) === String(item.LIEU))
              dir.directeurAdjoint = findDirecteurAdjoint._id;
            return dir;
          });

          findDirecteurAdjoint.fonction = item.INTITULE;
          findDirecteurAdjoint.civilite = item.CIVILITE;
          findDirecteurAdjoint.isDirecteurAdj = true;
          findDirecteurAdjoint.isChefDeService = false;
          findDirecteurAdjoint.isChefDeDepartement = false;
          findDirecteurAdjoint.directeur = false;
          findDirecteurAdjoint.direction = direction._id;
          findDirecteurAdjoint.matriculeSupN1 = item.MATRIC_SUPERIEUR;
          findDirecteurAdjoint.matriculeSupN2 = item.MATRIC_SUP_1;
          findDirecteurAdjoint.matriculeSupN3 = item.MATRIC_SUP_;
          findDirecteurAdjoint.roles = findDirecteurAdjoint.roles.filter(
            (r) => r != null
          );
          findDirecteurAdjoint.updatedAt = new Date();

          const updatedDirectionAdjoint = await Direction.findOne({
            uo: item.LIEU,
          });
          if (updatedDirectionAdjoint) {
            updatedDirectionAdjoint.directeursAdjoints.push(
              findDirecteurAdjoint._id
            );
            await updatedDirectionAdjoint.save();
          }

          await findDirecteurAdjoint.save();
          

        } else {
          let newDirecteurAdjoint = {
            _id: id,
            isActive: true,
            firstTimeLogin: true,
            createdAt: new Date(),
            nom: item.NOM,
            prenom: item.PRENOM,
            matricule: Number(item.MATRICULE),
            civilite: item.CIVILITE,
            fonction: item.INTITULE,
            isDirecteurAdj: true,
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
            matriculeSupN1: item.MATRIC_SUPERIEUR,
            matriculeSupN2: item.MATRIC_SUP_1,
            matriculeSupN3: item.MATRIC_SUP_2,
          };
          await new Utilisateur(newDirecteurAdjoint).save();
          const updatedDirection = await Direction.findOne({
            uo: item.LIEU,
          });
          if (updatedDirection) {
            updatedDirection.directeursAdjoints.push(newDirecteurAdjoint._id);
            await updatedDirection.save();
          }
          directeursAdjoints.push(newDirecteurAdjoint);
        }
      }
    }

    /******************************  UTILISATEURS NORMAL  ******************************/
    let query3 = `SELECT DISTINCT ag.MATRICULE, ag.NOM, ag.PRENOM,ag.CIVILITE,adr.TELEPHONE,adr.EMAIL,  (select re.INTITULE from TABLE_REFERENCE RE where re.CODE=CL.QUALIFICATION and RE.TABLE_NAME='qualification') as QUALIFICATION, af.LIEU, dir.SIGLE AS 'service',af.MATRIC_SUPERIEUR,af.MATRIC_SUP_1,af.MATRIC_SUP_2 
              FROM dbo.AGENT ag INNER JOIN dbo.ADRESSE adr ON adr.MATRICULE = ag.MATRICULE
              INNER JOIN CLASSIFICATION cl ON ag.MATRICULE = cl.MATRICULE
              INNER JOIN dbo.AFFECTATION af ON af.MATRICULE = ag.MATRICULE
              INNER JOIN dbo.UNITE_ORG dir ON af.LIEU = dir.UO 
              INNER JOIN dbo.CONTRAT ct on ag.MATRICULE = ct.MATRICULE
              where ct.SITUAT_EFFECTIF = '1'  AND NOT EXISTS (
                  SELECT 1 
                  FROM TABLE_REFERENCE tr
                  WHERE tr.Table_name = 'responsabilite' AND tr.CODE = cl.NIV_RESPONSABILITE and  tr.INTITULE  not like  '%RESPONSABLE%'
                );
`;

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
        (cdp) => cdp && String(cdp.email) === String(item.EMAIL)
      );

      const service = services.find(
        (srv) => String(srv.uo) === String(item.LIEU)
      );

      let departement = null;
      if (service && service.departement) {
        departement = departement = departements.find(
          (dep) => String(dep._id) === String(service.departement)
        );
      } else {
        departement = departements.find(
          (dep) => String(dep.uo) === String(item.LIEU)
        );
      }

      let direction = null;

      if (departement && departement.direction) {
        direction = directions.find(
          (dir) => String(dir._id) === String(departement.direction)
        );
      } else {
        direction = directions.find(
          (dir) => String(dir.uo) === String(item.LIEU)
        );
      }

      if (
        findIsChefDeDepartement === -1 &&
        findIsChefDeService === -1 &&
        findIsDirecteur === -1 &&
        item.EMAIL
      ) {
        let findUtilisateur = await Utilisateur.findOne({
          matricule: Number(item.MATRICULE),
        });

        if (findUtilisateur) {
          findUtilisateur.fonction = item.QUALIFICATION;
          findUtilisateur.civilite = item.CIVILITE;
          findUtilisateur.isDirecteur = false;
          findUtilisateur.isChefDeService = false;
          findUtilisateur.isChefDeDepartement = false;
          findUtilisateur.isDirecteurAdj = false;
          findUtilisateur.service = service && service._id;
          findUtilisateur.departement = departement && departement._id;
          findUtilisateur.direction = direction && direction._id;

          findUtilisateur.matriculeSupN1 = item.MATRIC_SUPERIEUR;
          findUtilisateur.matriculeSupN2 = item.MATRIC_SUP_1;
          findUtilisateur.matriculeSupN3 = item.MATRIC_SUP_2;

          let roles = [
            {
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
              _id: new mongoose.Types.ObjectId(),
            },
          ];

          let findRoleCrtOp = findUtilisateur.roles.find(
            (r) =>
              r != null && String(r.role) === String("65c34e0c4d1e2f50c262a13a")
          );
          if (findRoleCrtOp != undefined && findRoleCrtOp != null) {
            roles.push({
              _id: new mongoose.Types.ObjectId(),
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a13a"),
            });
          }

          let findRoleCrt = findUtilisateur.roles.find(
            (r) =>
              r != null && String(r.role) === String("65c34e0c4d1e2f50c262a137")
          );
          if (findRoleCrt != undefined && findRoleCrt != null) {
            roles.push({
              _id: new mongoose.Types.ObjectId(),
              role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a137"),
            });
          }

          findUtilisateur.roles = roles;
          findUtilisateur.updatedAt = new Date();

          const findUserChefservice = await Service.findOne({
            chefService: findUtilisateur._id,
          });
          if (findUserChefservice != null && findUserChefservice != undefined) {
            findUserChefservice.chefService = null;
            await findUserChefservice.save();
          }

          const findUserChefDep = await Departement.findOne({
            chefDeDepartement: findUtilisateur._id,
          });
          if (findUserChefDep != null && findUserChefDep != undefined) {
            findUserChefDep.chefDeDepartement = null;
            await findUserChefDep.save();
          }

          const findUserDirAdj = await Direction.findOne({
            directeurAdjoint: String(findUtilisateur._id),
          });
          if (findUserDirAdj != null && findUserDirAdj != undefined) {
            findUserDirAdj.directeurAdjoint = null;
            await findUserDirAdj.save();
          }

          const findUserDir = await Direction.findOne({
            directeur: String(findUtilisateur._id),
          });
          if (findUserDir != null && findUserDir != undefined) {
            findUserDir.directeur = null;
            await findUserDir.save();
          }

          await findUtilisateur.save();

          utilisateurs.push(JSON.parse(JSON.stringify(findUtilisateur)));
        } else {
          let find = await Utilisateur.findOne({
            email: item.EMAIL,
          });
          if (!find) {
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
              isDirecteurAdj: false,
              email: item.EMAIL,
              password: bcrypt.hashSync(generatePassword(6), 10),
              roles: [
                {
                  role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
                  _id: new mongoose.Types.ObjectId(),
                },
              ],
              service: service && service._id,
              departement: departement && departement._id,
              direction: direction && direction._id,
              matriculeSupN1: item.MATRIC_SUPERIEUR,
              matriculeSupN2: item.MATRIC_SUP_1,
              matriculeSupN3: item.MATRIC_SUP_2,
            };
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

    // direction et departement et service pour tester :
    let helloWorldService = null;
    let helloWorldDepratement = null;
    let helloWorldDirection = null;

    helloWorldDirection = await Direction.findOne({
      libelle: "direction de hello world",
    });
    helloWorldDepratement = await Departement.findOne({
      libelle: "departement de hello world",
    });
    helloWorldService = await Service.findOne({
      libelle: "service de hello world",
    });

    if (!helloWorldDirection) {
      helloWorldDirection = await new Direction({
        libelle: "direction de hello world",
      }).save();
    }

    if (!helloWorldDepratement) {
      helloWorldDepratement = await new Departement({
        libelle: "departement de hello world",
        direction: helloWorldDirection._id,
      }).save();
    }

    if (!helloWorldService) {
      helloWorldService = await new Service({
        libelle: "service de hello world",
        departement: helloWorldDepratement._id,
        direction: helloWorldDirection._id,
      }).save();
    }

    // utilisateurs pour tester :
    let jhonDoe = await Utilisateur.findOne({
      email: "j.doe@snrt.ma",
    });

    let steveSmith = await Utilisateur.findOne({
      email: "s.smith@snrt.ma",
    });

    let janeDoeSmith = await Utilisateur.findOne({
      email: "jane.doe@snrt.ma",
    });

    let richardRoe = await Utilisateur.findOne({
      email: "r.roe@snrt.ma",
    });

    let joeBloe = await Utilisateur.findOne({
      email: "joe.bloe@snrt.ma",
    });

    if (!joeBloe) {
      await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "Bloe",
        prenom: "Joe",
        email: "joe.bloe@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 191292393,
        fonction: "technicien en hello world",
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
        firstTimeLogin: false,
        direction: helloWorldDirection._id,
        departement: helloWorldDepratement._id,
        service: helloWorldService._id,
      }).save();
    }

    if (!jhonDoe) {
      await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "Doe",
        prenom: "Jhon",
        email: "j.doe@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 101202303,
        fonction: "ingenieur en hello world",
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
        firstTimeLogin: false,
        direction: helloWorldDirection._id,
        departement: helloWorldDepratement._id,
        service: helloWorldService._id,
      }).save();
    }

    if (!steveSmith) {
      let createdSteveSmith = await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "Smith",
        prenom: "Steve",
        email: "s.smith@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 111222333,
        isChefDeService: true,
        fonction: "chef de service de service hello world",
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
            _id: new mongoose.Types.ObjectId(),
          },
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
            _id: new mongoose.Types.ObjectId(),
          },
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a13a"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
        firstTimeLogin: false,
        direction: helloWorldDirection._id,
        departement: helloWorldDepratement._id,
        service: helloWorldService._id,
      }).save();

      const updatedHelloWorldService = await Service.findOne({
        libelle: "service de hello world",
      });
      updatedHelloWorldService.chefService = createdSteveSmith._id;
      await updatedHelloWorldService.save();
    }

    if (!janeDoeSmith) {
      let createdJaneDoeSmith = await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "Doe",
        prenom: "Jane",
        email: "jane.doe@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 119229339,
        fonction: "chef de departement de departement hello world",
        isChefDeDepartement: true,
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
            _id: new mongoose.Types.ObjectId(),
          },
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
            _id: new mongoose.Types.ObjectId(),
          },
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a13a"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
        firstTimeLogin: false,
        direction: helloWorldDirection._id,
        departement: helloWorldDepratement._id,
      }).save();

      const updatedHelloWorldDepartement = await Departement.findOne({
        libelle: "departement de hello world",
      });
      updatedHelloWorldDepartement.chefDeDepartement = createdJaneDoeSmith._id;
      await updatedHelloWorldDepartement.save();
    }

    if (!richardRoe) {
      let createdRihcardRoe = await new Utilisateur({
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        nom: "Roe",
        prenom: "Richard",
        email: "r.roe@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 118228338,
        fonction: "directeur de la direction hello world",
        isDirecteur: true,
        roles: [
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a138"),
            _id: new mongoose.Types.ObjectId(),
          },
          {
            role: new mongoose.Types.ObjectId("65c34e0c4d1e2f50c262a139"),
            _id: new mongoose.Types.ObjectId(),
          },
        ],
        firstTimeLogin: false,
        direction: helloWorldDirection._id,
      }).save();

      const updatedHelloWorldDirection = await Direction.findOne({
        libelle: "direction de hello world",
      });
      updatedHelloWorldDirection.directeur = createdRihcardRoe._id;
      await updatedHelloWorldDirection.save();
    }

    const dataToWrite = `[DATA INSERT] : ${new Date()} :: Data Inserted succcessfully \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("The data was appended to the file!");
    });

    console.log(`[BACKUP] Data Inserted succcessfully !`.green.inverse);
  } catch (error) {
    const dataToWrite = `[ERROR] : ${new Date()} :: ${error} \n`;
    fs.appendFileSync(logFilePath, dataToWrite, (err) => {
      if (err) throw err;
      console.log("The data was appended to the file!");
    });
    console.log(`[BACKUP] Error : ${error}`.red.inverse);
  }
};

// main();


// 12 hours :
cron.schedule("0 */12 * * *", async () => {
  try {
    main();
  } catch (error) {
    console.error("CRON ERROR:", error);
  }
});
