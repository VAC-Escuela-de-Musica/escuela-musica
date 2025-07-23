import express from 'express';
import Role from '../core/models/role.model.js';
import User from '../core/models/user.model.js';

const router = express.Router();

// Ruta para crear usuario profesor (solo para desarrollo)
router.post('/create-profesor', async (req, res) => {
  try {
    // Verificar si el profesor ya existe
    const existingProfesor = await User.findOne({ email: 'profesor@email.com' });
    if (existingProfesor) {
      return res.status(400).json({ 
        message: 'El usuario profesor ya existe',
        user: {
          email: existingProfesor.email,
          roles: existingProfesor.roles
        }
      });
    }

    // Buscar o crear el rol profesor
    let profesorRole = await Role.findOne({ name: 'profesor' });
    if (!profesorRole) {
      profesorRole = new Role({ name: 'profesor' });
      await profesorRole.save();
      console.log('Rol profesor creado');
    }

    // Crear el usuario profesor
    const profesor = new User({
      username: 'profesor',
      email: 'profesor@email.com',
      rut: '87654321-0',
      password: await User.encryptPassword('profesor123'),
      roles: [profesorRole._id],
    });

    await profesor.save();
    
    const savedProfesor = await User.findById(profesor._id).populate('roles');
    
    res.status(201).json({
      message: 'Usuario profesor creado exitosamente',
      user: {
        email: savedProfesor.email,
        username: savedProfesor.username,
        roles: savedProfesor.roles.map(role => role.name)
      },
      credentials: {
        email: 'profesor@email.com',
        password: 'profesor123'
      }
    });

  } catch (error) {
    console.error('Error creando usuario profesor:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

// Ruta para listar todos los usuarios (solo para desarrollo)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('roles');
    res.json({
      message: 'Lista de usuarios',
      users: users.map(user => ({
        email: user.email,
        username: user.username,
        roles: user.roles.map(role => role.name)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

export default router;
