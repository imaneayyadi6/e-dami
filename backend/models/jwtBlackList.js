import mongoose from "mongoose";

const Schema = mongoose.Schema;
const jwtBlackList = Schema({
  token: {
    type: String,
  },
});

const JwtBlackList = mongoose.model("jwtBlackList", jwtBlackList);
export default JwtBlackList;
