const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for Vercel (for demo - use a proper DB like MongoDB/Supabase/Planetscale in production)
// Note: Vercel serverless functions are stateless, so we need external database
// For this demo, we'll use Vercel KV or you can integrate MongoDB Atlas

// Generate Ticket Number
function generateTicketNumber() {
    const prefix = 'MXRY';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = { razorpay, generateTicketNumber, uuidv4, crypto };
