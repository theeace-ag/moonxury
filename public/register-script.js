document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initForm();
});

// Particle Animation (copied from script.js)
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

// Form Handling
function initForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Phone input validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });

    // Form connection
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const peopleCount = document.getElementById('peopleCount').value; // New field
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!name || !peopleCount || !email || !phone) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        loadingOverlay.classList.add('active');
        submitBtn.disabled = true;

        try {
            // Create Slot Booking Order
            const orderResponse = await fetch('/api/create-slot-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, peopleCount, email, phone })
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to initiate booking');
            }

            // Razorpay options
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'MOONXURY',
                description: 'Slot Confirmation Fee',
                order_id: orderData.orderId,
                handler: async function (response) {
                    loadingOverlay.classList.add('active');
                    try {
                        const verifyResponse = await fetch('/api/verify-slot-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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

                        // Success! Redirect to main page for ticket booking
                        window.location.href = '/?confirmed=true';

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
                theme: { color: '#0A0A0A' },
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
                showNotification('Payment failed', 'error');
                submitBtn.disabled = false;
            });

        } catch (error) {
            loadingOverlay.classList.remove('active');
            submitBtn.disabled = false;
            showNotification(error.message, 'error');
        }
    });
}

function showNotification(message, type = 'info') {
    // Reuse notification logic (condensed for brevity)
    alert(message); // Simple fallback for now
}
