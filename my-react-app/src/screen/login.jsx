import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Heading, Input, Button, InputGroup, Stack, InputLeftElement, InputRightElement, chakra, Box, Image, FormControl, Text } from '@chakra-ui/react';
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../Services/UserService';
import logo from '../assets/logo.png';
import bgImage from '../assets/WEBB.png';
import Cookies from 'universal-cookie';


const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

const Login = () => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const cookies = useMemo(() => new Cookies(), []);

  const handleShowClick = () => setShowPassword(!showPassword);
  const handleToggle = () => navigate('/signup');
  const handleResetPassword = () => navigate('/ResetPassword');

  // Validate email and password separately
  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    // Password validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await loginUser(email, password);

      if (response.status === 200) {
        const { token } = response.data;

        // Store user information from the token
        // localStorage.setItem('token', token);
        cookies.set('token', token)

        navigate('/home');
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Incorrect email or password');
            break;
          case 401:
            setError('Unauthorized');
            break;
          default:
            setError('An error occurred. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  // Clear local storage when the component mounts
  useEffect(() => {
    // localStorage.clear(); // Clear local storage
    cookies.remove("token");
  }, [cookies]);

  return (
    <Flex
      flexDirection="column"
      width="100%"
      height="100vh"
      backgroundImage={`url(${bgImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      justifyContent="center"
      alignItems="center"
      p={{ base: 4, md: 8 }}
    >
      <Stack flexDir="column" mb="2" justifyContent="center" alignItems="center">
        <Image
          src={logo}
          alt="Copious Logo"
          width="50%"
          height="130px"
        />
        <Heading color="blue.400">Plan - X</Heading>
        <Box minW={{ base: '90%', md: '468px' }}>
          <form onSubmit={handleLogin}>
            <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
              <FormControl isInvalid={!!emailError}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" aria-label="Email Icon" children={<CFaUserAlt color="gray.300" />} />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isRequired
                  />
                </InputGroup>
                {emailError && <Text color="red.500">{emailError}</Text>}
              </FormControl>

              <FormControl isInvalid={!!passwordError}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" aria-label="Password Icon" color="gray.300" children={<CFaLock color="gray.300" />} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isRequired
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick} backgroundColor={'#ffffff'}>
                      {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {passwordError && <Text color="red.500">{passwordError}</Text>}
              </FormControl>

              {error && <Text color="red.500">{error}</Text>}

              <Button borderRadius={0} type="submit" variant="solid" colorScheme="blue" width="full">
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        New to us?{' '}
        <Button colorScheme="blue" variant="link" onClick={handleToggle}>
          SIGNUP
        </Button>
      </Box>
      <Box>
        <Button colorScheme="red" variant="link" onClick={handleResetPassword}>
          FORGOT PASSWORD
        </Button>
      </Box>
    </Flex>
  );
};

export default Login;
