import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


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
    console.log('=== WELCOME EMAIL CALLED ===');
    console.log('To:', email, '| Name:', name);
    console.log('RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
    if (!email) return res.json({ success: false, message: 'Email required' });

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Jean-Zey <onboarding@resend.dev>',
                to: [email],
                subject: `Welcome to Jean-Zey, ${name} ❆`,
                html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Welcome to Jean-Zey</title>
<style>
  @media (prefers-color-scheme: dark) {
    .email-bg { background-color: #080808 !important; }
    .outer-wrap { background-color: #080808 !important; }
    .hero-bg { background-color: #0d0d0d !important; }
    .body-bg { background-color: #0a0a0a !important; }
    .quote-bg { background-color: #0d0d0d !important; }
    .footer-bg { background-color: #050505 !important; }
    .wordmark-td { border-color: #2a2a2a !important; }
    .wordmark-text { color: #f5f0e8 !important; }
    .eyebrow { color: #555 !important; }
    .tagline { color: #3a3a3a !important; }
    .greeting-name { color: #cccccc !important; }
    .greeting-h1 { color: #f5f0e8 !important; }
    .accent-rule { background-color: #333 !important; }
    .body-text { color: #777 !important; }
    .body-text span { color: #f5f0e8 !important; }
    .pillar-border { border-color: #1e1e1e !important; }
    .pillar-symbol { color: #555 !important; }
    .pillar-title { color: #f5f0e8 !important; }
    .pillar-sub { color: #333 !important; }
    .quote-mark { color: #222 !important; }
    .quote-text { color: #555 !important; }
    .quote-attr { color: #444 !important; }
    .cta-pre { color: #3a3a3a !important; }
    .cta-td { border-color: #555 !important; }
    .cta-link { color: #e0e0e0 !important; }
    .gold-line { background-color: #2a2a2a !important; }
    .footer-wordmark { color: #2a2a2a !important; }
    .footer-link { color: #2a2a2a !important; }
    .footer-text { color: #222 !important; }
    .divider-line { background-color: #1e1e1e !important; }
    .outer-border { border-color: #1a1a1a !important; }
    .pillar-gap { background-color: #080808 !important; }
    .ornament { color: #444 !important; }
  }
  @media (prefers-color-scheme: light) {
    .email-bg { background-color: #f2f2f0 !important; }
    .outer-wrap { background-color: #f2f2f0 !important; }
    .hero-bg { background-color: #ffffff !important; }
    .body-bg { background-color: #fafafa !important; }
    .quote-bg { background-color: #ffffff !important; }
    .footer-bg { background-color: #f5f5f5 !important; }
    .wordmark-td { border-color: #d0d0d0 !important; }
    .wordmark-text { color: #0c0c0c !important; }
    .eyebrow { color: #999 !important; }
    .tagline { color: #bbb !important; }
    .greeting-name { color: #555 !important; }
    .greeting-h1 { color: #0c0c0c !important; }
    .accent-rule { background-color: #d0d0d0 !important; }
    .body-text { color: #555 !important; }
    .body-text span { color: #0c0c0c !important; }
    .pillar-border { border-color: #e0e0e0 !important; }
    .pillar-symbol { color: #bbb !important; }
    .pillar-title { color: #0c0c0c !important; }
    .pillar-sub { color: #bbb !important; }
    .quote-mark { color: #ddd !important; }
    .quote-text { color: #888 !important; }
    .quote-attr { color: #bbb !important; }
    .cta-pre { color: #aaa !important; }
    .cta-td { border-color: #0c0c0c !important; }
    .cta-link { color: #0c0c0c !important; }
    .gold-line { background-color: #0c0c0c !important; }
    .footer-wordmark { color: #ccc !important; }
    .footer-link { color: #bbb !important; }
    .footer-text { color: #bbb !important; }
    .divider-line { background-color: #e8e8e8 !important; }
    .outer-border { border-color: #e0e0e0 !important; }
    .pillar-gap { background-color: #f2f2f0 !important; }
    .ornament { color: #ccc !important; }
  }
</style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#080808;font-family:Georgia,'Times New Roman',Times,serif;">

<table class="outer-wrap" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#080808;min-height:100vh;">
  <tr>
    <td align="center" style="padding:60px 20px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- TOP LINE -->
        <tr>
          <td class="gold-line" style="height:1px;background-color:#2a2a2a;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- HERO -->
        <tr>
          <td class="hero-bg outer-border" style="background-color:#0d0d0d;padding:64px 56px 52px;text-align:center;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">
            
            <p class="eyebrow" style="margin:0 0 28px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;font-weight:400;letter-spacing:6px;text-transform:uppercase;color:#555;">
              Jean&#8209;Zey &nbsp;&#183;&nbsp; Est. 2024
            </p>

            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
              <tr>
                <td class="wordmark-td" style="border:1px solid #2a2a2a;padding:18px 40px;">
                  <div class="wordmark-text" style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;letter-spacing:18px;text-transform:uppercase;color:#f5f0e8;line-height:1;">
                    JEAN&#183;ZEY
                  </div>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td class="divider-line" style="width:40px;height:1px;background-color:#2a2a2a;font-size:0;">&nbsp;</td>
                <td class="ornament" style="padding:0 12px;font-family:Georgia,serif;font-size:14px;color:#444;line-height:1;">&#10022;</td>
                <td class="divider-line" style="width:40px;height:1px;background-color:#2a2a2a;font-size:0;">&nbsp;</td>
              </tr>
            </table>

            <p class="tagline" style="margin:20px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;font-weight:400;color:#3a3a3a;letter-spacing:2px;">
              Where identity meets fashion
            </p>
          </td>
        </tr>

        <!-- ACCENT LINE -->
        <tr>
          <td class="gold-line outer-border" style="background-color:#2a2a2a;height:1px;font-size:0;line-height:0;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">&nbsp;</td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td class="body-bg outer-border" style="background-color:#0a0a0a;padding:56px 56px 44px;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">
            
            <p class="eyebrow" style="margin:0 0 6px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:#3a3a3a;">
              A personal note
            </p>

            <h1 class="greeting-h1" style="margin:0 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:400;color:#f5f0e8;line-height:1.1;letter-spacing:-0.5px;">
              Dear <em class="greeting-name" style="color:#cccccc;font-style:italic;">${name}</em>,
            </h1>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="accent-rule" width="2" style="background-color:#333;vertical-align:top;">&nbsp;</td>
                <td style="padding:2px 0 2px 24px;">
                  <p class="body-text" style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:400;color:#777;line-height:1.85;letter-spacing:0.3px;">
                    Your membership to <span style="color:#f5f0e8;">Jean&#8209;Zey</span> has been confirmed. You now belong to a circle of individuals who understand that what you wear is not merely clothing — it is a declaration, a language, a signature written in fabric and form.
                  </p>
                  <p class="body-text" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:400;color:#777;line-height:1.85;letter-spacing:0.3px;">
                    Every piece in our collection is chosen with intention. Every visit to Jean&#8209;Zey is an invitation to articulate who you are — or who you are becoming.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td class="body-bg outer-border" style="background-color:#0a0a0a;padding:0 56px;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="divider-line" style="height:1px;background-color:#1e1e1e;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- THREE PILLARS -->
        <tr>
          <td class="body-bg outer-border" style="background-color:#0a0a0a;padding:44px 56px;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="pillar-border" width="33%" style="text-align:center;padding:20px 8px;border:1px solid #1a1a1a;vertical-align:top;">
                  <div class="pillar-symbol" style="font-family:Georgia,serif;font-size:22px;color:#555;margin-bottom:10px;line-height:1;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:#f5f0e8;margin-bottom:6px;">Free Shipping</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#3a3a3a;">On every order</div>
                </td>
                <td class="pillar-gap" width="4" style="background-color:#080808;">&nbsp;</td>
                <td class="pillar-border" width="33%" style="text-align:center;padding:20px 8px;border:1px solid #1a1a1a;vertical-align:top;">
                  <div class="pillar-symbol" style="font-family:Georgia,serif;font-size:22px;color:#555;margin-bottom:10px;line-height:1;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:#f5f0e8;margin-bottom:6px;">Easy Returns</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#3a3a3a;">Hassle-free always</div>
                </td>
                <td class="pillar-gap" width="4" style="background-color:#080808;">&nbsp;</td>
                <td class="pillar-border" width="33%" style="text-align:center;padding:20px 8px;border:1px solid #1a1a1a;vertical-align:top;">
                  <div class="pillar-symbol" style="font-family:Georgia,serif;font-size:22px;color:#555;margin-bottom:10px;line-height:1;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:#f5f0e8;margin-bottom:6px;">New Arrivals</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#3a3a3a;">Dropped weekly</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- QUOTE BLOCK -->
        <tr>
          <td class="quote-bg outer-border" style="background-color:#0d0d0d;padding:48px 56px;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;text-align:center;">
            <p class="quote-mark" style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;font-style:italic;color:#222;line-height:1;">&#8220;</p>
            <p class="quote-text" style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:400;font-style:italic;color:#555;line-height:1.7;letter-spacing:0.5px;">
              Style is a way to say who you are<br/>without having to speak.
            </p>
            <p class="quote-mark" style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;font-style:italic;color:#222;line-height:1;">&#8221;</p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td class="body-bg outer-border" style="background-color:#0a0a0a;padding:48px 56px 52px;text-align:center;border-left:1px solid #1a1a1a;border-right:1px solid #1a1a1a;">
            <p class="cta-pre" style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:#3a3a3a;letter-spacing:0.3px;">Your wardrobe is waiting to be written.</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td class="cta-td" style="border:1px solid #555;">
                  <a class="cta-link" href="https://jeanzey-frontend.vercel.app/collection"
                     style="display:inline-block;padding:16px 48px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;font-weight:400;letter-spacing:6px;text-transform:uppercase;color:#e0e0e0;text-decoration:none;background-color:transparent;">
                    Enter the Collection
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BOTTOM LINE -->
        <tr>
          <td class="gold-line" style="background-color:#2a2a2a;height:1px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="footer-bg outer-border" style="background-color:#050505;padding:36px 56px;text-align:center;border-left:1px solid #111;border-right:1px solid #111;border-bottom:1px solid #111;">
            <p class="footer-wordmark" style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;font-weight:400;letter-spacing:10px;text-transform:uppercase;color:#2a2a2a;">JEAN&#183;ZEY</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
              <tr>
                <td style="padding:0 12px;">
                  <a class="footer-link" href="https://jeanzey-frontend.vercel.app/collection" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#2a2a2a;text-decoration:none;">Shop</a>
                </td>
                <td class="footer-link" style="color:#1a1a1a;font-size:8px;">&#183;</td>
                <td style="padding:0 12px;">
                  <a class="footer-link" href="https://jeanzey-frontend.vercel.app/orders" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#2a2a2a;text-decoration:none;">Orders</a>
                </td>
                <td class="footer-link" style="color:#1a1a1a;font-size:8px;">&#183;</td>
                <td style="padding:0 12px;">
                  <a class="footer-link" href="https://jeanzey-frontend.vercel.app/about" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#2a2a2a;text-decoration:none;">About</a>
                </td>
              </tr>
            </table>
            <p class="footer-text" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;font-weight:300;color:#222;line-height:1.8;letter-spacing:0.3px;">
              You are receiving this because you joined Jean&#8209;Zey.<br/>
              &copy; 2025 Jean&#8209;Zey. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('=== RESEND ERROR ===', JSON.stringify(data));
            return res.json({ success: false, message: data.message || 'Email failed' });
        }

        console.log('=== EMAIL SENT SUCCESSFULLY === ID:', data.id);
        res.json({ success: true });
    } catch (error) {
        console.error('=== WELCOME EMAIL ERROR ===', error.message);
        res.json({ success: false, message: error.message });
    }
};


export { loginUser, registerUser, adminLogin, sendWelcomeEmail }