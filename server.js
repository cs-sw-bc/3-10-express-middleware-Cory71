import express from "express";
import usersRoute from "./routes/user.js";
import { set } from "mongoose";

const app = express();
app.disable('x-powered-by'); // Disable Express's default X-Powered-By header
app.use(express.json());

app.use(express.static('public'));

function maintenance(req, res, next) {
    res.send("The site is currently down for maintenance.");
}

app.use(express.urlencoded({ extended: true }));

// Maintenance mode is now DISABLED
// app.use(maintenance);

// Challenge 10: Log how long each request takes (START TIMING FIRST)
// POSTMAN TEST: Make any request → check console for request duration
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`⏱️  Request started: ${req.method} ${req.path}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`⏱️  Request completed: ${req.method} ${req.path} - took ${duration}ms`);
    });
    
    next();
});

// Challenge 1: Block requests from Postman (REJECT EARLY)
// POSTMAN TEST: Uncomment code below, restart server, try any request → should get 403 error
// app.use((req, res, next) => {
//     const userAgent = req.headers["user-agent"];
//     if (userAgent && userAgent.includes("Postman")) {
//         return res.status(403).send("Access denied: Postman requests are blocked");
//     }
//     next();
// });

// Challenge 5: Allow requests only during business hours (BLOCK BEFORE PROCESSING)
// POSTMAN TEST: Try requests at different times → only works 9 AM - 10 PM
app.use((req, res, next) => {
    const currentHour = new Date().getHours();
    console.log(`Current hour: ${currentHour}`);
    
    if (currentHour >= 9 && currentHour < 22) {
        console.log("Within business hours - allowing request");
        next();
    } else {
        console.log("Outside business hours - blocking request");
        res.status(403).send("Server closed. Try again later.");
    }
});

// Challenge 2: Add custom header to every response (HEADERS FOR VALID REQUESTS)
// POSTMAN TEST: Make any request → check Headers tab → look for "X-Powered-By: Express-Lesson"
app.use((req, res, next) => {
    console.log("Setting custom header: X-Powered-By = Express-Lesson");
    res.setHeader("X-Powered-By", "Express-Lesson");
    next();
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} received at ${new Date().getTime()}`);
    next();
});

app.use((req, res, next) => {
    setTimeout(() => {
        next();
    }, 2000);
});

// Challenge 6: Count requests per route (COUNT ONLY VALID REQUESTS)
// POSTMAN TEST: Make multiple requests to different routes → check console for counts
const routeCounts = {};
app.use((req, res, next) => {
    const path = req.path;
    routeCounts[path] = (routeCounts[path] || 0) + 1;
    console.log(`Route ${path} hit ${routeCounts[path]} time(s)`);
    console.log("All route counts:", routeCounts);
    next();
});

// Challenge 8: Convert incoming names to uppercase (MODIFY DATA BEFORE ROUTES)
// POSTMAN TEST: POST http://localhost:3000/user/test-json with {"name": "bob"} → name becomes "BOB"
app.use((req, res, next) => {
    if (req.body && req.body.name) {
        console.log(`Converting name "${req.body.name}" to uppercase`);
        req.body.name = req.body.name.toUpperCase();
        console.log(`Name is now: "${req.body.name}"`);
    }
    next();
});

// Challenge 4: Delay requests conditionally (DELAYS AFTER OTHER PROCESSING)
// POSTMAN TEST: GET http://localhost:3000/user/?slow=true → request takes 3+ seconds
// POSTMAN TEST: GET http://localhost:3000/user/ → normal speed
app.use((req, res, next) => {
    if (req.query.slow === 'true') {
        console.log("Slow parameter detected - delaying request by 3 seconds...");
        setTimeout(() => {
            console.log("Delay complete - continuing request");
            next();
        }, 3000);
    } else {
        next();
    }
});

// Bonus Challenge: Easter Egg Middleware (INTERCEPT SPECIAL PATHS)
// POSTMAN TEST: GET http://localhost:3000/magic → special message (no route needed!)
app.use((req, res, next) => {
    if (req.path === '/magic') {
        console.log("🎉 Magic path detected! Responding with easter egg...");
        return res.send("✨ Middleware is magic ✨");
    }
    next();
});

// Challenge 3: Middleware that only runs for a specific route
// POSTMAN TEST: GET http://localhost:3000/profile → check console for "Checking profile access..."
app.get('/profile', (req, res, next) => {
    console.log("Checking profile access...");
    next();
}, (req, res) => {
    res.send("Welcome to your profile!");
});



app.use('/user', usersRoute);

// Challenge 7: Validate required query parameters
// POSTMAN TEST: GET http://localhost:3000/search?term=example → works
// POSTMAN TEST: GET http://localhost:3000/search → 400 error
app.get('/search', (req, res, next) => {
    if (!req.query.term) {
        return res.status(400).json({
            error: "Missing required query parameter",
            message: "Please provide a 'term' parameter. Example: /search?term=yourSearchTerm"
        });
    }
    next();
}, (req, res) => {
    res.json({
        message: "Search completed!",
        searchTerm: req.query.term,
        results: [`Result 1 for "${req.query.term}"`, `Result 2 for "${req.query.term}"`]
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));