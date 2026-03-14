// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import connectDB from './config/mongodb.js'
// import connectCloudinary from './config/cloudinary.js'
// import userRouter from './routes/userRoute.js'
// import productRouter from './routes/productRoute.js'
// import cartRouter from './routes/cartRoute.js'
// import orderRouter from './routes/orderRoute.js'
// import reviewRouter from './routes/reviewRoutes.js'
// import passwordRouter from "./routes/passwordRoute.js";
// import addressRouter from './routes/addressRoute.js';
// import wishlistRoutes from "./routes/wishlistRoutes.js";
// import couponRouter from './routes/couponRoute.js';
// import complaintRouter from './routes/complaintRoute.js';

// // App Config
// const app = express()
// const port = process.env.PORT || 5000
// connectDB()
// connectCloudinary()

// // Middlewares
// app.use(express.json())
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (mobile apps, Postman, curl)
//     if (!origin) return callback(null, true);

//     if (
//       origin === 'https://jeanzey-frontend.vercel.app' ||
//       origin === 'https://jeanzey-admin.vercel.app' ||
//       origin.endsWith('.vercel.app') ||
//       origin.startsWith('http://localhost')
//     ) {
//       return callback(null, true);
//     }

//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
// }))

// // API Endpoints
// app.use('/api/user', userRouter)
// app.use('/api/product', productRouter)
// app.use('/api/cart', cartRouter)
// app.use('/api/order', orderRouter)
// app.use('/api/review', reviewRouter)
// app.use("/api/user", passwordRouter);
// app.use('/api/address', addressRouter);
// app.use("/api/wishlist", wishlistRoutes);
// app.use('/api/coupon', couponRouter);
// app.use('/api/complaint', complaintRouter);

// app.get('/', (req, res) => {
//   res.send("API Working")
// })

// app.listen(port, () => console.log('Server started on PORT : ' + port))


import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import reviewRouter from './routes/reviewRoutes.js'
import passwordRouter from "./routes/passwordRoute.js";
import addressRouter from './routes/addressRoute.js';
import couponRouter from './routes/couponRoute.js';
import complaintRouter from './routes/complaintRoute.js';
import jwt from 'jsonwebtoken';
import userModel from './models/userModel.js';

// App Config
const app = express()
const port = process.env.PORT || 5000
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === 'https://jeanzey-frontend.vercel.app' ||
      origin === 'https://jeanzey-admin.vercel.app' ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}))

// ── Inline auth middleware ──
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ── Inline wishlist routes ──
const wishlistRouter = express.Router();

wishlistRouter.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    const user = await userModel.findById(req.user);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

wishlistRouter.post('/remove', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await userModel.findById(req.user);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

wishlistRouter.post('/get', authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user).populate('wishlist', 'name price image');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist get error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)
app.use("/api/user", passwordRouter);
app.use('/api/address', addressRouter);
app.use("/api/wishlist", wishlistRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/complaint', complaintRouter);

app.get('/', (req, res) => {
  res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))