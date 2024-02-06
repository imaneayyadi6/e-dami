import colors from "colors";
import fs from "fs";
import mongoose from "mongoose";
import roles from "./data/roles.js";
import bcrypt from "bcryptjs";

const extractData = async () => {
    try {

        /******************************   DIRECTIONS   ******************************/

        const directionsFromJson = fs.readFileSync("./backend/data/aghirjson/directions.json", 'utf8');
        let directions = JSON.parse(directionsFromJson);

        directions = directions.map(direction => {
            return {
                _id: new mongoose.Types.ObjectId(),
                libelle: direction.SIGLE,
                uo: direction.UO
            }
        })



        /******************************   SERVICES   ******************************/
        const servicesFromJson = fs.readFileSync("./backend/data/aghirjson/services.json", 'utf8');
        let services = JSON.parse(servicesFromJson);
        services = services.map(item => {
            return {
                _id: new mongoose.Types.ObjectId(),
                libelle: item.service,
                uo: item.UO_service,
                direction: directions.find(dir => String(dir.uo) === String(item.UO_direction))._id,
            }
        })

        /******************************   DIRECTEURS   ******************************/
        const directeursFromJson = fs.readFileSync("./backend/data/aghirjson/directeurs.json", 'utf8');
        let directeurs = JSON.parse(directeursFromJson);

        directeurs = directeurs.map(item => {
            const direction = directions.find(dir => String(dir.uo) === String(item.LIEU));
            if (direction) {
                const id = new mongoose.Types.ObjectId();

                directions = directions.map(dir => {
                    if (String(dir.uo) === String(item.LIEU))
                        dir.directeur = id
                    return dir;
                })



                return {
                    _id: id,
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    gsm: item.TELEPHONE,
                    fonction: item.INTITULE,
                    isDirecteur: true,
                    email: item.EMAIL,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {

                            role: "657b1914c9d20eb476013fda",
                            _id: new mongoose.Types.ObjectId(),

                        }
                    ],
                    direction: directions.find(dir => String(dir.uo) === String(item.LIEU))._id,
                }
            }


        })


        /******************************   CHEF DE SERVICES   ******************************/
        const chefdeservicesFromJson = fs.readFileSync("./backend/data/aghirjson/chefdeservices.json", 'utf8');
        let chefdeservices = JSON.parse(chefdeservicesFromJson);
        chefdeservices = chefdeservices.map(item => {
            const service = services.find(srv => String(srv.uo) === String(item.LIEU));
            if (service) {
                const id = new mongoose.Types.ObjectId();
                services = services.map(srv => {
                    if (String(srv.uo) === String(item.LIEU))
                        srv.chefService = id
                    return srv;
                })
                return {
                    _id: id,
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    gsm: item.TELEPHONE,
                    fonction: item.INTITULE,
                    isChefDeService: true,
                    email: item.EMAIL,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {
                            role: "657b1914c9d20eb476013fda",
                            _id: new mongoose.Types.ObjectId(),
                        }
                    ],
                    service: services.find(srv => String(srv.uo) === String(item.LIEU))._id,
                }
            }
        })


        directeurs = directeurs.map(item => {
            if (item !== null)
                return item;
        })

        chefdeservices = chefdeservices.map(item => {
            if (item !== null)
                return item;
        })


        /******************************   NORMAL URILISATEURS   ******************************/
        const utilisateursFromJson = fs.readFileSync("./backend/data/aghirjson/utilisateurs.json", 'utf8');
        let utilisateurs = JSON.parse(utilisateursFromJson);
        utilisateurs = utilisateurs.map(item => {
            const service = services.find(srv => String(srv.uo) === String(item.LIEU));
            const findIsChefDeService = chefdeservices.findIndex(cdf => cdf && Number(cdf ? cdf.matricule : 0) === Number(item.MATRICULE))
            const findIsDirecteur = directeurs.findIndex(dir => dir && Number(dir ? dir.matricule : 0) === Number(item.MATRICULE))

            if (service && findIsChefDeService === -1 && findIsDirecteur === -1) {
                const id = new mongoose.Types.ObjectId();
                return {
                    _id: id,
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    gsm: item.TELEPHONE,
                    fonction: item.QUALIFICATION,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {
                            role: "657b1914c9d20eb476013fd9",
                            _id: new mongoose.Types.ObjectId(),
                        }
                    ],
                    service: services.find(srv => String(srv.uo) === String(item.LIEU))._id,
                }
            }
        })

        /******************************   INSERT DATA  ******************************/
        directions = JSON.stringify(directions)
        fs.appendFileSync('./backend/data/json/directions.json', directions, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        services = JSON.stringify(services)
        fs.appendFileSync('./backend/data/json/services.json', services, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        directeurs = JSON.stringify(directeurs)
        fs.appendFileSync('./backend/data/json/directeurs.json', directeurs, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });


        chefdeservices = JSON.stringify(chefdeservices)
        fs.appendFileSync('./backend/data/json/chefdeservices.json', chefdeservices, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        utilisateurs = JSON.stringify(utilisateurs)
        fs.appendFileSync('./backend/data/json/utilisateurs.json', utilisateurs, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });


        console.log(`Data Extracted !`.green.inverse);

        process.exit();


    } catch (error) {
        console.error(`${error.message}`.red.inverse);
        process.exit(1);
    }
};

extractData();