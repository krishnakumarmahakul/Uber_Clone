const  express = require('express');
const router = express.Router();
const { body } = require("express-validator");  
const captainController = require("../controller/captain.controller");

router.post("/register",
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("fullname.firstname")
          .isLength({ min: 3 })
          .withMessage("First name must be at least 3 characters long"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
      ],
      captainController.registerCaptain
);

router.post("/login",
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
      ]
,
captainController.loginCaptain
);

router.get("/profile",
captainController.getCaptainProfile);

router.post("/logout",captainController.logoutCaptain);

module.exports = router;