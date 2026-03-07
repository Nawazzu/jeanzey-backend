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
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRouter from './routes/couponRoute.js';
import complaintRouter from './routes/complaintRoute.js';

// App Config
const app = express()
const port = process.env.PORT || 5000
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
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

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)
app.use("/api/user", passwordRouter);
app.use('/api/address', addressRouter);
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/coupon', couponRouter);
app.use('/api/complaint', complaintRouter);

app.get('/', (req, res) => {
  res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))