import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database
const dbPath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbPath);
const defaultData = { registrations: [] };
const db = new Low(adapter, defaultData);

// Read existing data
await db.read();
db.data ||= defaultData;
await db.write();

// Database helper functions
const dbHelpers = {
    // Create new registration
    createRegistration: async (data) => {
        const { ticketNumber, name, email, phone, orderId, amount, paymentStatus, ticketType } = data;
        const registration = {
            id: db.data.registrations.length + 1,
            ticket_number: ticketNumber,
            name,
            email,
            phone,
            ticket_type: ticketType || 'Regular',
            order_id: orderId,
            payment_id: null,
            amount,
            payment_status: paymentStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        db.data.registrations.push(registration);
        await db.write();
        return { id: registration.id, ticketNumber };
    },

    // Update payment status
    updatePaymentStatus: async (orderId, paymentId, status) => {
        const registration = db.data.registrations.find(r => r.order_id === orderId);
        if (registration) {
            registration.payment_id = paymentId;
            registration.payment_status = status;
            registration.updated_at = new Date().toISOString();
            await db.write();
            return { changes: 1 };
        }
        return { changes: 0 };
    },

    // Get registration by email
    getRegistrationByEmail: async (email) => {
        return db.data.registrations
            .filter(r => r.email === email)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    },

    // Get registration by order ID
    getRegistrationByOrderId: async (orderId) => {
        return db.data.registrations.find(r => r.order_id === orderId) || null;
    },

    // Get registration by ticket number
    getRegistrationByTicket: async (ticketNumber) => {
        return db.data.registrations.find(r => r.ticket_number === ticketNumber) || null;
    },

    // Get all registrations
    getAllRegistrations: async () => {
        return [...db.data.registrations].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );
    },

    // Get statistics
    getStats: async () => {
        const all = db.data.registrations;
        return {
            total: all.length,
            completed: all.filter(r => r.payment_status === 'completed').length,
            pending: all.filter(r => r.payment_status === 'pending').length,
            revenue: all.filter(r => r.payment_status === 'completed')
                .reduce((sum, r) => sum + r.amount, 0)
        };
    }
};

export default dbHelpers;
