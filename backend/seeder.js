import colors from "colors";
import dotenv from "dotenv";

import roles from "./data/roles.js";
import categories from "./data/categories.js";
import directions from "./data/directions.js";
import services from "./data/services.js";
import sousCategories from "./data/sousCategories.js";
import utilisateurs from "./data/utilisateurs.js";
import options from "./data/options.js";

import Role from "./models/roleModel.js";
import Utilisateur from "./models/utilisateurModel.js";
import Direction from "./models/directionModel.js";
import Service from "./models/serviceModel.js";
import Categorie from "./models/categorieModel.js";
import SousCategorie from "./models/sousCategorieModel.js";
import Option from "./models/optionModel.js";

import connectDB from "./config/database.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // delete data :
    // await Option.deleteMany();
    await Utilisateur.deleteMany();
    // await SousCategorie.deleteMany();
    // await Categorie.deleteMany();
    // await Service.deleteMany();
    // await Direction.deleteMany();
    // await Role.deleteMany();

    // import data :
    // await Role.insertMany(roles);
    // await Direction.insertMany(directions);
    // await Service.insertMany(services);
    // await Categorie.insertMany(categories);
    // await SousCategorie.insertMany(sousCategories);
    await Utilisateur.insertMany(utilisateurs);
    // await Option.insertMany(options);

    console.log(`Data Imported !`.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Utilisateur.deleteMany();
    await SousCategorie.deleteMany();
    await Categorie.deleteMany();
    await Service.deleteMany();
    await Direction.deleteMany();
    await Role.deleteMany();

    console.log(`Data destroyed !`.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
