import axios from 'axios';

// Base URL for comments API endpoints
const API_URL = 'http://localhost:8080/comment';

// Fetch all comments
export const getAllComments = () => {
  return axios.get(API_URL);
};

// Fetch a comment by ID
export const getCommentById = (commentId) => {
  return axios.get(`${API_URL}/${commentId}`);
};

// Fetch comments for a specific task
export const getCommentsByTaskId = (taskId) => {
  return axios.get(`${API_URL}/task/${taskId}`);
};

// Create a new comment
export const createComment = (commentData) => {
  console.log("Comment Data => ", commentData)
  return axios.post(API_URL, commentData);
};

export const addMediaAsComment = (commentData) => {
  return axios.post(`${API_URL}/addMedia`, commentData);
}

export const addComments = async (commentData) => {
  try {
    const formData = new FormData();
    formData.append('taskId', commentData.taskId);
    formData.append('createdByUserId', commentData.createdByUserId);
    formData.append('textCommentforViewtask', commentData.textCommentforViewtask);

    if (commentData.mediaFiles && commentData.mediaFiles.length > 0) {
      commentData.mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });
    }

    const response = await axios.post(`${API_URL}/addMedia`, formData);
   
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};



// Update an existing comment
export const updateComment = async (comment) => {
  try {
    const response = await axios.put(`${API_URL}/${comment.id}`, comment);
    return response.data;
  } catch (error) {
    console.error('Failed to update comment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Delete a comment
export const deleteComment = (commentId) => {
  return axios.delete(`${API_URL}/${commentId}`);
};


