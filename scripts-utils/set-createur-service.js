import mongoose from 'mongoose';

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/e-dami';
    await mongoose.connect(mongoUri);

    const serviceSchema = new mongoose.Schema({ libelle: String, direction: mongoose.Schema.Types.ObjectId, departement: mongoose.Schema.Types.ObjectId }, { strict: false });
    const userSchema = new mongoose.Schema({ matricule: Number, service: mongoose.Schema.Types.ObjectId, departement: mongoose.Schema.Types.ObjectId, direction: mongoose.Schema.Types.ObjectId }, { strict: false });

    const Service = mongoose.model('service', serviceSchema, 'services');
    const User = mongoose.model('utilisateur', userSchema, 'utilisateurs');

    const svc = await Service.findOne();
    if (!svc) {
      console.log('NO_SERVICE_FOUND');
      return;
    }

    const res = await User.updateOne({ matricule: 2003006 }, { $set: { service: svc._id, departement: svc.departement, direction: svc.direction } });
    console.log('CREATEUR_SERVICE_SET', String(svc._id), 'matched:', res.matchedCount || res.n, 'modified:', res.modifiedCount || res.nModified);
  } catch (err) {
    console.error('Error setting createur service:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();






