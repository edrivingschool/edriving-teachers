import {
  CallEnd,
  Close,
  Mic,
  MicOff,
  Minimize,
  OpenInFull,
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
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Modal
      open={!!roomId}
      onClose={isMinimized ? undefined : onClose}
      sx={{
        display: 'flex',
        alignItems: isMinimized ? 'flex-end' : 'center',
        justifyContent: isMinimized ? 'flex-end' : 'center',
        backdropFilter: 'blur(3px)'
      }}
    >
      <Box sx={{
        width: isMinimized ? 'auto' : '80vw',
        maxWidth: 1200,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 24,
        overflow: 'hidden',
        ...(isMinimized && {
          position: 'fixed',
          bottom: 16,
          right: 16,
          maxWidth: 300,
        })
      }}>
        {/* Full View */}
        <Box sx={{ display: isMinimized ? 'none' : 'block' }}>
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
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleMinimize} color="inherit">
                <Minimize />
              </IconButton>
              <IconButton onClick={onClose} color="inherit">
                <Close />
              </IconButton>
            </Stack>
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

        {/* Minimized View */}
        <Box sx={{
          display: isMinimized ? 'flex' : 'none',
          alignItems: 'center',
          p: 1,
          gap: 2,
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
          borderRadius: 2,
        }}>
          <Avatar sx={{ width: 24, height: 24 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2">
            Call with {chatPartner?.first_name}
          </Typography>
          <IconButton 
            onClick={handleMinimize} 
            color="inherit"
            size="small"
          >
            <OpenInFull fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            color="inherit"
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default VideoCallModal;