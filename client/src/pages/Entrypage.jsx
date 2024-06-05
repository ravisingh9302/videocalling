import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(

    (e) => {
      e.preventDefault();

      if (room.includes(' ')) {
        alert("Room ID must not contain space")
        return;
      }

      if (email !==null && room !==null) {
        socket.emit("room:join", { email, room });
      }
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );


  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (<>
    

    <div className="min-h-screen bg-black py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
        </div>
        <div className="relative px-4 py-10 bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">

          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Video calling</h1>
            </div>
            <div className="divide-y ">
              <div className="py-8 text-base leading-6 space-y-6 text-gray-700 sm:text-lg sm:leading-7">
                <div className="relative ">
                  <input autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} id="email" name="email" type="text" className="bg-gray-400 peer rounded-lg px-5 placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="John Doe" />
                  <label htmlFor="email" className="px-4 absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-6 peer-focus:text-gray-100 peer-focus:text-sm">Name</label>
                </div>
                <div className="relative ">
                  <input autoComplete="off" id="password" name="password" value={room} onChange={(e) => setRoom(e.target.value)} type="text" className=" peer  bg-gray-400 rounded-lg pl-4 placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Room Id" />
                  <label htmlFor="password" className="px-4 absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-6 peer-focus:text-gray-100 peer-focus:text-sm">Room Id</label>
                  <span className="text-red-400 text-xs">* Room Id shouldn't contain Space.</span>
                </div>
                <div className="relative">
                  <button className="bg-gray-950 text-white rounded-md px-2 py-1" onClick={handleSubmitForm}>Join/Create VideoCall</button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default LobbyScreen;
