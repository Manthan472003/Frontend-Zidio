import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Image,
  Button,
  Flex,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { MdOutlineZoomIn, MdOutlineZoomOut } from "react-icons/md";

const ViewImageModal = ({ isOpen, onClose, imageSrc, heading }) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 1));
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalBody
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="70vh"
          overflow="hidden"
          position="relative"
        >
          <Box
            width="50%"
            height="50%"
            overflow="auto"
            position="relative"
          >
            <Image
              src={imageSrc}
              alt="Main View"
              width="100%"
              height="100%"
              objectFit="contain"
              transform={`scale(${zoom})`}
              transition="transform 0.2s ease"
            />
          </Box>
        </ModalBody>
        <Flex justifyContent="center" mt={2} gap={4} >
          <IconButton
            icon={<MdOutlineZoomOut />}
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            colorScheme="blue"
          />
          <IconButton
            icon={<MdOutlineZoomIn />}
            onClick={handleZoomIn}
            aria-label="Zoom In"
            colorScheme="blue"
          />
        </Flex>
        <Button colorScheme="blue" onClick={onClose} mt={4}>
          Close
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default ViewImageModal;
