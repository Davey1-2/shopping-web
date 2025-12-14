import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema({
  awid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  category: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: "Obecné",
  },
  state: {
    type: String,
    enum: ["active", "archived", "deleted"],
    default: "active",
  },
  ownerId: {
    type: String,
    required: true,
  },
  items: [
    {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

shoppingListSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

shoppingListSchema.index({ ownerId: 1, state: 1 });
shoppingListSchema.index({ awid: 1 });

export default mongoose.model("ShoppingList", shoppingListSchema);
