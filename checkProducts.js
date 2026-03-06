import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://nawazsayed161202:uvjOhf6pv7ofzF7m@cluster0.u4uxinx.mongodb.net";

const checkProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📦 Collections in database:");
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    const count = await productsCollection.countDocuments();
    console.log(`\n📊 Total documents in 'products' collection: ${count}`);

    if (count > 0) {
      const sampleProducts = await productsCollection.find({}).limit(3).toArray();
      console.log("\n📝 Sample products:");
      sampleProducts.forEach(p => {
        console.log(`  - Name: ${p.name}`);
        console.log(`    Category: ${p.category}`);
        console.log(`    SubCategory: ${p.subCategory || 'N/A'}`);
        console.log('');
      });
    }

    mongoose.connection.close();

  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
  }
};

checkProducts();