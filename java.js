// Product Management System
class ProductManager {
    constructor() {
        this.products = [];
        this.editingProductId = null;
        this.deletingProductId = null;
        this.searchTerm = '';
        this.sortField = 'name';
        this.sortOrder = 'asc';
        this.stockChart = null;
        this.categoryChart = null;
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.attachEventListeners();
        this.renderAll();
    }

    // Load products from localStorage
    loadProducts() {
        const stored = localStorage.getItem('products');
        if (stored) {
            this.products = JSON.parse(stored);
        }
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    // Attach event listeners
    attachEventListeners() {
        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Close modal buttons
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submit
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderTable();
        });

        // Sort buttons
        document.getElementById('sort-price').addEventListener('click', () => {
            this.handleSort('price');
        });

        document.getElementById('sort-quantity').addEventListener('click', () => {
            this.handleSort('quantity');
        });

        // Table header sort
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                this.handleSort(th.dataset.sort);
            });
        });

        // Delete modal
        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close modals on outside click
        document.getElementById('product-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                this.closeModal();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                this.closeDeleteModal();
            }
        });
    }

    // Open add/edit modal
    openModal(product = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');
        const form = document.getElementById('product-form');

        if (product) {
            // Edit mode
            this.editingProductId = product.id;
            title.textContent = 'Edit Product';
            submitBtn.textContent = 'Update Product';
            
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-description').value = product.description;
        } else {
            // Add mode
            this.editingProductId = null;
            title.textContent = 'Add New Product';
            submitBtn.textContent = 'Add Product';
            form.reset();
        }

        // Clear errors
        this.clearErrors();
        
        modal.classList.add('active');
    }

    // Close modal
    closeModal() {
        document.getElementById('product-modal').classList.remove('active');
        document.getElementById('product-form').reset();
        this.editingProductId = null;
        this.clearErrors();
    }

    // Clear form errors
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.classList.remove('error');
        });
    }

    // Validate form
    validateForm() {
        this.clearErrors();
        let isValid = true;

        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const quantity = parseInt(document.getElementById('product-quantity').value);
        const description = document.getElementById('product-description').value.trim();

        if (!name) {
            this.showError('product-name', 'name-error', 'Product name is required');
            isValid = false;
        }

        if (!category) {
            this.showError('product-category', 'category-error', 'Category is required');
            isValid = false;
        }

        if (!price || price <= 0) {
            this.showError('product-price', 'price-error', 'Price must be greater than 0');
            isValid = false;
        }

        if (isNaN(quantity) || quantity < 0) {
            this.showError('product-quantity', 'quantity-error', 'Quantity must be 0 or greater');
            isValid = false;
        }

        if (!description) {
            this.showError('product-description', 'description-error', 'Description is required');
            isValid = false;
        }

        return isValid;
    }

    // Show error
    showError(inputId, errorId, message) {
        document.getElementById(inputId).classList.add('error');
        document.getElementById(errorId).textContent = message;
    }

    // Handle form submit
    handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            quantity: parseInt(document.getElementById('product-quantity').value),
            description: document.getElementById('product-description').value.trim()
        };

        if (this.editingProductId) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === this.editingProductId);
            if (index !== -1) {
                this.products[index] = { ...productData, id: this.editingProductId };
                this.showToast('Product Updated Successfully ✅', 'success');
            }
        } else {
            // Add new product
            const newProduct = {
                ...productData,
                id: Date.now().toString()
            };
            this.products.push(newProduct);
            this.showToast('Product Added Successfully ✅', 'success');
        }

        this.saveProducts();
        this.closeModal();
        this.renderAll();
    }

    // Delete product
    deleteProduct(id) {
        this.deletingProductId = id;
        const product = this.products.find(p => p.id === id);
        document.getElementById('delete-message').textContent = 
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`;
        document.getElementById('delete-modal').classList.add('active');
    }

    // Confirm delete
    confirmDelete() {
        if (this.deletingProductId) {
            this.products = this.products.filter(p => p.id !== this.deletingProductId);
            this.saveProducts();
            this.showToast('Product Deleted ❌', 'error');
            this.closeDeleteModal();
            this.renderAll();
        }
    }

    // Close delete modal
    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
        this.deletingProductId = null;
    }

    // Edit product
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.openModal(product);
        }
    }

    // Handle sort
    handleSort(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }

        // Update sort button states
        document.querySelectorAll('.btn-sort').forEach(btn => {
            btn.classList.remove('active', 'desc');
        });

        if (field === 'price') {
            const btn = document.getElementById('sort-price');
            btn.classList.add('active');
            if (this.sortOrder === 'desc') btn.classList.add('desc');
        } else if (field === 'quantity') {
            const btn = document.getElementById('sort-quantity');
            btn.classList.add('active');
            if (this.sortOrder === 'desc') btn.classList.add('desc');
        }

        this.renderTable();
    }

    // Get filtered products
    getFilteredProducts() {
        return this.products.filter(product => {
            const searchLower = this.searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower)
            );
        });
    }

    // Get sorted products
    getSortedProducts() {
        const filtered = this.getFilteredProducts();
        
        return [...filtered].sort((a, b) => {
            const aVal = a[this.sortField];
            const bVal = b[this.sortField];

            if (typeof aVal === 'string') {
                return this.sortOrder === 'asc' 
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    // Get stock badge
    getStockBadge(quantity) {
        if (quantity === 0) {
            return '<span class="badge badge-danger">Out of Stock</span>';
        } else if (quantity < 5) {
            return '<span class="badge badge-warning">Low Stock</span>';
        } else {
            return '<span class="badge badge-success">In Stock</span>';
        }
    }

    // Render table
    renderTable() {
        const tbody = document.getElementById('product-table-body');
        const emptyState = document.getElementById('empty-state');
        const products = this.getSortedProducts();

        if (products.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.add('active');
            
            if (this.searchTerm) {
                document.getElementById('empty-state-text').textContent = 
                    'No products found matching your search.';
            } else {
                document.getElementById('empty-state-text').textContent = 
                    'No products yet. Click "Add Product" to get started!';
            }
            return;
        }

        emptyState.classList.remove('active');

        tbody.innerHTML = products.map(product => `
            <tr class="${product.quantity < 5 ? 'low-stock' : ''}">
                <td>${this.escapeHtml(product.name)}</td>
                <td><span class="badge badge-category">${this.escapeHtml(product.category)}</span></td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${this.escapeHtml(product.description)}
                </td>
                <td class="text-center">${this.getStockBadge(product.quantity)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="productManager.editProduct('${product.id}')" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                        </button>
                        <button class="btn-delete" onclick="productManager.deleteProduct('${product.id}')" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render stats
    renderStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const lowStock = this.products.filter(p => p.quantity < 5).length;
        const totalUnits = this.products.reduce((sum, p) => sum + p.quantity, 0);

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('low-stock').textContent = lowStock;
        document.getElementById('total-units').textContent = totalUnits;
    }

    // Render charts
    renderCharts() {
        const chartsSection = document.getElementById('charts-section');
        
        if (this.products.length === 0) {
            chartsSection.style.display = 'none';
            return;
        }

        chartsSection.style.display = 'grid';

        // Stock Chart - Top 10 products by quantity
        const topProducts = [...this.products]
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const stockCtx = document.getElementById('stock-chart').getContext('2d');
        
        if (this.stockChart) {
            this.stockChart.destroy();
        }

        this.stockChart = new Chart(stockCtx, {
            type: 'bar',
            data: {
                labels: topProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
                datasets: [{
                    label: 'Quantity',
                    data: topProducts.map(p => p.quantity),
                    backgroundColor: '#3b82f6',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Category Chart - Distribution
        const categoryData = this.products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        const categoryCtx = document.getElementById('category-chart').getContext('2d');
        
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
        ];

        this.categoryChart = new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: colors.slice(0, Object.keys(categoryData).length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Render all
    renderAll() {
        this.renderStats();
        this.renderTable();
        this.renderCharts();
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<svg class="toast-icon success" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg class="toast-icon error" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${this.escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const productManager = new ProductManager();
