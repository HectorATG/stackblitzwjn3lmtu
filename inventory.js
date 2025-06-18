// Configuración de stock mínimo
const LOW_STOCK_THRESHOLD = 5;

// Datos de productos por defecto (organizados por categorías)
const defaultProductsData = [
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

// Variables globales
let currentFilter = 'all';
let productsData = [];

// Función para actualizar el estado visual del stock
function updateStockStatus(product, stock) {
    const stockInfo = product.querySelector('.stock-info');
    
    // Remover clases existentes
    stockInfo.classList.remove('low-stock', 'out-of-stock');
    
    // Remover alertas existentes
    const existingAlert = stockInfo.querySelector('.low-stock-alert, .out-of-stock-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Aplicar nuevo estado
    if (stock === 0) {
        stockInfo.classList.add('out-of-stock');
        const alert = document.createElement('span');
        alert.className = 'out-of-stock-alert';
        alert.textContent = '❌ Sin stock';
        stockInfo.appendChild(alert);
    } else if (stock <= LOW_STOCK_THRESHOLD) {
        stockInfo.classList.add('low-stock');
        const alert = document.createElement('span');
        alert.className = 'low-stock-alert';
        alert.textContent = '⚠️ Stock bajo';
        stockInfo.appendChild(alert);
    }
}

// Función para filtrar productos por categoría
function filterProducts(category) {
    currentFilter = category;
    const products = document.querySelectorAll('.product');
    let visibleCount = 0;
    
    products.forEach(product => {
        const productCategory = product.dataset.category;
        
        if (category === 'all' || productCategory === category) {
            product.classList.remove('hidden');
            visibleCount++;
        } else {
            product.classList.add('hidden');
        }
    });
    
    // Actualizar título y contador
    updateDisplayInfo(category, visibleCount);
    
    // Actualizar botones activos
    updateActiveButton(category);
}

// Función para actualizar información de display
function updateDisplayInfo(category, count) {
    const categoryDisplay = document.getElementById('category-display');
    const visibleCount = document.getElementById('visible-count');
    
    const categoryNames = {
        'all': 'Todos los Productos',
        'limpieza': '🧽 Productos de Limpieza',
        'hogar': '🏠 Productos para el Hogar',
        'comestibles': '🍎 Productos Comestibles'
    };
    
    categoryDisplay.textContent = categoryNames[category];
    visibleCount.textContent = `${count} productos`;
}

// Función para actualizar botón activo
function updateActiveButton(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Función para actualizar estadísticas del sidebar
function updateSidebarStats() {
    let totalProducts = 0;
    let lowStockCount = 0;
    let outStockCount = 0;
    
    productsData.forEach(product => {
        if (product.stock === 0) {
            outStockCount++;
        } else if (product.stock <= LOW_STOCK_THRESHOLD) {
            lowStockCount++;
        }
        totalProducts++;
    });
    
    document.getElementById('total-count').textContent = totalProducts;
    document.getElementById('low-stock-stat').textContent = lowStockCount;
    document.getElementById('out-stock-stat').textContent = outStockCount;
}

// Función para inicializar el estado de todos los productos
function initializeInventory() {
    // Cargar datos del localStorage si existen
    const savedData = localStorage.getItem('productsData');
    productsData = savedData ? JSON.parse(savedData) : defaultProductsData;
    
    const products = document.querySelectorAll('.product');
    
    products.forEach((product, index) => {
        if (productsData[index]) {
            const newStock = productsData[index].stock;
            product.dataset.stock = newStock;
            const stockCounter = product.querySelector('.stock-counter');
            if (stockCounter) {
                stockCounter.textContent = newStock;
            }
            updateStockStatus(product, newStock);
        }
    });
    
    // Actualizar estadísticas
    updateSidebarStats();
    
    // Aplicar filtro actual
    filterProducts(currentFilter);
}

// Función para generar reporte de stock
function generateStockReport() {
    const savedData = localStorage.getItem('productsData');
    const productsData = savedData ? JSON.parse(savedData) : defaultProductsData;
    
    let report = 'REPORTE DE INVENTARIO\n';
    report += '========================\n\n';
    
    // Agrupar por categorías
    const categories = {
        'limpieza': '🧽 LIMPIEZA',
        'hogar': '🏠 HOGAR',
        'comestibles': '🍎 COMESTIBLES'
    };
    
    let totalProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    
    Object.keys(categories).forEach(categoryKey => {
        const categoryProducts = productsData.filter(p => p.category === categoryKey);
        if (categoryProducts.length > 0) {
            report += `${categories[categoryKey]}\n`;
            report += '------------------------\n';
            
            categoryProducts.forEach(product => {
                const stock = product.stock;
                totalProducts += stock;
                
                let status = 'Normal';
                if (stock === 0) {
                    status = 'SIN STOCK';
                    outOfStockProducts++;
                } else if (stock <= LOW_STOCK_THRESHOLD) {
                    status = 'STOCK BAJO';
                    lowStockProducts++;
                }
                
                report += `${product.name}: ${stock} unidades - ${status}\n`;
            });
            report += '\n';
        }
    });
    
    report += '========================\n';
    report += `Total de unidades: ${totalProducts}\n`;
    report += `Productos con stock bajo: ${lowStockProducts}\n`;
    report += `Productos sin stock: ${outOfStockProducts}\n`;
    
    alert(report);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para botones de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
        });
    });
    
    // Inicializar inventario
    initializeInventory();
    
    // Agregar funcionalidad al enlace de reporte
    const reportLink = document.querySelector('a[href="#"]:nth-child(3)');
    if (reportLink && reportLink.textContent.includes('Reporte')) {
        reportLink.addEventListener('click', function(e) {
            e.preventDefault();
            generateStockReport();
        });
    }
    
    // Actualizar inventario cada 5 segundos para reflejar cambios
    setInterval(initializeInventory, 5000);
});