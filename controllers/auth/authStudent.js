const {  validationResult } = require("express-validator");
const Student = require("../../models/Student");
const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.studentSignUp = (req, res) => {
	const error = validationResult(req);
	if (!error.isEmpty()) {
		return res.json({
			error: error.array()[0].msg,
		});
	}
	const student = new Student(req.body);
	console.log(student);
	student.save((error, student) => {
		console.log(error);
		if (error || !student) {
			return res.json({
				error: `Roll Number ${req.body.rollNumber} is already registered. Please enter valid EmpId`,
			});
		}
		return res.json({rollNumber:student.rollNumber});
	});
};

exports.passportStudentSignIn = (req, res, next) => {
	passport.authenticate("studentLogin", (err, user, info) => {
		if (err) {
			return res.json(err);
		}
		console.log(info);
		if (info) {
			return res.json(info);
		}
		req.logIn(user, (err) => {
			if (err) {
				return res.json({ error: err });
			}

			res.cookie("jwt", jwtTokenGenerate(user._id), {
				httpOnly: true,
				sameSite: true,
			});

			return res.json({
				_id: user._id,
				rollNumber: user.rollNumber,
				studFirstName: user.studFirstName,
				studLastName: user.studLastName,
				branch: user.branch,
				year: user.year,
				email: user.email,
				createdAt: user.createdAt,
			});
		});
	})(req, res, next);
};

const jwtTokenGenerate = (id) => {
	const token = jwt.sign({ sub: id, type: "student" }, process.env.SECRET, {
		expiresIn: 1000,
	});
	return token;
};

exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	return res.status(401).json({ error: "Unauthorized" });
};

exports.studentSignOut = (req, res) => {
	res.clearCookie("jwt");
	req.logOut();
	req.session.destroy();
	return res.json({ message: "Successfully Log out" });
};

exports.changePassword = (req, res, next) => {
	const { rollNumber, prevPassword, newPassword } = req.body;
	Student.findOne({ rollNumber: rollNumber }).exec((err, stud) => {
		if (err || !stud) {
			if (err) {
				return res.sendStatus(500);
			} else {
				return res.status(404).json({
					error: "Invalid rollnumber/password",
				});
			}
		}
		if (!stud.authenticate(prevPassword)) {
			return res.status(404).json({
				error: "Invalid rollnumber/password",
			});
		} else {
			stud.encry_stud_password = stud.securePassword(newPassword);
			stud.save((err, stud) => {
				if (err || !stud) {
					if (err) {
						return res.sendStatus(500);
					} else {
						return res.status(404).json({
							error:
								"Internal Server Error. Please try again later",
						});
					}
				}
				req.stud = stud;
				next();
			});
		}
	});
};
