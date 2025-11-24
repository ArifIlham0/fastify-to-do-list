require('dotenv').config();
const fastify = require('fastify')({ trustProxy: true });

fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });

fastify.register(require('@fastify/cookie'), {
  secret: process.env.JWT_SECRET,
  parseOptions: {}
});

const userRoutes = require('./routes/userRoute');
const todoRoutes = require('./routes/todoRoute');

fastify.register(userRoutes, { prefix: '/api/v1/fastify' });
fastify.register(todoRoutes, { prefix: '/api/v1/fastify' });

const startServer = async () => {
    try {
        await fastify.listen({ port: process.env.PORT });
        console.log(`Server is running on port ${process.env.PORT}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

startServer();