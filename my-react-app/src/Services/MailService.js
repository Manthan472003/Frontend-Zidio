import axios from 'axios';

const API_URL = 'http://localhost:8080/sendMail';

export const sendEmail = async (emailContent) => {
    try {
        const response = await axios.post(API_URL, emailContent, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data; 
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};


export const sendOtp = async ({ email }) => {
    console.log("BEFORE SENDING => ", { email });
    const response = await axios.post(`${API_URL}/sendOtp`, { email });
    console.log(response.data);
    console.log("AFTER SENDING => ", { email });

    return response;

}

export const verifyOtp = async (otpContent) => {
    console.log("BEFORE VERIFYING => ", otpContent);
    const response = await axios.post(`${API_URL}/verifyOtp`, otpContent);
    console.log(response.data);
    // console.log(response);
    console.log("AFTER VERIFYING => ", otpContent);

    return response;

}