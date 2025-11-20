import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    
    mongoose.set("strictQuery", false);
    
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, 
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
      bufferCommands: false, 
      maxIdleTimeMS: 30000, 
      retryWrites: true, 
      retryReads: true, 
    };

    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/e-dami';
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected : ${conn.connection.host}`.cyan.bold);
    console.log(`Connection Pool Size: ${conn.connection.readyState}`.green);
    
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected'.yellow);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected'.green);
    });

    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination'.yellow);
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error : ${error.message}`.red.underline.bold);
    
    process.exit(1);
  }
};

export default connectDB;
