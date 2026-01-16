# MOONXURY Ticket Booking System
### THEMOON × DJ RD RAJAT - Female Edition Launch × DJ Night

A premium, luxury-themed event registration and ticket booking system with Razorpay payment integration.

![Event Date](https://img.shields.io/badge/Event-25%20Feb%202025-gold)
![Location](https://img.shields.io/badge/Location-Kolkata-blue)
![Entry](https://img.shields.io/badge/Entry-₹50-green)

---

## ✨ Features

- **Premium UI/UX** - Stark white luxury design with elegant animations
- **Razorpay Integration** - Secure ₹50 payment processing
- **Ticket Generation** - Beautiful downloadable tickets with QR codes
- **Email Notifications** - Automatic ticket delivery to users
- **Admin Dashboard** - Track all registrations and sales
- **SQLite Database** - Simple, file-based storage
- **Responsive Design** - Works on all devices

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your details:

```env
# Razorpay Credentials (Get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Email Configuration (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Email
ADMIN_EMAIL=admin@themoon.in

# Server
PORT=3000
SITE_URL=http://localhost:3000
```

### 3. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 4. Access the Application

- **Registration Page**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 🚀 Deploy to Vercel

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add Environment Variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add all variables from `.env.example`

### Method 2: GitHub Integration

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/moonxury-tickets.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add Environment Variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `ADMIN_EMAIL`
6. Click "Deploy"

### ⚠️ Important Notes for Vercel

- **Database**: The demo uses in-memory storage which resets on each deployment. For production, integrate with:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (Free tier available)
  - [Supabase](https://supabase.com) (Free tier available)
  - [PlanetScale](https://planetscale.com) (Free tier available)
  - [Vercel KV](https://vercel.com/storage/kv)

- **Razorpay Live Mode**: Update your Razorpay keys to live mode before going to production

---

## 🔐 Getting Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up / Log in
3. Go to **Settings** → **API Keys**
4. Generate a new API key (start with Test mode)
5. Copy the Key ID and Key Secret to your `.env` file

### Test Mode vs Live Mode
- **Test Mode**: Use for development, no real money charged
- **Live Mode**: Switch when going to production

Test Card Details:
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: Any number

---

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Use this password in your `.env` file

---

## 📁 Project Structure

```
xdjform/
├── server.js           # Express server & API routes
├── database.js         # SQLite database helpers
├── package.json        # Dependencies
├── .env               # Environment variables (create from .env.example)
├── moonxury.db        # SQLite database (auto-created)
├── public/
│   ├── index.html     # Registration page
│   ├── styles.css     # Premium luxury styles
│   ├── script.js      # Frontend JavaScript
│   ├── ticket.html    # Ticket view/download page
│   └── admin.html     # Admin dashboard
└── asset/
    └── [event poster]
```

---

## 🎫 How It Works

1. **User fills registration form** with name, email, and phone
2. **Creates Razorpay order** (₹50)
3. **User completes payment** through Razorpay checkout
4. **Payment verified** and ticket generated
5. **QR code created** for entry verification
6. **Email sent** to user with ticket
7. **Admin notified** about new sale
8. **User can download** ticket as image

---

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-order` | POST | Create new Razorpay order |
| `/api/verify-payment` | POST | Verify payment signature |
| `/api/ticket/:ticketNumber` | GET | Get ticket details |
| `/api/admin/registrations` | GET | Get all registrations (admin) |

---

## 📱 Event Details

- **Event**: MOONXURY - Female Edition Launch × DJ Night
- **Date**: 25 February 2025
- **Time**: 7 PM Onwards
- **Location**: Kolkata (Venue TBA)
- **Entry**: 18+ Only
- **Price**: ₹50

---

## 🎨 Customization

### Colors
Edit CSS variables in `public/styles.css`:

```css
:root {
    --color-bg: #FAFAFA;
    --color-accent: #C9A962;
    --color-dark: #0A0A0A;
}
```

### Event Details
Update in `server.js` and HTML files.

---

## 📞 Support

For Table / Guest List: **+91 70032 50233**

---

## License

© 2025 THEMOON. All rights reserved.
