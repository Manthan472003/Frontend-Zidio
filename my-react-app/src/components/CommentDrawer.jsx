import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody, Button, Box, Spinner, Text, VStack, HStack, Input, IconButton, InputGroup, InputRightElement } from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons';
import { getComments, addComments } from '../Services/BuildService';
import { useToast } from "@chakra-ui/react";
import jwt_decode from 'jwt-decode';
import { getUsers } from '../Services/UserService';
import AddMediaModalForBuild from './AddMediaModalForBuild';  // Import the AddMediaModalForBuild component
import MediaForCommentForTaskOfBuild from './MediaForCommentForTaskOfBuild';
import Cookies from 'universal-cookie';

const CommentDrawer = ({ buildId, taskName, isOpen, onClose }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [userId, setUserId] = useState('');
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // State to control media modal visibility
    const commentsEndRef = useRef(null);
    const cookies = useMemo(() => new Cookies(), []);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (err) {
                console.error('Fetch Users Error:', err);
                toast({
                    title: "Error fetching users.",
                    description: "Unable to fetch users. Please try again later.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
        fetchUsers();

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
    }, [cookies, toast]);

    useEffect(() => {
        if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    const fetchComments = useCallback(async () => {
        try {
            setLoadingComments(true);
            console.log('Fetching comments for:', buildId, taskName); // Debugging line
            const response = await getComments(buildId, taskName);
            
            if (response.data && Array.isArray(response.data.comments)) {
                const taskComments = response.data.comments;
                setComments(taskComments);
            } else {
                toast({
                    title: "Error fetching build data",
                    description: "No valid build data found.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast({
                title: "Error fetching comments",
                description: "There was a problem fetching the comments.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingComments(false);
            if (commentsEndRef.current) {
                commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [buildId, taskName, toast]);
    

    useEffect(() => {
        if (buildId && taskName) {
            fetchComments();
        }
    }, [buildId, taskName, fetchComments]);



    const getUserNameById = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.userName : 'Unknown';
    };

    const colorPalette = [
        "#ffddd6",
        "#d0f5d7",
        "#dee4ff",
        "#fadcec",
        "#fff1d4",
        "#d4fffc",
        "#feffd4",
        "#edd4ff"
    ];

    const getUserColor = (userId) => {
        const userIndex = userId % colorPalette.length;
        return colorPalette[userIndex];
    };

    const handleAddComment = async () => {
        if (!commentText && mediaFiles.length === 0) {
            toast({
                title: "Error",
                description: "Comment text or media is required.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!userId) {
            toast({
                title: "Error",
                description: "User ID is required.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const newComment = {
            userId,
            comment: commentText,
            media: mediaFiles,
            createdAt : new Date()
        };

        try {
            await addComments(buildId, { taskName, commentText, userId, mediaFiles });
            setComments(prevComments => [...prevComments, newComment]);
            setCommentText('');
            setMediaFiles([]);

            toast({
                title: "Comment added",
                description: "Your comment has been added successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: "Error adding comment",
                description: "There was a problem adding your comment.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const openMediaModal = () => {
        setIsMediaModalOpen(true); // Open the media modal
    };

    const closeMediaModal = () => {
        setIsMediaModalOpen(false); // Close the media modal
    };

    const handleUploadComplete = () => {
        setMediaFiles([]);
        fetchComments();
    }

    const buttonStyles = {
        base: {
            fontSize: '23px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundImage: 'linear-gradient(288deg, rgba(0,85,255,0.8) 1.5%, rgba(4,56,115,0.8) 91.6%)',
            padding: '8px 6px',
            borderRadius: '0 0 0 0',
            transition: 'all 0.3s ease',
            marginBottom: '2px',
            width: '100%',
            textAlign: 'left',
            justifyContent: 'start',
            paddingLeft: '20px',
        },
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton color={'white'} size={10} padding='10 3' />
                <DrawerHeader sx={buttonStyles.base}>COMMENTS FOR TASK : {taskName}</DrawerHeader>

                <DrawerBody>
                    {loadingComments ? (
                        <Box textAlign="center">
                            <Spinner size="lg" />
                        </Box>
                    ) : (
                        <VStack align="start" spacing={3}>
                            {comments.length > 0 ? (
                                <>
                                    {comments.map((comment, index) => {
                                        const isUserComment = comment.userId === userId;
                                        const commentColor = getUserColor(comment.userId);
                                        const formattedDate = new Date(comment.createdAt).toLocaleString();

                                        return (
                                            <HStack
                                                key={index}
                                                p={2}
                                                borderWidth={1}
                                                borderRadius="md"
                                                backgroundColor={isUserComment ? "#e0f7fa" : commentColor}
                                                boxShadow="sm"
                                                width="full"
                                                alignSelf={isUserComment ? "flex-end" : "flex-start"}
                                            >
                                                <Box flex="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="normal">
                                                    <Text fontWeight="bold" color={isUserComment ? "blue.600" : "gray.600"}>
                                                        {isUserComment ? "You" : getUserNameById(comment.userId)}:
                                                    </Text>
                                                    {comment.mediaLinks && comment.mediaLinks.length > 0 ? (
                                                        <>
                                                        <MediaForCommentForTaskOfBuild
                                                            comment={comment.comment}
                                                            mediaLinks={comment.mediaLinks}
                                                        />
                                                        <Text>{comment.comment}</Text>
                                                        </>

                                                    ) : (
                                                        <Text>{comment.comment}</Text>
                                                    )}
                                                    <Text fontSize="sm" color="gray.500" textAlign="right">
                                                        {formattedDate}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        );
                                    })}
                                    {/* Invisible div to scroll to */}
                                    <div ref={commentsEndRef} />
                                </>
                            ) : (
                                <Text>No comments yet.</Text>
                            )}
                        </VStack>

                    )}
                </DrawerBody>
                <HStack mr={10} ml={7} mb={2} mt={2}>
                    <InputGroup width="100%">
                        <Input
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            size="lg"
                            borderRadius="md"
                            borderWidth={1}
                            borderColor="gray.300"
                        />
                        <InputRightElement pt={2} pr={2}>
                            {/* <IconButton
                                icon={<AttachmentIcon size={30} />}
                                onClick={openMediaModal} // Open the modal on icon click
                                colorScheme="gray"
                                aria-label="Attach media"
                            /> */}
                            <IconButton
                                icon={<AttachmentIcon size={25} />}
                                onClick={openMediaModal}
                                variant="outline"
                                title='Add Attachments'
                                colorScheme="blue"
                                border={0}
                            // mr={2}
                            />
                        </InputRightElement>
                    </InputGroup>
                    <Button onClick={handleAddComment} colorScheme="blue" height="45px" size="sm">Comment</Button>
                </HStack>
            </DrawerContent>
            {/* Media Upload Modal */}
            <AddMediaModalForBuild
                isOpen={isMediaModalOpen}
                onClose={closeMediaModal}
                taskName={taskName}
                onUploadComplete={handleUploadComplete} // Clear media after upload
                buildId={buildId}
            />
        </Drawer >
    );
};

export default CommentDrawer;
