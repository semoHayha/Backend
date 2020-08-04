require("dotenv").config();
const express = require("express");
const app = express();

app.set("view engine", "ejs");
//mongoose
const mongoose = require("mongoose");

//middlewares
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressSession = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Student = require("./models/Student");
const flash = require("express-flash");
//routes
const authentication = require("./routes/authentication/admin/adminRoute");
const student = require("./routes/authentication/student/studentRoute");
const mBook = require("./routes/books/mBookRoute");
const {
	jwtStretegy,
	passportStudentLogin,
	passportAdministrationLogin,
} = require("./controllers/passport");

app.use(
	expressSession({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { secure: true, maxAge: 10 },
	})
);
app.use(flash());
mongoose
	.connect("mongodb://localhost:27017/library", {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("DB created");
	});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (student, done) {
	console.log(student.id);
	done(null, student.id);
});
passport.deserializeUser(function (id, done) {
	Student.findById(id, function (err, student) {
		done(err, student);
	});
});
app.use(function (req, res, next) {
	res.header("Content-Type", "application/json;charset=UTF-8");
	res.header("Access-Control-Allow-Credentials", true);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
passport.use("studentLogin", passportStudentLogin);
passport.use("administrationLogin", passportAdministrationLogin);
passport.use(jwtStretegy);

app.use("/", authentication);
app.use("/", student);
app.use("/", mBook);
app.listen(process.env.PORT, () => {
	console.log(`server is running at ${process.env.PORT}`);
});
