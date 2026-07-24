import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ActiveCallOverlay({
  callState,
  chatInfo,
  micEnabled,
  camEnabled,
  callDuration,
  localVideoRef,
  remoteVideoRef,
  onToggleMic,
  onToggleCam,
  onHangUp,
}) {
  return (
    <div className="active-call-overlay">
      {callState.isVideo ? (
        <div className="active-call-video-stage">
          <video ref={remoteVideoRef} className="active-call-remote-video" autoPlay playsInline />
          <div className="active-call-local-pip">
            <video ref={localVideoRef} className="active-call-local-video" autoPlay playsInline muted />
          </div>
        </div>
      ) : (
        <div className="active-call-audio-stage">
          <span className="active-call-avatar">
            {chatInfo.profileImage ? (
              <img
                src={chatInfo.profileImage}
                alt={chatInfo.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (chatInfo.username || "?").slice(0, 2).toUpperCase()
            )}
          </span>
          <p className="active-call-name">{chatInfo.username}</p>
          <p className="active-call-status">
            {callState.status === "calling" ? "Calling..." : formatDuration(callDuration)}
          </p>
          {/* Hidden audio-only local stream keeps getUserMedia() alive; no video element needed */}
          <video ref={localVideoRef} autoPlay playsInline muted style={{ display: "none" }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ display: "none" }} />
        </div>
      )}

      {callState.isVideo && callState.status === "connected" && (
        <p className="active-call-status" style={{ textAlign: "center", padding: "8px 0" }}>
          {formatDuration(callDuration)}
        </p>
      )}
      {callState.isVideo && callState.status === "calling" && (
        <p className="active-call-status" style={{ textAlign: "center", padding: "8px 0" }}>
          Calling {chatInfo.username}...
        </p>
      )}

      <div className="active-call-controls">
        <button
          className={`call-control-btn ${!micEnabled ? "off" : ""}`}
          onClick={onToggleMic}
          aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {callState.isVideo && (
          <button
            className={`call-control-btn ${!camEnabled ? "off" : ""}`}
            onClick={onToggleCam}
            aria-label={camEnabled ? "Turn camera off" : "Turn camera on"}
          >
            {camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        )}

        <button className="call-control-btn hangup" onClick={onHangUp} aria-label="End call">
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}