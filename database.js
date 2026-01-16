const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'moonxury.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    db.run(`
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

    db.run(`CREATE INDEX IF NOT EXISTS idx_email ON registrations(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ticket ON registrations(ticket_number)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_order ON registrations(order_id)`);
});

// Database helper functions
const dbHelpers = {
    // Create new registration
    createRegistration: (data) => {
        return new Promise((resolve, reject) => {
            const { ticketNumber, name, email, phone, orderId, amount, paymentStatus } = data;
            db.run(
                `INSERT INTO registrations (ticket_number, name, email, phone, order_id, amount, payment_status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [ticketNumber, name, email, phone, orderId, amount, paymentStatus],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ticketNumber });
                }
            );
        });
    },

    // Update payment status
    updatePaymentStatus: (orderId, paymentId, status) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE registrations 
                 SET payment_id = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE order_id = ?`,
                [paymentId, status, orderId],
                function (err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    // Get registration by email
    getRegistrationByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM registrations WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Get registration by order ID
    getRegistrationByOrderId: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM registrations WHERE order_id = ?`,
                [orderId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Get registration by ticket number
    getRegistrationByTicket: (ticketNumber) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM registrations WHERE ticket_number = ?`,
                [ticketNumber],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Get all registrations
    getAllRegistrations: () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM registrations ORDER BY created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Get statistics
    getStats: () => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as revenue
                 FROM registrations`,
                [],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }
};

module.exports = dbHelpers;
