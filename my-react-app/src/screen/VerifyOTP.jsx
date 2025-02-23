import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Input, Button, Text, HStack, useToast, PinInput, PinInputField } from '@chakra-ui/react';
import { verifyOtp, sendOtp } from '../Services/MailService';
import ConfirmPassword from './ConfirmPassword';

const VerifyOTP = ({ isOpen, onClose, email }) => {
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [timer, setTimer] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const toast = useToast();

    const handleOtpChange = (value) => {
        setOtp(value); // Update state with the current PIN input
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setOtpError('');
        setIsVerifying(true);

        console.log(otp);

        if (otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP.');
            setIsVerifying(false);
            return;
        }

        try {
            const otpContent = {
                email,
                otp,
            };
            const response = await verifyOtp(otpContent);

            if (response.status === 200) {
                setIsPasswordModalOpen(true); // Open the ConfirmPasswordModal on successful OTP verification
                toast({
                    title: 'OTP Verified Successfully.',
                    status: 'success',
                    variant: 'left-accent',
                    position: 'top-right',
                    duration: 3000,
                    isClosable: false,
                })
            } else if (response.status === 201) {
                startResendTimer();
                toast({
                    title: 'Incorrect OTP',
                    status: 'warning',
                    position: 'top-right',
                    duration: 3000,
                    isClosable: false,
                })
            } else {
                setOtpError('Failed to verify OTP. Please try again.');
            }
        } catch (error) {
            setOtpError('An error occurred while verifying OTP. Please try again.');
            toast({
                title: 'An error occurred while verifying OTP',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: false,
            })
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (isResendDisabled) return;
        await sendOtp({ email });
        startResendTimer();
        toast({
            title: 'OTP Resent Successfully.',
            status: 'info',
            variant: 'subtle',
            position: 'top-right',
            duration: 3000,
            isClosable: false,
        })
    };

    // Wrap startResendTimer with useCallback to stabilize the function reference
    const startResendTimer = useCallback(() => {
        if (isResendDisabled) return;

        setIsResendDisabled(true);
        setTimer(30);

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [isResendDisabled]);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setOtpError('');
            setTimer(30);
            setIsVerifying(false);
            setIsResendDisabled(false);
            startResendTimer();
        }
    }, [isOpen]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                closeOnOverlayClick={false}
                onClose={() => {
                    onClose();
                    setTimer(30)
                }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Verify OTP</ModalHeader>
                    <ModalBody>
                        <Text>We have sent an OTP to <b>{email}</b>.</Text>
                        <form onSubmit={handleVerifyOTP}>


                            <HStack mt={3}>
                                <PinInput onChange={handleOtpChange} placeholder=''>
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                    <PinInputField />
                                </PinInput>
                            </HStack>

                            {otpError && <Text color="red.500" mt={2}>{otpError}</Text>}

                            <Button
                                colorScheme="blue"
                                type="submit"
                                mt={4}
                                isLoading={isVerifying}
                                isDisabled={isVerifying}
                            >
                                Verify OTP
                            </Button>
                        </form>

                        <Button
                            color='#316cb5'
                            alignContent='Center'
                            alignItems='center'
                            _hover={{
                                backgroundColor: 'none',
                                textDecoration: 'underline',
                            }}
                            fontWeight='bold'
                            ml={-3}
                            mt={-4}
                            background='transparent'
                            onClick={handleResendOtp}
                            isDisabled={isResendDisabled}
                        >
                            Didn’t receive OTP? Resend in {timer}s
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <ConfirmPassword
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                email={email}
            />
        </>
    );
};

export default VerifyOTP;
