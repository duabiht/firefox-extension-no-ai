// Create a DevTools panel for the Filterit extension
chrome.devtools.panels.create(
    "Filterit",
    "icon-48.png",
    "panel.html",
    function(panel) {
        console.log("Filterit DevTools panel created");
        
        // Optional: Handle panel show/hide events
        panel.onShown.addListener(function(window) {
            console.log("Filterit panel shown");
        });
        
        panel.onHidden.addListener(function() {
            console.log("Filterit panel hidden");
        });
    }
);
