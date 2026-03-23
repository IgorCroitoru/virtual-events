const GameConfig = {
    // Game Canvas Size
    gameWidth: 1920, // Change as needed
    gameHeight: 1080,
    screenMinWidth: 400, // Minimum screen width
    mapScaleY: 1.3,// Margin for 
    // Player Settings
    playerWidth: 75, // UI & Phaser sprite width
    playerHeight: 75, // UI & Phaser sprite height
    playerSpeed: 250, // Adjust movement speed

    // Camera Settings
    minZoom: 0.5,  // Minimum camera zoom
    maxZoom: 2,    // Maximum camera zoom
    zoomStep: 0.25, // Zoom change step for smoother transitions
    zoomDuration: 250, // Zoom tween duration (ms)
    
    // Dragging (Grabbing) Sensitivity
    dragFriction: 0.9, // Controls inertia slowdown
    dragSmoothness: 16, // Delay per frame for smoothing
};

export default GameConfig;
