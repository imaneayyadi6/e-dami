import colors from "colors";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const extractData = async () => {
    try {

        /******************************   DIRECTIONS   ******************************/

        const directionsFromJson = fs.readFileSync("./backend/data/aghirjson/directions.json", 'utf8');
        let directions = JSON.parse(directionsFromJson);

        directions = directions.map(direction => {
            return {
                _id: {
                    "$oid": new mongoose.Types.ObjectId(),
                },
                libelle: direction.SIGLE,
                uo: direction.UO
            }
        })



        /******************************   SERVICES   ******************************/
        const servicesFromJson = fs.readFileSync("./backend/data/aghirjson/services.json", 'utf8');
        let services = JSON.parse(servicesFromJson);
        services = services.map(item => {
            return {
                _id: {
                    "$oid": new mongoose.Types.ObjectId(),
                },
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
            if (direction && item.EMAIL) {
                const id = new mongoose.Types.ObjectId();

                directions = directions.map(dir => {
                    if (String(dir.uo) === String(item.LIEU))
                        dir.directeur = {
                            "$oid": id
                        }
                    return dir;
                })


                return {
                    _id: {
                        "$oid": id
                    },
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    fonction: item.INTITULE,
                    isDirecteur: true,
                    email: item.EMAIL,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {

                            role: { "$oid": "65c34e0c4d1e2f50c262a139" },
                            _id: {
                                "$oid": new mongoose.Types.ObjectId()
                            },

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
            if (service && item.EMAIL) {
                const id = new mongoose.Types.ObjectId();
                services = services.map(srv => {
                    if (String(srv.uo) === String(item.LIEU))
                        srv.chefService = {
                            "$oid": id
                        }
                    return srv;
                })
                return {
                    _id: {
                        "$oid": id,
                    },
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    fonction: item.INTITULE,
                    isChefDeService: true,
                    email: item.EMAIL,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {
                            role: {
                                "$oid": "65c34e0c4d1e2f50c262a139",
                            },
                            _id: {
                                "$oid": new mongoose.Types.ObjectId(),
                            }
                        }
                    ],
                    service: services.find(srv => String(srv.uo) === String(item.LIEU))._id,
                    direction: services.find(srv => String(srv.uo) === String(item.LIEU)).direction
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

            if (service && item.EMAIL && findIsChefDeService === -1 && findIsDirecteur === -1) {
                const id = new mongoose.Types.ObjectId();
                return {
                    _id: {
                        "$oid": id,
                    },
                    isActive: true,
                    firstTimeLogin: true,
                    nom: item.NOM,
                    prenom: item.PRENOM,
                    matricule: Number(item.MATRICULE),
                    civilite: item.CIVILITE,
                    fonction: item.QUALIFICATION,
                    email: item.EMAIL,
                    password: bcrypt.hashSync("123456", 10),
                    roles: [
                        {
                            role: {
                                "$oid": "65c34e0c4d1e2f50c262a138",
                            },
                            _id: {
                                "$oid": new mongoose.Types.ObjectId(),
                            }
                        }
                    ],
                    service: services.find(srv => String(srv.uo) === String(item.LIEU))._id,
                    direction: services.find(srv => String(srv.uo) === String(item.LIEU)).direction

                }
            }
        })


        let ndirections = []
        for (let direction of directions)
            if (direction !== null) ndirections.push(direction)

        let nservices = []
        for (let service of services)
            if (service !== null) nservices.push(service)
        let ndirecteurs = []
        for (let directeur of directeurs)
            if (directeur !== null) ndirecteurs.push(directeur)
        let nchefdeservices = []
        for (let chefdeservice of chefdeservices)
            if (chefdeservice !== null) nchefdeservices.push(chefdeservice)
        let nutilisateurs = []
        for (let utilisateur of utilisateurs)
            if (utilisateur !== null) nutilisateurs.push(utilisateur)

        /******************************   INSERT DATA  ******************************/
        ndirections = JSON.stringify(ndirections)
        fs.appendFileSync('./backend/data/json/directions.json', ndirections, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        nservices = JSON.stringify(nservices)
        fs.appendFileSync('./backend/data/json/services.json', nservices, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        ndirecteurs = JSON.stringify(ndirecteurs)
        fs.appendFileSync('./backend/data/json/directeurs.json', ndirecteurs, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });


        nchefdeservices = JSON.stringify(nchefdeservices)
        fs.appendFileSync('./backend/data/json/chefdeservices.json', nchefdeservices, (err) => {
            if (err) throw err;
            console.log('The data was appended to the file!');
        });

        nutilisateurs = JSON.stringify(nutilisateurs)
        fs.appendFileSync('./backend/data/json/utilisateurs.json', nutilisateurs, (err) => {
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