import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import defaultImg from "../assets/default.jpg"
import { HTTP_URL } from '../config';

const MapChooseBox = () => {
  const [maps, setMaps] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    async function handleMaps() {
      const res = await fetch(`${HTTP_URL}/api/v1/maps`, {
        headers: {
          "authorization": `Bearer ${token}`
        }
      });

      const response = await res.json();
      setMaps(response.maps);
    }
    handleMaps();
  }, []);

  return (
    <div className="border-transparent flex flex-col gap-3 rounded-lg h-60 min-w-6xl mx-20">

      <h1 className="text-[#07482A] text-xl font-semibold ml-1">
        Choose an existing map
      </h1>

      <div
        className="
          flex
          gap-6
          bg-[#F5F6FD]
          border-white
          rounded-xl
          h-full
          overflow-x-auto
          overflow-y-hidden
          px-4
          py-4
          scrollbar-hide
        "
      >
        {maps.map((item: any) => (
          <div
            key={item?.id}
            onClick={() => {
              navigate(
                `/createspace?mapId=${item?.id}&name=${item?.name}&thumbnail=${item?.thumbnail}`
              );
            }}
            className="
              flex-shrink-0
              w-52
              cursor-pointer
              transition
              hover:scale-105
            "
          >
            <img
              // src={item?.thumbnail}
              src={defaultImg}
              alt=""
              className="
                w-full
                h-32
                object-cover
                rounded-2xl
                shadow-md
                hover:shadow-2xl
                transition
              "
            />
            <p className="mt-2 text-center font-semibold text-[#07482A]">
              {item?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MapChooseBox
