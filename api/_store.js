// Simple in-memory store for demo purposes
// WARNING: This resets on every deployment/restart
// For production, use MongoDB Atlas, Supabase, PlanetScale, or Vercel KV

const registrations = new Map();

module.exports = {
    createRegistration: async (data) => {
        const { ticketNumber, name, email, phone, orderId, amount, paymentStatus } = data;
        const registration = {
            id: registrations.size + 1,
            ticket_number: ticketNumber,
            name,
            email,
            phone,
            order_id: orderId,
            payment_id: null,
            amount,
            payment_status: paymentStatus,
            created_at: new Date().toISOString()
        };
        registrations.set(orderId, registration);
        return { id: registration.id, ticketNumber };
    },

    updatePaymentStatus: async (orderId, paymentId, status) => {
        const registration = registrations.get(orderId);
        if (registration) {
            registration.payment_id = paymentId;
            registration.payment_status = status;
            registrations.set(orderId, registration);
        }
        return { changes: registration ? 1 : 0 };
    },

    getRegistrationByEmail: async (email) => {
        for (const reg of registrations.values()) {
            if (reg.email === email) return reg;
        }
        return null;
    },

    getRegistrationByOrderId: async (orderId) => {
        return registrations.get(orderId) || null;
    },

    getRegistrationByTicket: async (ticketNumber) => {
        for (const reg of registrations.values()) {
            if (reg.ticket_number === ticketNumber) return reg;
        }
        return null;
    },

    getAllRegistrations: async () => {
        return Array.from(registrations.values()).sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );
    },

    getStats: async () => {
        const all = Array.from(registrations.values());
        return {
            total: all.length,
            completed: all.filter(r => r.payment_status === 'completed').length,
            pending: all.filter(r => r.payment_status === 'pending').length,
            revenue: all.filter(r => r.payment_status === 'completed').reduce((sum, r) => sum + r.amount, 0)
        };
    }
};
