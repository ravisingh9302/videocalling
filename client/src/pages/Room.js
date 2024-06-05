import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import peer from "../service/PeerService";
import { useSocket } from "../context/SocketProvider";
// import { FaMicrophoneSlash } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { BiSolidPhoneCall } from "react-icons/bi";
import { FaPhone } from "react-icons/fa6";
import { PiPhoneDisconnectFill } from "react-icons/pi";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa6";
import { FaMicrophoneSlash } from "react-icons/fa6";

const RoomPage = () => {
  const socket = useSocket();
  const navigate = useNavigate()
  const [remoteSocketId, setRemoteSocketId] = useState(false);
  const [callbtn, setCallbtn] = useState(false);
  const [incommingCallbtn, setIncommingcallbtn] = useState(false);
  const [myStream, setMyStream] = useState();
  const [micState, setmicState] = useState(true);
  const [videoState, setvideoState] = useState(true);
  const [remoteStream, setRemoteStream] = useState();

  

  // console.log(peer)
  // useEffect(() => {
  //   document.getElementById("myStream_player").srcObject=myStream
  // }, [myStream])

  // useEffect(() => {
  //   if (remoteSocketId) {

  //     handleCallUser()
  //   }
  // }, [remoteSocketId])

  let constraints = {
    video: {
      cursor: 'always' | 'motion' | 'never',
      displaySurface: 'application' | 'browser' | 'monitor' | 'window',
      width: { min: 640, ideal: 1920, max: 1920 },
      height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true
  }

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setCallbtn(true)
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: true,
    // });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    document.getElementById('myStream_player').srcObject = stream
  }, [remoteSocketId, socket]);

  // execute when user is online and other one is call
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      setIncommingcallbtn(true)
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      document.getElementById('myStream_player').srcObject = stream
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setIncommingcallbtn(false)
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    }, [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const callended = useCallback((e) => {
    console.log("channelclose")
    navigate('/')
    window.location.reload()
  }, []);


  let toggleMic = async () => {
    let audioTrack = myStream.getTracks().find(track => track.kind === 'audio')
    if (audioTrack.enabled) {
      audioTrack.enabled = false
      setmicState(false)
    } else {
      audioTrack.enabled = true
      setmicState(true)
    }
  }

  let toggleCamera = async () => {
    let videoTrack = myStream.getTracks().find(track => track.kind === 'video')

    if (videoTrack.enabled) {
      videoTrack.enabled = false
      setvideoState(false)
    } else {
      videoTrack.enabled = true
      setvideoState(true)
    }
  }


  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.channel.addEventListener("close", callended);
    return () => {
      peer.channel.removeEventListener("close", callended);
    };
  }, [callended]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);


  const leavechat = useCallback(() => {
    // myStream.getTracks().forEach((track) => track.stop());
    // remoteStream.getTracks().forEach((track) => track.stop());
    peer.peer.close()
    navigate('/')   
    window.location.reload()
    // peer.channel.close()
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const [remoteStream] = ev.streams;
      console.log("remote stream", remoteStream.getTracks())
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream);
      setCallbtn(false)
      document.getElementById('remoteStream_player').srcObject = remoteStream

    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="bg-black h-screen p-2">
      <div id="chat-page" className="h-full relative p-2">

        <div id="video-my" className="absolute top-2 left-2 z-10 ">
          {/* {myStream && ( */}
          <video style={{ objectFit: "cover" }} className=" rounded-md border-2 border-gray-600 shadow-lg w-[200px]" id="myStream_player" autoPlay playsInline></video>
          {/* )} */}
        </div>

        <div id="video-remote " className="absolute top-0 bottom-0 left-0 right-0 overflow-auto  bg-slate-300 ">
          {/* {remoteStream && ( */}
          <video style={{ width: "100%", height: "100%", objectFit: "cover" }} id="remoteStream_player" autoPlay playsInline></video>
          {/* )} */}
        </div>


        <div id="chat-control" className="[&>*]:border-gray-400 [&>*]:cursor-pointer bg-transparent absolute    left-0 right-0 mx-auto bottom-3  flex flex-row  gap-10 justify-center h-[80px] flex-grow text-center p-2">
          {/* {remoteSocketId ? <div className="p-3 text-center align-middle items-center justify-center flex  border rounded-full text-2xl h-14 w-14 object-cover overflow-hidden text-green-500"><GoDotFill /></div> : <div className="p-3 text-center align-middle items-center justify-center flex  border rounded-full text-2xl h-14 w-14 object-cover overflow-hidden text-red-600"><GoDotFill /></div>} */}
          {callbtn && <div className=" p-3 text-center align-middle items-center justify-center flex  border rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-green-500" onClick={handleCallUser}><FaPhone /></div>}
          {incommingCallbtn && <div className="p-3 text-center align-middle items-center justify-center flex  border rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-green-500 animate-[myping_1s_linear_infinite]" onClick={sendStreams}>< BiSolidPhoneCall/></div>}
          {videoState ? <div onClick={toggleCamera} className="p-3 text-center align-middle items-center justify-center flex  border  rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-slate-50"><  FaVideo /></div> : <div onClick={toggleCamera} className="p-3 text-center align-middle items-center justify-center flex  border  rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-slate-50"><  FaVideoSlash /></div>}
          {micState ? <div onClick={toggleMic} className="p-3 text-center align-middle items-center justify-center flex  border  rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-slate-50"><  FaMicrophone /></div> : <div onClick={toggleMic} className="p-3 text-center align-middle items-center justify-center flex  border  rounded-full text-2xl h-14 w-14 object-cover overflow-hidden bg-slate-50"><  FaMicrophoneSlash /></div>}
          <div className="p-3 text-center align-middle items-center justify-center flex  border rounded-full text-2xl h-14 w-14 object-cover overflow-hidden  bg-red-600" onClick={leavechat}><PiPhoneDisconnectFill /></div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
