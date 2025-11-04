/*!
 * check4ai.httpHelper
 * Copyright(c) 2023-2025 Ali Murat Bozaci
 * GNU General Public License v3.0
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default;

/**
 * HTTP Helper with retry logic and error handling
 */

// Configure axios with retry logic
const createAxiosInstance = (retries = 3) => {
    const instance = axios.create({
        timeout: 30000, // 30 seconds
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'check4ai/0.0.3-beta'
        }
    });

    // Configure retry logic
    axiosRetry(instance, {
        retries: retries,
        retryDelay: (retryCount) => {
            // Exponential backoff: 1s, 2s, 4s, 8s
            return Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
        },
        retryCondition: (error) => {
            // Retry on network errors or 5xx server errors
            return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                   (error.response && error.response.status >= 500);
        },
        onRetry: (retryCount, error, requestConfig) => {
            console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
        }
    });

    return instance;
};

/**
 * Make HTTP POST request with retry logic
 */
const post = async (url, data, options = {}) => {
    const { retries = 3, timeout = 30000, ...axiosOptions } = options;

    const instance = createAxiosInstance(retries);
    instance.defaults.timeout = timeout;

    try {
        const response = await instance.post(url, data, axiosOptions);
        return response;
    } catch (error) {
        // Transform error for better handling
        return {
            error: true,
            status: error.response?.status || 0,
            statusText: error.response?.statusText || 'Unknown Error',
            message: error.message,
            data: error.response?.data
        };
    }
};

/**
 * Make HTTP GET request with retry logic
 */
const get = async (url, options = {}) => {
    const { retries = 3, timeout = 30000, ...axiosOptions } = options;

    const instance = createAxiosInstance(retries);
    instance.defaults.timeout = timeout;

    try {
        const response = await instance.get(url, axiosOptions);
        return response;
    } catch (error) {
        // Transform error for better handling
        return {
            error: true,
            status: error.response?.status || 0,
            statusText: error.response?.statusText || 'Unknown Error',
            message: error.message,
            data: error.response?.data
        };
    }
};

/**
 * Check if response is an error
 */
const isError = (response) => {
    return response.error === true || response.status >= 400;
};

module.exports = {
    createAxiosInstance,
    post,
    get,
    isError
};
