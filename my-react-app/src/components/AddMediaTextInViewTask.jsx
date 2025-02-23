import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Box, Spinner, useToast, Stack, Text, Image, IconButton } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { addComments } from '../Services/CommentService';
import { getUsers } from '../Services/UserService';
import jwt_decode from 'jwt-decode';
import { AiFillFileAdd } from "react-icons/ai";
import Cookies from 'universal-cookie';


const AddMediaTextInViewTask = ({ isOpen, onClose, taskId, onUploadComplete }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSubmit] = useState(false);
  const [loading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const cookies = new Cookies();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setShowPreview(true);
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Error fetching users.",
        description: "Unable to fetch users. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const handleDeleteFile = (index) => {
    const newFiles = [...mediaFiles];
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText && mediaFiles.length === 0) {
      toast({
        title: "No data to submit.",
        description: "Please add a comment or select media files.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // const token = localStorage.getItem('token');
    const token = cookies.get('token');

    let decoded = null;
    if (token) {
      decoded = jwt_decode(token);
    }

    if (!decoded) {
      toast({
        title: "Error",
        description: "User is not authenticated.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const commentData = {
      taskId,
      createdByUserId: decoded.id,
      textCommentforViewtask: commentText,
      mediaFiles,

    };

    console.log(commentData);
    try {
      await addComments(commentData);
      onUploadComplete();

      toast({
        title: "Success!",
        description: `Media added successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setMediaFiles([]);
      setCommentText("");
    } catch (error) {
      console.error("Error adding media:", error);
      toast({
        title: "Error",
        description: "There was an error adding your comment and media.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    onClose();
    setMediaFiles([]);
    setCommentText("");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Media to Comment</ModalHeader>
        <ModalBody>
          <Box>
            <Input
              placeholder="Enter your comment..."
              value={commentText}
              onChange={handleCommentChange}
            />

            <Button
              onClick={() => fileInputRef.current.click()}
              colorScheme="blue"
              mb={2}
              mt={2}
              leftIcon={<AiFillFileAdd />}
            >
              Choose Files
            </Button>
            <Input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              style={{ display: 'none' }} // Hide the input

            />
          </Box>

          {showPreview && !loading && (
            <Stack>
              <Text fontWeight="bold">Selected Files:</Text>
              <Stack spacing={2}>
                {mediaFiles.map((file, index) => (
                  <Box key={index} border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                    <Text>{file.name}</Text>
                    {file.type.startsWith('image/') && (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`preview-${file.name}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    )}
                    {file.type.startsWith('video/') && (
                      <video
                        src={URL.createObjectURL(file)}
                        controls
                        style={{ width: '100%', borderRadius: 'md' }}
                      />
                    )}
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
            </Stack>
          )}

          {loadingUsers && <Spinner mt={4} size="xl" />}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loadingSubmit}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMediaTextInViewTask;
