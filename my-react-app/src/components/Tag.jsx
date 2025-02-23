import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, useToast, Heading } from '@chakra-ui/react';
import { getTags, deleteTag } from '../Services/TagService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { DeleteIcon } from '@chakra-ui/icons';

const Tag = () => {
    const [Tags, setTags] = useState([]); // Updated the state name to match usage
    const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [TagToDelete, setTagToDelete] = useState(null);
    const toast = useToast();

    // Fetch Tags from backend wrapped in useCallback
    const fetchTags = useCallback(async () => {
        try {
            const response = await getTags();
            setTags(response.data);
        } catch (error) {
            toast({
                title: "Error fetching Tags",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [toast]); // Include toast in the dependency array

    // Delete Tag
    const handleDeleteTag = async (id) => {
        try {
            await deleteTag(id);
            setTags((prevTags) => prevTags.filter(Tag => Tag.id !== id)); // Update state
            toast({
                title: "Tag deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error deleting Tag",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleOpenConfirmDelete = (id) => {
        setTagToDelete(id);
        setConfirmDeleteOpen(true);
    };

    useEffect(() => {
        fetchTags();
    }, [fetchTags]); // No warning here since fetchTags is stable

    return (
        <Box p={5}>
            <Heading as='h2' size='xl' paddingLeft={3} mb={4}
                sx={{
                    background: 'linear-gradient(288deg, rgba(0,85,255,0.8) 1.5%, rgba(4,56,115,0.8) 91.6%)',
                    backgroundClip: 'text',
                    color: 'transparent',
                    display: 'inline-block',
                }}>
                Tag List
            </Heading>
            <Table variant="simple" borderRadius="xl" overflow="hidden">
                <Thead bg="gray.100">
                    <Tr>
                        <Th color="gray.700" width="40%" fontWeight={800} fontSize={15}>Tag Name</Th>
                        <Th color="gray.700" width="40%" fontWeight={800} fontSize={15}>Created At</Th>
                        <Th color="gray.700" width="20%" fontWeight={800} fontSize={15}>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Tags.map(Tag => ( // Use `Tags` here instead of lowercase `tags`
                        <Tr key={Tag.id} style={{ backgroundColor: Tag.id % 2 === 0 ? '#ebfff0' : '#d7f2ff' }}>
                            <Td>{Tag.tagName}</Td> {/* Access tagName directly */}
                            <Td>
                                {new Intl.DateTimeFormat('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                }).format(new Date(Tag.createdAt))}
                            </Td>
                            <Td>
                                <Button colorScheme="red" onClick={() => handleOpenConfirmDelete(Tag.id)}>
                                    <DeleteIcon boxSize={5} mr={2} />
                                    Delete
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <ConfirmDeleteModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={() => {
                    handleDeleteTag(TagToDelete);
                    setConfirmDeleteOpen(false); // Close modal after confirming
                }}
                itemName={`${TagToDelete ? Tags.find(s => s.id === TagToDelete)?.tagName : ''} Tag? `}
            />
        </Box>
    );
};

export default Tag;
