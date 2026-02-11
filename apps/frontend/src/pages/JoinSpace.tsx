import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2 } from "lucide-react";

const JoinSpace = () => {
  const [spaceLink, setSpaceLink] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!spaceLink.trim()) return;

    try {
      const url = new URL(spaceLink);
      const spaceId = url.pathname.split("/").pop();

      if (!spaceId) return;

      navigate(`/join/${spaceId}`);
    } catch {
      console.error("Invalid URL");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-800/90 backdrop-blur-xl shadow-2xl p-8 border border-white/10">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-white">
            Join a Space
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Paste the space link to enter
          </p>
        </div>

        <div className="relative mb-6">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="https://app.yourdomain.com/space/abc123"
            value={spaceLink}
            onChange={(e) => setSpaceLink(e.target.value)}
            className="
              w-full pl-12 pr-4 py-3 rounded-xl
              bg-gray-900 text-white
              placeholder-gray-500
              border border-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={!spaceLink.trim()}
          className="
            w-full py-3 rounded-xl
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Enter Space
        </button>

        {/* Footer hint */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You’ll be able to check your camera and mic before joining
        </p>
      </div>
    </div>
  );
};

export default JoinSpace;

