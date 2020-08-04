const Student = require("../models/Student");
const Administration = require("../models/Administration");
const LocalStrategy = require("passport-local").Strategy;
const JwtStretegy = require("passport-jwt").Strategy;

const cookieExtractor = (req) => {
	let token = null;
	if (req && req.cookies.jwt) {
		token = req.cookies["jwt"];
	}
	return token;
};

exports.jwtStretegy = new JwtStretegy(
	{
		jwtFromRequest: cookieExtractor,
		secretOrKey: process.env.SECRET,
	},
	(payload, done) => {
		if (payload.type === "student") {
			Student.findById({ _id: payload.sub }, (err, stud) => {
				if (err) {
					return done(err);
				}
				if (stud) {

					return done(null, stud);
				} else {
					return done(null, false, {
						message: "Roll number is not registered yet",
					});
				}
			});
		} else {
			Administration.findById({ _id: payload.sub }, (err, admin) => {
				if (err) {
					return done(err);
				}
				if (admin) {
					return done(null, admin);
				} else {
					return done(null, false, {
						message: "Employee Id is not registered yet",
					});
				}
			});
		}
	}
);

exports.passportStudentLogin = new LocalStrategy(
	{ usernameField: "rollNumber", passwordField: "password" },
	function (rollNumber, password, done) {
		Student.findOne({ rollNumber: rollNumber }, function (err, student) {
			console.log(err);
			console.log(student);
			if (err) {
				return done({error:"Unauthorized Access"});
			}
			if (!student) {
				return done(null, false, {
					error: "Roll number is not registered",
				});
			}

			if (!student.authenticate(password)) {
				return done(null, false, {
					error: "Invalid Roll Number/ Password",
				});
			}
			return done(null, student);
		});
	}
);

exports.passportAdministrationLogin = new LocalStrategy(
	{ usernameField: "empId", passwordField: "password" },
	function (empId, password, done) {
		Administration.findOne({ empId: empId }, function (
			err,
			administration
		) {
			if (err) {
				return done({error:"Unauthorized Access"});
			}
			if (!administration) {
				return done(null, false, {
					error: "Employee Id is not registered",
				});
			}

			if (!administration.authenticate(password)) {
				return done(null, false, {
					error: "Invalid Employee Id/ Password",
				});
			}
			return done(null, administration);
		});
	}
);
