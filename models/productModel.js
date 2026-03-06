import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    image: { 
      type: [String], 
      required: true, 
      validate: (arr) => arr.length > 0 
    },
    category: { 
      type: String, 
      required: true, 
      trim: true 
    },
    subCategory: { 
      type: String, 
      required: true, 
      trim: true 
    },
    sizes: { 
      type: [String], 
      required: true 
    },
    bestseller: { 
      type: Boolean, 
      default: false 
    },
    date: { 
      type: Number, 
      required: true 
    },

    // ✅ STOCK FIELD
    // Sized categories (Shirt/Jeans/Tshirt/Combo) → object: { S: 10, M: 5, L: 8, XL: 3 }
    // Non-sized categories (Bags/Perfumes)         → number: 50
    stock: {
      type: mongoose.Schema.Types.Mixed,
      default: 0
    },
  },
  { timestamps: true }
);

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;