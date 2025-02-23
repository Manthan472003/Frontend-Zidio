import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, useToast
} from '@chakra-ui/react';
import jwt_decode from 'jwt-decode';
import { getAssignedTasks } from '../Services/TaskService';
    import Cookies from 'universal-cookie';


const AddDailyReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [tasks, setTasks] = useState([]); // Track added tasks
  const [taskName, setTaskName] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [userId, setUserId] = useState('');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const toast = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCustomTaskModalOpen, setIsCustomTaskModalOpen] = useState(false);
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
    } else {
      console.error('No token found in local storage');
    }
  }, [cookies]);

  useEffect(() => {
    if (userId) {
      const fetchAssignedTasks = async () => {
        try {
          const response = await getAssignedTasks(userId);
          const filteredTasks = response.data.filter(
            (task) => task.status !== 'Completed' && task.isDelete === false
          );
          setAssignedTasks(filteredTasks);
        } catch (error) {
          console.error('Error fetching assigned tasks:', error);
        }
      };
      fetchAssignedTasks();
    }
  }, [userId]);

  const resetForm = () => {
    setTasks([]);
    setTaskName('');
    setStatus('In Progress');
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();

    if (!taskName) {
      toast({
        title: "Task is required.",
        description: "Please select or enter a task before submitting.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const updatedTasks = [...tasks, { taskName, status }];
    setTasks(updatedTasks);

    toast({
      title: "Task Added.",
      description: "The task has been added to your report.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setTaskName('');
    setStatus('In Progress');
    setIsTaskModalOpen(false);
  };

  const handleSaveCustomTask = async (event) => {
    event.preventDefault();

    if (!taskName) {
      toast({
        title: "Task Name is required.",
        description: "Please enter a task name before submitting.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const updatedTasks = [...tasks, { taskName, status }];
    setTasks(updatedTasks);

    toast({
      title: "Custom Task Added.",
      description: "The custom task has been added to your report.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setTaskName('');
    setStatus('In Progress');
    setIsCustomTaskModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (tasks.length === 0) {
      toast({
        title: "No Tasks Selected.",
        description: "Please add at least one task before submitting the report.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const report = {
      userId: parseInt(userId, 10),
      tasks,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof onSubmit === 'function') {
      try {
        await onSubmit(report);
        toast({
          title: "Report Saved.",
          description: "Your report has been saved successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetForm();
        onClose();
      } catch (error) {
        console.error("Error adding report:", error);
        toast({
          title: "Error adding report.",
          description: error.response?.data?.message || "An error occurred while adding the report.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.error('onSubmit is not a function');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Daily Report</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div>
            <Button colorScheme="blue" mr={3} width={230} onClick={() => setIsTaskModalOpen(true)}>
              + Add Task
            </Button>
            <Button colorScheme="blue" width={200} onClick={() => setIsCustomTaskModalOpen(true)}>
              + Add Custom Task
            </Button>
          </div>

          {/* Task Modal */}
          <Modal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setTaskName('');
            }}
            size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <FormControl id="assignedTasks" mb={4}>
                  <FormLabel>My Assigned Tasks</FormLabel>
                  <Select
                    placeholder="Select a task"
                    value={taskName ? assignedTasks.find(task => task.taskName === taskName)?.id : ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const selectedTask = assignedTasks.find(task => task.id === parseInt(selectedValue));
                      console.log(selectedTask);

                      if (selectedTask) {
                        setTaskName(selectedTask.taskName); // Update taskName
                        setStatus(selectedTask.status);     // Update status
                      }
                    }}
                  >
                    {assignedTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.taskName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id="status" mb={4}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSaveTask}>
                  Save Task
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsTaskModalOpen(false);
                  setTaskName('');
                  setStatus('In Progress');
                }}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>


          {/* Custom Task Modal */}
          <Modal
            isOpen={isCustomTaskModalOpen}
            onClose={() => {
              setIsCustomTaskModalOpen(false);
              setTaskName('');
            }}
            size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <FormControl id="taskName" mb={4}>
                  <FormLabel>Custom Task Name</FormLabel>
                  <Input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                </FormControl>

                <FormControl id="status" mb={4}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleSaveCustomTask}>
                  Save Custom Task
                </Button>
                <Button variant="outline" onClick={() => {
                  setTaskName('');
                  setStatus('In Progress');
                  setIsCustomTaskModalOpen(false);
                }}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Display selected tasks */}
          <div>
            <h4>Selected Tasks:</h4>
            <ul>
              {tasks.map((task, index) => (
                <li key={index}>{task.taskName} - {task.status}</li>
              ))}
            </ul>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save Report
          </Button>
          <Button variant="outline" onClick={() => {
            onClose();
            resetForm();
          }}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddDailyReportModal;
