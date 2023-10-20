import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected : ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`Error : ${error.message}`.red.underline.bold);
    // Exit process with failure :
    process.exit(1);
  }
};

export default connectDB;
