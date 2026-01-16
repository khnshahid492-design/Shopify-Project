// Main JavaScript file for the practice e-commerce site

// Product data
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
        price: 199.99,
        category: "Electronics",
        image: "🎧"
    },
    {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Track your fitness goals with heart rate monitoring and GPS",
        price: 299.99,
        category: "Electronics",
        image: "⌚"
    },
    {
        id: 3,
        name: "Organic Coffee Set",
        description: "Premium organic coffee beans from sustainable farms",
        price: 34.99,
        category: "Food & Beverage",
        image: "☕"
    },
    {
        id: 4,
        name: "Yoga Mat Pro",
        description: "Non-slip premium yoga mat with carrying strap",
        price: 49.99,
        category: "Fitness",
        image: "🧘"
    },
    {
        id: 5,
        name: "LED Desk Lamp",
        description: "Adjustable LED desk lamp with touch controls",
        price: 39.99,
        category: "Home & Office",
        image: "💡"
    },
    {
        id: 6,
        name: "Portable Bluetooth Speaker",
        description: "Waterproof speaker with 360° sound and 12-hour battery",
        price: 89.99,
        category: "Electronics",
        image: "🔊"
    }
];

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load products on homepage
    if (document.getElementById('products-container')) {
        loadProducts();
    }
    
    // Load product details on product page
    if (document.getElementById('product-detail-content')) {
        loadProductDetails();
    }
    
    // Update cart count
    updateCartCount();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Initialize tracking
    initializeTracking();
});

// Load products on homepage
function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image}
        </div>
        <div class="product-content">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary view-product-btn" data-id="${product.id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const viewBtn = card.querySelector('.view-product-btn');
    const addBtn = card.querySelector('.add-to-cart-btn');
    
    viewBtn.addEventListener('click', () => viewProduct(product.id));
    addBtn.addEventListener('click', () => addToCart(product.id));
    
    return card;
}

// View product details
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Track product view
    trackGA4Event('view_item', {
        currency: 'USD',
        value: product.price,
        items: [{
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: 1
        }]
    });
    
    // Redirect to product page with ID parameter
    window.location.href = `product.html?id=${productId}`;
}

// Load product details on product page
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }
    
    const container = document.getElementById('product-detail-content');
    
    container.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                ${product.image}
            </div>
            <div class="product-detail-content">
                <h1>${product.name}</h1>
                <div class="product-price-large">$${product.price.toFixed(2)}</div>
                <p class="product-description-long">${product.description}</p>
                <div class="quantity-selector">
                    <button class="quantity-btn" id="decrease-qty">-</button>
                    <input type="number" class="quantity-input" id="product-quantity" value="1" min="1" max="10">
                    <button class="quantity-btn" id="increase-qty">+</button>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" id="add-to-cart-detail">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
                <div class="tracking-info">
                    <h4><i class="fas fa-info-circle"></i> Tracking Practice</h4>
                    <p>Viewing this product triggers:</p>
                    <ul>
                        <li><strong>GA4:</strong> view_item event</li>
                        <li><strong>Meta:</strong> ViewContent event</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-to-cart-detail').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('product-quantity').value);
        addToCart(product.id, quantity);
    });
    
    document.getElementById('decrease-qty').addEventListener('click', () => {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
    
    document.getElementById('increase-qty').addEventListener('click', () => {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) < 10) {
            input.value = parseInt(input.value) + 1;
        }
    });
    
    // Track product view
    trackProductView(product);
}

// Track product view event
function trackProductView(product) {
    // GA4 view_item event
    trackGA4Event('view_item', {
        currency: 'USD',
        value: product.price,
        items: [{
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: 1
        }]
    });
    
    // Meta ViewContent event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_ids: [product.id],
            content_type: 'product',
            value: product.price,
            currency: 'USD'
        });
    }
}

// Add to cart function
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Track add to cart event
    trackAddToCart(product, quantity);
}

// Update cart count in header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2ecc71' : '#3498db'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const nav = document.querySelector('.main-nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    
    if (nav.style.display === 'flex') {
        nav.style.cssText = `
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const navUl = nav.querySelector('ul');
        navUl.style.flexDirection = 'column';
        navUl.style.gap = '1rem';
    }
}

// Initialize tracking functions
function initializeTracking() {
    // Set up dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
}

// Track GA4 event
function trackGA4Event(eventName, eventParams) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
    
    // Also push to dataLayer for GTM
    window.dataLayer.push({
        event: eventName,
        ...eventParams
    });
}

// Track add to cart event
function trackAddToCart(product, quantity) {
    // GA4 add_to_cart event
    trackGA4Event('add_to_cart', {
        currency: 'USD',
        value: product.price * quantity,
        items: [{
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: quantity
        }]
    });
    
    // Meta AddToCart event
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_type: 'product',
            value: product.price * quantity,
            currency: 'USD',
            num_items: quantity
        });
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 10px;
    }
`;
document.head.appendChild(style);