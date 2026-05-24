// In OrderPayment.html, after payment is successful:
document.getElementById('edit-cart').textContent = 'Go to Profile to check History';
document.getElementById('edit-cart').onclick = () => { window.location.href = 'Profile.html'; };

// In Profile.html, at the bottom script block:
document.addEventListener('DOMContentLoaded', function() {
    updateSaleHistory();
    loadOrderReceiptsFromStorage(); // <-- This function loads the receipts
});