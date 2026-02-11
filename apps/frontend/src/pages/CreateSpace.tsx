import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MoveRight } from 'lucide-react'
import { toast } from 'react-toastify'
import defaultImg from "../assets/default.jpg"

const CreateSpace = () => {
    const [searchParams] = useSearchParams();
    const mapId = searchParams.get('mapId')
    const mapName = searchParams.get('name')
    const mapThumbnail = searchParams.get('thumbnail')
    const navigate = useNavigate();
    const [name, setName] = useState("")
    const [dimensions, setDimensions] = useState("")
    const isFormValid = name.trim() !== "" && dimensions.trim() !== "";
    const token = sessionStorage.getItem('token');

    async function handleSubmit(e: any) {
        e.preventDefault()
        try {
            let response;
            if (mapId == "null") {
                response = await fetch("http://localhost:3000/api/v1/space/", {
                    method: "POST",
                    body: JSON.stringify({
                        name: name,
                        dimensions: dimensions,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
            } else {
                response = await fetch("http://localhost:3000/api/v1/space/", {
                    method: "POST",
                    body: JSON.stringify({
                        name: name,
                        dimensions: dimensions,
                        mapId: mapId
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
            }
            const res = await response.json();
            if (res?.success) {
                toast("Space Created !!")
            }
            navigate(`/addelements/${res?.spaceId}`)
        } catch (error: any) {
            console.log(error.message)
        }
    }

    return (
        <div className="">
            <Navbar />

            <div className="flex justify-center py-20 px-6 min-h-[90vh] bg-gradient-to-b from-[#3E74E7] via-[#5A86F0] to-[#E9EEFA]">

                {/* Glass Card */}
                <div className="w-full max-w-5xl h-[52vh] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10">

                    <h1 className="text-4xl font-bold text-center text-[#0B2A2F] mb-10">
                        Create a New Space
                    </h1>

                    <div className="grid md:grid-cols-2 gap-16 items-center">

                        {/* Map Preview */}
                        <div className="flex flex-col items-center gap-4">
                            <img
                                className="w-80 h-52 object-cover rounded-2xl shadow-lg"
                                src={mapId == "null" ? defaultImg : mapThumbnail!}
                                alt=""
                            />
                            <p className="text-lg font-semibold text-gray-700">
                                {mapId == "null" ? "Blank Space" : mapName}
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-6"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">
                                    Space Name
                                </label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Enter space name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">
                                    Space Dimensions
                                </label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setDimensions(e.target.value)}
                                    type="text"
                                    placeholder="e.g. 1200 x 800"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-lg transition${isFormValid
                                            ? "bg-[#FED767] text-[#CC6933] hover:scale-105 cursor-pointer"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"}
  `}
                                >
                                    Next
                                    <MoveRight size={20} />
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateSpace
