import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Heading, Input, Button, InputGroup, Stack, InputLeftElement, chakra, Box, Image, FormControl, Text, useToast } from '@chakra-ui/react';
import { FaUserAlt } from 'react-icons/fa';
import { sendOtp } from '../Services/MailService';
import logo from '../assets/logo.png';
import VerifyOTP from './VerifyOTP';
import bgImage from '../assets/WEBB.png';

const CFaUserAlt = chakra(FaUserAlt);

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [description, setDescription] = useState('');
    const [, setIsFormDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleToggle = () => navigate('/login');

    const validateForm = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const handleResetPassword = async (event) => {

        event.preventDefault();
        setError('');
        setIsFormDisabled(true); // Disable the form

        if (!validateForm()) {
            setError('Please enter a valid email.');
            setIsFormDisabled(false); // Enable the form if validation fails
            return;
        }

        try {
            const response = await sendOtp({ email });
            console.log(response.data);

            setIsModalOpen(true); // Open OTP modal
            if (response.status === 200) {

                // Success toast
                toast({
                    title: 'OTP Sent Successfully.',
                    description: 'An OTP has been sent to your email address.',
                    variant:'left-accent',
                    position: 'top-right',
                    status: 'info',
                    duration: 5000,
                    isClosable: true,
                });
            }

        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        setError('Incorrect email');
                        setDescription('Email not found')
                        break;
                    default:
                        setError('An error occurred. Please try again later.');
                }
            }

            // Error toast
            toast({
                title: 'Error Sending OTP.',
                description: description,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });

            setIsFormDisabled(false); // Enable the form on error
        }
    };


    return (
        <Flex
            flexDirection="column"
            width="100%"
            height="100vh"
            backgroundImage={`url(${bgImage})`}
            backgroundSize="cover"
            backgroundPosition="center" justifyContent="center"
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
                    <form onSubmit={handleResetPassword}>
                        <Stack spacing={4} p="1rem" backgroundColor="whiteAlpha.900" boxShadow="md">
                            <FormControl>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none" aria-label="Email Icon" children={<CFaUserAlt color="gray.300" />} />
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                        isRequired
                                        // isDisabled={isFormDisabled} // Disable the input field when form is disabled
                                    />
                                </InputGroup>
                            </FormControl>
                            {error && <Text color="red.500">{error}</Text>}
                            <Button
                                borderRadius={0}
                                type="submit"
                                variant="solid"
                                colorScheme="blue"
                                width="full"
                                // isDisabled={isFormDisabled} // Disable the button when form is disabled
                            >
                                Send OTP
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            <Box>
                Already have an account? {' '}
                <Button colorScheme="blue" variant="link" onClick={handleToggle}>
                    Login
                </Button>
            </Box>

            {/* OTP Modal */}
            <VerifyOTP
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                email={email}
            />
        </Flex>
    );
};

export default ResetPassword;
