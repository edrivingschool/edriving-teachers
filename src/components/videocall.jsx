import {
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { Box, Chip, IconButton, styled } from '@mui/material';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import { firestore } from '../firebase';

const VideoContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '#000',
  overflow: 'hidden'
});

const DraggablePreview = styled('video')({
  position: 'absolute',
  cursor: 'grab',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  zIndex: 10,
  transition: 'transform 0.15s',
  '&:active': {
    cursor: 'grabbing',
    transform: 'scale(1.03)'
  },
  '&:hover': {
    boxShadow: 3
  }
});

export default function VideoCall({ roomId, onClose, audioEnabled, videoEnabled }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const unsubRef = useRef(null);
  const localStreamRef = useRef(null);
  const signaledRef = useRef({ offer: false, answer: false });

  const [callStatus, setCallStatus] = useState('Connecting...');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Enhanced dragging handlers with touch support
  const startDragging = (clientX, clientY) => {
    isDragging.current = true;
    dragStartPos.current = {
      x: clientX - previewPosition.x,
      y: clientY - previewPosition.y
    };
  };

  const handleDrag = (clientX, clientY) => {
    if (!isDragging.current) return;
    const maxX = window.innerWidth - 160;
    const maxY = window.innerHeight - 120;
    
    setPreviewPosition({
      x: Math.max(0, Math.min(clientX - dragStartPos.current.x, maxX)),
      y: Math.max(0, Math.min(clientY - dragStartPos.current.y, maxY))
    });
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  // Fullscreen handling with event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      remoteVideoRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen();
    }
  };
  useEffect(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = audioEnabled);
    }
  }, [audioEnabled]);

  useEffect(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = videoEnabled);
    }
  }, [videoEnabled]);

  useEffect(() => {
    let isMounted = true;
    const onCloseRef = onClose;

    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.onloadedmetadata = () => 
            localVideoRef.current.play().catch(console.warn);
        }

        const roomDoc = doc(firestore, 'video_calls', roomId);
        const roomSnapshot = await getDoc(roomDoc);
        const isInitiator = !roomSnapshot.exists();

        const peer = new SimplePeer({
          initiator: isInitiator,
          trickle: false,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        peerRef.current = peer;

        peer.on('signal', async (data) => {
          if (data.type === 'offer') {
            await setDoc(roomDoc, { offer: JSON.stringify(data) });
          } else if (data.type === 'answer') {
            await updateDoc(roomDoc, { answer: JSON.stringify(data) });
          }
        });

        unsubRef.current = onSnapshot(roomDoc, (snap) => {
          if (snap.metadata.hasPendingWrites) return;
          const data = snap.data() || {};
          const p = peerRef.current;
          if (!p || p.destroyed) return;

          if (!isInitiator && data.offer && !signaledRef.current.offer) {
            signaledRef.current.offer = true;
            p.signal(JSON.parse(data.offer));
          }
          if (isInitiator && data.answer && !signaledRef.current.answer) {
            signaledRef.current.answer = true;
            p.signal(JSON.parse(data.answer));
          }
        });

        peer.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () =>
              remoteVideoRef.current.play().catch(console.warn);
            setCallStatus('Connected');
          }
        });

        peer.on('connect', () => setCallStatus('Connected'));
        peer.on('error', (err) => setCallStatus(`Error: ${err.message}`));

      } catch (err) {
        console.error('Call initialization failed:', err);
        onCloseRef();
      }
    };

    if (!peerRef.current) initializeCall();

    return () => {
      isMounted = false;
      peerRef.current?.destroy();
      unsubRef.current?.();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      document.exitFullscreen();
    };
  }, [roomId]);

  return (
    <VideoContainer>
      <Box
        component="video"
        ref={remoteVideoRef}
        autoPlay
        playsInline
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
          '&:fullscreen': { backgroundColor: 'black' }
        }}
        onDoubleClick={toggleFullscreen}
      />

      <DraggablePreview
        ref={localVideoRef}
        muted
        autoPlay
        playsInline
        style={{
          left: previewPosition.x,
          top: previewPosition.y,
          width: 160,
          height: 120
        }}
        onMouseDown={(e) => startDragging(e.clientX, e.clientY)}
        onTouchStart={(e) => startDragging(e.touches[0].clientX, e.touches[0].clientY)}
        onMouseMove={(e) => handleDrag(e.clientX, e.clientY)}
        onTouchMove={(e) => handleDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onMouseUp={stopDragging}
        onTouchEnd={stopDragging}
      />

      <Box sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        bgcolor: 'rgba(0,0,0,0.65)',
        p: 1.5,
        borderRadius: 4,
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        boxShadow: 3,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Chip
          label={callStatus}
          color={
            callStatus === 'Connected' ? 'success' : 
            callStatus?.startsWith('Error') ? 'error' : 'primary'
          }
          variant="filled"
          size="small"
          sx={{ fontWeight: 600, mr: 1 }}
        />

        <IconButton
          color="primary"
          onClick={toggleFullscreen}
          sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }}}
        >
          {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
        </IconButton>

      
      </Box>
    </VideoContainer>
  );
}