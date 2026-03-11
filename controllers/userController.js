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
<style type="text/css">

  /* ── RESET ── */
  body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; }

  /* ── LIGHT MODE (default) ── */
  body, .email-body     { background-color:#f0efed !important; }
  .card                 { background-color:#ffffff !important; border-color:#d8d8d8 !important; }
  .hero-bg              { background-color:#ffffff !important; }
  .body-section         { background-color:#fafafa !important; }
  .quote-section        { background-color:#f5f5f5 !important; }
  .cta-section          { background-color:#ffffff !important; }
  .footer-section       { background-color:#f0efed !important; }

  .wordmark-box         { border:1.5px solid #111111 !important; }
  .wordmark-text        { color:#111111 !important; }
  .eyebrow-text         { color:#999999 !important; }
  .tagline-text         { color:#aaaaaa !important; }
  .ornament-char        { color:#cccccc !important; }
  .divider-bar          { background-color:#e0e0e0 !important; }

  .greeting-label       { color:#aaaaaa !important; }
  .greeting-name-dark   { color:#111111 !important; }
  .greeting-name-italic { color:#444444 !important; }
  .side-rule            { background-color:#cccccc !important; }
  .body-copy            { color:#333333 !important; }
  .body-copy-highlight  { color:#111111 !important; font-weight:600 !important; }

  .section-divider      { background-color:#e8e8e8 !important; }

  .pillar-cell          { border:1px solid #e0e0e0 !important; background-color:#ffffff !important; }
  .pillar-gap           { background-color:#f0efed !important; }
  .pillar-symbol        { color:#cccccc !important; }
  .pillar-title         { color:#111111 !important; }
  .pillar-sub           { color:#aaaaaa !important; }

  .quote-mark           { color:#dddddd !important; }
  .quote-body           { color:#666666 !important; }

  .cta-subtext          { color:#aaaaaa !important; }
  .cta-button           { background-color:#111111 !important; }
  .cta-button-text      { color:#ffffff !important; }

  .top-rule             { background-color:#111111 !important; }
  .bottom-rule          { background-color:#cccccc !important; }
  .footer-wordmark      { color:#cccccc !important; }
  .footer-link          { color:#aaaaaa !important; }
  .footer-sep           { color:#dddddd !important; }
  .footer-copy          { color:#bbbbbb !important; }
  .footer-divider       { background-color:#e8e8e8 !important; }

  /* ── DARK MODE ── */
  @media (prefers-color-scheme: dark) {
    body, .email-body   { background-color:#080808 !important; }
    .card               { background-color:#080808 !important; border-color:#080808 !important; }
    .hero-bg            { background-color:#111111 !important; }
    .body-section       { background-color:#0d0d0d !important; }
    .quote-section      { background-color:#111111 !important; }
    .cta-section        { background-color:#0d0d0d !important; }
    .footer-section     { background-color:#080808 !important; }

    .wordmark-box       { border:1.5px solid #444444 !important; }
    .wordmark-text      { color:#f0f0f0 !important; }
    .eyebrow-text       { color:#555555 !important; }
    .tagline-text       { color:#444444 !important; }
    .ornament-char      { color:#333333 !important; }
    .divider-bar        { background-color:#2a2a2a !important; }

    .greeting-label     { color:#444444 !important; }
    .greeting-name-dark { color:#f0f0f0 !important; }
    .greeting-name-italic { color:#aaaaaa !important; }
    .side-rule          { background-color:#333333 !important; }
    .body-copy          { color:#888888 !important; }
    .body-copy-highlight { color:#f0f0f0 !important; font-weight:600 !important; }

    .section-divider    { background-color:#1e1e1e !important; }

    .pillar-cell        { border:1px solid #222222 !important; background-color:#161616 !important; }
    .pillar-gap         { background-color:#080808 !important; }
    .pillar-symbol      { color:#333333 !important; }
    .pillar-title       { color:#dddddd !important; }
    .pillar-sub         { color:#444444 !important; }

    .quote-mark         { color:#222222 !important; }
    .quote-body         { color:#666666 !important; }

    .cta-subtext        { color:#444444 !important; }
    .cta-button         { background-color:#f0f0f0 !important; }
    .cta-button-text    { color:#111111 !important; }

    .top-rule           { background-color:#f0f0f0 !important; }
    .bottom-rule        { background-color:#222222 !important; }
    .footer-wordmark    { color:#2a2a2a !important; }
    .footer-link        { color:#333333 !important; }
    .footer-sep         { color:#222222 !important; }
    .footer-copy        { color:#2a2a2a !important; }
    .footer-divider     { background-color:#1a1a1a !important; }
  }

</style>
</head>
<body class="email-body" style="margin:0;padding:0;background-color:#f0efed;font-family:Georgia,'Times New Roman',Times,serif;">

<table class="email-body" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0efed;">
  <tr>
    <td align="center" style="padding:48px 16px;">

      <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background-color:#ffffff;">

        <!-- TOP RULE -->
        <tr>
          <td class="top-rule" style="height:3px;background-color:#111111;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- HERO -->
        <tr>
          <td class="hero-bg" style="background-color:#ffffff;padding:52px 48px 44px;text-align:center;">

            <p class="eyebrow-text" style="margin:0 0 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:#999999;">
              Jean&#8209;Zey &nbsp;&#xB7;&nbsp; Est.&nbsp;2024
            </p>

            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
              <tr>
                <td class="wordmark-box" style="border:1.5px solid #111111;padding:14px 36px;">
                  <span class="wordmark-text" style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;letter-spacing:14px;text-transform:uppercase;color:#111111;line-height:1;display:block;">
                    JEAN&#xB7;ZEY
                  </span>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td class="divider-bar" style="width:36px;height:1px;background-color:#e0e0e0;font-size:0;">&nbsp;</td>
                <td class="ornament-char" style="padding:0 10px;font-family:Georgia,serif;font-size:12px;color:#cccccc;line-height:1;">&#10022;</td>
                <td class="divider-bar" style="width:36px;height:1px;background-color:#e0e0e0;font-size:0;">&nbsp;</td>
              </tr>
            </table>

            <p class="tagline-text" style="margin:18px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:#aaaaaa;letter-spacing:1.5px;">
              Where identity meets fashion
            </p>

          </td>
        </tr>

        <!-- SECTION DIVIDER -->
        <tr>
          <td class="section-divider" style="height:1px;background-color:#e8e8e8;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td class="body-section" style="background-color:#fafafa;padding:48px 48px 40px;">

            <p class="greeting-label" style="margin:0 0 8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#aaaaaa;">
              A Personal Note
            </p>

            <h1 class="greeting-name-dark" style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;color:#111111;line-height:1.15;">
              Dear <em class="greeting-name-italic" style="font-style:italic;color:#444444;">${name},</em>
            </h1>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="side-rule" width="3" style="background-color:#cccccc;vertical-align:top;font-size:0;">&nbsp;</td>
                <td style="padding:0 0 0 20px;">
                  <p class="body-copy" style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.9;color:#333333;letter-spacing:0.2px;">
                    Your membership to <strong class="body-copy-highlight" style="color:#111111;font-weight:600;">Jean&#8209;Zey</strong> has been confirmed. You now belong to a circle of individuals who understand that what you wear is not merely clothing&#8202;&#8212;&#8202;it is a declaration, a language, a signature written in fabric and form.
                  </p>
                  <p class="body-copy" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.9;color:#333333;letter-spacing:0.2px;">
                    Every piece in our collection is chosen with intention. Every visit to Jean&#8209;Zey is an invitation to articulate who you are&#8202;&#8212;&#8202;or who you are becoming.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- SECTION DIVIDER -->
        <tr>
          <td class="section-divider" style="height:1px;background-color:#e8e8e8;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- THREE PILLARS -->
        <tr>
          <td class="body-section" style="background-color:#fafafa;padding:36px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="pillar-cell" style="width:32%;text-align:center;padding:22px 10px;border:1px solid #e0e0e0;background-color:#ffffff;vertical-align:top;">
                  <div class="pillar-symbol" style="font-size:18px;color:#cccccc;margin-bottom:10px;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#111111;margin-bottom:6px;">Free Shipping</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#aaaaaa;">On every order</div>
                </td>
                <td class="pillar-gap" style="width:2%;background-color:#f0efed;">&nbsp;</td>
                <td class="pillar-cell" style="width:32%;text-align:center;padding:22px 10px;border:1px solid #e0e0e0;background-color:#ffffff;vertical-align:top;">
                  <div class="pillar-symbol" style="font-size:18px;color:#cccccc;margin-bottom:10px;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#111111;margin-bottom:6px;">Easy Returns</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#aaaaaa;">Hassle&#8209;free always</div>
                </td>
                <td class="pillar-gap" style="width:2%;background-color:#f0efed;">&nbsp;</td>
                <td class="pillar-cell" style="width:32%;text-align:center;padding:22px 10px;border:1px solid #e0e0e0;background-color:#ffffff;vertical-align:top;">
                  <div class="pillar-symbol" style="font-size:18px;color:#cccccc;margin-bottom:10px;">&#10022;</div>
                  <div class="pillar-title" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:8px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#111111;margin-bottom:6px;">New Arrivals</div>
                  <div class="pillar-sub" style="font-family:Georgia,serif;font-size:11px;font-style:italic;color:#aaaaaa;">Dropped weekly</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SECTION DIVIDER -->
        <tr>
          <td class="section-divider" style="height:1px;background-color:#e8e8e8;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- QUOTE -->
        <tr>
          <td class="quote-section" style="background-color:#f5f5f5;padding:44px 48px;text-align:center;">
            <p class="quote-mark" style="margin:0;font-family:Georgia,serif;font-size:40px;line-height:0.8;color:#dddddd;">&#8220;</p>
            <p class="quote-body" style="margin:16px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;line-height:1.8;color:#666666;letter-spacing:0.4px;">
              Style is a way to say who you are<br/>without having to speak.
            </p>
            <p class="quote-mark" style="margin:0;font-family:Georgia,serif;font-size:40px;line-height:0.8;color:#dddddd;">&#8221;</p>
          </td>
        </tr>

        <!-- SECTION DIVIDER -->
        <tr>
          <td class="section-divider" style="height:1px;background-color:#e8e8e8;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- CTA -->
        <tr>
          <td class="cta-section" style="background-color:#ffffff;padding:44px 48px 52px;text-align:center;">
            <p class="cta-subtext" style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:#aaaaaa;">
              Your wardrobe is waiting to be written.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td class="cta-button" style="background-color:#111111;border-radius:0;">
                  <a href="https://jeanzey-frontend.vercel.app/collection" target="_blank"
                     style="display:inline-block;padding:16px 52px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:#ffffff;text-decoration:none;mso-padding-alt:0;">
                    <span class="cta-button-text" style="color:#ffffff;">Enter the Collection</span>
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BOTTOM RULE -->
        <tr>
          <td class="bottom-rule" style="height:1px;background-color:#cccccc;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="footer-section" style="background-color:#f0efed;padding:32px 48px;text-align:center;">
            <p class="footer-wordmark" style="margin:0 0 14px;font-family:Georgia,serif;font-size:16px;letter-spacing:8px;text-transform:uppercase;color:#cccccc;">JEAN&#xB7;ZEY</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
              <tr>
                <td><a class="footer-link" href="https://jeanzey-frontend.vercel.app/collection" target="_blank" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#aaaaaa;text-decoration:none;">Shop</a></td>
                <td class="footer-sep" style="padding:0 10px;color:#dddddd;font-size:10px;">&#xB7;</td>
                <td><a class="footer-link" href="https://jeanzey-frontend.vercel.app/orders" target="_blank" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#aaaaaa;text-decoration:none;">Orders</a></td>
                <td class="footer-sep" style="padding:0 10px;color:#dddddd;font-size:10px;">&#xB7;</td>
                <td><a class="footer-link" href="https://jeanzey-frontend.vercel.app/about" target="_blank" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#aaaaaa;text-decoration:none;">About</a></td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
              <tr><td class="footer-divider" style="height:1px;background-color:#e8e8e8;font-size:0;">&nbsp;</td></tr>
            </table>
            <p class="footer-copy" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;color:#bbbbbb;line-height:1.8;letter-spacing:0.3px;">
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