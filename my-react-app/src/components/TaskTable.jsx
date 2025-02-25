import React, { useState, useEffect } from 'react';
import { useDisclosure, IconButton } from '@chakra-ui/react';
import { ImBin2 } from "react-icons/im";
import { getTags } from '../Services/TagService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmCompleteModal from './ConfirmCompleteModal';
import ConfirmSentToQAModal from './ConfirmSentToQAModal';
import ViewTaskDrawer from './ViewTaskDrawer';
import { deleteTask, sendToQA } from '../Services/TaskService';
import { BsFillSendFill } from "react-icons/bs";

const TaskTable = ({ tasks, onStatusChange, users }) => {
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isSendToQAOpen, onOpen: onSendToQAOpen, onClose: onSendToQAClose } = useDisclosure();
    const { isOpen: isCompleteOpen, onClose: onCompleteClose } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToSendToQA, setTaskToSendToQA] = useState(null);
    const [taskToComplete, setTaskToComplete] = useState(null);
    const [tags, setTags] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [columnWidths, setColumnWidths] = useState(['5%', '35%', '28%', '8%', '10%', '11%', '3%']);
    const [filteredTasks, setFilteredTasks] = useState(tasks);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await getTags();
                setTags(response.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    const handleStatusChange = (taskId, newStatus) => {
        if (onStatusChange) {
            onStatusChange(taskId, newStatus);
        }
    };

    const getTagNamesByIds = (tagIds) => {
        const tagMap = new Map(tags.map(tag => [tag.id, tag.tagName]));
        return tagIds.map(id => tagMap.get(id) || 'NA');
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        if (taskToDelete) {
            try {
                await deleteTask(taskToDelete.id); // Call deleteTask API
                setFilteredTasks(filteredTasks.filter(task => task.id !== taskToDelete.id)); // Update displayed tasks
                setTaskToDelete(null);
                onDeleteClose();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };


    const handleSendToQA = (task) => {
        setTaskToSendToQA(task);
        onSendToQAOpen();
    };

    const confirmSendToQA = async () => {
        if (taskToSendToQA) {
            try {
                await sendToQA(taskToSendToQA.id)
                setFilteredTasks(filteredTasks.filter(task => task.id !== taskToSendToQA.id));
                setTaskToSendToQA(null);
                onSendToQAClose();
            } catch (error) {
                console.error('Error sending to QA:', error);
            }
        };
    }


    const confirmComplete = () => {
        if (onStatusChange && taskToComplete) {
            onStatusChange(taskToComplete.id, 'Completed');
            setTaskToComplete(null);
            onCompleteClose();
        }
    };

    const getUserNameById = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.userName : 'Unknown';
    };

    const sortedTasks = filteredTasks
        .filter(task => task.status !== 'Completed')
        .filter(task => !task.isDelete)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        onDrawerOpen();
    };

    const startResize = (index, e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[index] === '5%' ? 40 : columnWidths[index];
        const onMouseMove = (moveEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            setColumnWidths((prevWidths) => {
                const updatedWidths = [...prevWidths];
                updatedWidths[index] = Math.max(newWidth, 50);
                return updatedWidths;
            });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const getRowColorByStatus = (status) => {
        switch (status) {
            case 'Not Started':
                return '#CDF5FD';
            case 'In Progress':
                return '#A0E9FF';
            case 'On Hold':
                return '#89CFF3';
            default:
                return 'transparent';
        }
    };

    return (
        <>
            <style>
                {`
                    .table-container {
                        overflow-x: auto;
                    }
                    .column_resize_table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .column_resize_table th, 
                    .column_resize_table td {
                        padding: 8px;
                        text-align: left;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        border: 1px solid #EFFFFD; 
                    }
                    .column_resize_table th {
                        background-color: #ECF9FF;
                    }
                    .tag {
                        background-color: green;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 6px;
                        margin-right: 8px;
                    }
                    .status-select {
                          padding: 4px;
                          border-radius: 5px;
                           border: 1px solid #9e9e9e;
                          background-color: transparent; 
                          width: 100%; 
                    }
                    .delete-button {
                        background-color: red;
                        color: white;
                        border: none;
                        padding: 6px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .no-tasks {
                        text-align: center;
                        color: gray;
                        padding: 8px;
                    }
                    .resizer {
                        cursor: ew-resize;
                        width: 10px;
                        display: inline-block;
                        height: 100%;
                        position: absolute;
                        right: 0;
                        top: 0;
                        z-index: 1;
                    }
                `}
            </style>
            <div className="table-container">
                <table className="column_resize_table">
                    <thead>
                        <tr>
                            {['Sr.', 'Task Name', 'Tags','Due Date', 'Created Date', 'Assigned To', 'Status', 'Actions'].map((header, index) => (
                                <th key={index} style={{ position: 'relative', width: columnWidths[index] }}>
                                    {header}
                                    {index < 2 && (
                                        <span
                                            className="resizer"
                                            onMouseDown={(e) => startResize(index, e)}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.length > 0 ? (
                            sortedTasks.map((task, index) => {
                                const taskNumber = `${task.idWithPrefix}`;

                                return (
                                    <tr key={task.id} style={{ backgroundColor: getRowColorByStatus(task.status) }}>
                                        <td style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>{taskNumber}</td>
                                        <td style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>{task.taskName}</td>
                                        <td style={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', width: '108px ' }}>
                                                {getTagNamesByIds(task.tagIDs || []).map((tagName, idx) => (
                                                    <span key={idx} className="tag">
                                                        {tagName}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            {task.createdAt ? new Intl.DateTimeFormat('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }).format(new Date(task.dueDate)) : ''}
                                        </td>
                                        <td>
                                            {task.createdAt ? new Intl.DateTimeFormat('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            }).format(new Date(task.createdAt)) : ''}
                                        </td>
                                        <td>{getUserNameById(task.taskAssignedToID)}</td>
                                        <td>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                className="status-select"
                                                style={{ width: '108px ', fontSize: '15px', padding: '4px' }}
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </td>
                                        <td>
                                            <IconButton
                                                icon={<ImBin2 size={20} />}
                                                onClick={() => handleDeleteClick(task)}
                                                variant="outline"
                                                title="Delete"
                                                border={0}
                                                colorScheme="red"
                                            />
                                            <IconButton
                                                icon={<BsFillSendFill size={20} />}
                                                onClick={() => handleSendToQA(task)}
                                                variant="outline"
                                                title="Send to QA"
                                                border={0}
                                                colorScheme="black"
                                                _hover={{ bg: 'white' }}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="no-tasks">
                                    No tasks available
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onConfirm={confirmDelete}
                itemName={taskToDelete ? taskToDelete.taskName : ''}
            />

            <ConfirmSentToQAModal
                isOpen={isSendToQAOpen}
                onClose={onSendToQAClose}
                onConfirm={confirmSendToQA}
                itemName={taskToSendToQA ? taskToSendToQA.taskName : ''}
            />

            <ConfirmCompleteModal
                isOpen={isCompleteOpen}
                onClose={onCompleteClose}
                onConfirm={confirmComplete}
                itemName={taskToComplete ? taskToComplete.taskName : ''}
            />

            <ViewTaskDrawer
                isOpen={isDrawerOpen}
                onClose={onDrawerClose}
                task={selectedTask}
                users={users}
                tags={tags}
                onStatusChange={handleStatusChange}
            />
        </>
    );
};

export default TaskTable;
