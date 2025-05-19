import {
  Check,
  Close,
  DarkMode as DarkModeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
  LightMode as LightModeIcon,
  Message as MessageIcon,
  Numbers,
  Person as PersonIcon,
  School as SchoolIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  styled
} from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { firestore } from '../../firebase';
// Add missing import at the top of Dashboard.jsx
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import VideoCallModal from '../videoCallModal';

const instance = axios.create({
  baseURL: 'https://driving-backend-stmb.onrender.com',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

const drawerWidth = 240;

const Sidebar = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    borderRight: `1px solid ${theme.palette.divider}`
  }
}));

const NavItem = styled(ListItemButton)(({ theme, selected }) => ({
  margin: '4px 8px',
  borderRadius: 4,
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: selected
      ? theme.palette.action.selected
      : theme.palette.action.hover
  }
}));

const MainContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  marginLeft: drawerWidth,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [themeMode, setThemeMode] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) setThemeMode(savedTheme);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await instance.get('/api/assignments/students');
        setStudents(response.data.students);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchStudents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
    <CssBaseline />
    <Box sx={{ display: 'flex' }}>
      <Sidebar variant="permanent" anchor="left">
          <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SchoolIcon />
            </Avatar>
          </Toolbar>
          <Divider />
          <List>
            <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
              My Students
            </Typography>
            {students.map(student => (
              <NavItem
                key={student.id}
                selected={selectedStudent?.id === student.id}
                onClick={() => setSelectedStudent(student)}
              >
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText
                  primary={`${student.first_name} ${student.last_name}`}
                  secondary={student.email}
                />
              </NavItem>
            ))}
          </List>
          <Divider />
          <List>
            <NavItem onClick={toggleTheme}>
              <ListItemIcon>
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText primary={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'} />
            </NavItem>
            <NavItem onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </NavItem>
          </List>
        </Sidebar>

        <MainContainer>
          <AppBar
            position="fixed"
            color="inherit"
            elevation={1}
            sx={{ ml: drawerWidth, width: `calc(100% - ${drawerWidth}px)` }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {selectedStudent ? `Teacher's Dashboard` : 'Teacher Dashboard'}
              </Typography>
            </Toolbar>
          </AppBar>


          <Box component="main" sx={{ mt: 8, flexGrow: 1, p: 3 }}>
            {selectedStudent ? (
             <Grid container spacing={3} sx={{ height: '100%', alignItems: 'flex-start' }}>
  <Grid item xs={12} md={7} sx={{ height: '88vh',width:'50%' }}>
    <MessagesSection
      studentId={selectedStudent.id}
      studentName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
    />
  </Grid>

  <Grid item xs={12} md={5} sx={{ 
    position: 'sticky',
    top: 80,
    height: '88vh',
    width: '40%',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }}>
    <Box sx={{
      flex: 1,
      overflowY: 'auto',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      p: 1
    }}>
      <CreativeProgress studentId={selectedStudent.id} />
    </Box>
    
    <Box sx={{
      flex: 1,
      overflowY: 'auto',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      p: 1
    }}>
      <QuizResults studentId={selectedStudent.id} />
    </Box>
  </Grid>
</Grid>

            ) : (
              <Typography variant="h6" color="textSecondary">
                Welcome! Select a student to view details
              </Typography>
            )}
          </Box>
        </MainContainer>
      </Box>
    </ThemeProvider>
  );
};


const MessagesSection = ({ studentId, studentName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [callStatus, setCallStatus] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const ringAudioRef = useRef(null);

  const [callDirection, setCallDirection] = useState(null); // 'outgoing', 'incoming'
  const [incoming, setIncoming] = useState(false);
const chatPartner = { 
  id: studentId,
  first_name: studentName?.split(' ')[0] || '',
  last_name: studentName?.split(' ').slice(1).join(' ') || ''
};

useEffect(() => {
  if (typeof Audio !== 'undefined') {
    try {
      ringAudioRef.current = new Audio("/ringtone.mp3");
      ringAudioRef.current.preload = 'auto';
      
      ringAudioRef.current.addEventListener('error', (e) => {
        console.error('Audio loading failed:', e);
        // Fallback to browser notification
        if (Notification.permission === 'granted') {
          new Notification('Incoming call!');
        }
      });
    } catch (err) {
      console.error('Audio initialization error:', err);
    }
  }
}, []);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setTeacherId(payload.teacherId || payload.userId);
    }
  }, []);

  const handleStartCall = () => {
    const myId = teacherId;
    const otherId = studentId;
    console.log('ids'+ myId + ' ' + otherId);
    const generatedRoomId = [myId, otherId].sort().join('_');
    setRoomId(generatedRoomId);
    setIsCalling(true);
    setCallDirection('outgoing');
    setCallStatus('connecting');
  };

  const handleEndCall = async () => {
    try {
      if (roomId) {
        await deleteDoc(doc(firestore, "video_calls", roomId));
      }
    } catch (err) {
      console.error("Error cleaning up call document:", err);
    }
    setIsCalling(false);
    setRoomId(null);
    setCallStatus(null);
    setCallDirection(null);
  };
  useEffect(() => {
    return () => {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, []);
  useEffect(() => {
    if (!teacherId || !studentId || isCalling) return;
  
    const newRoom = [teacherId, studentId].sort().join('_');
    const roomDoc = doc(firestore, "video_calls", newRoom);
    
    const unsub = onSnapshot(roomDoc, (snap) => {
      const data = snap.data() || {};
      if (data.offer && !snap.metadata.hasPendingWrites) {
        setIncoming(true);
        if (ringAudioRef.current) {
          ringAudioRef.current.play();
        }
      }
    });
  
    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
      }
      unsub();
    };
  }, [teacherId, studentId, isCalling]);
  
  const acceptCall = () => {
    ringAudioRef.current.pause();
    ringAudioRef.current.currentTime = 0;
    setRoomId([teacherId, studentId].sort().join('_'));
    setIsCalling(true);
    setIncoming(false);
    setCallDirection('incoming');
    setCallStatus('connecting');
  };

    const handleMessageClick = (msg) => {
      if (msg.sent_by === 'teacher') {
        setSelectedMessage(msg.id);
        setEditingMessage(msg.content);
      }
    };
  
    const handleEditMessage = async () => {
      if (!editingMessage.trim()) return;
      
      try {
        await instance.put(`/api/message/edit/${selectedMessage}`, {
          content: editingMessage
        });
        
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage ? {...msg, content: editingMessage} : msg
        ));
        setIsEditing(false);
        setSelectedMessage(null);
      } catch (err) {
        console.error('Failed to edit message:', err);
      }
    };
  
    const handleDeleteMessage = async () => {
      try {
        await instance.delete(`/api/message/delete/${selectedMessage}`);
        setMessages(prev => prev.filter(msg => msg.id !== selectedMessage));
        setSelectedMessage(null);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    };
   
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setTeacherId(payload.teacherId || payload.userId);
        }
    }, []);
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]); // Add messages as dependency here
    useEffect(() => {
        if (!teacherId || !studentId) return;

        if (socketRef.current) socketRef.current.disconnect();

        const newSocket = io('https://driving-backend-stmb.onrender.com', {
            query: { userId: teacherId },
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('Connected. Room:', `user_${teacherId}`);
        });

        newSocket.on('new_message', (message) => {
            const isCurrent = 
                parseInt(message.student_id) === parseInt(studentId) &&
                parseInt(message.teacher_id) === parseInt(teacherId);
            if (isCurrent) {
                setMessages(prev => [...prev, message]);
            }
        });
        newSocket.on('message_deleted', (messageId) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        });
        socketRef.current = newSocket;
        

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [teacherId, studentId]);
    
    
   
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


   
    const fetchMessages = async () => {
        try {
            const res = await instance.get(`/api/message?studentId=${studentId}`);
            setMessages(res.data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };
  

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        
        try {
            const response = await instance.post('/api/message/create', {
                studentId: studentId,
                content: newMessage,
                type: 'text'
            });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (studentId) fetchMessages();
    }, [studentId]);
    return (
      <>
         <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ 
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" display="flex" alignItems="center">
                <MessageIcon sx={{ mr: 1 }} />
                Messages with {studentName}
              </Typography>
              <Button
  variant="contained"
  color="primary"
  startIcon={<VideoCallIcon />}
  onClick={handleStartCall}
  disabled={isCalling || incoming}
>
  {isCalling ? 'Connecting...' : 'Start Video Call'}
</Button>
            </Box>
      
              <Box
                ref={containerRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  px: 2,
                  py: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
               {/* Update the message rendering part */}
{messages.map((msg) => (
  <Box
    key={msg.id}
    onClick={() => handleMessageClick(msg)}
    sx={{
      alignSelf: msg.sent_by === 'teacher' ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
      minWidth: '120px',
      position: 'relative',
      cursor: msg.sent_by === 'teacher' ? 'pointer' : 'default',
      '&:hover': {
        '& .message-actions': {
          opacity: msg.sent_by === 'teacher' ? 1 : 0
        }
      }
    }}
  >
    {/* Message actions */}
    {selectedMessage === msg.id && (
      <Box className="message-actions" 
        sx={{
          position: 'absolute',
          top: -28,
          right: 0,
          display: 'flex',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 0.5,
          boxShadow: 1
        }}>
        <IconButton size="small" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDeleteMessage}>
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>
    )}

    {/* Message content */}
    {isEditing && selectedMessage === msg.id ? (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          value={editingMessage}
          onChange={(e) => setEditingMessage(e.target.value)}
          size="small"
          fullWidth
          autoFocus
        />
        <IconButton onClick={handleEditMessage}>
          <Check color="success" />
        </IconButton>
        <IconButton onClick={() => {
          setIsEditing(false);
          setSelectedMessage(null);
        }}>
          <Close color="error" />
        </IconButton>
      </Box>
    ) : (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 4,
          bgcolor: msg.sent_by === 'teacher' 
            ? 'primary.main' 
            : 'background.default',
          color: msg.sent_by === 'teacher' 
            ? 'primary.contrastText' 
            : 'text.primary',
          boxShadow: 2,
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {msg.sent_by === 'teacher' ? 'You' : studentName}
        </Typography>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {msg.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'right',
            opacity: 0.6,
          }}
        >
          {new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Africa/Addis_Ababa',
          })}
        </Typography>
      </Box>
    )}
  </Box>
))}
<div ref={messagesEndRef} />
              </Box>
              <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              disabled={sending}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? <CircularProgress size={24} /> : 'Send'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    {isCalling && (
  <VideoCallModal
    roomId={roomId}
    onClose={handleEndCall}
    chatPartner={chatPartner}
    callStatus={callStatus}
    setCallStatus={setCallStatus}
    isCaller={callDirection === 'outgoing'}
  />
)}
      {incoming && (
  <Modal
    open={incoming}
    onClose={() => {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      setIncoming(false);
    }}
    aria-labelledby="incoming-call-modal"
    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <Box sx={{
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 3,
      borderRadius: 2,
      width: 400
    }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Incoming Video Call
      </Typography>
      <Typography variant="body1" gutterBottom>
        Call from {chatPartner.first_name} {chatPartner.last_name}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            ringAudioRef.current.pause();
            ringAudioRef.current.currentTime = 0;
            setIncoming(false);
          }}
        >
          Decline
        </Button>
        <Button variant="contained" color="success" onClick={acceptCall}>
          Accept
        </Button>
      </Box>
    </Box>
  </Modal>
)}

        </>
      );
    };

      
const CreativeProgress = ({ studentId }) => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true); // Reset loading state
            setError(''); // Clear previous errors
            try {
                const res = await instance.get(
                    `/api/progress/teacher/student/${studentId}/course`
                );
                setProgressData(res.data || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load course progress.');
            } finally {
                setLoading(false);
            }
        };

        if (studentId) fetchProgress();
    }, [studentId]);

    if (loading) return <LinearProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Card sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 4,
            borderRadius: 4,
            overflow: 'hidden'
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 3,
                    color: 'primary.main'
                }}>
                    <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    Course Progress
                </Typography>

                {progressData.map((lesson, index) => (
                    <Box key={index} sx={{ 
                        mb: 2,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: lesson.is_completed ? 'success.light' : 'background.default',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 1
                        }
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mb: 1
                        }}>
                            <Avatar sx={{ 
                                bgcolor: lesson.is_completed ? 'success.main' : 'grey.300',
                                width: 32,
                                height: 32
                            }}>
                                {lesson.is_completed ? (
                                    <Check sx={{ fontSize: 20 }} />
                                ) : (
                                    <Numbers sx={{ fontSize: 20, color: 'text.secondary' }} />
                                )}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: lesson.is_completed ? 'success.dark' : 'text.primary'
                            }}>
                                {lesson.lesson_title}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={lesson.is_completed ? 100 : 0}
                                    sx={{ 
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'background.default',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            bgcolor: 'success.main'
                                        }
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ 
                                color: lesson.is_completed ? 'success.dark' : 'text.secondary',
                                fontWeight: 500
                            }}>
                                {lesson.is_completed ? 'Completed' : 'Pending'}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

const QuizResults = ({ studentId }) => {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const res = await instance.get(`/api/quizzes/results/${studentId}`);
        setQuizData(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load quiz results.');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchQuizResults();
  }, [studentId]);

  // Calculate scores
  const totalQuestions = quizData.length;
  const correctAnswers = quizData.filter(item => item.is_correct).length;
  const scorePercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  
  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" gutterBottom>

          <SchoolIcon sx={{ mr: 1.5, fontSize: 28 }} />
          Quiz Results (Score: {scorePercentage}%)
        </Typography>

        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {quizData.map((quiz, index) => (
            <Box key={index} sx={{ 
              mb: 2,
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'background.default',
              borderLeft: `4px solid ${quiz.is_correct ? '#4CAF50' : '#F44336'}`
            }}>
              <Typography variant="body2" fontWeight={500}>
                {quiz.question}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  student answer:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quiz.option_text}
                </Typography>
                {quiz.is_correct ? (
                  <Check sx={{ color: '#4CAF50', ml: 1, fontSize: 20 }} />
                ) : (
                  <Close sx={{ color: '#F44336', ml: 1, fontSize: 20 }} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};



export default Dashboard;