const NotificationService = require("../services/notification_service");

const testPushNotification = async (request, response) => {
    try {
        const { fcm_token } = request.body;

        await NotificationService.sendNotification(
            fcm_token,
            "Hello from Fastify",
            "Push notification berhasil dikirim.",
            { route: "/" }
        );

        response.send({ status: 200, message: "Push notification sent successfully." });
    } catch (error) {
        response.code(500).send({ status: 500, message: error.message });
    }
};

module.exports = { testPushNotification };