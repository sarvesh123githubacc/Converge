import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";
import { useMedia } from "../context/MediaContext";

const CheckHairScreen = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // const [micOn, setMicOn] = useState(true);
  // const [cameraOn, setCameraOn] = useState(true);
  const { micOn, setMicOn, cameraOn, setCameraOn } = useMedia();


  const inviteLink = `${window.location.origin}/join/${spaceId}`;

  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        toast.error("Please allow camera and microphone access");
      }
    }

    initMedia();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast("Invite link copied");
  };

  return (
    <div className="min-h-screen  h-[90vh] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl rounded-2xl bg-black/30 backdrop-blur-xl p-8 text-white flex gap-8">

        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">
            Check Your Hair!
          </h1>
          <p className="text-white/70 mb-4">
            Get ready before entering the space
          </p>

          <div className="relative rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-[360px] object-cover"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full ${micOn ? "bg-white/20" : "bg-red-600"
                  }`}
              >
                {micOn ? <Mic /> : <MicOff />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${cameraOn ? "bg-white/20" : "bg-red-600"
                  }`}
              >
                {cameraOn ? <Video /> : <VideoOff />}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate(`/space/${spaceId}`)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Enter Space
            </button>

            <button
              onClick={() => navigate(-1)}
              className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="w-[320px] bg-black/40 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Invite Link</h3>

          <div className="bg-black/30 rounded-lg p-3 text-sm break-all">
            {inviteLink}
          </div>

          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
          >
            <Copy size={16} />
            Copy Link
          </button>

          <div className="mt-4 space-y-3 text-sm text-white/80">
            <div className="flex justify-between">
              <span>Camera</span>
              <span className={cameraOn ? "text-green-400" : "text-red-400"}>
                {cameraOn ? "On" : "Off"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Microphone</span>
              <span className={micOn ? "text-green-400" : "text-red-400"}>
                {micOn ? "On" : "Off"}
              </span>
            </div>

            <p className="text-xs text-white/60 mt-4">
              Tip: Find a quiet place and check your lighting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckHairScreen;








// import React, { useEffect, useRef, useState } from 'react'
// import { getUserMedia } from '../services/getCurrentUserMedia';

// const CheckHairScreen = () => {
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [cameraOn, setCameraOn] = useState<Boolean>(true);
//   const [micOn, setMicOn] = useState<Boolean>(true);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   async function getMedia() {
//     const stream = await window.navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true
//     })
//     if(videoRef.current){
//     videoRef.current.srcObject = stream
//   }
//     setLocalStream(stream)
//     return stream
//   }
//   useEffect(() => {
//     getMedia();
//   }, [])
//   return (
//     <div className='flex justify-start ml-40 items-center h-screen gap-10'>
//       <div className=''>
//         <video ref={videoRef} className='border-transparent rounded-2xl' autoPlay muted width={600} height={400}/>
//         <div>
//           <button></button>
//           <button></button>
//         </div>
//       </div>
//       <div>Details</div>
//     </div>
//   )
// }

// export default CheckHairScreen
