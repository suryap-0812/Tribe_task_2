// Utility to reset mock data to initial state
// Use this if you want to reset all data back to the original mock data

export const resetMockData = () => {
    const keys = [
        'tribetask_mock_tasks',
        'tribetask_mock_tribes',
        'tribetask_mock_sessions',
        'tribetask_mock_user',
        'tribetask_mock_counters'
    ];

    keys.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('✅ Mock data reset! Refresh the page to load initial mock data.');
    window.location.reload();
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
    window.resetMockData = resetMockData;
}

export default resetMockData;
