import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            // Return user name along with token
            res.json({ 
                success: true, 
                token,
                name: user.name  // Added this line
            })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        // Return user name along with token
        res.json({ 
            success: true, 
            token,
            name: user.name  // Added this line
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for sending welcome email on first registration
const sendWelcomeEmail = async (req, res) => {
    const { name, email } = req.body;
    if (!email) return res.json({ success: false, message: 'Email required' });

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Jean-Zey" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Welcome to Jean-Zey, ${name} ✦`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to Jean-Zey</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0c0c0c;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;">

    <div style="height:4px;background:#0c0c0c;"></div>

    <div style="background:#0c0c0c;padding:52px 48px 44px;text-align:center;">
      <p style="font-size:10px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:#555;margin:0 0 18px;">Welcome to the Family</p>
      <div style="font-size:44px;font-weight:600;letter-spacing:14px;text-transform:uppercase;color:#ffffff;line-height:1;margin-bottom:8px;">JEAN·ZEY</div>
      <div style="width:32px;height:1px;background:#333;margin:18px auto;"></div>
      <p style="font-size:16px;font-weight:300;font-style:italic;color:#888;letter-spacing:1px;margin:0;">Where identity meets fashion.</p>
    </div>

    <div style="padding:48px 48px 40px;border-left:1px solid #efefef;border-right:1px solid #efefef;">

      <p style="font-size:10px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:#aaa;margin:0 0 10px;">A personal note</p>
      <h1 style="font-size:38px;font-weight:500;color:#0c0c0c;line-height:1.05;margin:0 0 28px;letter-spacing:-0.5px;">
        Hello,<br/><span style="font-style:italic;font-weight:400;color:#aaa;">${name}.</span>
      </h1>

      <p style="font-size:14px;font-weight:300;color:#444;line-height:1.9;letter-spacing:0.2px;margin:0 0 18px;">
        Welcome to <strong style="color:#0c0c0c;font-weight:500;">Jean-Zey</strong> — we're genuinely glad you're here. Your account has been created and you're now part of a community that believes fashion is more than clothing. It's identity. It's expression. It's culture.
      </p>

      <p style="font-size:14px;font-weight:300;color:#444;line-height:1.9;letter-spacing:0.2px;margin:0 0 32px;">
        From this moment, every visit to Jean-Zey is yours — curated drops, exclusive pieces, and a wardrobe that speaks before you do.
      </p>

      <div style="height:1px;background:#f0f0f0;margin:0 0 28px;"></div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;margin-bottom:36px;">
        <tr>
          <td style="padding:24px 12px;text-align:center;border-right:1px solid #f0f0f0;">
            <div style="font-size:28px;font-weight:500;color:#0c0c0c;line-height:1;margin-bottom:6px;">Free</div>
            <div style="font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#999;">Shipping</div>
          </td>
          <td style="padding:24px 12px;text-align:center;border-right:1px solid #f0f0f0;">
            <div style="font-size:28px;font-weight:500;color:#0c0c0c;line-height:1;margin-bottom:6px;">Easy</div>
            <div style="font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#999;">Returns</div>
          </td>
          <td style="padding:24px 12px;text-align:center;">
            <div style="font-size:28px;font-weight:500;color:#0c0c0c;line-height:1;margin-bottom:6px;">New</div>
            <div style="font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#999;">Drops Weekly</div>
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin-bottom:8px;">
        <a href="https://jeanzey-frontend.vercel.app/collection"
           style="display:inline-block;background:#0c0c0c;color:#ffffff;text-decoration:none;font-size:10px;font-weight:500;letter-spacing:5px;text-transform:uppercase;padding:18px 48px;">
          Explore the Collection
        </a>
      </div>
      <p style="font-size:11px;color:#bbb;text-align:center;margin:12px 0 32px;letter-spacing:0.3px;">Your style is waiting.</p>

      <div style="background:#fafafa;border-left:2px solid #0c0c0c;padding:20px 24px;">
        <p style="font-size:18px;font-weight:400;font-style:italic;color:#555;line-height:1.6;letter-spacing:0.3px;margin:0 0 10px;">
          "Style is a way to say who you are without having to speak."
        </p>
        <p style="font-size:10px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin:0;">— The Jean-Zey Philosophy</p>
      </div>

    </div>

    <div style="background:#0c0c0c;padding:32px 48px;text-align:center;">
      <div style="font-size:20px;font-weight:600;letter-spacing:10px;text-transform:uppercase;color:#fff;margin-bottom:14px;">JEAN·ZEY</div>
      <div style="margin-bottom:18px;">
        <a href="https://jeanzey-frontend.vercel.app/collection" style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;text-decoration:none;margin:0 10px;">Shop</a>
        <a href="https://jeanzey-frontend.vercel.app/orders" style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;text-decoration:none;margin:0 10px;">Orders</a>
        <a href="https://jeanzey-frontend.vercel.app/about" style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;text-decoration:none;margin:0 10px;">About</a>
      </div>
      <div style="height:1px;background:#1a1a1a;margin:18px 0;"></div>
      <p style="font-size:10px;font-weight:300;color:#444;line-height:1.8;letter-spacing:0.3px;margin:0;">
        You're receiving this because you created an account at Jean-Zey.<br/>
        © 2025 Jean-Zey. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>`,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Welcome email error:', error);
        res.json({ success: false, message: error.message });
    }
};


export { loginUser, registerUser, adminLogin, sendWelcomeEmail }