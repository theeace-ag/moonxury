const { razorpay, generateTicketNumber, uuidv4 } = require('./_utils');
const db = require('./_store');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone } = req.body;

        // Validate input
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if already registered
        const existing = await db.getRegistrationByEmail(email);
        if (existing && existing.payment_status === 'completed') {
            return res.status(400).json({ error: 'This email is already registered' });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: 100, // Rs 1 in paise
            currency: 'INR',
            receipt: uuidv4(),
            notes: {
                name,
                email,
                phone
            }
        });

        // Save registration to database
        const ticketNumber = generateTicketNumber();
        await db.createRegistration({
            ticketNumber,
            name,
            email,
            phone,
            orderId: order.id,
            amount: 1,
            paymentStatus: 'pending'
        });

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
