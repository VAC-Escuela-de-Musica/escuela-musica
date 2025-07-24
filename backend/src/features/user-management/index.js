/**
 * User Management Feature Index
 * Centraliza todas las exportaciones del módulo de gestión de usuarios
 */

// Controladores
import userController from './controllers/user.controller.js'
import roleController from './controllers/role.controller.js'

// Servicios
import userService from './services/user.service.js'

// Rutas
import userRoutes from './routes/user.routes.js'
import roleRoutes from './routes/role.routes.js'

// Exportaciones por defecto
export default {
  controllers: {
    user: userController,
    role: roleController
  },
  services: {
    user: userService
  },
  routes: {
    user: userRoutes,
    role: roleRoutes
  }
}

// Exportaciones nombradas para importación individual
export const controllers = {
  userController,
  roleController
}

export const services = {
  userService
}

export const routes = {
  userRoutes,
  roleRoutes
}

// Exportaciones directas para compatibilidad
export { userController, roleController }
export { userService }
export { userRoutes, roleRoutes }
