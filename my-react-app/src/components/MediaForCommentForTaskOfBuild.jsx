import React, { useState, useEffect, useCallback } from 'react';
import ViewImageModal from './ViewImageModal';
import { useDisclosure, Box, Image, SimpleGrid, Button, Text, Modal, ModalBody, ModalOverlay, ModalHeader, ModalCloseButton, ModalContent, ModalFooter } from '@chakra-ui/react';

const MediaForCommentForTaskOfBuild = (comment) => {
    const [uploadedMedia, setUploadedMedia] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mediaToShow, setMediaToShow] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isImageModalOpen, setImageModalOpen] = useState(false);


    const fetchMedia = useCallback(async () => {
        try {
            setUploadedMedia(comment.mediaLinks);
            console.log(comment.mediaLinks);

        } catch (error) {
            console.error('Error fetching media:', error);
            alert('Failed to load media. Please try again later.');
        } finally {
        }
    }, [comment]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const renderMediaThumbnail = (mediaLink) => {
        return (
            <Box position="relative" boxSize="100px" onClick={() => handleMediaClick(mediaLink)}>
                <Image
                    src={mediaLink}
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
        setSelectedMedia(media); // Ensure media is correctly set
        setImageModalOpen(true); // Open the modal
    };

    return (
        <>
            {uploadedMedia.length > 0 ? (
                <SimpleGrid columns={6} spacing={4}>
                    {uploadedMedia.slice(0, 3).map((media) => (
                        <Box key={media.id} onClick={() => handleMediaClick(media)}>
                            {renderMediaThumbnail(media)}
                        </Box>
                    ))}
                    {uploadedMedia.length > 3 && (
                        <Button
                            onClick={() => {
                                setMediaToShow(uploadedMedia);
                                console.log("adsfadas", mediaToShow);
                                onOpen();
                            }}
                            boxSize="100px"
                            fontSize="md"
                            variant="outline"
                            colorScheme="blue"
                        >
                            +{uploadedMedia.length - 5}
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
                    imageSrc={selectedMedia} // Make sure mediaLink exists
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
                            {mediaToShow.map((media) => (
                                <Box key={media.id} position="relative" onClick={() => handleMediaClick(media)}>
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
    )
}

export default MediaForCommentForTaskOfBuild