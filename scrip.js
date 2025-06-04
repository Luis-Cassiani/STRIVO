//carrito
/**
 * cart.js
 * Gestiona la funcionalidad del carrito de compras
 */

// Clase para gestionar el carrito de compras
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
        this.setupEventListeners();
    }
    
    /**
     * Carga el carrito desde localStorage
     * @returns {Array} Items del carrito
     */
    loadCart() {
        const savedCart = localStorage.getItem('strivo_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }
    
    /**
     * Guarda el carrito en localStorage
     */
    saveCart() {
        localStorage.setItem('strivo_cart', JSON.stringify(this.items));
    }
    
    /**
     * Añade un producto al carrito
     * @param {Object} product - Producto a añadir
     * @param {number} quantity - Cantidad a añadir
     * @param {string} size - Talla seleccionada (si aplica)
     */
    addItem(product, quantity = 1, size = null) {
        // Verificar si el producto ya existe en el carrito
        const existingItemIndex = this.items.findIndex(item => 
            item.product.id === product.id && item.size === size
        );
        
        if (existingItemIndex !== -1) {
            // Incrementar la cantidad si el producto ya existe
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // Añadir nuevo item si no existe
            this.items.push({
                product: product,
                quantity: quantity,
                size: size
            });
        }
        
        // Guardar carrito y actualizar la interfaz
        this.saveCart();
        this.updateCartDisplay();
        
        // Mostrar notificación de éxito
        this.showNotification(`${product.name} añadido al carrito`);
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     */
    showNotification(message) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'toast-notification slide-up';
        notification.innerHTML = `
            <div class="toast bg-white border-start border-4 border-primary shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fas fa-shopping-cart text-primary me-2"></i>
                    <strong class="me-auto">Carrito actualizado</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Actualiza la cantidad de un item en el carrito
     * @param {number} index - Índice del item a actualizar
     * @param {number} quantity - Nueva cantidad
     */
    updateItemQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
            return;
        }
        
        this.items[index].quantity = quantity;
        this.saveCart();
        this.updateCartDisplay();
    }
    
    /**
     * Elimina un item del carrito
     * @param {number} index - Índice del item a eliminar
     */
    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }
    
    /**
     * Vacía completamente el carrito
     */
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
    
    /**
     * Calcula el total del carrito
     * @returns {number} Total del carrito
     */
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }
    
    /**
     * Actualiza la visualización del carrito en la UI
     */
    updateCartDisplay() {
        // Actualizar contador del carrito
        const cartCount = document.getElementById('cartCount');
        const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
        cartCount.textContent = itemCount;
        
        // Actualizar modal del carrito si está abierto
        if (document.getElementById('cartItems')) {
            this.renderCartItems();
        }
    }
    
    /**
     * Renderiza los items del carrito en el modal
     */
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCartMessage = document.getElementById('emptyCart');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotalElement = document.getElementById('cartTotal');
        
        // Mostrar mensaje de carrito vacío si no hay items
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            emptyCartMessage.style.display = 'block';
            cartFooter.style.display = 'none';
            return;
        }
        
        // Ocultar mensaje de carrito vacío y mostrar items
        emptyCartMessage.style.display = 'none';
        cartFooter.style.display = 'flex';
        
        // Render de los items
        cartItemsContainer.innerHTML = '';
        this.items.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h6 class="cart-item-title">${item.product.name}</h6>
                    <p class="cart-item-price">${formatPrice(item.product.price)}</p>
                    ${item.size ? `<p class="cart-item-size">Talla: ${item.size}</p>` : ''}
                </div>
                <div class="cart-item-quantity">
                    <button class="cart-quantity-btn minus" data-index="${index}">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="cart-quantity-btn plus" data-index="${index}">+</button>
                </div>
                <div class="cart-item-subtotal text-end me-3">
                    <span>${formatPrice(item.product.price * item.quantity)}</span>
                </div>
                <div class="cart-item-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Actualizar total
        cartTotalElement.textContent = formatPrice(this.getTotal());
        
        // Añadir event listeners para botones dentro del carrito
        this.addCartItemEventListeners();
    }
    
    /**
     * Añade event listeners a los botones dentro del carrito
     */
    addCartItemEventListeners() {
        // Botones de incremento/decremento
        document.querySelectorAll('.cart-quantity-btn.plus').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.updateItemQuantity(index, this.items[index].quantity + 1);
            });
        });
        
        document.querySelectorAll('.cart-quantity-btn.minus').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.updateItemQuantity(index, this.items[index].quantity - 1);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.removeItem(index);
            });
        });
    }
    
    /**
     * Configura todos los event listeners relacionados con el carrito
     */
    setupEventListeners() {
        // Botón para abrir el carrito
        const cartButton = document.getElementById('cartButton');
        cartButton.addEventListener('click', () => {
            const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
            this.renderCartItems();
            cartModal.show();
        });
        
        // Botón para vaciar el carrito
        const clearCartButton = document.getElementById('clearCart');
        clearCartButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
                this.clearCart();
            }
        });
        
        // Botón para proceder al pago
        const checkoutButton = document.getElementById('checkoutBtn');
        checkoutButton.addEventListener('click', () => {
            // En una implementación real, esto redirigiría a la página de checkout
            alert('¡Gracias por tu compra! En una implementación real, aquí procederías al pago.');
            this.clearCart();
            
            // Cerrar el modal
            const cartModalElement = document.getElementById('cartModal');
            const cartModal = bootstrap.Modal.getInstance(cartModalElement);
            cartModal.hide();
        });
    }
}

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Crear la instancia global del carrito
    window.cart = new ShoppingCart();
});
//mein
/**
 * main.js
 * Archivo principal de JavaScript que inicializa componentes y gestiona funcionalidades globales
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Efecto de scroll suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Cerrar el menú de navegación en móviles
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsNavbar = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsNavbar) bsNavbar.hide();
                }
                
                // Desplazamiento suave
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Efecto de cambio de navbar al hacer scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled', 'shadow-sm');
            } else {
                navbar.classList.remove('navbar-scrolled', 'shadow-sm');
            }
        });
    }
    
    // Animación de elementos al hacer scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animated');
            }
        });
    };
    
    // Agregar la clase "animate-on-scroll" a elementos que queremos animar
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.classList.add('animate-on-scroll');
    });
    
    // Llamar a la función de animación al cargar y al hacer scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Gestión de estilos dinámicos
    const style = document.createElement('style');
    style.textContent = `
        .navbar-scrolled {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            background-color: rgba(13, 110, 253, 0.98) !important;
            backdrop-filter: blur(10px);
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
//modal
/**
 * modal.js
 * Gestiona la funcionalidad de los modales (detalles de producto)
 */

/**
 * Abre el modal con detalles del producto
 * @param {number} productId - ID del producto a mostrar
 */
function openProductModal(productId) {
    // Obtener el producto
    const product = findProductById(productId);
    if (!product) return;
    
    // Obtener elementos del modal
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalLabel');
    const modalImage = document.getElementById('modalProductImage');
    const modalName = document.getElementById('modalProductName');
    const modalCategory = document.getElementById('modalProductCategory');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalDescription = document.getElementById('modalProductDescription');
    const sizeSelector = document.getElementById('sizeSelector');
    
    // Obtener elementos para cantidad
    const quantityInput = document.getElementById('productQuantity');
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    
    // Configurar datos del producto en el modal
    modalTitle.textContent = 'Detalles del Producto';
    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalName.textContent = product.name;
    modalCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    modalPrice.textContent = formatPrice(product.price);
    modalDescription.textContent = product.description;
    
    // Resetear cantidad a 1
    quantityInput.value = 1;
    
    // Mostrar/ocultar selector de tallas según categoría
    if (product.category === 'futbol' || product.category === 'running' || product.category === 'entrenamiento') {
        sizeSelector.style.display = 'block';
        // Reset selección de talla
        document.getElementById('sizeS').checked = true;
    } else {
        sizeSelector.style.display = 'none';
    }
    
    // Configurar botón de añadir al carrito
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.onclick = function() {
        // Obtener cantidad
        const quantity = parseInt(quantityInput.value);
        
        // Obtener talla seleccionada si aplica
        let size = null;
        if (sizeSelector.style.display !== 'none') {
            const sizeInputs = document.querySelectorAll('input[name="size"]');
            for (const input of sizeInputs) {
                if (input.checked) {
                    size = input.id.replace('size', '');
                    break;
                }
            }
        }
        
        // Añadir al carrito
        window.cart.addItem(product, quantity, size);
        
        // Cerrar modal
        const productModalElement = document.getElementById('productModal');
        const productModal = bootstrap.Modal.getInstance(productModalElement);
        productModal.hide();
    };
    
    // Event listeners para botones de cantidad
    decreaseBtn.onclick = function() {
        const currentVal = parseInt(quantityInput.value);
        if (currentVal > 1) {
            quantityInput.value = currentVal - 1;
        }
    };
    
    increaseBtn.onclick = function() {
        const currentVal = parseInt(quantityInput.value);
        if (currentVal < 10) {
            quantityInput.value = currentVal + 1;
        }
    };
    
    // Validar entrada manual de cantidad
    quantityInput.onchange = function() {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 1) {
            this.value = 1;
        } else if (val > 10) {
            this.value = 10;
        }
    };
    
    // Abrir el modal
    const productModal = new bootstrap.Modal(modal);
    productModal.show();
}

// Agregar estilos para notificaciones de carrito
document.addEventListener('DOMContentLoaded', function() {
    // Crear estilos para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast {
            min-width: 250px;
        }
        
        .slide-up {
            animation: slideUp 0.3s ease-out;
        }
        
        .fade-out {
            animation: fadeOut 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
/**
 * products.js
 * Gestiona los datos y la visualización de los productos
 */

// Datos de productos - En un entorno real, estos vendrían de una API
const products = [
    {
        id: 1,
        name: "Balón de Fútbol Profesional",
        category: "futbol",
        price: 159900,
        image: "./https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlXp7mN00chUSPWQ22jI1Edg2-QdttwKxOVA&s",
        description: "Balón de fútbol profesional con tecnología de alta precisión. Diseñado para un mejor control, precisión y durabilidad. Aprobado para competiciones oficiales."
    },
    {
        id: 2,
        name: "Camiseta Running Dri-Fit",
        category: "running",
        price: 89900,
        image: "./https://tennisworldcolombia.com/wp-content/uploads/2023/10/Diseno-sin-titulo-11-1-1.png",
        description: "Camiseta técnica con tecnología de absorción de humedad para mantener la piel seca durante tus entrenamientos. Material ligero y transpirable con protección UV."
    },
    {
        id: 3,
        name: "Zapatillas Baloncesto Pro Jump",
        category: "baloncesto",
        price: 329900,
        image: "./https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn0d4aVOLrxMs-HZ_AyKEo1VjNw3E-y6mMoQ&s",
        description: "Zapatillas de baloncesto con amortiguación premium y soporte para el tobillo. Suela de alta tracción para movimientos rápidos en la cancha."
    },
    {
        id: 4,
        name: "Conjunto Entrenamiento Elite",
        category: "entrenamiento",
        price: 245900,
        image: "./https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/5cbd8cca-a56b-49d7-8243-6246c3988451/M+NK+STRK%2B+TRK+SUIT+K.png",
        description: "Conjunto de entrenamiento completo con chaqueta y pantalón. Material elástico de alta calidad para máxima libertad de movimiento durante cualquier actividad física."
    },
    {
        id: 5,
        name: "Guantes de Portero Pro Grip",
        category: "futbol",
        price: 124900,
        image: "./https://www.futbolemotion.com/imagesarticulos/203345/grandes/guante-nike-mercurial-vapor-grip-3-profesional-20cm-black-0.webp",
        description: "Guantes de portero profesionales con tecnología de agarre superior. Protección para los dedos y palma reforzada para una mayor durabilidad y confort."
    },
    {
        id: 6,
        name: "Pelota de Baloncesto Grip Master",
        category: "baloncesto",
        price: 119900,
        image: "./https://images.pexels.com/photos/945471/pexels-photo-945471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        description: "Pelota de baloncesto con superficie de agarre superior. Diseñada para uso tanto en interiores como exteriores. Construcción duradera y rendimiento consistente."
    },
    {
        id: 7,
        name: "Zapatillas Running Cloud Ultra",
        category: "running",
        price: 289900,
        image: "./https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        description: "Zapatillas de running con tecnología de amortiguación avanzada. Diseñadas para distancias largas con máximo confort y retorno de energía."
    },
    {
        id: 8,
        name: "Kit de Pesas Ajustables",
        category: "entrenamiento",
        price: 349900,
        image: "./https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        description: "Kit completo de pesas ajustables para entrenamiento en casa. Incluye mancuernas ajustables de 2.5kg a 25kg cada una, perfecto para todo tipo de ejercicios."
    },
    {
        id: 9,
        name: "Chaqueta Impermeable Trail Run",
        category: "running",
        price: 219900,
        image: "./https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfwrTRCk4m1oDP7TlfcVXSRK7D9rTFr2LGDQ&s",
        description: "Chaqueta impermeable y transpirable perfecta para running en condiciones adversas. Cuenta con costuras selladas y tejido resistente al agua de 10k."
    },
    {
        id: 10,
        name: "Jersey Oficial Equipo chelsea",
        category: "futbol",
        price: 199900,
        image: "./https://media.foot-store.es/catalog/product/cache/small_image/318x/9df78eab33525d08d6e5fb8d27136e95/n/i/nike_fn8760-496-phsfh001-nw091924.jpg",
        description: "Jersey oficial de la selección nacional. Diseño actual con tecnología de ventilación avanzada. Material premium con escudo bordado."
    },
    {
        id: 11,
        name: "Banda de Resistencia Pro Kit",
        category: "entrenamiento",
        price: 129900,
        image: "./https://m.media-amazon.com/images/I/51hiz1xnMBL._AC_UF1000,1000_QL80_.jpg",
        description: "Kit completo de bandas de resistencia con diferentes niveles de tensión. Incluye accesorios para fijar a puertas y manual de ejercicios."
    },
    {
        id: 12,
        name: "Canasta de Baloncesto Portátil",
        category: "baloncesto",
        price: 749900,
        image: "./https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTghQO_4H6umXdj9Dz63t3VQUMRMTdO8gd1DQ&s",
        description: "Canasta de baloncesto portátil y ajustable en altura. Base resistente con capacidad para agua o arena. Fácil de transportar con ruedas integradas."
    }
];

/**
 * Formatea el precio en pesos colombianos
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
}

/**
 * Crea el HTML para la tarjeta de un producto
 * @param {Object} product - Datos del producto
 * @returns {string} HTML de la tarjeta del producto
 */
function createProductCard(product) {
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4 product-item" data-category="${product.category}">
            <div class="card product-card h-100 fade-in">
                <div class="product-img-container">
                    <img src="${product.image}" class="product-img" alt="${product.name}">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="product-title">${product.name}</h5>
                    <p class="product-category text-muted">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    <p class="product-price mb-3">${formatPrice(product.price)}</p>
                    <button class="btn btn-outline-primary mt-auto btn-view-details" data-product-id="${product.id}">
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza todos los productos en el grid
 * @param {Array} productsToRender - Array de productos a renderizar
 */
function renderProducts(productsToRender = products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="lead">No se encontraron productos en esta categoría.</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        productGrid.innerHTML += createProductCard(product);
    });
    
    // Agregar event listeners para los botones de detalles
    document.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            openProductModal(productId);
        });
    });
}

/**
 * Filtra los productos por categoría
 * @param {string} category - Categoría a filtrar
 */
function filterProducts(category) {
    let filtered;
    
    if (category === 'all') {
        filtered = products;
    } else {
        filtered = products.filter(product => product.category === category);
    }
    
    renderProducts(filtered);
}

/**
 * Encuentra un producto por su ID
 * @param {number} id - ID del producto
 * @returns {Object} Producto encontrado
 */
function findProductById(id) {
    return products.find(product => product.id === id);
}

// Inicializar la página de productos
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar todos los productos inicialmente
    renderProducts();
    
    // Configurar filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Eliminar la clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir la clase active al botón clicado
            this.classList.add('active');
            
            // Filtrar productos
            const category = this.getAttribute('data-filter');
            filterProducts(category);
        });
    });
});
/**
 * subscription.js
 * Gestiona la funcionalidad del formulario de suscripción
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('subscription-form');
    
    /**
     * Valida que un campo tenga valor
     * @param {HTMLElement} field - Campo a validar
     * @returns {boolean} Si el campo es válido
     */
    function validateField(field) {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            return true;
        }
    }
    
    /**
     * Valida una dirección de correo electrónico
     * @param {HTMLElement} field - Campo de email a validar
     * @returns {boolean} Si el email es válido
     */
    function validateEmail(field) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(field.value.trim());
        
        if (!isValid) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            return true;
        }
    }
    
    /**
     * Valida que un checkbox esté marcado
     * @param {HTMLElement} field - Checkbox a validar
     * @returns {boolean} Si el checkbox está marcado
     */
    function validateCheckbox(field) {
        if (!field.checked) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            return true;
        }
    }
    
    // Validación en tiempo real para los campos
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const acceptTerms = document.getElementById('acceptTerms');
    
    firstName.addEventListener('blur', function() {
        validateField(this);
    });
    
    lastName.addEventListener('blur', function() {
        validateField(this);
    });
    
    email.addEventListener('blur', function() {
        validateEmail(this);
    });
    
    acceptTerms.addEventListener('change', function() {
        validateCheckbox(this);
    });
    
    // Manejo de envío del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validar todos los campos
        const isFirstNameValid = validateField(firstName);
        const isLastNameValid = validateField(lastName);
        const isEmailValid = validateEmail(email);
        const areTermsAccepted = validateCheckbox(acceptTerms);
        
        // Comprobar si todo es válido
        if (isFirstNameValid && isLastNameValid && isEmailValid && areTermsAccepted) {
            // Recoger datos del formulario
            const formData = {
                firstName: firstName.value.trim(),
                lastName: lastName.value.trim(),
                email: email.value.trim(),
                interests: Array.from(document.getElementById('interests').selectedOptions).map(option => option.value)
            };
            
            // En una aplicación real, aquí enviaríamos los datos a un servidor
            console.log('Datos de suscripción:', formData);
            
            // Mostrar mensaje de éxito
            showSubscriptionConfirmation(formData.firstName);
            
            // Resetear el formulario
            form.reset();
            
            // Quitar clases de validación
            form.querySelectorAll('.is-valid').forEach(el => {
                el.classList.remove('is-valid');
            });
        }
    });
    
    /**
     * Muestra un mensaje de confirmación de suscripción
     * @param {string} name - Nombre del usuario
     */
    function showSubscriptionConfirmation(name) {
        // Crear modal de confirmación
        const modalHTML = `
            <div class="modal fade" id="subscriptionSuccessModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">¡Suscripción Exitosa!</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <i class="fas fa-check-circle text-success fa-4x mb-3"></i>
                            <h4>¡Gracias, ${name}!</h4>
                            <p class="lead">Tu suscripción ha sido registrada correctamente.</p>
                            <p>Te enviaremos las últimas novedades y promociones exclusivas a tu correo electrónico.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Añadir modal al DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Mostrar modal
        const successModal = new bootstrap.Modal(document.getElementById('subscriptionSuccessModal'));
        successModal.show();
        
        // Eliminar modal del DOM cuando se cierre
        document.getElementById('subscriptionSuccessModal').addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalContainer);
        });
    }
});