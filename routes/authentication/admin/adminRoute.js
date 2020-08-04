const express = require("express");
const {
	signUp,
	updatePassword,
	adminSignIn,
	isSignedIn,
	isAdminExistForCollege,
	signOut,
	getProfileById,
	isAuthenticated,
} = require("../../../controllers/auth/authAdministration");
const router = express.Router();
const { check, validationResult, exists } = require("express-validator");

const passport = require("passport");
const { authenticate } = require("passport");

//signUp route for ADMIN and LIBRARIAN
//By using 'isAdminExistForCollege' route, ADMIN will be assigned on basis of collegeCode and only one ADMIN is allowed on each collegeCode
router.post(
	"/administration/signUp",
	//TODO: add check for empId length
	check("empId", "Enter valid Employee Id").exists().isLength({ min: 2 }),

	check("roleInLibrary", "Enter role of person as 'admin' or 'librarian")
		.exists()
		.isLength({ min: 1 }),
	check("collegeCode", "Enter college code (minimum 2 digits)")
		.exists()
		.isLength({ min: 2 }),
	check(
		"empFirstName",
		"First Name should be less then 15 characters"
	).isLength({
		min: 1,
		max: 15,
	}),
	check("empLastName", "Last Name should be less then 15 characters")
		.exists()
		.isLength({
			max: 15,
			min: 1,
		}),

	check("email", "Enter valid email address").exists().isEmail(),
	check("mobileNo", "Mobile number should consist of 10 digits")
		.exists()
		.isLength({
			max: 10,
			min: 10,
		}),
	check("password", "Password should consist of at least 5 digits")
		.exists()
		.isLength({
			min: 5,
		}),
	isAdminExistForCollege,
	signUp
);

//signIn route
router.post(
	"/administration/signIn",
	check("empId", "please provide 10 digit roll number")
		.exists()
		.isLength({ max: 10, min: 1 }),
	check("password", "Password should consist of at least 5 digits")
		.exists()
		.isLength({
			min: 5,
		}),

	adminSignIn
);

router.param("profileId", getProfileById);
router.post("/getUser/:profileId", isSignedIn,isAuthenticated,(req, res) => {
	return res.json(req.profile);
});

router.get(
	"/administration/isSigned",
	isSignedIn,
	(req, res) => {
		return res.json({ token: req.cookies.jwt, user: req.user });
	}
);

router.get(
	"/administration/signOut",
	isSignedIn,
	signOut
);

//reset password
router.post(
	"/administration/updatePassword",
	check("password", "Password should consist of at least 5 digits").isLength({
		min: 5,
	}),
	check(
		"new_password",
		"New Password should consist of at least 5 digits"
	).isLength({
		min: 5,
	}),
	isSignedIn,

	updatePassword
);

module.exports = router;
