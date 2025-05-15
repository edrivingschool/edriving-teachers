import {
  CallEnd,
  Close,
  Mic,
  MicOff,
  Person as PersonIcon,
  Videocam,
  VideocamOff
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Modal,
  Stack,
  Typography
} from '@mui/material';
import { useRef, useState } from 'react';
import VideoCall from './videocall';

const VideoCallModal = ({ 
  roomId, 
  onClose, 
  chatPartner,
  callStatus,
  setCallStatus,
  isCaller
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  return (
    <Modal
      open={!!roomId}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)'
      }}
    >
      <Box sx={{
        width: '80vw',
        maxWidth: 1200,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 24,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'primary.dark',
          color: 'primary.contrastText'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar>
              <PersonIcon />
            </Avatar>
            <Typography variant="h6">
              {chatPartner?.first_name} {chatPartner?.last_name}
            </Typography>
            <Chip 
              label={callStatus} 
              size="small"
              color={
                callStatus === 'connected' ? 'success' : 
                callStatus === 'failed' ? 'error' : 'default'
              }
            />
          </Stack>
          <IconButton onClick={onClose} color="inherit">
            <Close />
          </IconButton>
        </Box>

        {/* Video Area */}
        <Box sx={{
          position: 'relative',
          height: '60vh',
          bgcolor: 'black'
        }}>
          <VideoCall 
            roomId={roomId}
            onClose={onClose}
            chatPartner={chatPartner}
            callStatus={callStatus}
            setCallStatus={setCallStatus}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
          />

          {/* Local Video Preview */}
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 160,
            height: 120,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            bgcolor: 'black'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>

          {/* {callStatus !== 'connected' && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.7)'
            }}> */}
              {/* <CircularProgress color="inherit" /> */}
              {/* <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
                {isCaller ? 'Calling...' : 'Connecting...'}
              </Typography> */}
            {/* </Box> */}
          {/* )} */}
        </Box>

        {/* Controls */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'background.default'
        }}>
          <Stack direction="row" spacing={2}>
            <IconButton
              color={videoEnabled ? 'primary' : 'error'}
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>

            <IconButton
              color={audioEnabled ? 'primary' : 'error'}
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </IconButton>

            <IconButton
              color="error"
              onClick={onClose}
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <CallEnd fontSize="large" />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoCallModal;