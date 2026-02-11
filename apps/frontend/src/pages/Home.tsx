


import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import MySpacesDiv from '../components/MySpacesDiv'
import MapChooseBox from '../components/MapChooseBox'
import { Hammer } from 'lucide-react'
import { toast } from 'react-toastify'
import Footer from '../components/Footer'
import type { Avatar } from '../types'

const Home = () => {
  const token = sessionStorage.getItem("token");
  const { username } = useParams()
  const navigate = useNavigate()
  const userId = sessionStorage.getItem("userId");
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [avatars, setAvatars] = useState<Array<Avatar>>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  async function getUserAvatar() {
    const userRes = await fetch(`http://localhost:3000/api/v1/user/metadata/bulk?ids=[${userId}]`);
    const userResponse = await userRes.json();
    const avatarRes = userResponse?.avatars[0];
    setAvatar(avatarRes);
  }
  useEffect(() => {
    getUserAvatar()
  }, [userId])
  async function getAllAvatars() {
    const res = await fetch('http://localhost:3000/api/v1/avatars');
    const userResponse = await res.json();
    const resAvatars = userResponse?.avatars;
    setAvatars(resAvatars)
  }
  useEffect(() => {
    getAllAvatars()
  }, [userId])

  async function updateUserAvatar() {
    try {
      const res = await fetch('http://localhost:3000/api/v1/user/metadata', {
        method: "POST",
        body: JSON.stringify({
          avatarId: selectedAvatar?.id
        }),
        headers: {
          "authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const response = await res.json();
      if (res.status == 200) {
        setAvatar(selectedAvatar);
        setSelectedAvatar(null);
        toast(response.message);
      }
    } catch (error) {
      throw new Error("Error in updating metadata");
    }
  }

  return (
    <div className="bg-[#C4C6D4] min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-b from-[#3E74E7] to-[#2B5EDC] shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-4">
          <img
            className="w-20 h-20"
            src={avatar?.imageUrl}
            alt="User Avatar"
          />
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Welcome, {username} 👋
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">

        <section>
          <h2 className="font-bold text-3xl tracking-tight mb-4 text-[#0B2A2F]">
            My Spaces
          </h2>

          <div className="bg-[#F5F6FD] rounded-xl shadow-lg min-h-[40vh] flex items-center justify-center">
            <MySpacesDiv />
          </div>
        </section>

        <section>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="font-bold text-3xl tracking-tight text-[#0B2A2F]">
              Create a New Space
            </h2>

            <button
              onClick={() => navigate('/createspace?mapId=null')}
              className="bg-blue-500 text-white font-semibold px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-blue-600 hover:shadow-lg transition"
            >
              <Hammer size={20} />
              Start from scratch
            </button>
          </div>

          <div className="bg-[#F5F6FD] rounded-xl shadow-lg min-h-[40vh] flex items-center justify-center">
            <MapChooseBox />
          </div>
        </section>

        <section>
          <h2 className="text-[#0B2A2F] font-bold text-3xl tracking-tight mb-4">
            {avatar?.imageUrl ? "Change Your Avatar" : "Choose Your Avatar"}
          </h2>

          <div className="bg-[#F4F7FD] rounded-xl shadow-lg p-6 min-h-[45vh]">
            <div className="flex flex-col lg:flex-row gap-10 justify-between">

              {avatar?.imageUrl && (
                <div className="flex flex-col items-center">
                  <img
                    src={avatar.imageUrl}
                    className="w-52 rounded-xl shadow-md"
                    alt="Current Avatar"
                  />
                  <h3 className="font-semibold mt-2">
                    {avatar?.name} (You)
                  </h3>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-[#0B2A2F] font-semibold text-2xl tracking-tight mb-4">
                  Available Avatars
                </h3>

                <div className="flex gap-4 overflow-x-auto pb-2">
                  {avatars
                    .filter(e => !avatar?.id || e.id !== avatar.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAvatar(item)}
                        className={`
                        flex flex-col items-center p-3 rounded-xl cursor-pointer transition
                        ${selectedAvatar?.id === item.id
                            ? "border-4 border-black shadow-xl bg-white"
                            : "hover:border-2 hover:border-[#4E6EC7] hover:shadow-lg bg-white"}
                      `}
                      >
                        <img className="w-24" src={item.imageUrl} alt={item.name} />
                        <h3 className="font-semibold mt-1">{item.name}</h3>
                      </div>
                    ))}
                </div>

                {selectedAvatar && (
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={updateUserAvatar}
                      className="bg-[#55D995] px-5 py-2 text-[#07482A] text-lg rounded-full font-semibold hover:shadow-lg transition"
                    >
                      Set Avatar
                    </button>
                    <button
                      onClick={() => setSelectedAvatar(null)}
                      className="px-5 py-2 text-[#07482A] text-lg font-semibold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );

}

export default Home

