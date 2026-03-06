import mongoose from "mongoose";
import productModel from "./models/productModel.js";

const MONGODB_URI = "mongodb+srv://nawazsayed161202:uvjOhf6pv7ofzF7m@cluster0.u4uxinx.mongodb.net";

const fixCategories = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const products = await productModel.find({});
    console.log(`Found ${products.length} products\n`);

    for (const product of products) {
      let newCategory = null;
      const name = product.name.toLowerCase();

      // Determine correct category based on product name
      if (name.includes("shirt") && name.includes("jeans")) {
        newCategory = "Combo";
      } else if (name.includes("shirt") && !name.includes("tshirt")) {
        newCategory = "Shirt";
      } else if (name.includes("tshirt") || name.includes("t-shirt")) {
        newCategory = "Tshirt";
      } else if (name.includes("jeans")) {
        newCategory = "Jeans";
      } else if (name.includes("bag")) {
        newCategory = "Bags";
      } else if (name.includes("perfume")) {
        newCategory = "Perfumes";
      }

      if (newCategory) {
        console.log(`Updating: "${product.name}" → ${newCategory}`);
        await productModel.findByIdAndUpdate(product._id, {
          category: newCategory
        });
      }
    }

    console.log("\n✅ All products updated successfully!");
    mongoose.connection.close();

  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
  }
};

fixCategories();