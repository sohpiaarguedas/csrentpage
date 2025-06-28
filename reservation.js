// Configuración de la API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = `${API_BASE_URL}/reservation`;

// Variables globales
let reservations = [];
let editingId = null;

// Elementos del DOM
const form = document.getElementById('reservation-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-email');
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const reservationsList = document.getElementById('reservations-list');
const loading = document.getElementById('loading');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let deleteId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadReservations();
    setupEventListeners();
});

function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    searchBtn.addEventListener('click', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    
    // Cerrar modal al hacer clic fuera
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Funciones de API
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return null;
    } catch (error) {
        console.error('Error en la petición:', error);
        showNotification('Error de conexión con el servidor', 'error');
        throw error;
    }
}

async function loadReservations() {
    try {
        showLoading(true);
        const data = await apiRequest(API_ENDPOINT);
        reservations = data || [];
        displayReservations(reservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        reservations = [];
        displayReservations([]);
    } finally {
        showLoading(false);
    }
}

async function createReservation(reservationData) {
    return await apiRequest(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(reservationData)
    });
}

async function updateReservation(id, reservationData) {
    return await apiRequest(`${API_ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reservationData)
    });
}

async function deleteReservation(id) {
    return await apiRequest(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE'
    });
}

async function searchReservationsByEmail(email) {
    return await apiRequest(`${API_ENDPOINT}/search?email=${encodeURIComponent(email)}`);
}

// Funciones de manejo de formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const reservationData = {
        emailUser: formData.get('emailUser'),
        idSpace: parseInt(formData.get('idSpace')),
        date: formData.get('date'),
        status: formData.get('status')
    };

    try {
        showLoading(true);
        
        if (editingId) {
            await updateReservation(editingId, reservationData);
            showNotification('Reservación actualizada correctamente', 'success');
        } else {
            await createReservation(reservationData);
            showNotification('Reservación creada correctamente', 'success');
        }
        
        resetForm();
        await loadReservations();
    } catch (error) {
        console.error('Error al guardar reservación:', error);
        showNotification('Error al guardar la reservación', 'error');
    } finally {
        showLoading(false);
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = 'Agregar Nueva Reservación';
    submitBtn.textContent = 'Agregar Reservación';
    cancelBtn.style.display = 'none';
}

function cancelEdit() {
    resetForm();
}

// Funciones de búsqueda
async function handleSearch() {
    const email = searchInput.value.trim();
    if (!email) {
        showNotification('Por favor ingresa un email para buscar', 'warning');
        return;
    }

    try {
        showLoading(true);
        const results = await searchReservationsByEmail(email);
        displayReservations(results || []);
        
        if (!results || results.length === 0) {
            showNotification('No se encontraron reservaciones para ese email', 'info');
        }
    } catch (error) {
        console.error('Error searching reservations:', error);
        showNotification('Error al buscar reservaciones', 'error');
    } finally {
        showLoading(false);
    }
}

function clearSearch() {
    searchInput.value = '';
    displayReservations(reservations);
}

// Funciones de visualización
function displayReservations(reservationsToShow) {
    if (!reservationsToShow || reservationsToShow.length === 0) {
        reservationsList.innerHTML = `
            <div class="no-reservations">
                No se encontraron reservaciones 💔
            </div>
        `;
        return;
    }

    reservationsList.innerHTML = reservationsToShow.map(reservation => `
        <div class="reservation-card">
            <div class="reservation-header">
                <div class="reservation-id">ID: ${reservation.id}</div>
                <div class="reservation-actions">
                    <button class="btn-edit" onclick="editReservation(${reservation.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="showDeleteModal(${reservation.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
            
            <div class="reservation-details">
                <div class="detail-section">
                    <h4>👤 Información del Usuario</h4>
                    <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">${reservation.user?.id || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${reservation.user?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${reservation.user?.email || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Rol:</span>
                        <span class="detail-value">${reservation.user?.rol || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>🏢 Información del Espacio</h4>
                    <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">${reservation.space?.id || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${reservation.space?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">${reservation.space?.type || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Capacidad:</span>
                        <span class="detail-value">${reservation.space?.capacity || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>📅 Detalles de la Reservación</h4>
                    <div class="detail-item">
                        <span class="detail-label">Fecha:</span>
                        <span class="detail-value">${formatDate(reservation.dateReservation)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value">
                            <span class="status-badge status-${reservation.status}">
                                ${reservation.status}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Funciones de edición
function editReservation(id) {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) {
        showNotification('Reservación no encontrada', 'error');
        return;
    }

    editingId = id;
    formTitle.textContent = 'Editar Reservación';
    submitBtn.textContent = 'Actualizar Reservación';
    cancelBtn.style.display = 'inline-block';

    // Llenar el formulario con los datos existentes
    document.getElementById('emailUser').value = reservation.user?.email || '';
    document.getElementById('idSpace').value = reservation.space?.id || '';
    document.getElementById('date').value = reservation.dateReservation || '';
    document.getElementById('status').value = reservation.status || '';

    // Scroll al formulario
    document.querySelector('.form-container').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Funciones de eliminación
function showDeleteModal(id) {
    deleteId = id;
    deleteModal.style.display = 'block';
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    deleteId = null;
}

async function confirmDelete() {
    if (!deleteId) return;

    try {
        showLoading(true);
        await deleteReservation(deleteId);
        showNotification('Reservación eliminada correctamente', 'success');
        await loadReservations();
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting reservation:', error);
        showNotification('Error al eliminar la reservación', 'error');
    } finally {
        showLoading(false);
    }
}

// Funciones auxiliares
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    // Agregar estilos si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
            }
            
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
            
            .notification-success { background: #28a745; }
            .notification-error { background: #dc3545; }
            .notification-warning { background: #ffc107; color: #333; }
            .notification-info { background: #17a2b8; }
            
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
        `;
        document.head.appendChild(style);
    }

    // Agregar al DOM
    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}