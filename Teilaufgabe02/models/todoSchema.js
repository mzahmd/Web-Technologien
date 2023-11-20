import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  name: "String",
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

export default mongoose.model("ToDo", todoSchema);
