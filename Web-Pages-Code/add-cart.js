// Moved from inline <script> in Add Cart.html
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function' && !checkAuth()) return;
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
        document.querySelectorAll('.login-btn').forEach(el => {
            el.textContent = 'Logout';
            el.onclick = function(e) { e.preventDefault(); if (typeof logoutUser === 'function') logoutUser(); };
        });
    }

    // Load cart items from localStorage
    function loadCartItems() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        const cart = JSON.parse(localStorage.getItem('bookCart') || '[]');

        // Clear any existing children (idempotent)
        cartItems.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';

        if (cart.length === 0) {
            document.querySelector('.cart-empty').style.display = 'block';
            return;
        }

        document.querySelector('.cart-empty').style.display = 'none';

        cart.forEach((item) => {
            // Ensure category property is available; render if present
            const categoryText = item.category ? `Category: ${item.category}` : '';
            const itemHTML = `
                <div class="cart-item" data-id="${item.id}" data-category="${item.category || ''}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <div class="cart-item-price" data-unit-price="${item.price}">Rs. ${item.price}</div>
                        ${categoryText ? `<div class="cart-item-category">${categoryText}</div>` : ''}
                        <div class="quantity-controls">
                            <button class="qty-btn minus">-</button>
                            <input type="number" value="${item.quantity}" min="1" max="10" class="qty-input">
                            <button class="qty-btn plus">+</button>
                        </div>
                        <div class="item-total">Total: Rs. <span>${item.price * item.quantity}</span></div>
                        <button class="remove-item">Remove</button>
                    </div>
                </div>
            `;
            cartItems.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Attach event handlers after adding items
        attachEventHandlers();
        updateCartTotals();
    }

    // Handle quantity controls + remove buttons
    function attachEventHandlers() {
        document.querySelectorAll('.quantity-controls').forEach(control => {
            const input = control.querySelector('.qty-input');
            const minusBtn = control.querySelector('.minus');
            const plusBtn = control.querySelector('.plus');

            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value) || 1;
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    updateCartTotals();
                }
            });

            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value) || 1;
                if (currentValue < 10) {
                    input.value = currentValue + 1;
                    updateCartTotals();
                }
            });

            input.addEventListener('change', () => {
                let value = parseInt(input.value) || 1;
                value = Math.max(1, Math.min(10, value));
                input.value = value;
                updateCartTotals();
            });
        });

        // Handle remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                if (cartItem) cartItem.remove();
                updateCartTotals();
                checkEmptyCart();
            });
        });
    }

    // Update cart totals
    function updateCartTotals() {
        let subtotal = 0;
        let totalItems = 0;
        document.querySelectorAll('.cart-item').forEach(item => {
            const priceEl = item.querySelector('.cart-item-price');
            const unitPrice = parseFloat(priceEl.dataset.unitPrice) || 0;
            const quantity = parseInt(item.querySelector('.qty-input').value) || 1;
            const itemTotal = unitPrice * quantity;

            // Update item's total
            item.querySelector('.item-total span').textContent = itemTotal;
            subtotal += itemTotal;
            totalItems += quantity;
        });

        const delivery = 100; // Fixed delivery fee
        const total = subtotal + delivery;

        // Update display
        // Update subtotal and total elements
        const subtotalEl = document.querySelector('.sum-row .sum-value');
        // more specific: find the sum-row containing 'Subtotal'
        const subtotalRow = Array.from(document.querySelectorAll('.sum-row')).find(r => r.textContent.includes('Subtotal'));
        if (subtotalRow) {
            const el = subtotalRow.querySelector('.sum-value');
            if (el) el.textContent = 'Rs. ' + subtotal;
        }
        const totalEl = document.querySelector('.sum-row.total .sum-value');
        if (totalEl) totalEl.textContent = 'Rs. ' + total;

        // Update total items display (if present)
        const itemsRow = document.querySelector('.sum-row.items .sum-value');
        if (itemsRow) itemsRow.textContent = totalItems;

        // Save updated cart to localStorage
        const cart = Array.from(document.querySelectorAll('.cart-item')).map(item => ({
            id: item.dataset.id,
            title: item.querySelector('h4').textContent,
            price: parseFloat(item.querySelector('.cart-item-price').dataset.unitPrice),
            quantity: parseInt(item.querySelector('.qty-input').value),
            image: item.querySelector('img').src,
            category: item.dataset.category || ''
        }));
        if (cart.length > 0) {
            localStorage.setItem('bookCart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('bookCart');
        }
    }

    // Check if cart is empty and toggle empty message
    function checkEmptyCart() {
        const hasItems = document.querySelectorAll('.cart-item').length > 0;
        const emptyEl = document.querySelector('.cart-empty');
        if (emptyEl) emptyEl.style.display = hasItems ? 'none' : 'block';
        if (!hasItems) {
            // Clear cart from localStorage if empty
            localStorage.removeItem('bookCart');
        }
    }

    // Load cart items initially
    loadCartItems();

    // Add event listener for checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const form = document.querySelector('.buyer-info');
            if (!form) return;
            const inputs = form.querySelectorAll('input, textarea');
            let isValid = true;

            // Simple form validation
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '';
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields');
                return;
            }

            // Proceed with checkout (redirect to payment page)
            const cart = JSON.parse(localStorage.getItem('bookCart') || '[]');
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            // Store buyer info for the payment page
            const buyerInfo = {
                username: form.querySelector('[name="username"]').value,
                email: form.querySelector('[name="email"]').value,
                address: form.querySelector('[name="address"]').value
            };
            localStorage.setItem('buyerInfo', JSON.stringify(buyerInfo));

            // Redirect to payment page
            window.location.href = 'OrderPayment.html';
        });
    }
});
