// Panel JavaScript for the No-AI DevTools panel
let logs = [];
let stats = {
    postsFound: 0,
    postsHidden: 0,
    filterRuns: 0
};

// Initialize the panel
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.type === 'no-ai-log') {
            addLog(message.level, message.message, message.data);
        } else if (message.type === 'no-ai-stats') {
            updateStatsFromMessage(message.stats);
        }
    });
    
    // Connect to the current tab to start receiving logs
    connectToContentScript();
});

function connectToContentScript() {
    // Inject a script to establish communication
    chrome.devtools.inspectedWindow.eval(`
        // Send existing stats if available
        if (window.noAIStats) {
            chrome.runtime.sendMessage({
                type: 'no-ai-stats',
                stats: window.noAIStats
            });
        }
    `);
}

function addLog(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs = logs.slice(-100);
    }
    
    renderLogs();
}

function renderLogs() {
    const logContent = document.getElementById('logContent');
    
    const logHtml = logs.map(log => {
        const dataText = log.data ? ` ${JSON.stringify(log.data)}` : '';
        return `
            <div class="log-entry">
                <span class="log-timestamp">[${log.timestamp}]</span>
                <span class="log-level-${log.level}">[${log.level.toUpperCase()}]</span>
                ${log.message}${dataText}
            </div>
        `;
    }).join('');
    
    logContent.innerHTML = logHtml || '<div class="log-entry">No logs yet...</div>';
    
    // Auto-scroll to bottom
    logContent.scrollTop = logContent.scrollHeight;
}

function updateStats() {
    document.getElementById('postsFound').textContent = stats.postsFound;
    document.getElementById('postsHidden').textContent = stats.postsHidden;
    document.getElementById('filterRuns').textContent = stats.filterRuns;
}

function updateStatsFromMessage(newStats) {
    stats = { ...stats, ...newStats };
    updateStats();
}

function runFilter() {
    // Send message to content script to run filter
    chrome.devtools.inspectedWindow.eval(`
        if (typeof runWithCustomKeywords === 'function') {
            runWithCustomKeywords();
        } else {
            console.log('[no-ai] Filter function not available');
        }
    `);
}

function clearLogs() {
    logs = [];
    renderLogs();
    addLog('info', 'Logs cleared from DevTools panel');
}

function exportLogs() {
    const logText = logs.map(log => {
        const dataText = log.data ? ` ${JSON.stringify(log.data)}` : '';
        return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataText}`;
    }).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `no-ai-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('info', 'Logs exported successfully');
}

// Initialize with a welcome message
addLog('info', 'No-AI DevTools panel ready');
addLog('debug', 'Monitoring Reddit AI post filtering activity');
