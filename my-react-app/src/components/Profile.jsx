import React, { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import {
  ChakraProvider,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Textarea,
  HStack,
  useToast,
  SimpleGrid,
  Spinner,
  Select
} from '@chakra-ui/react';
import { getUser, updateUser, getUsers } from '../Services/UserService';
import ChangePasswordModal from './ChangePasswordModal'; // Import the modal
import { getSections } from '../Services/SectionService'; // Import the sections service
import Cookies from 'universal-cookie';


const Profile = () => {
  const [user, setUser] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    userType: '',
    workingAs: '',
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [sections, setSections] = useState([]);  // Define sections state
  const [, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  let userId;

    const cookies = new Cookies();
  

  // const token = localStorage.getItem('token');
  const token = cookies.get("token");

  if (token) {
    const decoded = jwt_decode(token);
    userId = decoded.id;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const response = await getUser(userId);
        setUser(response.data);
        setOriginalUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({ title: "Error fetching user data", status: "error", duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    const fetchUserTypes = async () => {
      try {
        const response = await getUsers();
        const types = response.data.map(user => user.userType);
        setUserTypes([...new Set(types)]);
      } catch (error) {
        console.error("Error fetching user types:", error);
        toast({ title: "Error fetching user types", status: "error", duration: 3000 });
      }
    };

    const fetchSections = async () => {
      try {
        const response = await getSections(); // Fetch sections from the backend
        setSections(response.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast({ title: "Error fetching sections", status: "error", duration: 3000 });
      }
    };

    fetchUser();
    fetchUserTypes();
    fetchSections();  // Fetch sections
  }, [toast, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));

    if (name === 'phoneNumber') {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
      }
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = {};
    if (user.userName !== originalUser.userName) updatedFields.userName = user.userName;
    if (user.email !== originalUser.email) updatedFields.email = user.email;
    if (user.phoneNumber !== originalUser.phoneNumber) updatedFields.phoneNumber = user.phoneNumber;
    if (user.bio !== originalUser.bio) updatedFields.bio = user.bio;
    if (user.userType !== originalUser.userType) updatedFields.userType = user.userType;
    if (user.workingAs !== originalUser.workingAs) updatedFields.workingAs = user.workingAs;

    try {
      await updateUser(userId, updatedFields);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        title: "Error Updating Profile",
        description: "There was an error updating your profile.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // New state variable for selected section
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    // Update selectedSection if user.workingAs is already set
    if (user.workingAs) {
      setSelectedSection(user.workingAs);
    }
  }, [user.workingAs]);

  const handleSectionChange = (value) => {
    setSelectedSection(value);
    setUser((prevUser) => ({ ...prevUser, workingAs: value }));
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <ChakraProvider>
      <Box p={5}>
        <Heading mb={4} as='h2' size='xl' paddingLeft={3}
          sx={{
            background: 'linear-gradient(288deg, rgba(0,85,255,0.8) 1.5%, rgba(4,56,115,0.8) 91.6%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}>
          User Profile
        </Heading>

        <VStack as="form" spacing={4} align="stretch" onSubmit={handleSubmit} paddingLeft={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="userName"><b>Full Name</b></FormLabel>
            <Input
              id="userName"
              name="userName"
              value={user.userName}
              placeholder="Enter your Name here"
              onChange={handleChange}
            />
          </FormControl>

          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="email"><b>Email</b></FormLabel>
              <Input
                type="email"
                id="email"
                name="email"
                value={user.email}
                placeholder="Enter your mail here"
                onChange={handleChange}
                readOnly
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="phoneNumber"><b>Phone Number</b></FormLabel>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={user.phoneNumber}
                placeholder="Enter 10-digit phone number"
                onChange={handleChange}
                maxLength={10}
                pattern="\d{10}"
                title="Please enter a valid 10-digit phone number"
              />
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} spacing={4} >
            <FormControl isRequired>
              <FormLabel htmlFor="userType"><b>User Type</b></FormLabel>
              <Input value={user.userType || ''} readOnly />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="workingAs"><b>Working On</b></FormLabel>

              <Select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)} // Update selected section
              >
                {/* Conditionally render the placeholder option only when there's no workingAs */}
                {!user.workingAs && <option value="">Select Section</option>}
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.sectionName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel htmlFor="bio"><b>Bio</b></FormLabel>
            <Textarea
              id="bio"
              name="bio"
              value={user.bio}
              placeholder="Tell us about yourself..."
              onChange={handleChange}
            />
          </FormControl>
          <ChangePasswordModal userId={userId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

          <HStack  spacing={4} mt={2}>
            <Button  colorScheme="blue" type="submit" ml={800}>
              Save Changes
            </Button>
            <Button   colorScheme="gray" variant="outline" onClick={() => setUser(originalUser)}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              mr={1000}
              position="absolute"
              onClick={() => setIsModalOpen(true)}
            >
              Change Password
            </Button>
          </HStack>
        </VStack>

        {/* Change Password Modal */}
      </Box>
    </ChakraProvider>
  );
};

export default Profile;
