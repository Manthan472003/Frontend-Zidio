import React, { useState, useEffect, useCallback } from 'react';
import ViewImageModal from './ViewImageModal';
import { useDisclosure, Box, Image, SimpleGrid, Button, Text, Modal, ModalBody, ModalOverlay, ModalHeader, ModalCloseButton, ModalContent, ModalFooter } from '@chakra-ui/react';

const ViewMediaShow = ({ comment }) => {  
    const [uploadedMedia, setUploadedMedia] = useState([]); 
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mediaToShow, setMediaToShow] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isImageModalOpen, setImageModalOpen] = useState(false);

    // Fetch media when comment is updated
    const fetchMedia = useCallback(async () => {
        try {
            const mediaUrls = Array.isArray(comment.commentText) ? comment.commentText : comment.commentText.split(','); // Split string into array if needed
            setUploadedMedia(mediaUrls);  
        } catch (error) {
            console.error('Error fetching media:', error);
            alert('Failed to load media. Please try again later.');
        }
    }, [comment]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const renderMediaThumbnail = (media) => {
        return (
            <Box position="relative" boxSize="100px" onClick={() => handleMediaClick(media)}>
                <Image
                    src={media}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                    cursor="pointer"
                    boxShadow="md"
                />
            </Box>
        );
    };

    const handleMediaClick = (media) => {
        setSelectedMedia(media);
        setImageModalOpen(true);
    };

    return (
        <>
            {comment.textCommentforViewtask && (
                <Box mb={4}>
                    <Text fontSize="md">{comment.textCommentforViewtask}</Text>
                </Box>
            )}

            {uploadedMedia.length > 0 ? (
                <SimpleGrid columns={6} spacing={4}>
                    {uploadedMedia.slice(0, 3).map((media, index) => (
                        <Box key={index} onClick={() => handleMediaClick(media)}>
                            {renderMediaThumbnail(media)}
                        </Box>
                    ))}
                    {uploadedMedia.length > 3 && (
                        <Button
                            onClick={() => {
                                setMediaToShow(uploadedMedia);
                                console.log("All media:", uploadedMedia);
                                onOpen();
                            }}
                            boxSize="100px"
                            fontSize="md"
                            variant="outline"
                            colorScheme="blue"
                        >
                            +{uploadedMedia.length - 3}
                        </Button>
                    )}
                </SimpleGrid>
            ) : (
                <Text fontSize="md">No media found.</Text>
            )}

            {isImageModalOpen && selectedMedia && (
                <ViewImageModal
                    isOpen={isImageModalOpen}
                    onClose={() => setImageModalOpen(false)}
                    imageSrc={selectedMedia} 
                    heading={'View Image'}
                />
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>All Media Files</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid columns={[2, 3]} spacing={4}>
                            {mediaToShow.map((media, index) => (
                                <Box key={index} position="relative" onClick={() => handleMediaClick(media)}>
                                    {renderMediaThumbnail(media)}
                                </Box>
                            ))}
                        </SimpleGrid>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ViewMediaShow;
