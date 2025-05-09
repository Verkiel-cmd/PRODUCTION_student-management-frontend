

const config = {
    API_URL: import.meta.env.VITE_API_URL, // Use Vite's environment variable
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
};

console.log('Config:', {
    API_URL: config.API_URL,
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
});

export default config;