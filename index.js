// Configuración de URLs específicas para cada API
const API_URLS = {
    user: 'https://csrent-x0ip.onrender.com/users',
    space: 'https://csrent-x0ip.onrender.com/space',
    reservation: 'https://csrent-x0ip.onrender.com/reservation'
};

// Configuración de headers por defecto
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// Función auxiliar para manejar respuestas
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Función auxiliar para mostrar mensajes
function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Aquí puedes agregar lógica para mostrar mensajes en la UI
    if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification(message, type);
    }
}

// ==================== USUARIOS API ====================

const UsersAPI = {
    // Obtener todos los usuarios
    async getAll() {
        try {
            const response = await fetch(API_URLS.users, {
                method: 'GET',
                headers: defaultHeaders
            });
            const users = await handleResponse(response);
            showMessage('Usuarios obtenidos exitosamente', 'success');
            return users;
        } catch (error) {
            showMessage(`Error al obtener usuarios: ${error.message}`, 'error');
            throw error;
        }
    },

    // Obtener usuario por ID
    async getById(id) {
        try {
            const response = await fetch(`${API_URLS.users}/${id}`, {
                method: 'GET',
                headers: defaultHeaders
            });
            const user = await handleResponse(response);
            showMessage(`Usuario ${id} obtenido exitosamente`, 'success');
            return user;
        } catch (error) {
            showMessage(`Error al obtener usuario ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Crear nuevo usuario
    async create(userData) {
        try {
            const response = await fetch(API_URLS.users, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(userData)
            });
            const newUser = await handleResponse(response);
            showMessage('Usuario creado exitosamente', 'success');
            return newUser;
        } catch (error) {
            showMessage(`Error al crear usuario: ${error.message}`, 'error');
            throw error;
        }
    },

    // Actualizar usuario
    async update(id, userData) {
        try {
            const response = await fetch(`${API_URLS.users}/${id}`, {
                method: 'PUT',
                headers: defaultHeaders,
                body: JSON.stringify(userData)
            });
            const updatedUser = await handleResponse(response);
            showMessage(`Usuario ${id} actualizado exitosamente`, 'success');
            return updatedUser;
        } catch (error) {
            showMessage(`Error al actualizar usuario ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Eliminar usuario
    async delete(id) {
        try {
            const response = await fetch(`${API_URLS.users}/${id}`, {
                method: 'DELETE',
                headers: defaultHeaders
            });
            await handleResponse(response);
            showMessage(`Usuario ${id} eliminado exitosamente`, 'success');
            return true;
        } catch (error) {
            showMessage(`Error al eliminar usuario ${id}: ${error.message}`, 'error');
            throw error;
        }
    }
};

// ==================== ESPACIOS API ====================

const SpacesAPI = {
    // Obtener todos los espacios
    async getAll() {
        try {
            const response = await fetch(API_URLS.space, {
                method: 'GET',
                headers: defaultHeaders
            });
            const spaces = await handleResponse(response);
            showMessage('Espacios obtenidos exitosamente', 'success');
            return spaces;
        } catch (error) {
            showMessage(`Error al obtener espacios: ${error.message}`, 'error');
            throw error;
        }
    },

    // Obtener espacio por ID
    async getById(id) {
        try {
            const response = await fetch(`${API_URLS.space}/${id}`, {
                method: 'GET',
                headers: defaultHeaders
            });
            const space = await handleResponse(response);
            showMessage(`Espacio ${id} obtenido exitosamente`, 'success');
            return space;
        } catch (error) {
            showMessage(`Error al obtener espacio ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Crear nuevo espacio
    async create(spaceData) {
        try {
            const response = await fetch(API_URLS.space, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(spaceData)
            });
            const newSpace = await handleResponse(response);
            showMessage('Espacio creado exitosamente', 'success');
            return newSpace;
        } catch (error) {
            showMessage(`Error al crear espacio: ${error.message}`, 'error');
            throw error;
        }
    },

    // Actualizar espacio
    async update(id, spaceData) {
        try {
            const response = await fetch(`${API_URLS.space}/${id}`, {
                method: 'PUT',
                headers: defaultHeaders,
                body: JSON.stringify(spaceData)
            });
            const updatedSpace = await handleResponse(response);
            showMessage(`Espacio ${id} actualizado exitosamente`, 'success');
            return updatedSpace;
        } catch (error) {
            showMessage(`Error al actualizar espacio ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Eliminar espacio
    async delete(id) {
        try {
            const response = await fetch(`${API_URLS.space}/${id}`, {
                method: 'DELETE',
                headers: defaultHeaders
            });
            await handleResponse(response);
            showMessage(`Espacio ${id} eliminado exitosamente`, 'success');
            return true;
        } catch (error) {
            showMessage(`Error al eliminar espacio ${id}: ${error.message}`, 'error');
            throw error;
        }
    }
};

// ==================== RESERVACIONES API ====================

const ReservationsAPI = {
    // Obtener todas las reservaciones
    async getAll() {
        try {
            const response = await fetch(API_URLS.reservation, {
                method: 'GET',
                headers: defaultHeaders
            });
            const reservations = await handleResponse(response);
            showMessage('Reservaciones obtenidas exitosamente', 'success');
            return reservations;
        } catch (error) {
            showMessage(`Error al obtener reservaciones: ${error.message}`, 'error');
            throw error;
        }
    },

    // Obtener reservación por ID
    async getById(id) {
        try {
            const response = await fetch(`${API_URLS.reservation}/${id}`, {
                method: 'GET',
                headers: defaultHeaders
            });
            const reservation = await handleResponse(response);
            showMessage(`Reservación ${id} obtenida exitosamente`, 'success');
            return reservation;
        } catch (error) {
            showMessage(`Error al obtener reservación ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Crear nueva reservación
    async create(reservationData) {
        try {
            const response = await fetch(API_URLS.reservation, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(reservationData)
            });
            const newReservation = await handleResponse(response);
            showMessage('Reservación creada exitosamente', 'success');
            return newReservation;
        } catch (error) {
            showMessage(`Error al crear reservación: ${error.message}`, 'error');
            throw error;
        }
    },

    // Actualizar reservación
    async update(id, reservationData) {
        try {
            const response = await fetch(`${API_URLS.reservation}/${id}`, {
                method: 'PUT',
                headers: defaultHeaders,
                body: JSON.stringify(reservationData)
            });
            const updatedReservation = await handleResponse(response);
            showMessage(`Reservación ${id} actualizada exitosamente`, 'success');
            return updatedReservation;
        } catch (error) {
            showMessage(`Error al actualizar reservación ${id}: ${error.message}`, 'error');
            throw error;
        }
    },

    // Eliminar reservación
    async delete(id) {
        try {
            const response = await fetch(`${API_URLS.reservation}/${id}`, {
                method: 'DELETE',
                headers: defaultHeaders
            });
            await handleResponse(response);
            showMessage(`Reservación ${id} eliminada exitosamente`, 'success');
            return true;
        } catch (error) {
            showMessage(`Error al eliminar reservación ${id}: ${error.message}`, 'error');
            throw error;
        }
    }
};

// ==================== FUNCIONES DE UTILIDAD ====================

// Función para verificar conectividad de las APIs
async function checkAPIConnectivity() {
    const results = {
        users: false,
        spaces: false,
        reservations: false
    };

    try {
        await fetch(API_URLS.users, { method: 'HEAD' });
        results.users = true;
        showMessage('API de usuarios conectada', 'success');
    } catch (error) {
        showMessage('API de usuarios no disponible', 'warning');
    }

    try {
        await fetch(API_URLS.space, { method: 'HEAD' });
        results.spaces = true;
        showMessage('API de espacios conectada', 'success');
    } catch (error) {
        showMessage('API de espacios no disponible', 'warning');
    }

    try {
        await fetch(API_URLS.reservation, { method: 'HEAD' });
        results.reservations = true;
        showMessage('API de reservaciones conectada', 'success');
    } catch (error) {
        showMessage('API de reservaciones no disponible', 'warning');
    }

    return results;
}

// Función para inicializar la aplicación
async function initializeApp() {
    try {
        showMessage('Inicializando aplicación CSRent...', 'info');
        
        // Verificar conectividad con las APIs
        const connectivity = await checkAPIConnectivity();
        
        if (connectivity.users && connectivity.spaces && connectivity.reservations) {
            showMessage('Todas las APIs están disponibles', 'success');
        } else {
            showMessage('Algunas APIs no están disponibles', 'warning');
        }
        
        showMessage('Aplicación inicializada correctamente', 'success');
        return connectivity;
    } catch (error) {
        showMessage('Error al inicializar la aplicación', 'error');
        console.error('Error de inicialización:', error);
        return null;
    }
}

// Función para buscar en cualquier API
async function searchData(apiType, searchTerm) {
    try {
        let data;
        switch (apiType) {
            case 'users':
                data = await UsersAPI.getAll();
                break;
            case 'spaces':
                data = await SpacesAPI.getAll();
                break;
            case 'reservations':
                data = await ReservationsAPI.getAll();
                break;
            default:
                throw new Error('Tipo de API no válido');
        }
        
        // Filtrar datos basado en el término de búsqueda
        const filteredData = data.filter(item => 
            JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return filteredData;
    } catch (error) {
        showMessage(`Error en búsqueda: ${error.message}`, 'error');
        throw error;
    }
}

// Función para obtener estadísticas generales
async function getStats() {
    try {
        const [users, spaces, reservations] = await Promise.all([
            UsersAPI.getAll().catch(() => []),
            SpacesAPI.getAll().catch(() => []),
            ReservationsAPI.getAll().catch(() => [])
        ]);

        const stats = {
            totalUsers: users.length,
            totalSpaces: spaces.length,
            totalReservations: reservations.length,
            lastUpdate: new Date().toISOString()
        };

        showMessage('Estadísticas obtenidas exitosamente', 'success');
        return stats;
    } catch (error) {
        showMessage(`Error al obtener estadísticas: ${error.message}`, 'error');
        throw error;
    }
}

// Exportar las APIs para uso global
window.CSRentAPI = {
    Users: UsersAPI,
    Spaces: SpacesAPI,
    Reservations: ReservationsAPI,
    initialize: initializeApp,
    search: searchData,
    getStats: getStats,
    checkConnectivity: checkAPIConnectivity,
    URLs: API_URLS
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

