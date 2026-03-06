import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// Categories that use size-based stock
const SIZED_CATEGORIES = ["shirt", "jeans", "combo", "tshirt"];

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, stock } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        // ✅ Parse stock - handles both number and object
        let parsedStock = 0;
        if (stock) {
            try {
                parsedStock = JSON.parse(stock);
            } catch {
                parsedStock = Number(stock) || 0;
            }
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now(),
            stock: parsedStock, // ✅ Save stock
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ UPDATE STOCK — Admin updates stock from List page
const updateStock = async (req, res) => {
    try {
        const { productId, stock } = req.body;

        if (!productId) {
            return res.json({ success: false, message: "Product ID required" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        product.stock = stock;
        product.markModified('stock'); // Required for Mixed type
        await product.save();

        res.json({ success: true, message: "Stock updated successfully", stock: product.stock });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ✅ REDUCE STOCK — Called internally after every successful order
const reduceStock = async (items) => {
    try {
        for (const item of items) {
            const product = await productModel.findById(item._id || item.productId);
            if (!product) continue;

            const isSized = SIZED_CATEGORIES.includes(product.category?.toLowerCase());

            if (isSized && typeof product.stock === 'object' && product.stock !== null) {
                // Size-based: reduce only the ordered size
                const size = item.size;
                if (size && product.stock[size] !== undefined) {
                    product.stock[size] = Math.max(0, (product.stock[size] || 0) - (item.quantity || 1));
                }
            } else {
                // Simple number stock
                product.stock = Math.max(0, (Number(product.stock) || 0) - (item.quantity || 1));
            }

            product.markModified('stock');
            await product.save();
        }
    } catch (error) {
        console.log("Stock reduction error:", error);
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateStock, reduceStock }