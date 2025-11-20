
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/e-dami", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};


const roleSchema = new mongoose.Schema({
  code: String,
  libelle: String
}, { timestamps: true });

const directionSchema = new mongoose.Schema({
  libelle: String,
  directeursAdjoints: [String],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  libelle: String,
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const departementSchema = new mongoose.Schema({
  libelle: String,
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const categorieSchema = new mongoose.Schema({
  libelle: String,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const sousCategorieSchema = new mongoose.Schema({
  libelle: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const optionSchema = new mongoose.Schema({
  libelle: String,
  description: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie' },
  sousCategorie: { type: mongoose.Schema.Types.ObjectId, ref: 'sousCategorie' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  password: String,
  matricule: Number,
  isActive: { type: Boolean, default: true },
  firstTimeLogin: { type: Boolean, default: false },
  isDirecteur: { type: Boolean, default: false },
  roles: [{ role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' } }],
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'service' },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: 'direction' },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: 'departement' }
}, { timestamps: true });


const Role = mongoose.model('role', roleSchema);
const Direction = mongoose.model('direction', directionSchema);
const Service = mongoose.model('service', serviceSchema);
const Departement = mongoose.model('departement', departementSchema);
const Categorie = mongoose.model('categorie', categorieSchema);
const SousCategorie = mongoose.model('sousCategorie', sousCategorieSchema);
const Option = mongoose.model('option', optionSchema);
const User = mongoose.model('utilisateur', userSchema);


const populateDatabase = async () => {
  try {
    console.log("🚀 Starting database population...");

    
    console.log("📋 Creating roles...");
    const roles = [
      { code: "crt", libelle: "créateur" },
      { code: "dmr", libelle: "demandeur" },
      { code: "sig", libelle: "signataire" },
      { code: "crt-op", libelle: "créateur d'option" }
    ];

    const createdRoles = [];
    for (const roleData of roles) {
      const existingRole = await Role.findOne({ code: roleData.code });
      if (!existingRole) {
        const role = await Role.create(roleData);
        createdRoles.push(role);
        console.log(`✅ Created role: ${roleData.libelle}`);
      } else {
        createdRoles.push(existingRole);
        console.log(`⚠️ Role already exists: ${roleData.libelle}`);
      }
    }

    
    console.log("🏢 Creating directions...");
    const directions = [
      { libelle: "Direction Générale", directeursAdjoints: [] },
      { libelle: "Direction des Ressources Humaines", directeursAdjoints: [] },
      { libelle: "Direction Financière", directeursAdjoints: [] },
      { libelle: "Direction Technique", directeursAdjoints: [] },
      { libelle: "Direction Commerciale", directeursAdjoints: [] }
    ];

    const createdDirections = [];
    for (const directionData of directions) {
      const existingDirection = await Direction.findOne({ libelle: directionData.libelle });
      if (!existingDirection) {
        const direction = await Direction.create(directionData);
        createdDirections.push(direction);
        console.log(`✅ Created direction: ${directionData.libelle}`);
      } else {
        createdDirections.push(existingDirection);
        console.log(`⚠️ Direction already exists: ${directionData.libelle}`);
      }
    }

    
    console.log("🔧 Creating services...");
    const services = [
      { libelle: "Service Informatique", direction: createdDirections[0]._id },
      { libelle: "Service RH", direction: createdDirections[1]._id },
      { libelle: "Service Comptabilité", direction: createdDirections[2]._id },
      { libelle: "Service Maintenance", direction: createdDirections[3]._id },
      { libelle: "Service Ventes", direction: createdDirections[4]._id },
      { libelle: "Service Support", direction: createdDirections[0]._id }
    ];

    const createdServices = [];
    for (const serviceData of services) {
      const existingService = await Service.findOne({ libelle: serviceData.libelle });
      if (!existingService) {
        const service = await Service.create(serviceData);
        createdServices.push(service);
        console.log(`✅ Created service: ${serviceData.libelle}`);
      } else {
        createdServices.push(existingService);
        console.log(`⚠️ Service already exists: ${serviceData.libelle}`);
      }
    }

    
    console.log("🏬 Creating departments...");
    const departments = [
      { libelle: "Département IT", direction: createdDirections[0]._id },
      { libelle: "Département Personnel", direction: createdDirections[1]._id },
      { libelle: "Département Finance", direction: createdDirections[2]._id },
      { libelle: "Département Production", direction: createdDirections[3]._id },
      { libelle: "Département Marketing", direction: createdDirections[4]._id }
    ];

    const createdDepartments = [];
    for (const deptData of departments) {
      const existingDept = await Departement.findOne({ libelle: deptData.libelle });
      if (!existingDept) {
        const dept = await Departement.create(deptData);
        createdDepartments.push(dept);
        console.log(`✅ Created department: ${deptData.libelle}`);
      } else {
        createdDepartments.push(existingDept);
        console.log(`⚠️ Department already exists: ${deptData.libelle}`);
      }
    }

    
    console.log("📂 Creating categories...");
    const categories = [
      { libelle: "Demandes RH" },
      { libelle: "Demandes IT" },
      { libelle: "Demandes Financières" },
      { libelle: "Demandes Administratives" },
      { libelle: "Demandes Techniques" }
    ];

    const createdCategories = [];
    for (const catData of categories) {
      const existingCat = await Categorie.findOne({ libelle: catData.libelle });
      if (!existingCat) {
        const category = await Categorie.create(catData);
        createdCategories.push(category);
        console.log(`✅ Created category: ${catData.libelle}`);
      } else {
        createdCategories.push(existingCat);
        console.log(`⚠️ Category already exists: ${catData.libelle}`);
      }
    }

    
    console.log("📁 Creating subcategories...");
    const subcategories = [
      { libelle: "Congés", categorie: createdCategories[0]._id },
      { libelle: "Formations", categorie: createdCategories[0]._id },
      { libelle: "Matériel Informatique", categorie: createdCategories[1]._id },
      { libelle: "Logiciels", categorie: createdCategories[1]._id },
      { libelle: "Achats", categorie: createdCategories[2]._id },
      { libelle: "Remboursements", categorie: createdCategories[2]._id },
      { libelle: "Documents", categorie: createdCategories[3]._id },
      { libelle: "Autorisations", categorie: createdCategories[3]._id },
      { libelle: "Maintenance", categorie: createdCategories[4]._id },
      { libelle: "Installations", categorie: createdCategories[4]._id }
    ];

    const createdSubcategories = [];
    for (const subcatData of subcategories) {
      const existingSubcat = await SousCategorie.findOne({ libelle: subcatData.libelle });
      if (!existingSubcat) {
        const subcategory = await SousCategorie.create(subcatData);
        createdSubcategories.push(subcategory);
        console.log(`✅ Created subcategory: ${subcatData.libelle}`);
      } else {
        createdSubcategories.push(existingSubcat);
        console.log(`⚠️ Subcategory already exists: ${subcatData.libelle}`);
      }
    }

    
    console.log("🎯 Creating sample options...");
    const options = [
      {
        libelle: "Demande de Congé Annuel",
        description: "Demande de congé annuel pour les employés",
        categorie: createdCategories[0]._id,
        sousCategorie: createdSubcategories[0]._id,
        service: createdServices[1]._id,
        departement: createdDepartments[1]._id,
        direction: createdDirections[1]._id
      },
      {
        libelle: "Demande de Matériel Informatique",
        description: "Demande d'achat de matériel informatique",
        categorie: createdCategories[1]._id,
        sousCategorie: createdSubcategories[2]._id,
        service: createdServices[0]._id,
        departement: createdDepartments[0]._id,
        direction: createdDirections[0]._id
      },
      {
        libelle: "Demande de Formation",
        description: "Demande de participation à une formation",
        categorie: createdCategories[0]._id,
        sousCategorie: createdSubcategories[1]._id,
        service: createdServices[1]._id,
        departement: createdDepartments[1]._id,
        direction: createdDirections[1]._id
      }
    ];

    for (const optionData of options) {
      const existingOption = await Option.findOne({ libelle: optionData.libelle });
      if (!existingOption) {
        await Option.create(optionData);
        console.log(`✅ Created option: ${optionData.libelle}`);
      } else {
        console.log(`⚠️ Option already exists: ${optionData.libelle}`);
      }
    }

    
    console.log("👥 Creating users...");
    const users = [
      {
        nom: "admin",
        prenom: "admin",
        email: "admin@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 2003003,
        roles: [{ role: createdRoles[0]._id }], 
        service: createdServices[0]._id,
        direction: createdDirections[0]._id,
        departement: createdDepartments[0]._id,
        isActive: true,
        firstTimeLogin: false
      },
      {
        nom: "demandeur",
        prenom: "test",
        email: "demandeur@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 2003004,
        roles: [{ role: createdRoles[1]._id }], 
        service: createdServices[1]._id,
        direction: createdDirections[1]._id,
        departement: createdDepartments[1]._id,
        isActive: true,
        firstTimeLogin: false
      },
      {
        nom: "signataire",
        prenom: "test",
        email: "signataire@snrt.ma",
        password: bcrypt.hashSync("123456", 10),
        matricule: 2003005,
        roles: [{ role: createdRoles[2]._id }], 
        service: createdServices[2]._id,
        direction: createdDirections[2]._id,
        departement: createdDepartments[2]._id,
        isActive: true,
        firstTimeLogin: false,
        isDirecteur: true
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ matricule: userData.matricule });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.nom} ${userData.prenom} (${userData.matricule})`);
      } else {
        console.log(`⚠️ User already exists: ${userData.nom} ${userData.prenom} (${userData.matricule})`);
      }
    }

    console.log("🎉 Database population completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- ${await Role.countDocuments()} roles`);
    console.log(`- ${await Direction.countDocuments()} directions`);
    console.log(`- ${await Service.countDocuments()} services`);
    console.log(`- ${await Departement.countDocuments()} departments`);
    console.log(`- ${await Categorie.countDocuments()} categories`);
    console.log(`- ${await SousCategorie.countDocuments()} subcategories`);
    console.log(`- ${await Option.countDocuments()} options`);
    console.log(`- ${await User.countDocuments()} users`);

  } catch (error) {
    console.error("❌ Error populating database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};


connectDB().then(() => {
  populateDatabase();
});
