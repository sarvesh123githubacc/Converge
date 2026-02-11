
export async function getUserMedia() {
    const stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })
    const videoTracks = stream.getVideoTracks()[0];
    const audioTracks = stream.getAudioTracks()[0];
    return {
        localVideoTrack :videoTracks,
        localAudioTrack :audioTracks
    }
}
