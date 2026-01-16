// ========================================
// MOONXURY - Registration Form Script
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initForm();
});

// ========================================
// Particle Animation
// ========================================
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        container.appendChild(particle);
    }
}

// ========================================
// Form Handling
// ========================================
function initForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const viewTicketBtn = document.getElementById('viewTicketBtn');

    // Ticket Type handling
    const ticketTypeSelect = document.getElementById('ticketType');
    const displayAmount = document.getElementById('displayAmount');

    function updatePrice() {
        const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
        const price = selectedOption.dataset.price;
        displayAmount.textContent = price;
    }

    if (ticketTypeSelect) {
        ticketTypeSelect.addEventListener('change', updatePrice);
        updatePrice(); // Initial set
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const ticketType = document.getElementById('ticketType').value;

        // Get amount from selected option
        const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
        const amount = parseInt(selectedOption.dataset.price);

        // Validation
        if (!name || !email || !phone) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (phone.length !== 10) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        // Show loading
        loadingOverlay.classList.add('active');
        submitBtn.disabled = true;

        try {
            // Create order (handles both free and paid)
            const orderResponse = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, ticketType, amount })
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            // If free ticket, it's already confirmed
            if (amount === 0 || orderData.success) {
                loadingOverlay.classList.remove('active');
                document.getElementById('ticketNumber').textContent = orderData.ticketNumber;
                viewTicketBtn.href = `/ticket/${orderData.ticketNumber}`;
                successModal.classList.add('active');
                form.reset();
                updatePrice();
                submitBtn.disabled = false;
                return;
            }

            // Configure Razorpay for paid tickets
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'MOONXURY',
                description: `Event Entry Pass - ${ticketType}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    // Verify payment
                    loadingOverlay.classList.add('active');

                    try {
                        const verifyResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok) {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }

                        // Show success modal
                        loadingOverlay.classList.remove('active');
                        document.getElementById('ticketNumber').textContent = verifyData.ticketNumber;
                        viewTicketBtn.href = `/ticket/${verifyData.ticketNumber}`;
                        successModal.classList.add('active');

                        // Reset form
                        form.reset();
                        updatePrice();

                    } catch (error) {
                        loadingOverlay.classList.remove('active');
                        showNotification(error.message, 'error');
                    }
                },
                prefill: {
                    name: name,
                    email: email,
                    contact: '+91' + phone
                },
                theme: {
                    color: '#0A0A0A',
                    backdrop_color: 'rgba(0, 0, 0, 0.8)'
                },
                modal: {
                    ondismiss: function () {
                        loadingOverlay.classList.remove('active');
                        submitBtn.disabled = false;
                    }
                }
            };

            loadingOverlay.classList.remove('active');
            const rzp = new Razorpay(options);
            rzp.open();

            rzp.on('payment.failed', function (response) {
                showNotification('Payment failed. Please try again.', 'error');
                submitBtn.disabled = false;
            });

        } catch (error) {
            loadingOverlay.classList.remove('active');
            submitBtn.disabled = false;
            showNotification(error.message, 'error');
        }
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        submitBtn.disabled = false;
    });

    // Close modal on backdrop click
    successModal.querySelector('.modal-backdrop').addEventListener('click', () => {
        successModal.classList.remove('active');
        submitBtn.disabled = false;
    });
}

// ========================================
// Utilities
// ========================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#1a1a1a' : '#0A0A0A'};
        color: #fff;
        border-radius: 12px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        border-left: 3px solid ${type === 'error' ? '#e74c3c' : '#C9A962'};
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-close {
            background: none;
            border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .notification-close:hover {
            color: #fff;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth scroll to registration
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
});
