import {
    Check,
    DarkMode as DarkModeIcon,
    ExitToApp as ExitToAppIcon,
    LightMode as LightModeIcon,
    Message as MessageIcon,
    Numbers,
    Person as PersonIcon,
    School as SchoolIcon,
    Send
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Card,
    CardContent,
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
    TextField,
    ThemeProvider,
    Toolbar,
    Typography,
    createTheme,
    styled
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Axios instance
const instance = axios.create({
    baseURL: 'http://localhost:3000',
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Themes
const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

const drawerWidth = 240;

// Styled Components
const Sidebar = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderRight: `1px solid ${theme.palette.divider}`
    }
}));

const NavItem = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'selected'
})(({ theme, selected }) => ({
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
                                {selectedStudent ? `${selectedStudent.first_name}'s Dashboard` : 'Teacher Dashboard'}
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box component="main" sx={{ mt: 8, flexGrow: 1, p: 3 }}>
                        {selectedStudent ? (
                            <Grid container spacing={3} sx={{ height: '100%', alignItems: 'flex-start' }}>
                                <Grid item xs={12} md={8} sx={{ height: '88vh',width: '60%' }}>
                                    <MessagesSection
                                        studentId={selectedStudent.id}
                                        studentName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4} sx={{ 
                                    position: 'sticky',
                                    top: 80,
                                    height: 'fit-content',
                                    maxHeight: 'calc(100vh - 100px)',
                                    overflow: 'hidden'
                                }}>
                                    <CreativeProgress studentId={selectedStudent.id} />
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography variant="h6" color="textSecondary">
                                Select a student to view details
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
    const [socket, setSocket] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setTeacherId(payload.teacherId || payload.userId);
        }
    }, []);

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

        socketRef.current = newSocket;
        setSocket(newSocket);

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
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: 'background.paper'
        }}>
            <CardContent sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                p: 0,
                overflow: 'hidden'
            }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" display="flex" alignItems="center">
                        <MessageIcon sx={{ mr: 1 }} />
                        Messages with {studentName}
                    </Typography>
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
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                alignSelf: msg.sent_by === 'teacher' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                minWidth: '120px'
                            }}
                        >
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
                                        opacity: 0.6 
                                    }}
                                >
                                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // set to true for AM/PM
    timeZone: 'Africa/Addis_Ababa'
})
}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                <Box
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        alignItems: 'center',
                        '& .MuiInputBase-root': {
                            borderRadius: 4,
                            bgcolor: 'background.paper'
                        }
                    }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            disabled={sending}
                        />
                        <IconButton
                            color="primary"
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            sx={{ 
                                flexShrink: 0,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            <Send />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const CreativeProgress = ({ studentId }) => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await instance.get(`/api/progress/teacher/student/${studentId}/course`);
                setProgressData(res.data || []);
            } catch (err) {
                setError('Could not load course progress.');
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

export default Dashboard;