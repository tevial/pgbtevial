let tg = window.Telegram.WebApp;
let userId = tg.initDataUnsafe?.user?.id;
let lastClick = 0;
const COOLDOWN_TIME = 60000; // 60 seconds in milliseconds

// Initialize Telegram Mini App
tg.expand();

// Elements
const pointsDisplay = document.getElementById('points');
const earn2Button = document.getElementById('earn2');
const earn5Button = document.getElementById('earn5');
const cooldownDisplay = document.getElementById('cooldown');

// Load user points
async function loadPoints() {
    try {
        const response = await fetch(`/api/points/${userId}`);
        const data = await response.json();
        pointsDisplay.textContent = data.points;
    } catch (error) {
        console.error('Error loading points:', error);
    }
}

// Handle button clicks
async function earnPoints(amount) {
    const now = Date.now();
    if (now - lastClick < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastClick)) / 1000);
        cooldownDisplay.textContent = `Please wait ${remainingTime} seconds`;
        return;
    }

    try {
        const response = await fetch('/api/earn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                points: amount
            })
        });

        const data = await response.json();
        pointsDisplay.textContent = data.points;
        lastClick = now;
        
        // Start cooldown
        updateCooldown();
    } catch (error) {
        console.error('Error earning points:', error);
    }
}

// Update cooldown timer
function updateCooldown() {
    const updateTimer = () => {
        const now = Date.now();
        const timeSinceClick = now - lastClick;
        
        if (timeSinceClick < COOLDOWN_TIME) {
            const remainingTime = Math.ceil((COOLDOWN_TIME - timeSinceClick) / 1000);
            cooldownDisplay.textContent = `Cooldown: ${remainingTime}s`;
            earn2Button.disabled = true;
            earn5Button.disabled = true;
        } else {
            cooldownDisplay.textContent = 'Ready!';
            earn2Button.disabled = false;
            earn5Button.disabled = false;
        }
    };

    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
}

// Event listeners
earn2Button.addEventListener('click', () => earnPoints(2));
earn5Button.addEventListener('click', () => earnPoints(5));

// Initial load
loadPoints();
updateCooldown(); 