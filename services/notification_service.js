const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const axios = require("axios");

class NotificationService {
    static projectId = process.env.FIREBASE_PROJECT_ID;
    static serviceAccountPath = path.join(__dirname, "../firebase-adminsdk.json");
    static scopes = ["https://www.googleapis.com/auth/firebase.messaging"];

    static async getAccessToken() {
    const auth = new GoogleAuth({
        keyFile: this.serviceAccountPath,
        scopes: this.scopes,
    });

    const client = await auth.getClient();
    const accessTokenObj = await client.getAccessToken();
    return accessTokenObj.token;
    }

    static async sendNotification(token, title, body, data = null) {
    const accessToken = await this.getAccessToken();

    const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;

    const payload = {
        message: {
            token,
            notification: {
                title,
                body,
            },
            android: {
                priority: "high",
                notification: {
                    channel_id: "default",
                    default_sound: true,
                },
            },
            apns: {
                headers: {
                    "apns-priority": "10"
                },
            },
        },
    };

    if (data) {
        payload.message.data = data;
    }

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; UTF-8",
    };

    const response = await axios.post(url, payload, { headers });
    return response.data;
    }
}

module.exports = NotificationService;
