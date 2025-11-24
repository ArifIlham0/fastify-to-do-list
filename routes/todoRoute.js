const todoController = require("../controllers/todoController");
const { authenticate, requireUser } = require("../middlewares/authMiddleware");

async function todoRoutes(fastify, options) {
    fastify.get('/todo', { preHandler: [authenticate, requireUser] }, todoController.fetchTodos);
    fastify.get('/todo/:id', { preHandler: [authenticate, requireUser] }, todoController.fetchTodoById);
    fastify.post('/todo', { preHandler: [authenticate, requireUser] }, todoController.createTodo);
    fastify.put('/todo/:id', { preHandler: [authenticate, requireUser] }, todoController.updateTodo);
    fastify.delete('/todo', { preHandler: [authenticate, requireUser] }, todoController.deleteTodos);
}

module.exports = todoRoutes;