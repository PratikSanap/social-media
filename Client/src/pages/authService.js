import axios from 'axios';

export const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:5500/api/media/token', { token: refreshToken });
        const { accessToken } = response.data;
        console.log(accessToken);
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Unable to refresh access token:', error);
        return null;
    }
};

export const makeAuthenticatedRequest = async (url, options) => {
    let accessToken = localStorage.getItem('accessToken');

    try {
        const response = await axios(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            accessToken = await refreshAccessToken();
            if (accessToken) {
                const response = await axios(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                return response;
            }
        }
        throw error;
    }
};
