const express = require('express');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// ============= CONFIGURATION =============
const REAL_AUTH_KEYS = ['zRkaP4c15osmNs27us', 'xY9wV8u7T6s5R4q3P2'];
const ADMIN_SECRET = 'IloveallpeopleXer';

// Your real script (the one you want to protect)
const PROTECTED_SCRIPT = `loadstring(game:HttpGet("https://load-lime.vercel.app"))()`;

// Your real script parts (split into chunks for extra protection)
const SCRIPT_PARTS = {
    part1: `-- Part 1: Environment Check
local function checkEnvironment()
    if not game or not game.HttpGet then
        return false
    end
    return true
end`,
    
    part2: `-- Part 2: Main Loader
local function loadMainScript()
    if checkEnvironment() then
        ${PROTECTED_SCRIPT}
    else
        print("Environment validation failed")
    end
end`,
    
    part3: `-- Part 3: Execute
loadMainScript()`
};

// Fake decoy scripts (skidders get these)
const DECOY_SCRIPTS = [
    `print("Error: Invalid authentication")
print("Contact developer for access")`,
    
    `-- Fake script 1
print("Loading...")
wait(2)
print("Access denied")`,
    
    `-- Fake script 2
local function fakeFunction()
    print("Script is under maintenance")
    return false
end
fakeFunction()`,
    
    `-- Fake script 3
print("hi skidd")
print("Hi skidder")`,
    
    `-- Fake script 4
loadstring(game:HttpGet("https://pastefy.app/MqlHJeCW/raw"))()`,
];

// User session tracking
const userSessions = new Map();
const rateLimits = new Map();

// ============= UTILITY FUNCTIONS =============
function generateTimeBasedToken(hwid) {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
    return crypto.createHash('sha256').update(hwid + currentHour.toString()).digest('hex').substring(0, 16);
}

function validateTimeBasedToken(hwid, token) {
    const currentToken = generateTimeBasedToken(hwid);
    const previousToken = crypto.createHash('sha256').update(hwid + (Math.floor(Date.now() / (1000 * 60 * 60)) - 1).toString()).digest('hex').substring(0, 16);
    return token === currentToken || token === previousToken;
}

function isValidHWID(hwid) {
    // Basic HWID validation (you can make this more complex)
    return hwid && hwid.length >= 10 && /^[a-zA-Z0-9]+$/.test(hwid);
}

function getRealScript() {
    // Combine all parts with random spacing and comments
    const randomComments = [
        '-- Protected by Aux Development',
        '-- Authentication verified',
        '-- HWID validated',
        '-- Time lock passed'
    ];
    
    return `${randomComments[Math.floor(Math.random() * randomComments.length)]}
    
${SCRIPT_PARTS.part1}

${randomComments[Math.floor(Math.random() * randomComments.length)]}

${SCRIPT_PARTS.part2}

${randomComments[Math.floor(Math.random() * randomComments.length)]}

${SCRIPT_PARTS.part3}

${randomComments[Math.floor(Math.random() * randomComments.length)]}`;
}

function getDecoyScript() {
    return DECOY_SCRIPTS[Math.floor(Math.random() * DECOY_SCRIPTS.length)];
}

// ============= RATE LIMITING =============
function checkRateLimit(ip) {
    const now = Date.now();
    const key = ip;
    
    if (!rateLimits.has(key)) {
        rateLimits.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
        return true;
    }
    
    const limit = rateLimits.get(key);
    if (now > limit.resetTime) {
        rateLimits.set(key, { count: 1, resetTime: now + 60000 });
        return true;
    }
    
    if (limit.count >= 10) { // Max 10 requests per minute
        return false;
    }
    
    limit.count++;
    return true;
}

// ============= MAIN ENDPOINTS =============

// Main protection endpoint
app.get('/', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
        return res.status(429).send('Rate limited - too many requests');
    }
    
    // Check if request is from Roblox
    if (!userAgent.includes('Roblox') && !userAgent.includes('HttpService')) {
        return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Access Denied</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                
                body {
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #ffffff;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                
                body::before {
                    content: '';
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
                    z-index: -1;
                }
                
                .container {
                    text-align: center;
                    background: rgba(15, 15, 15, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 60px 40px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    max-width: 500px; width: 90%;
                }
                
                .logo { margin-bottom: 40px; height: 80px; display: flex; align-items: center; justify-content: center; }
                .logo img { max-height: 80px; max-width: 200px; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3)); border-radius: 8px; }
                
                .verifying {
                    font-size: 28px; font-weight: 500; margin: 40px 0; color: #3b82f6;
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .protection-message {
                    display: none; animation: fadeInUp 0.8s ease-out forwards;
                }
                
                .protection-text { font-size: 18px; color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; }
                .aux-text {
                    font-size: 32px; font-weight: 700;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
                    background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    margin: 24px 0;
                }
                .denied {
                    font-size: 22px; font-weight: 600; color: #ef4444; margin-top: 32px;
                    padding: 16px 32px; border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px; background: rgba(239, 68, 68, 0.1);
                }
                
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="https://raw.githubusercontent.com/dark-Age3/ZyXn/main/download.jpeg" alt="Logo" />
                </div>
                <div class="verifying" id="verifying">Verifying<span class="dots">...</span></div>
                <div class="protection-message" id="protection-message">
                    <div class="protection-text">This Script Was Protected With</div>
                    <div class="aux-text">Aux Development</div>
                    <div class="denied">Access Denied</div>
                </div>
            </div>
            <script>
                setTimeout(() => {
                    const verifying = document.getElementById('verifying');
                    const protectionMessage = document.getElementById('protection-message');
                    verifying.style.transition = 'all 0.5s ease-out';
                    verifying.style.opacity = '0';
                    setTimeout(() => {
                        verifying.style.display = 'none';
                        protectionMessage.style.display = 'block';
                    }, 500);
                }, 8000);
            </script>
        </body>
        </html>
        `);
    }
    
    // Extract parameters
    const authKey = req.query.auth;
    const hwid = req.query.hwid;
    const token = req.query.token;
    const stage = req.query.stage || '1';
    
    // Multi-stage authentication
    switch(stage) {
        case '1':
            // Stage 1: Basic auth check
            if (!authKey || !REAL_AUTH_KEYS.includes(authKey)) {
                return res.send(getDecoyScript()); // Send decoy for invalid auth
            }
            
            // Valid auth - proceed to stage 2
            res.send(`loadstring(game:HttpGet("${req.protocol}://${req.get('host')}/?auth=${authKey}&stage=2&hwid=" .. gethwid()))()`);
            break;
            
        case '2':
            // Stage 2: HWID validation
            if (!authKey || !REAL_AUTH_KEYS.includes(authKey)) {
                return res.send(getDecoyScript());
            }
            
            if (!hwid || !isValidHWID(hwid)) {
                return res.send(`print("Invalid hardware ID")`);
            }
            
            // Generate time-based token
            const timeToken = generateTimeBasedToken(hwid);
            res.send(`loadstring(game:HttpGet("${req.protocol}://${req.get('host')}/?auth=${authKey}&hwid=${hwid}&token=${timeToken}&stage=3"))()`);
            break;
            
        case '3':
            // Stage 3: Final validation and script delivery
            if (!authKey || !REAL_AUTH_KEYS.includes(authKey)) {
                return res.send(getDecoyScript());
            }
            
            if (!hwid || !isValidHWID(hwid)) {
                return res.send(`print("Invalid hardware ID")`);
            }
            
            if (!token || !validateTimeBasedToken(hwid, token)) {
                return res.send(`print("Token expired or invalid")`);
            }
            
            // All checks passed - send real script
            userSessions.set(hwid, { lastAccess: Date.now(), authKey });
            res.send(getRealScript());
            break;
            
        default:
            res.send(getDecoyScript());
    }
});

// Admin endpoint to view statistics (optional)
app.get('/admin', (req, res) => {
    const secret = req.query.secret;
    if (secret !== ADMIN_SECRET) {
        return res.status(404).send('Not found');
    }
    
    const stats = {
        activeSessions: userSessions.size,
        rateLimitEntries: rateLimits.size,
        uptime: process.uptime()
    };
    
    res.json(stats);
});

app.listen(port, () => {
    console.log(`Advanced protection system running on port ${port}`);
    console.log('Protection features:');
    console.log('- Multi-stage authentication');
    console.log('- Time-based tokens');
    console.log('- HWID validation');
    console.log('- Decoy system');
    console.log('- Rate limiting');
    console.log('- Split script delivery');
});
