const { crypto } = require('./_utils');
const db = require('./_store');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send ticket email
async function sendTicketEmail(registration, qrCodeDataURL) {
    const ticketHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .ticket-container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px; text-align: center; }
            .logo { font-size: 28px; font-weight: 300; color: #fff; letter-spacing: 8px; margin-bottom: 10px; }
            .event-name { font-size: 42px; font-weight: 700; color: #fff; letter-spacing: 4px; margin: 20px 0; }
            .featuring { color: #888; font-size: 14px; letter-spacing: 3px; }
            .dj-name { color: #fff; font-size: 18px; margin-top: 10px; }
            .content { padding: 40px; }
            .ticket-number { background: #f8f8f8; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .ticket-label { font-size: 12px; color: #888; letter-spacing: 2px; margin-bottom: 5px; }
            .ticket-value { font-size: 24px; font-weight: 600; color: #1a1a1a; letter-spacing: 3px; }
            .details { margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
            .detail-label { color: #888; font-size: 14px; }
            .detail-value { font-weight: 500; color: #1a1a1a; }
            .qr-section { text-align: center; padding: 20px; background: #f8f8f8; border-radius: 10px; }
            .qr-code { width: 150px; height: 150px; }
            .footer { text-align: center; padding: 30px; background: #1a1a1a; color: #fff; }
            .footer-text { font-size: 12px; color: #888; }
        </style>
    </head>
    <body>
        <div class="ticket-container">
            <div class="header">
                <div class="logo">THEMOON</div>
                <div class="event-name">MOONXURY</div>
                <div class="featuring">FEATURING</div>
                <div class="dj-name">DJ RD RAJAT</div>
            </div>
            <div class="content">
                <div class="ticket-number">
                    <div class="ticket-label">TICKET NUMBER</div>
                    <div class="ticket-value">${registration.ticket_number}</div>
                </div>
                <div class="details">
                    <div class="detail-row">
                        <span class="detail-label">GUEST NAME</span>
                        <span class="detail-value">${registration.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">DATE</span>
                        <span class="detail-value">25 February 2025</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">TIME</span>
                        <span class="detail-value">7 PM Onwards</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">VENUE</span>
                        <span class="detail-value">Kolkata (TBA)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ENTRY</span>
                        <span class="detail-value">18+ Only</span>
                    </div>
                </div>
                <div class="qr-section">
                    <img src="${qrCodeDataURL}" class="qr-code" alt="QR Code">
                    <p style="font-size: 12px; color: #888; margin-top: 10px;">Scan for verification</p>
                </div>
            </div>
            <div class="footer">
                <p style="margin: 0; font-size: 14px;">Female Edition Launch × DJ Night</p>
                <p class="footer-text">For queries: +91 70032 50233</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"THEMOON" <${process.env.EMAIL_USER}>`,
        to: registration.email,
        subject: `🎫 Your MOONXURY Ticket - ${registration.ticket_number}`,
        html: ticketHtml
    });
}

// Send admin notification
async function sendAdminNotification(registration) {
    const adminHtml = `
    <h2>🎉 New Ticket Sold!</h2>
    <p><strong>Ticket Number:</strong> ${registration.ticket_number}</p>
    <p><strong>Name:</strong> ${registration.name}</p>
    <p><strong>Email:</strong> ${registration.email}</p>
    <p><strong>Phone:</strong> ${registration.phone}</p>
    <p><strong>Amount:</strong> ₹50</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
    `;

    await transporter.sendMail({
        from: `"MOONXURY System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🎫 Ticket Sold: ${registration.ticket_number}`,
        html: adminHtml
    });
}

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update registration
        const registration = await db.getRegistrationByOrderId(razorpay_order_id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        await db.updatePaymentStatus(razorpay_order_id, razorpay_payment_id, 'completed');

        // Generate QR Code
        const qrData = JSON.stringify({
            ticket: registration.ticket_number,
            name: registration.name,
            event: 'MOONXURY 2025',
            date: '25 Feb 2025'
        });
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Send confirmation email (don't await to speed up response)
        try {
            await sendTicketEmail(registration, qrCodeDataURL);
            await sendAdminNotification(registration);
        } catch (emailError) {
            console.error('Email error:', emailError);
        }

        res.status(200).json({
            success: true,
            ticketNumber: registration.ticket_number,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};
