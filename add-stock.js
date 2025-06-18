// Datos de productos organizados por categorías
let productsData = [
    // Limpieza
    { name: 'Detergente Líquido', stock: 25, category: 'limpieza' },
    { name: 'Desinfectante', stock: 3, category: 'limpieza' },
    { name: 'Jabón en Polvo', stock: 15, category: 'limpieza' },
    { name: 'Limpiador de Vidrios', stock: 0, category: 'limpieza' },
    { name: 'Esponjas', stock: 8, category: 'limpieza' },
    { name: 'Papel Higiénico', stock: 2, category: 'limpieza' },
    
    // Hogar
    { name: 'Bombillas LED', stock: 12, category: 'hogar' },
    { name: 'Pilas AA', stock: 4, category: 'hogar' },
    { name: 'Velas Aromáticas', stock: 7, category: 'hogar' },
    { name: 'Cable USB', stock: 1, category: 'hogar' },
    { name: 'Toallas', stock: 9, category: 'hogar' },
    { name: 'Organizadores', stock: 0, category: 'hogar' },
    
    // Comestibles
    { name: 'Arroz', stock: 20, category: 'comestibles' },
    { name: 'Aceite de Cocina', stock: 5, category: 'comestibles' },
    { name: 'Pasta', stock: 14, category: 'comestibles' },
    { name: 'Leche', stock: 3, category: 'comestibles' },
    { name: 'Pan', stock: 0, category: 'comestibles' },
    { name: 'Huevos', stock: 11, category: 'comestibles' },
    { name: 'Azúcar', stock: 2, category: 'comestibles' },
    { name: 'Sal', stock: 8, category: 'comestibles' }
];

const LOW_STOCK_THRESHOLD = 5;

// Elementos del DOM
const categorySelect = document.getElementById('category-select');
const productSelect = document.getElementById('product-select');
const stockAction = document.getElementById('stock-action');
const quantityInput = document.getElementById('quantity');
const currentStockDisplay = document.getElementById('current-stock-display');
const stockForm = document.getElementById('stock-form');

// Poblar lista de productos según categoría seleccionada
function populateProductSelect() {
    const selectedCategory = categorySelect.value;
    const filteredProducts = selectedCategory 
        ? productsData.filter(product => product.category === selectedCategory)
        : productsData;
    
    // Limpiar opciones existentes
    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    
    // Agregar productos filtrados
    filteredProducts.forEach((product, index) => {
        const originalIndex = productsData.indexOf(product);
        const option = document.createElement('option');
        option.value = originalIndex;
        option.textContent = `${product.name} (${product.stock} en stock)`;
        productSelect.appendChild(option);
    });
    
    // Resetear display de stock actual
    updateCurrentStockDisplay();
}

// Actualizar display de stock actual
function updateCurrentStockDisplay() {
    const selectedIndex = productSelect.value;
    if (selectedIndex !== '') {
        const product = productsData[selectedIndex];
        currentStockDisplay.textContent = `Stock actual: ${product.stock} unidades`;
        
        // Cambiar color según el stock
        if (product.stock === 0) {
            currentStockDisplay.style.color = '#F44336';
        } else if (product.stock <= LOW_STOCK_THRESHOLD) {
            currentStockDisplay.style.color = '#FF9800';
        } else {
            currentStockDisplay.style.color = '#4CAF50';
        }
    } else {
        currentStockDisplay.textContent = 'Stock actual: -';
        currentStockDisplay.style.color = '#4CAF50';
    }
}

// Actualizar resumen de inventario
function updateSummary() {
    const totalProducts = productsData.length;
    let lowStockCount = 0;
    let outStockCount = 0;
    
    productsData.forEach(product => {
        if (product.stock === 0) {
            outStockCount++;
        } else if (product.stock <= LOW_STOCK_THRESHOLD) {
            lowStockCount++;
        }
    });
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('out-stock-count').textContent = outStockCount;
}

// Mostrar mensaje
function showMessage(message, isError = false) {
    // Remover mensajes existentes
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Insertar antes del formulario
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(messageDiv, stockForm);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    const selectedIndex = parseInt(productSelect.value);
    const action = stockAction.value;
    const quantity = parseInt(quantityInput.value);
    
    if (selectedIndex === '' || action === '' || isNaN(quantity)) {
        showMessage('Por favor completa todos los campos', true);
        return;
    }
    
    const product = productsData[selectedIndex];
    const oldStock = product.stock;
    let newStock = oldStock;
    
    switch (action) {
        case 'add':
            newStock = oldStock + quantity;
            break;
        case 'remove':
            newStock = Math.max(0, oldStock - quantity);
            break;
        case 'set':
            newStock = quantity;
            break;
    }
    
    // Actualizar el stock
    product.stock = newStock;
    
    // Actualizar localStorage para persistir los cambios
    localStorage.setItem('productsData', JSON.stringify(productsData));
    
    // Mostrar mensaje de éxito
    const actionText = action === 'add' ? 'agregado' : action === 'remove' ? 'reducido' : 'establecido';
    showMessage(`Stock ${actionText} correctamente. ${product.name}: ${oldStock} → ${newStock} unidades`);
    
    // Actualizar displays
    populateProductSelect(); // Actualizar lista con nuevos stocks
    updateCurrentStockDisplay();
    updateSummary();
    
    // Limpiar cantidad
    quantityInput.value = '';
}

// Limpiar formulario
function resetForm() {
    stockForm.reset();
    populateProductSelect();
    updateCurrentStockDisplay();
}

// Event listeners
categorySelect.addEventListener('change', populateProductSelect);
productSelect.addEventListener('change', updateCurrentStockDisplay);
stockForm.addEventListener('submit', handleFormSubmit);

// Cargar datos del localStorage si existen
function loadData() {
    const savedData = localStorage.getItem('productsData');
    if (savedData) {
        productsData = JSON.parse(savedData);
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    populateProductSelect();
    updateSummary();
    updateCurrentStockDisplay();
});

// Función global para limpiar (llamada desde el HTML)
window.resetForm = resetForm;