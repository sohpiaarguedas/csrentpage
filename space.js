// script.js
class SpaceManager {
    constructor() {
        this.baseUrl = 'http://localhost:8080/space';
        this.currentEditId = null;
        this.deleteId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSpaces();
    }

    initializeElements() {
        // Formulario
        this.form = document.getElementById('space-form');
        this.formTitle = document.getElementById('form-title');
        this.submitBtn = document.getElementById('submit-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        
        // Campos del formulario
        this.idField = document.getElementById('space-id');
        this.nameField = document.getElementById('space-name');
        this.typeField = document.getElementById('space-type');
        this.capacityField = document.getElementById('space-capacity');
        
        // Contenedores y controles
        this.spacesContainer = document.getElementById('spaces-container');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.searchIdField = document.getElementById('search-id');
        this.searchBtn = document.getElementById('search-btn');
        this.clearSearchBtn = document.getElementById('clear-search-btn');
        
        // Modal
        this.modal = document.getElementById('confirm-modal');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.resetForm());
        this.refreshBtn.addEventListener('click', () => this.loadSpaces());
        
        // Búsqueda
        this.searchBtn.addEventListener('click', () => this.searchSpaceById());
        this.clearSearchBtn.addEventListener('click', () => this.loadSpaces());
        this.searchIdField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchSpaceById();
            }
        });
        
        // Modal events
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const spaceData = {
            name: this.nameField.value.trim(),
            type: this.typeField.value.trim(),
            capacity: parseInt(this.capacityField.value)
        };

        try {
            if (this.currentEditId) {
                await this.updateSpace(this.currentEditId, spaceData);
            } else {
                await this.createSpace(spaceData);
            }
        } catch (error) {
            this.showError('Error al procesar la solicitud: ' + error.message);
        }
    }

    async createSpace(spaceData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(spaceData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const createdSpace = await response.json();
            this.showSuccess('Espacio creado exitosamente');
            this.resetForm();
            this.loadSpaces();
        } catch (error) {
            console.error('Error creating space:', error);
            throw error;
        }
    }

    async updateSpace(id, spaceData) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id, ...spaceData })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const updatedSpace = await response.json();
            this.showSuccess('Espacio actualizado exitosamente');
            this.resetForm();
            this.loadSpaces();
        } catch (error) {
            console.error('Error updating space:', error);
            throw error;
        }
    }

    async searchSpaceById() {
        const searchId = this.searchIdField.value.trim();
        
        if (!searchId) {
            this.showError('Por favor ingresa un ID para buscar');
            return;
        }

        try {
            this.spacesContainer.innerHTML = '<div class="loading">Buscando espacio...</div>';
            
            const response = await fetch(`${this.baseUrl}/${searchId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No se encontró un espacio con ese ID');
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }

            const space = await response.json();
            this.displaySpaces([space]);
            this.showSuccess(`Espacio encontrado: ${space.name}`);
        } catch (error) {
            console.error('Error searching space:', error);
            this.spacesContainer.innerHTML = `
                <div class="error">
                    ${error.message}
                </div>
            `;
        }
    }

    async loadSpaces() {
        try {
            this.spacesContainer.innerHTML = '<div class="loading">Cargando espacios...</div>';
            
            // Limpiar campo de búsqueda
            this.searchIdField.value = '';
            
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const spaces = await response.json();
            this.displaySpaces(spaces);
        } catch (error) {
            console.error('Error loading spaces:', error);
            this.spacesContainer.innerHTML = `
                <div class="error">
                    Error al cargar espacios: ${error.message}
                </div>
            `;
        }
    }

    displaySpaces(spaces) {
        if (!Array.isArray(spaces) || spaces.length === 0) {
            this.spacesContainer.innerHTML = `
                <div class="loading">No hay espacios disponibles</div>
            `;
            return;
        }

        const spacesHtml = spaces.map(space => this.createSpaceCard(space)).join('');
        this.spacesContainer.innerHTML = spacesHtml;
    }

    createSpaceCard(space) {
        return `
            <div class="space-card" data-id="${space.id}">
                <div class="space-header">
                    <div class="space-info">
                        <h3>${this.escapeHtml(space.name)} <span style="color: #95a5a6; font-size: 0.8em;">(ID: ${space.id})</span></h3>
                        <div class="space-details">
                            <span class="space-type">${this.escapeHtml(space.type)}</span>
                        </div>
                    </div>
                </div>
                <div class="space-capacity">
                    Capacidad: ${space.capacity} personas
                </div>
                <div class="space-actions">
                    <button class="edit-btn" onclick="spaceManager.editSpace(${space.id})">
                        Editar
                    </button>
                    <button class="delete-btn" onclick="spaceManager.showDeleteModal(${space.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    async editSpace(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const space = await response.json();
            this.populateForm(space);
        } catch (error) {
            console.error('Error loading space for edit:', error);
            this.showError('Error al cargar el espacio para editar: ' + error.message);
        }
    }

    populateForm(space) {
        this.currentEditId = space.id;
        this.idField.value = space.id;
        this.nameField.value = space.name;
        this.typeField.value = space.type;
        this.capacityField.value = space.capacity;
        
        this.formTitle.textContent = 'Editar Espacio';
        this.submitBtn.textContent = 'Actualizar Espacio';
        this.cancelBtn.style.display = 'inline-block';
        
        // Scroll al formulario
        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    resetForm() {
        this.currentEditId = null;
        this.form.reset();
        this.idField.value = '';
        
        this.formTitle.textContent = 'Agregar Nuevo Espacio';
        this.submitBtn.textContent = 'Agregar Espacio';
        this.cancelBtn.style.display = 'none';
    }

    showDeleteModal(id) {
        this.deleteId = id;
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.deleteId = null;
    }

    async confirmDelete() {
        if (!this.deleteId) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/${this.deleteId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            this.showSuccess('Espacio eliminado exitosamente');
            this.closeModal();
            this.loadSpaces();
            
            // Si estamos editando el espacio que se eliminó, resetear el formulario
            if (this.currentEditId === this.deleteId) {
                this.resetForm();
            }
        } catch (error) {
            console.error('Error deleting space:', error);
            this.showError('Error al eliminar el espacio: ' + error.message);
            this.closeModal();
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remover mensajes anteriores
        const existingMessages = document.querySelectorAll('.success, .error');
        existingMessages.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        // Insertar después del header
        const header = document.querySelector('header');
        header.insertAdjacentElement('afterend', messageDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inicializar la aplicación cuando se carga la página
let spaceManager;

document.addEventListener('DOMContentLoaded', () => {
    spaceManager = new SpaceManager();
});

// Manejar errores globales
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (spaceManager) {
        spaceManager.showError('Error inesperado en la aplicación');
    }
});