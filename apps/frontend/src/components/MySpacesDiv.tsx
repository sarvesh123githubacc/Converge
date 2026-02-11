import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Ellipsis, Pencil } from 'lucide-react';
import defaultImg from "../assets/default.jpg"
import { toast } from 'react-toastify';

const MySpacesDiv = () => {
  const [mySpaces, setMySpaces] = useState([]);
  const [itemId, setItemId] = useState("");
  const [spaceDialogBoxOpen, setSpaceDialogBoxOpen] = useState(false);
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    async function getMySpaces() {
      const res = await fetch("http://localhost:3000/api/v1/space/all", {
        headers: {
          "authorization": `Bearer ${token}`
        }
      })
      const response = await res.json();
      const spaces = response?.spaces
      setMySpaces(spaces);
    }
    getMySpaces()
  }, [])
  const navigate = useNavigate()

  async function handleDelete (spaceId) {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/space/${spaceId}`, {
        method: 'DELETE',
        headers: {
          "authorization": `Bearer ${token}`
        }
      })
      const response = await res.json();
      if(res.status == 200){
        toast(`${response.message}`)
        const newSpaces = mySpaces.filter((item)=>
          item.id !== spaceId
        )
        setMySpaces(newSpaces)
      }

    } catch (error) {
      toast.error("Something went wrong while deleting a space")
      throw new Error("Something went wrong while deleting a space")
    }
  }
  return (
    <>
      {mySpaces.length > 0 ? (
        <div className="flex flex-wrap my-7 gap-x-5 gap-y-10 bg-[#F5F6FD] text-[#07482A] border-white rounded-lg h-60 min-w-6xl overflow-y-auto overflow-x-hidden mx-20 px-4 scrollbar-hide">

          {mySpaces.map((item) => (
            <div
              key={item?.id}
              className="relative w-52"
            >
              <img
                onClick={() => navigate(`/join/${item?.id}`)}
                src={item?.thumbnail || defaultImg}
                alt="Space thumbnail"
                className="w-full h-32 object-cover rounded-2xl cursor-pointer hover:shadow-2xl hover:opacity-90 transition"
              />

              <div className="flex items-center justify-between mt-2 px-1">
                <p className="font-semibold truncate">{item?.name}</p>

                <button
                  onClick={() => {
                    setSpaceDialogBoxOpen(!spaceDialogBoxOpen)
                    setItemId(item?.id)
                  }}
                  className="hover:opacity-70 transition"
                >
                  <Ellipsis />
                </button>
              </div>

              {(spaceDialogBoxOpen && itemId === item?.id) && (
                <div className="absolute right-0 top-[105%] z-20 bg-white border border-gray-200 rounded-xl shadow-xl w-36 overflow-hidden">

                  <button
                    onClick={() => navigate(`/addelements/${item.id}`)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <Pencil size={16} />
                    <span>Edit Map</span>
                  </button>

                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                    onClick={()=>{handleDelete(item.id)}}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-[80vw] py-16">
          <h1 className="text-[#0B2A2F] text-xl font-semibold mb-1">
            No spaces created yet 😕
          </h1>
          <p className="text-gray-600 text-center max-w-md">
            Refer to the section below and create customizable spaces to start your journey!
          </p>
        </div>
      )}
    </>

  )
}

export default MySpacesDiv
