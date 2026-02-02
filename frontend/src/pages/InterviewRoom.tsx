import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import { servers } from "../servers/server";

const InterviewRoom = () => {
    const {roomId} = useParams();

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
 
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const camTrackRef = useRef<MediaStreamTrack | null>(null);
    const micTrackRef = useRef<MediaStreamTrack | null>(null);

    useEffect(()=>{
        if(!roomId) return;

        const start = async () => {
            const camStream = await navigator.mediaDevices.getUserMedia({video: true, audio: {echoCancellation: true, noiseSuppression: true}});

            camTrackRef.current = camStream.getVideoTracks()[0];
            micTrackRef.current = camStream.getAudioTracks()[0];

            if(localVideo.current){
                localVideo.current.srcObject = camStream;
            }

            const peer = new RTCPeerConnection(servers);
            peerRef.current = peer;

            camStream.getTracks().forEach((track)=> peer.addTrack(track, camStream));

            peer.ontrack = (event) => {
                if(remoteVideo.current){
                    remoteVideo.current.srcObject = event.streams[0];
                }
            };

            //ice candidates send
            peer.onicecandidate = (event) => {
                if(event.candidate){
                    // Send the candidate to the remote peer
                    socket.emit("ice-candidate",{ roomId, candidate: event.candidate });
                }
            };

            //join room
            socket.emit("join-room", { roomId, userId: socket.id });

            //offer receive
            socket.on("offer", handleOffer);

            //answer receive
            socket.on("answer", handleAnswer);

            //ICE receive
            socket.on("ice-candidate", handleIce);

            //create offer if first user
            socket.on("ready", createOffer);
        }

        start();
        return () => {
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIce);
            socket.off("ready", createOffer);
        }
    }, [roomId]);


    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const peer = peerRef.current!;  
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        await peerRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
        );
    };

    const handleIce = async (candidate: RTCIceCandidateInit) => {
        await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const createOffer = async () => {
        const peer = peerRef.current!;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
    };

    // 🖥️ START SCREEN SHARE
  const startScreenShare = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true, // system audio (Chrome)
    });

    const screenTrack = screenStream.getVideoTracks()[0];

    const sender = peerRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender) sender.replaceTrack(screenTrack);

    if (localVideo.current) localVideo.current.srcObject = screenStream;

    screenTrack.onended = stopScreenShare;
  };

  // 🔙 STOP SHARE
  const stopScreenShare = () => {
    if (!camTrackRef.current) return;

    const sender = peerRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender) sender.replaceTrack(camTrackRef.current);

    const camStream = new MediaStream([
      camTrackRef.current,
      micTrackRef.current!,
    ]);

    if (localVideo.current) localVideo.current.srcObject = camStream;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Room: {roomId}</h2>

      <video ref={localVideo} autoPlay muted width="300" />
      <video ref={remoteVideo} autoPlay width="500" />

      <div>
        <button onClick={startScreenShare}>Share Screen</button>
        <button onClick={stopScreenShare}>Stop Share</button>
      </div>
    </div>
  );
};

export default InterviewRoom;
