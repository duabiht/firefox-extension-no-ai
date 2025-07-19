// Create a DevTools panel for the no-ai extension
chrome.devtools.panels.create(
    "No-AI Filter",
    "icon-48.png",
    "panel.html",
    function(panel) {
        console.log("No-AI DevTools panel created");
        
        // Optional: Handle panel show/hide events
        panel.onShown.addListener(function(window) {
            console.log("No-AI panel shown");
        });
        
        panel.onHidden.addListener(function() {
            console.log("No-AI panel hidden");
        });
    }
);
