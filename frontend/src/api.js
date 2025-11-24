import axios from 'axios';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

export const getCustomers = async () => {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data.customers;
};

export const getEmails = async (customerId) => {
    const response = await axios.get(`${API_URL}/emails`, {
        params: { customer_id: customerId }
    });
    return response.data.emails;
};

export const predictTag = async (emailText, customerId) => {
    const response = await axios.post(`${API_URL}/predict`, {
        email_text: emailText,
        customer_id: customerId
    });
    return response.data;
};
