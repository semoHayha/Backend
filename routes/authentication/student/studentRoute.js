const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const {
	studentSignUp,
	studentSignIn,
	isSignedInForStudent,
	studentSignOut,
	isLoggedIn,
	passportStudentSignIn,
	passportLoginStudent,
	changePassword,
	getUserById,
} = require("../../../controllers/auth/authStudent");
const passport = require("passport");
const { passportLogin } = require("../../../controllers/passport");

router.post(
	"/student/signUp",
	check("studFirstName", "please provide first name of at most 15 digits")
		.exists()
		.isLength({ min: 1 }),
	check("studLastName", "please provide last name of at most 15 digits")
		.exists()
		.isLength({ min: 1 }),

	check("rollNumber", "please provide 10 digit roll number")
		.exists()
		.isLength({ min: 10, max: 10 }),
	check("branch", "Branch should be 'cse','tt' or 'tc'").exists(),
	check("year", "please provide year as '1y', '2y', '3y' or '4y'").exists(),
	check("email", "Enter valid email address").exists().isEmail(),
	check("password", "Password should consist of at least 5 digits")
		.exists()
		.isLength({
			min: 5,
		}),
	check("mobileNo", "Contact no. should consist of 10 digits")
		.exists()
		.isLength({
			max: 10,
			min: 10,
		}),
	studentSignUp
);

router.post(
	"/student/signin",
	check("rollNumber", "please provide 10 digit roll number")
		.exists()
		.isLength({ max: 10, min: 10 }),
	check("password", "Password should consist of at least 5 digits")
		.exists()
		.isLength({
			min: 5,
		}),

	passportStudentSignIn
);

router.get(
	"/isSigned",
	(req, res, next) => {
		next();
	},
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		return res.json({ token: req.cookies.jwt, user: req.user });
	}
);

router.get(
	"/student/signOut",
	(req, res, next) => {
		console.log("adsjdahdkajhdsajdhajk");
		next();
	},
	passport.authenticate("jwt", { session: false }),
	studentSignOut
);

//change password and logout after changing
router.post("/changePassword", changePassword, (req, res) => {
	req.logOut();
	return res.json(req.stud);
});
module.exports = router;
