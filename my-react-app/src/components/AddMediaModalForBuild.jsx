import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal, Input, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Stack, Text, Image, Box, IconButton } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { addComments } from '../Services/BuildService';
import { AiFillFileAdd } from "react-icons/ai";
import jwt_decode from 'jwt-decode';
import Cookies from 'universal-cookie';



// Modal to upload media files related to a task
const AddMediaModalForBuild = ({ isOpen, onClose, taskName, onUploadComplete, buildId }) => {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState();
    const [commentText, setCommentText] = useState('');
    const fileInputRef = useRef(null);
    const cookies = useMemo(() => new Cookies(), []);


    useEffect(() => {
        // const token = localStorage.getItem('token');
        const token = cookies.get('token');

        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                setUserId(decodedToken.id);
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    }, [cookies]);


    // Handle file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setMediaFiles(files);
        setShowPreview(true);
    };

    // Confirm file upload and make the API request to add the comment
    const confirmUpload = async () => {
        const taskDetails = {
            taskName: taskName,
            userId: userId,
            commentText: commentText,
            mediaFiles: mediaFiles,
        };

        console.log("Task to be sent :", taskDetails.mediaFiles);

        // If no files selected, alert the user and return
        if (mediaFiles.length === 0) {
            alert('No files selected');
            return;
        }

        setLoading(true);

        try {
            // Pass the buildId and taskDetails separately to the addComments function
            await addComments(buildId, taskDetails);
            onUploadComplete();
            onClose();
        } catch (error) {
            console.error('Failed to upload media:', error);
            alert('Failed to upload media. Please try again.');
        } finally {
            setMediaFiles([]);
            setCommentText('');
            setShowPreview(false);
            setLoading(false);
        }
    };


    // Handle closing the modal, clearing any selected files
    const handleClose = () => {
        setMediaFiles([]);
        setCommentText('');
        setShowPreview(false);
        onClose();
    };

    // Handle deleting a specific file from the selected files list
    const handleDeleteFile = (index) => {
        setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Media Files</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {/* Button to trigger file selection */}
                    <Button
                        onClick={() => fileInputRef.current.click()}
                        colorScheme="blue"
                        mb={4}
                        leftIcon={<AiFillFileAdd />}
                    >
                        Choose Files
                    </Button>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    {/* File preview section */}
                    {showPreview && !loading && (
                        <Stack mt={4}>
                            <Text fontWeight="bold">Selected Files:</Text>
                            <Box
                                maxH="200px" // Set a fixed height
                                overflowY="auto" // Enable vertical scrolling
                                border="1px"
                                borderColor="gray.300"
                                borderRadius="md"
                                p={2}
                            >
                                <Stack spacing={2}>
                                    {mediaFiles.map((file, index) => (
                                        <Box key={index} border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                                            <Text>{file.name}</Text>

                                            {/* Display image preview if the file is an image */}
                                            {file.type.startsWith('image/') && (
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`preview-${file.name}`}
                                                    boxSize="100px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                />
                                            )}

                                            {/* Icon to delete the file */}
                                            <IconButton
                                                aria-label="Delete file"
                                                icon={<FaTrash />}
                                                colorScheme="red"
                                                size="sm"
                                                mt={2}
                                                onClick={() => handleDeleteFile(index)}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    )}

                </ModalBody>
                <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    size="lg"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="gray.300"
                    ml={5}
                    width={465}
                />
                <ModalFooter>

                    {/* Confirm upload button */}
                    <Button colorScheme="blue" onClick={confirmUpload} isLoading={loading} mr={4}>
                        {loading ? 'Uploading...' : 'Confirm Upload'}
                    </Button>
                    {/* Cancel button to close the modal */}
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddMediaModalForBuild;