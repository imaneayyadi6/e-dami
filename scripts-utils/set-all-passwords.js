import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/e-dami';
    await mongoose.connect(mongoUri);

    const userSchema = new mongoose.Schema({ password: String, firstTimeLogin: Boolean }, { strict: false });
    const User = mongoose.model('utilisateur', userSchema, 'utilisateurs');

    const hash = await bcrypt.hash('123456', 10);
    const res = await User.updateMany({}, { $set: { password: hash, firstTimeLogin: false } });
    console.log(`Updated ${res.modifiedCount || res.nModified || 0} users to password 123456`);
  } catch (err) {
    console.error('Error updating passwords:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();






