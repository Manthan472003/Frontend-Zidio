import React, { useMemo, useEffect } from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './screen/login';
import Signup from './screen/signup';
import MainScreen from './screen1/mainScreen';
import TaskManager from './components/TaskManager';
import CompletedTask from './components/CompletedTask';
import Bin from './components/Bin';
import MyTasks from './components/MyTasks';
import Sections from './components/Sections';
import Users from './components/Users';
import Profile from './components/Profile';
import QADashboard from './components/QADashboard';
import ResetPassword from './screen/ResetPassword';
import VerifyOTP from './screen/VerifyOTP';
import ConfirmPassword from './screen/ConfirmPassword';
import Tag from './components/Tag';
import Cookies from 'universal-cookie';

// PrivateRoute component to protect routes
function PrivateRoute({ element }) {
  const cookies = useMemo(() => new Cookies(), []);
  const token = cookies.get('token');

  if (!token) {
    // Redirect to login page if token is not found
    return <Navigate to="/login" />;
  }

  return element;
}

function App() {
  const cookies = useMemo(() => new Cookies(), []);
  // Remove token on specific routes
  const handleTokenRemoval = () => {
    cookies.remove('token');
  };

  useEffect(() => {
    // Add event listeners to remove token on login, signup, reset password, etc.
    const removeTokenOnPath = (path) => {
      const removePaths = ['/login', '/signup', '/ResetPassword', '/VerifyOTP', '/ConfirmPassword'];
      if (removePaths.includes(path)) {
        handleTokenRemoval();
      }
    };

    // Listening for route change (or navigating to specific paths)
    window.addEventListener('hashchange', () => {
      removeTokenOnPath(window.location.pathname);
    });

    // Initial check in case we are already on one of these paths
    removeTokenOnPath(window.location.pathname);

    return () => {
      // Cleanup event listener on component unmount
      window.removeEventListener('hashchange', () => {
        removeTokenOnPath(window.location.pathname);
      });
    };
  }, [cookies]);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/VerifyOTP" element={<VerifyOTP />} />
          <Route path="/ConfirmPassword" element={<ConfirmPassword />} />

          {/* Default route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/home" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<TaskManager />} />
          </Route>

          <Route path="/QA-tester" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<QADashboard />} />
          </Route>

          <Route path="/completed-tasks" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<CompletedTask />} />
          </Route>

          <Route path="/bin" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<Bin />} />
          </Route>

          <Route path="/my-tasks" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<MyTasks />} />
          </Route>

          <Route path="sections" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<Sections />} />
          </Route>

          <Route path="/users" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<Users />} />
          </Route>

          <Route path="/profile" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<Profile />} />
          </Route>

          <Route path="/tag" element={<PrivateRoute element={<MainScreen />} />}>
            <Route index element={<Tag />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
