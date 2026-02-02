export const servers: RTCConfiguration = {
    iceServers:[
        {urls: "stun:stun.l.google.com:19302"},
        {
            urls: "turn:turn.example.com:3478",
            username: "user",
            credential: "pass"
        }
    ]
};