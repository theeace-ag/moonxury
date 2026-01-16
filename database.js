const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'moonxury.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        order_id TEXT UNIQUE,
        payment_id TEXT,
        amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_email ON registrations(email)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_ticket ON registrations(ticket_number)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_order ON registrations(order_id)`);

// Database helper functions
const dbHelpers = {
    // Create new registration
    createRegistration: (data) => {
        const { ticketNumber, name, email, phone, orderId, amount, paymentStatus } = data;
        const stmt = db.prepare(
            `INSERT INTO registrations (ticket_number, name, email, phone, order_id, amount, payment_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(ticketNumber, name, email, phone, orderId, amount, paymentStatus);
        return Promise.resolve({ id: result.lastInsertRowid, ticketNumber });
    },

    // Update payment status
    updatePaymentStatus: (orderId, paymentId, status) => {
        const stmt = db.prepare(
            `UPDATE registrations 
             SET payment_id = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE order_id = ?`
        );
        const result = stmt.run(paymentId, status, orderId);
        return Promise.resolve({ changes: result.changes });
    },

    // Get registration by email
    getRegistrationByEmail: (email) => {
        const stmt = db.prepare(
            `SELECT * FROM registrations WHERE email = ? ORDER BY created_at DESC LIMIT 1`
        );
        return Promise.resolve(stmt.get(email));
    },

    // Get registration by order ID
    getRegistrationByOrderId: (orderId) => {
        const stmt = db.prepare(`SELECT * FROM registrations WHERE order_id = ?`);
        return Promise.resolve(stmt.get(orderId));
    },

    // Get registration by ticket number
    getRegistrationByTicket: (ticketNumber) => {
        const stmt = db.prepare(`SELECT * FROM registrations WHERE ticket_number = ?`);
        return Promise.resolve(stmt.get(ticketNumber));
    },

    // Get all registrations
    getAllRegistrations: () => {
        const stmt = db.prepare(`SELECT * FROM registrations ORDER BY created_at DESC`);
        return Promise.resolve(stmt.all());
    },

    // Get statistics
    getStats: () => {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as revenue
             FROM registrations
        `);
        return Promise.resolve(stmt.get());
    }
};

module.exports = dbHelpers;
