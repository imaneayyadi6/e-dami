
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";


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

const checkRoleRef = async () => {
  try {
    
    const roleId = "68c888ca1e0c1a604997dff7";
    const role = await mongoose.connection.db.collection('roles').findOne({ _id: new mongoose.Types.ObjectId(roleId) });
    console.log('🔍 Role with ID 68c888ca1e0c1a604997dff7:', role);
    
    
    const user = await mongoose.connection.db.collection('utilisateurs').findOne({ matricule: 2003003 });
    console.log('🔍 Admin user roles:', user.roles);
    
    
    const roleRef = user.roles[0].role;
    const roleExists = await mongoose.connection.db.collection('roles').findOne({ _id: roleRef });
    console.log('🔍 Role reference exists:', roleExists);
    
    
    const allRoles = await mongoose.connection.db.collection('roles').find({}).toArray();
    console.log('🔍 All roles:', allRoles.map(r => ({ id: r._id, code: r.code, libelle: r.libelle })));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  checkRoleRef();
});
