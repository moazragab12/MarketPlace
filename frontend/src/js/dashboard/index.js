import dashboardController from './controllers/DashboardController';
import { makeDeposit } from '../core/api/services/transactionsService.js';

const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');

const darkMode = document.querySelector('.dark-mode');

menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
})


Orders.forEach(order => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${order.productName}</td>
        <td>${order.productNumber}</td>
        <td>${order.paymentStatus}</td>
        <td class="${order.status === 'Declined' ? 'danger' : order.status === 'Pending' ? 'warning' : 'primary'}">${order.status}</td>
        <td class="primary">Details</td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);
});

// Function to update any displayed balance on the page
function updateDisplayedBalance(newBalance) {
  // Check if there's a balance display element on the page
  const balanceDisplay = document.getElementById('user-balance');
  if (balanceDisplay) {
    balanceDisplay.textContent = `$${newBalance.toFixed(2)}`;
  }
}

// Notification function
function showNotification(message, type = 'info') {
  // You can customize this to show a toast or other notification UI
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // Alert for now, but ideally replace with a proper notification component
  alert(message);
}

// Deposit Modal Functionality
function openDepositModal() {
  document.getElementById('deposit-modal').style.display = 'block';
}

function closeDepositModal() {
  document.getElementById('deposit-modal').style.display = 'none';
  document.getElementById('deposit-amount').value = '';
  document.getElementById('payment-method').selectedIndex = 0;
  document.getElementById('deposit-notes').value = '';
}

async function processDeposit() {
  const amount = document.getElementById('deposit-amount').value;
  const paymentMethod = document.getElementById('payment-method').value;
  const notes = document.getElementById('deposit-notes').value;
  
  if (!amount) {
    showNotification('Please enter an amount to deposit', 'error');
    return;
  }
  
  try {
    // Call the API to process the deposit
    const response = await makeDeposit(parseFloat(amount));
    
    // Show success message with the updated balance
    showNotification(`Deposit of $${amount} processed successfully! Your new balance is $${response.cash_balance.toFixed(2)}`, 'success');
    
    // Add the new transaction to the table
    const transactionTable = document.querySelector('#transactions-tab .orders-table tbody');
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td class="order-id">#TRX-${Math.floor(Math.random() * 1000)}</td>
      <td>${formattedDate}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="user-avatar">JD</div>
          <span>Deposit (Self)</span>
        </div>
      </td>
      <td><span class="transaction-type received">Deposit</span></td>
      <td class="amount received">+$${parseFloat(amount).toFixed(2)}</td>
      <td><span class="order-status status-delivered">Completed</span></td>
    `;
    
    transactionTable.insertBefore(newRow, transactionTable.firstChild);
    
    closeDepositModal();
  } catch (error) {
    let errorMessage = 'An error occurred during the deposit';
    
    // Extract error message from API response if available
    if (error.response && error.response.data && error.response.data.detail) {
      errorMessage = error.response.data.detail;
    }
    
    showNotification(errorMessage, 'error');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Transaction tab filtering
  const transactionTabs = document.querySelectorAll('[data-transactiontab]');
  const transactionRows = document.querySelectorAll('#transactions-tab .orders-table tbody tr');
  
  transactionTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active tab
      transactionTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.getAttribute('data-transactiontab');
      
      // Filter transaction rows
      transactionRows.forEach(row => {
        const transactionType = row.querySelector('.transaction-type');
        
        if (filter === 'all' || 
            (filter === 'sent' && transactionType.classList.contains('sent')) || 
            (filter === 'received' && transactionType.classList.contains('received'))) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
  
  // Initialize product progress bars
  initProductProgressBars();
  
  // Re-calculate on window resize to maintain responsive design
  window.addEventListener('resize', initProductProgressBars);
});

// Function to initialize and set up the product progress bars proportionally
function initProductProgressBars() {
  const progressBars = document.querySelectorAll('.product-progress-bar');
  let totalUnits = 0;
  
  // First, calculate the total units
  progressBars.forEach(bar => {
    const units = parseInt(bar.getAttribute('data-units'), 10);
    totalUnits += units;
  });
  
  // Then set each progress bar width as a percentage of the total
  progressBars.forEach(bar => {
    const units = parseInt(bar.getAttribute('data-units'), 10);
    const percentage = (units / totalUnits) * 100;
    bar.style.width = percentage + '%';
  });
}

// Add an observer for dynamic content loading
const observer = new MutationObserver(() => {
  const productsContainer = document.getElementById('best-selling-products');
  if (productsContainer && productsContainer.querySelectorAll('.product-progress-bar').length > 0) {
    initProductProgressBars();
  }
});

// Observe changes to the document
observer.observe(document.body, { childList: true, subtree: true });

// Product form handling
document.addEventListener('DOMContentLoaded', function() {
  // Product form elements
  const productForm = document.getElementById('product-form');
  const saveAsDraftBtn = document.getElementById('save-draft');
  const publishProductBtn = document.getElementById('publish-product');
  const productStatusInput = document.getElementById('product_status');
  const browseFilesBtn = document.getElementById('browse-files');
  const productImageInput = document.getElementById('product_image');
  const imagePreview = document.getElementById('image-preview');

  // Handle file selection
  if (browseFilesBtn && productImageInput) {
    browseFilesBtn.addEventListener('click', function() {
      productImageInput.click();
    });

    productImageInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          imagePreview.style.display = 'block';
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Product Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <div style="margin-top: 10px; display: flex; justify-content: center;">
              <button type="button" class="btn btn-outline btn-sm" id="remove-image">Remove</button>
            </div>`;
          
          // Add remove image functionality
          document.getElementById('remove-image').addEventListener('click', function() {
            productImageInput.value = '';
            imagePreview.style.display = 'none';
            imagePreview.innerHTML = '';
          });
        };
        
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // Save as draft button
  if (saveAsDraftBtn) {
    saveAsDraftBtn.addEventListener('click', function(e) {
      e.preventDefault();
      productStatusInput.value = 'draft';
      submitProductForm('draft');
    });
  }

  // Publish product button
  if (publishProductBtn) {
    publishProductBtn.addEventListener('click', function(e) {
      e.preventDefault();
      productStatusInput.value = 'for_sale';
      submitProductForm('for_sale');
    });
  }

  // Handle form submission
  function submitProductForm(status) {
    // Basic validation
    const name = document.getElementById('product_name').value;
    const description = document.getElementById('product_description').value;
    const price = document.getElementById('product_price').value;
    const quantity = document.getElementById('product_quantity').value;
    const category = document.getElementById('product_category').value;
    
    if (!name || !description || !price || !quantity || !category) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Create FormData for handling file uploads
    const formData = new FormData(productForm);
    formData.append('status', status);
    
    // For demonstration purposes - normally you'd send this to your backend
    console.log('Product form submitted with:', {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      quantity: formData.get('quantity'),
      category: formData.get('category'),
      status: formData.get('status'),
      // Image would be sent as a file
    });
    
    // Simulate successful submission
    alert(`Product ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
  }

  // Add drag and drop functionality for images
  const dropArea = document.querySelector('.dashboard-card [style*="border: 2px dashed"]');
  if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
      dropArea.style.borderColor = 'var(--primary-color)';
      dropArea.style.backgroundColor = 'rgba(13, 153, 255, 0.05)';
    }

    function unhighlight() {
      dropArea.style.borderColor = '#e2e8f0';
      dropArea.style.backgroundColor = '';
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files && files.length) {
        productImageInput.files = files;
        
        // Trigger change event manually
        const event = new Event('change', { bubbles: true });
        productImageInput.dispatchEvent(event);
      }
    }
  }
});

/**
 * Initialize dashboard functionality when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the dashboard page
  const dashboardContainer = document.querySelector('#dashboardCards');
  if (dashboardContainer) {
    console.log('Dashboard page detected, initializing dashboard controller...');
    dashboardController.init();
  }
});

// Export dashboard controller for direct use
export { dashboardController };