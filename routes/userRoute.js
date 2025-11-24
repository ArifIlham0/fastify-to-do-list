const userController = require("../controllers/userController");
const { authenticate, requireUser, requireAdmin } = require("../middlewares/authMiddleware");

async function userRoutes(fastify, options) {
    fastify.get('/user', { preHandler: [authenticate, requireAdmin] }, userController.fetchUsers);
    fastify.get('/user/:id', { preHandler: [authenticate, requireUser] }, userController.fetchUserById);
    fastify.post('/user', userController.createUser);
    fastify.put('/user/:id', { preHandler: [authenticate, requireUser] }, userController.updateUser);
    fastify.delete('/user', { preHandler: [authenticate, requireAdmin] }, userController.deleteUsers);
    fastify.post('/user/login', userController.login);
    fastify.post('/user/refresh-token', userController.refreshToken);
    fastify.post('/user/logout', { preHandler: [authenticate, requireUser] }, userController.logout);
}

module.exports = userRoutes;