// Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    // Load checkout items
    if (document.getElementById('checkout-items')) {
        loadCheckoutItems();
    }
    
    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    
    // Load confirmation page data
    if (document.getElementById('order-id')) {
        loadConfirmationData();
    }
});

// Load checkout items
function loadCheckoutItems() {
    const container = document.getElementById('checkout-items');
    
    if (!container || cart.length === 0) {
        // Redirect to cart if empty
        window.location.href = 'cart.html';
        return;
    }
    
    container.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        
        const itemTotal = item.price * item.quantity;
        
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name} × ${item.quantity}</div>
            </div>
            <div class="item-total">$${itemTotal.toFixed(2)}</div>
        `;
        
        container.appendChild(itemElement);
    });
    
    // Update totals
    updateCheckoutTotals();
}

// Update checkout totals
function updateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // Update elements
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Handle checkout form submission
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zip: document.getElementById('zip').value,
        payment: document.querySelector('input[name="payment"]:checked').value
    };
    
    // Validate form
    if (!formData.email || !formData.name || !formData.address || !formData.city || !formData.zip) {
        showNotification('Please fill in all required fields', 'info');
        return;
    }
    
    // Save order data to localStorage
    const orderData = {
        ...formData,
        items: [...cart],
        date: new Date().toISOString(),
        orderId: 'PRACTICE-' + Date.now(),
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 5.99,
        tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08
    };
    
    orderData.total = orderData.subtotal + orderData.shipping + orderData.tax;
    
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Track purchase event
    trackPurchase(orderData);
    
    // Clear cart
    clearCart();
    
    // Redirect to confirmation page
    window.location.href = 'confirmation.html';
}

// Track purchase event
function trackPurchase(orderData) {
    // GA4 purchase event
    trackGA4Event('purchase', {
        transaction_id: orderData.orderId,
        value: orderData.total,
        currency: 'USD',
        tax: orderData.tax,
        shipping: orderData.shipping,
        items: orderData.items.map(item => ({
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    });
    
    // Meta Purchase event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: orderData.total,
            currency: 'USD',
            content_ids: orderData.items.map(item => item.id),
            content_type: 'product',
            num_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
        });
    }
    
    // Google Ads conversion (simulated)
    console.log('Google Ads conversion tracked:', {
        transaction_id: orderData.orderId,
        value: orderData.total,
        currency: 'USD'
    });
}

// Load confirmation data
function loadConfirmationData() {
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!orderData) {
        // Redirect to home if no order data
        window.location.href = 'index.html';
        return;
    }
    
    // Update order details
    document.getElementById('order-id').textContent = orderData.orderId;
    document.getElementById('customer-name').textContent = orderData.name;
    document.getElementById('customer-email').textContent = orderData.email;
    document.getElementById('shipping-address').textContent = `${orderData.address}, ${orderData.city}, ${orderData.zip}`;
    document.getElementById('payment-method').textContent = formatPaymentMethod(orderData.payment);
    document.getElementById('order-total').textContent = `$${orderData.total.toFixed(2)}`;
    
    // Format date
    const orderDate = new Date(orderData.date);
    document.getElementById('order-date').textContent = orderDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Load order items
    loadConfirmationItems(orderData.items);
    
    // Update tracking event details
    document.getElementById('ga-transaction-id').textContent = orderData.orderId;
    document.getElementById('ga-purchase-value').textContent = `$${orderData.total.toFixed(2)}`;
    document.getElementById('meta-purchase-value').textContent = `$${orderData.total.toFixed(2)}`;
    document.getElementById('gads-value').textContent = `$${orderData.total.toFixed(2)}`;
}

// Load confirmation items
function loadConfirmationItems(items) {
    const container = document.getElementById('confirmation-items-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'confirmation-item';
        
        const itemTotal = item.price * item.quantity;
        
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">$${itemTotal.toFixed(2)}</div>
        `;
        
        container.appendChild(itemElement);
    });
}

// Format payment method
function formatPaymentMethod(method) {
    const methods = {
        'credit': 'Credit Card',
        'paypal': 'PayPal',
        'google-pay': 'Google Pay'
    };
    
    return methods[method] || method;
}