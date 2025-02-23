import { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, Input, Button, Text, IconButton, InputGroup, InputRightElement, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { changePasswordByEmail } from '../Services/UserService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ConfirmPassword = ({ isOpen, onClose, email }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();  

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return;
        }

        try {
            await changePasswordByEmail(email, newPassword);
            // Success toast
            toast({
                title: 'Password Changed.',
                description: "Your password has been successfully updated.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            onClose();
            navigate('/login');
        } catch (error) {
            // Error toast
            toast({
                title: 'Error Changing Password.',
                description: error.message || 'An error occurred while updating your password.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}> 
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Set New Password</ModalHeader>
                <ModalBody>
                    <Text mb={4}>Enter your new password for <b>{email}</b></Text>
                    <form onSubmit={handleSubmit}>
                        <InputGroup mb={3}>
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="New Password"
                                name="newPassword"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                isRequired
                            />
                            <InputRightElement>
                                <IconButton
                                    icon={showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    onClick={toggleNewPasswordVisibility}
                                    variant="link"
                                    aria-label="Toggle password visibility"
                                />
                            </InputRightElement>
                        </InputGroup>

                        <InputGroup mb={3}>
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handlePasswordChange}
                                isRequired
                            />
                            <InputRightElement>
                                <IconButton
                                    icon={showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    onClick={toggleConfirmPasswordVisibility}
                                    variant="link"
                                    aria-label="Toggle password visibility"
                                />
                            </InputRightElement>
                        </InputGroup>

                        {passwordError && <Text color="red.500" mt={2}>{passwordError}</Text>}
                        <Button colorScheme="blue" type="submit" mt={4}>Set New Password</Button>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmPassword;
