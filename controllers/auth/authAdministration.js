const Profile = require("../../models/Administration");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { validationResult } = require("express-validator");
const passport = require("passport");
const Administration = require("../../models/Administration");

exports.isAdminExistForCollege = (req, res, next) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		return res.json({
			error: error.array()[0].msg,
		});
	}
	if (req.body.roleInLibrary === "admin") {
		Profile.findOne({ collegeCode: req.body.collegeCode }).exec(
			(error, profile) => {
				if (error) {
					return res.json({
						status: false,
						error: `Some error occured. Please try again later!`,
					});
				}
				if (profile) {
					return res.json({
						status: false,
						error: `Admin is already registered on given college code`,
					});
				} else {
					next();
				}
			}
		);
	} else {
		next();
	}
};

//signUp controller
exports.signUp = (req, res) => {
	const error = validationResult(req);

	if (!error.isEmpty()) {
		return res.json({
			error: error.array()[0].msg,
		});
	}

	const profile = new Profile(req.body);

	profile.save((error, profile) => {
		if (error || !profile) {
			return res.json({
				error: `EmpId ${req.body.empId} is already registered. Please enter valid EmpId`,
			});
		}
		return res.json(profile);
	});
};

//signIn controller
exports.adminSignIn = (req, res, next) => {
	passport.authenticate("administrationLogin", (err, admin, info) => {
		if (err) {
			return res.json(err);
		}
		if (info) {
			return res.json(info);
		}
		req.logIn(admin, (err) => {
			if (err) {
				return res.json({ error: err });
			}

			res.cookie("jwt", jwtTokenGenerate(admin._id), {
				httpOnly: true,
				sameSite: true,
			});

			return res.json({
				_id: admin._id,
				empId: admin.empId,
				empFirstName: admin.empFirstName,
				empLastName: admin.empLastName,
				roleInLibrary: admin.roleInLibrary,
				email: admin.email,
				createdAt: admin.createdAt,
			});
		});
	})(req, res, next);
};

const jwtTokenGenerate = (id) => {
	const token = jwt.sign({ sub: id, type: "admin" }, process.env.SECRET, {
		expiresIn: 1000,
	});
	return token;
};

// exports.isSignedIn = expressJwt({
// 	secret: process.env.SECRET,
// 	userProperty: "auth",
// 	algorithms: ["HS256"],
// });

exports.signOut = (req, res) => {
	console.log(req.isAuthenticated());
	res.clearCookie("jwt");
	req.logOut();
	req.session.destroy();
	return res.json({ message: "Successfully Log out" });
};

//used for checking own account
//used when changing settings in own account
exports.isAuthenticated = (req, res, next) => {
	console.log(req.user);
	console.log(req.profile);
	const check =
		req.user && req.profile && req.user.empId === req.profile.empId;
	if (check) {
		console.log(true);
		next();
	} else {
		return res.json({
			error: "Access denied",
		});
	}
};
//check if user is signed in
exports.isSignedIn = passport.authenticate("jwt", { session: false });

//get user profile by parameter id and put in req.profile
exports.getProfileById = (req, res, next, id) => {
	Administration.findById({ _id: id }, (error, profile) => {
		req.profile = profile;
		next();
	});
};

//used for checking admin
exports.isAdmin = (req, res, next) => {

	if (req.user.roleInLibrary === "admin") {
		next();
	} else {
		return res.json({
			error: "Only admin access route",
		});
	}
};

//used for checking librarian and admin
exports.isLibrarian = (req, res, next) => {
	if (req.user.roleInLibrary === "librarian" ||req.user.roleInLibrary === "admin") {
		next();
	} else {
		return res.json({
			error: "Only librarian or admin access route",
		});
	}
};

//updatePassword controller
exports.updatePassword = (req, res) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		return res.json({
			error: error.array()[0].msg,
		});
	}
	const { empId, password, new_password } = req.body;
	Profile.findOne({ empId: empId }).exec((err, profile) => {
		if (err || !profile) {
			if (err) {
				return res.json({
					error: err,
				});
			} else {
				return res.json({
					error: "profile do not exist",
				});
			}
		}
		if (profile.authenticate(password)) {
			let encry_password = profile.securePassword(new_password);
			Profile.findOneAndUpdate(
				{ empId: empId },
				{ $set: { encry_password: encry_password } },
				{ new: true, useFindAndModify: false }
			).exec((err, pro) => {
				if (err) {
					return res.json({
						error: err,
					});
				}
				return res.json({
					message: "Password successfully updated.",
				});
			});
		} else {
			return res.json({
				message: "Either empId or password is wrong",
			});
		}
	});
};

//updateProfile controller
exports.updateProfile = (req, res) => {
	const { profile } = req.body;
	Profile.findOneAndUpdate(
		{ empId: empId },
		{ $set: profile },
		{ new: true, useFindAndModify: false }
	).exec((error, profile) => {
		if (error || !profile) {
			if (error) {
				return res.json({
					error: error,
				});
			} else {
				return res.json({
					error: "profile do not exist",
				});
			}
		}
		return res.json({
			message: "profile successfully updated.",
		});
	});
};
