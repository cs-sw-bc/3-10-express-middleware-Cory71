import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("All users");
});

router.post("/", (req, res) => {
  res.send("Create a user");
});

function validateSecret(req, res, next) {
  if (req.body.secret) {
    next();
  } else {
    res.status(401).send("Unauthorized: Missing secret");
  }
}

router.post("/test-json", (req, res) => {
  console.log("Received JSON body:", req.body);
  res.json({
    message: "JSON parsed successfully!",
    yourData: req.body
  });
});

router.get("/test-form", (req, res) => {
  res.sendFile("test-form.html", { root: "./public" });
});

router.post("/test-form", (req, res) => {
  console.log("Received FORM body:", req.body);
  res.json({
    message: "Form data parsed successfully!",
    yourData: req.body
  });
});

// Protected route that requires a secret in the request body
router.post("/protected", validateSecret, (req, res) => {
  res.json({
    message: "Access granted to protected route!",
    yourData: req.body
  });
});

export default router;
