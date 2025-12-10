const testController = require("../controllers/testController");
const { authenticate, requireUser } = require("../middlewares/authMiddleware");

async function testRoutes(fastify, options) {
    fastify.post('/test/push-notification', testController.testPushNotification);
}

module.exports = testRoutes;