// Cart functionality

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load cart on cart page
    if (document.getElementById('cart-items-container')) {
        loadCartItems();
    }
    
    // Checkout button functionality
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (cart.length === 0) {
                e.preventDefault();
                showNotification('Your cart is empty!', 'info');
            } else {
                // Track begin_checkout event
                trackCheckoutStart();
            }
        });
    }
});

// Load cart items on cart page
function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        updateCartSummary(0, 0);
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    
    container.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        container.appendChild(cartItem);
        subtotal += item.price * item.quantity;
    });
    
    updateCartSummary(subtotal);
}

// Create cart item element
function createCartItemElement(item) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    element.setAttribute('data-item-id', item.id);
    
    const itemTotal = item.price * item.quantity;
    
    element.innerHTML = `
        <div class="cart-item-image">
            ${item.image}
        </div>
        <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn decrease-qty">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase-qty">+</button>
            </div>
            <div class="item-total">$${itemTotal.toFixed(2)}</div>
            <button class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const decreaseBtn = element.querySelector('.decrease-qty');
    const increaseBtn = element.querySelector('.increase-qty');
    const removeBtn = element.querySelector('.remove-btn');
    
    decreaseBtn.addEventListener('click', () => updateCartItemQuantity(item.id, item.quantity - 1));
    increaseBtn.addEventListener('click', () => updateCartItemQuantity(item.id, item.quantity + 1));
    removeBtn.addEventListener('click', () => removeCartItem(item.id));
    
    return element;
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeCartItem(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Reload cart items
        if (document.getElementById('cart-items-container')) {
            loadCartItems();
        }
        
        // Track cart update
        trackCartUpdate(item, oldQuantity, newQuantity);
    }
}

// Remove cart item
function removeCartItem(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Reload cart items
        if (document.getElementById('cart-items-container')) {
            loadCartItems();
        }
        
        // Show notification
        showNotification(`${removedItem.name} removed from cart`, 'info');
        
        // Track remove from cart
        trackRemoveFromCart(removedItem);
    }
}

// Update cart summary
function updateCartSummary(subtotal) {
    const shipping = 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Update subtotal
    const subtotalElement = document.getElementById('cart-subtotal');
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    // Update tax
    const taxElement = document.getElementById('cart-tax');
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    
    // Update total
    const totalElement = document.getElementById('cart-total');
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Update checkout page totals if exists
    updateCheckoutTotals(subtotal, shipping, tax, total);
}

// Update checkout page totals
function updateCheckoutTotals(subtotal, shipping, tax, total) {
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Track cart update
function trackCartUpdate(item, oldQuantity, newQuantity) {
    const valueChange = item.price * (newQuantity - oldQuantity);
    
    // GA4 event
    trackGA4Event('add_to_cart', {
        currency: 'USD',
        value: valueChange > 0 ? valueChange : -valueChange,
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: Math.abs(newQuantity - oldQuantity)
        }]
    });
}

// Track remove from cart
function trackRemoveFromCart(item) {
    // GA4 remove_from_cart event
    trackGA4Event('remove_from_cart', {
        currency: 'USD',
        value: item.price * item.quantity,
        items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }]
    });
}

// Track checkout start
function trackCheckoutStart() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // GA4 begin_checkout event
    trackGA4Event('begin_checkout', {
        currency: 'USD',
        value: total,
        items: cart.map(item => ({
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    });
    
    // Meta InitiateCheckout event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            value: total,
            currency: 'USD',
            num_items: cart.reduce((sum, item) => sum + item.quantity, 0)
        });
    }
}

// Clear cart after purchase
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}