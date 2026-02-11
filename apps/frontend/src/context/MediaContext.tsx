import { createContext, useContext, useRef, useState } from "react";

type MediaContextType = {
  stream: MediaStream | null;
  setStream: (s: MediaStream) => void;
  micOn: boolean;
  setMicOn: (v: boolean) => void;
  cameraOn: boolean;
  setCameraOn: (v: boolean) => void;
};

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider = ({ children }: { children: React.ReactNode }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  return (
    <MediaContext.Provider
      value={{ stream, setStream, micOn, setMicOn, cameraOn, setCameraOn }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("useMedia must be used inside MediaProvider");
  return ctx;
};