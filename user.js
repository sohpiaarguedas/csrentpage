// script.js
class UserManager {
    constructor() {
        this.apiUrl = 'http://localhost:8080/users';
        this.users = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUsers();
    }

    bindEvents() {
        // Formulario
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Botón cancelar
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.resetForm();
        });

        // Búsqueda
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchUsers();
        });

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchUsers();
            }
        });

        // Mostrar todos
        document.getElementById('show-all-btn').addEventListener('click', () => {
            this.showAllUsers();
        });

        // Modal
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.hideModal();
        });
    }

    // Manejo del formulario
    async handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            if (this.currentEditId) {
                await this.updateUser(this.currentEditId, formData);
            } else {
                await this.createUser(formData);
            }
        } catch (error) {
            this.showError('Error al procesar la solicitud: ' + error.message);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            rol: document.getElementById('rol').value
        };
    }

    validateForm(data) {
        if (!data.name || !data.email || !data.password || !data.rol) {
            this.showError('Todos los campos son obligatorios');
            return false;
        }

        if (!this.isValidEmail(data.email)) {
            this.showError('Por favor ingresa un email válido');
            return false;
        }

        if (data.password.length < 6) {
            this.showError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Operaciones CRUD
    async loadUsers() {
        try {
            this.showLoading(true);
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.users = await response.json();
            this.renderUsers(this.users);
        } catch (error) {
            this.showError('Error al cargar usuarios: ' + error.message);
            this.users = [];
            this.renderUsers([]);
        } finally {
            this.showLoading(false);
        }
    }

    async createUser(userData) {
        try {
            this.showLoading(true);
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newUser = await response.json();
            this.users.push(newUser);
            this.renderUsers(this.users);
            this.resetForm();
            this.showSuccess('Usuario agregado exitosamente');
        } catch (error) {
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async updateUser(id, userData) {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedUser = await response.json();
            const index = this.users.findIndex(user => user.id == id);
            if (index !== -1) {
                this.users[index] = updatedUser;
            }
            this.renderUsers(this.users);
            this.resetForm();
            this.showSuccess('Usuario actualizado exitosamente');
        } catch (error) {
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async deleteUser(id) {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.users = this.users.filter(user => user.id != id);
            this.renderUsers(this.users);
            this.showSuccess('Usuario eliminado exitosamente');
        } catch (error) {
            this.showError('Error al eliminar usuario: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // Búsqueda
    async searchUsers() {
        const searchTerm = document.getElementById('search-input').value.trim();
        
        if (!searchTerm) {
            this.showError('Por favor ingresa un término de búsqueda');
            return;
        }

        try {
            this.showLoading(true);
            
            // Buscar por ID si es un número
            if (!isNaN(searchTerm)) {
                const response = await fetch(`${this.apiUrl}/${searchTerm}`);
                if (response.ok) {
                    const user = await response.json();
                    this.renderUsers([user]);
                    return;
                }
            }

            // Buscar por email en la lista local
            const filteredUsers = this.users.filter(user => 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toString().includes(searchTerm)
            );

            if (filteredUsers.length === 0) {
                this.showError('No se encontraron usuarios con ese criterio');
                this.renderUsers([]);
            } else {
                this.renderUsers(filteredUsers);
            }
        } catch (error) {
            this.showError('Error en la búsqueda: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showAllUsers() {
        document.getElementById('search-input').value = '';
        this.renderUsers(this.users);
    }

    // Renderizado
    renderUsers(users) {
        const container = document.getElementById('users-container');
        
        if (users.length === 0) {
            container.innerHTML = '<div class="no-users">No hay usuarios para mostrar</div>';
            return;
        }

        container.innerHTML = users.map(user => this.createUserCard(user)).join('');
    }

    createUserCard(user) {
        return `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-field">
                        <span class="field-label">ID</span>
                        <span class="field-value">${user.id || 'N/A'}</span>
                    </div>
                    <div class="user-field">
                        <span class="field-label">Nombre</span>
                        <span class="field-value">${user.name || 'N/A'}</span>
                    </div>
                    <div class="user-field">
                        <span class="field-label">Email</span>
                        <span class="field-value">${user.email || 'N/A'}</span>
                    </div>
                    <div class="user-field">
                        <span class="field-label">Rol</span>
                        <span class="field-value">${user.rol || 'N/A'}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn-edit" onclick="userManager.editUser(${user.id})">
                        Editar
                    </button>
                    <button class="btn-delete" onclick="userManager.showDeleteModal(${user.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    // Edición
    editUser(id) {
        const user = this.users.find(u => u.id == id);
        if (!user) {
            this.showError('Usuario no encontrado');
            return;
        }

        this.currentEditId = id;
        document.getElementById('user-id').value = id;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('password').value = user.password || '';
        document.getElementById('rol').value = user.rol || '';

        document.getElementById('form-title').textContent = 'Editar Usuario';
        document.getElementById('submit-btn').textContent = 'Actualizar Usuario';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    resetForm() {
        document.getElementById('user-form').reset();
        document.getElementById('user-id').value = '';
        this.currentEditId = null;
        
        document.getElementById('form-title').textContent = 'Agregar Usuario';
        document.getElementById('submit-btn').textContent = 'Agregar Usuario';
        document.getElementById('cancel-btn').style.display = 'none';
        
        this.hideError();
    }

    // Modal de confirmación
    showDeleteModal(id) {
        this.userToDelete = id;
        document.getElementById('confirm-modal').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('confirm-modal').style.display = 'none';
        this.userToDelete = null;
    }

    async confirmDelete() {
        if (this.userToDelete) {
            await this.deleteUser(this.userToDelete);
            this.hideModal();
        }
    }

    // Utilidades
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    showSuccess(message) {
        // Crear elemento de éxito temporal
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(successDiv, container.firstChild);
        
        // Auto-hide después de 3 segundos
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Inicializar la aplicación
let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
});