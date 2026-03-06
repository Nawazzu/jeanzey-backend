import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    country: { 
      type: String, 
      default: "" 
    },

    mobile: { 
      type: String, 
      default: "" 
    },

    cartData: { 
      type: Object, 
      default: {} 
    },

    // ✅ New field: Wishlist (array of Product references)
    wishlist: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" 
      }
    ],

    // You can add this optional field for flexibility
    isVerified: { 
      type: Boolean, 
      default: false 
    },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
