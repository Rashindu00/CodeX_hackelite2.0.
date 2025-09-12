import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import {
  VideoCameraIcon,
  MicrophoneIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  CameraIcon,
  SpeakerWaveIcon,
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  VideoCameraSlashIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const VideoConsultation = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const videoRef = useRef(null);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // Mock upcoming appointments
  useEffect(() => {
    setUpcomingAppointments([
      {
        id: 1,
        provider: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        date: '2024-01-20',
        time: '10:00 AM',
        status: 'scheduled',
        meetingLink: 'video-call-room-123'
      },
      {
        id: 2,
        provider: 'Dr. Michael Chen',
        specialization: 'General Practice',
        date: '2024-01-22',
        time: '2:30 PM',
        status: 'scheduled',
        meetingLink: 'video-call-room-456'
      }
    ]);
  }, []);

  // Mock timer for call duration
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async (appointmentId) => {
    try {
      setConnectionStatus('connecting');
      
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isAudioOn
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate connection delay
      setTimeout(() => {
        setIsCallActive(true);
        setConnectionStatus('connected');
        setCallDuration(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('failed');
      alert('Failed to access camera or microphone. Please check your permissions.');
    }
  };

  const endCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    setIsCallActive(false);
    setConnectionStatus('disconnected');
    setCallDuration(0);
    setShowChat(false);
    setMessages([]);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    if (videoRef.current && videoRef.current.srcObject) {
      const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: user.name,
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  if (isCallActive) {
    return (
      <>
        <Helmet>
          <title>Video Consultation - MediConnect AI</title>
        </Helmet>
        
        <div className="fixed inset-0 bg-gray-900 z-50">
          {/* Call Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected</span>
                </div>
                <div className="text-sm">{formatDuration(callDuration)}</div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold">Dr. Sarah Johnson</h3>
                <p className="text-sm text-gray-300">Cardiology</p>
              </div>
              <button
                onClick={endCall}
                className="text-red-400 hover:text-red-300"
              >
                <PhoneXMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="h-full flex">
            {/* Main Video Area */}
            <div className="flex-1 relative">
              {/* Remote Video (Doctor) */}
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="h-32 w-32 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-16 w-16" />
                  </div>
                  <h3 className="text-xl font-semibold">Dr. Sarah Johnson</h3>
                  <p className="text-gray-300">Video is off</p>
                </div>
              </div>

              {/* Local Video (Self) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <UserIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">Video off</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Chat</h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="font-medium text-gray-900">{msg.sender}</div>
                      <div className="text-gray-600">{msg.message}</div>
                      <div className="text-xs text-gray-400">{msg.timestamp}</div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isVideoOn ? (
                  <VideoCameraIcon className="h-6 w-6" />
                ) : (
                  <VideoCameraSlashIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors ${
                  isAudioOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAudioOn ? (
                  <MicrophoneIcon className="h-6 w-6" />
                ) : (
                  <div className="relative">
                    <MicrophoneIcon className="h-6 w-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-white rotate-45"></div>
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full transition-colors ${
                  isSpeakerOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                }`}
              >
                {isSpeakerOn ? (
                  <SpeakerWaveIcon className="h-6 w-6" />
                ) : (
                  <SpeakerXMarkIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-4 rounded-full transition-colors ${
                  showChat 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </button>

              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <PhoneXMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Video Consultation - MediConnect AI</title>
        <meta name="description" content="Join video consultations with healthcare providers" />
      </Helmet>

      <DashboardLayout>
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/patient')}
                className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <VideoCameraIcon className="h-8 w-8 mr-3 text-teal-600" />
                Video Consultation
              </h1>
              <p className="mt-2 text-gray-600">
                Connect with your healthcare providers through secure video calls
              </p>
            </div>

            {/* Connection Status */}
            {connectionStatus === 'connecting' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <span className="text-yellow-800">Connecting to video call...</span>
                </div>
              </div>
            )}

            {connectionStatus === 'failed' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <PhoneXMarkIcon className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-red-800">Failed to connect. Please check your camera and microphone permissions.</span>
                </div>
              </div>
            )}

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Video Consultations</h2>
                
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <UserIcon className="h-6 w-6 text-gray-400 mr-3" />
                              <div>
                                <h3 className="font-semibold text-gray-900">{appointment.provider}</h3>
                                <p className="text-sm text-gray-600">{appointment.specialization}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {appointment.date} at {appointment.time}
                              </div>
                              <div className="flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600" />
                                {appointment.status}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startCall(appointment.id)}
                              disabled={connectionStatus === 'connecting'}
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex items-center"
                            >
                              <VideoCameraIcon className="h-4 w-4 mr-2" />
                              Join Call
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Video Consultations</h3>
                    <p className="text-gray-600 mb-4">You don't have any scheduled video consultations at the moment.</p>
                    <button
                      onClick={() => navigate('/patient/appointment-booking')}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Requirements</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Technical Requirements</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Stable internet connection (minimum 1 Mbps)</li>
                      <li>• Camera and microphone access</li>
                      <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                      <li>• Speakers or headphones</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Privacy & Security</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• End-to-end encrypted video calls</li>
                      <li>• HIPAA compliant platform</li>
                      <li>• No call recordings stored</li>
                      <li>• Secure patient data protection</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <CameraIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Before your consultation:</strong> Test your camera and microphone, ensure you're in a quiet, well-lit space, 
                      and have your insurance information and current medications list ready.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default VideoConsultation;
