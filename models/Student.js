const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1 } = require("uuid");

const student = new mongoose.Schema(
	{
		rollNumber: {
			type: String,
			required: true,
			unique: true,
			maxlength: 10,
		},
		studFirstName: {
			type: String,
			maxlength: 35,
			required: true,
			trim: true,
		},
		studLastName: {
			type: String,
			maxlength: 35,
			required: true,
			trim: true,
		},
		branch: {
			type: String,
			required: true,
			enum: ["cse", "tt", "tc"],
		},
		year: {
			type: String,
			required: true,
			enum: ["1y", "2y", "3y", "4y"],
		},

		mobileNo: {
			type: String,
			maxlength: 10,
			required: true,
		},
		email: {
			type: String,
			maxlength: 30,
			trim: true,
		},
		encry_stud_password: {
			type: String,
			trim: true,
		},
		salt: String,
	},
	{ timestamps: true }
);

student
	.virtual("password")
	.set(function (password) {
		this.salt = v1();
		this.encry_stud_password = this.securePassword(password);
	})
	.get(function () {
		return this.password;
	});

student.methods = {
	authenticate: function (password) {
		return this.encry_stud_password === this.securePassword(password);
	},
	securePassword: function (password) {
		if (!password) return "";
		try {
			return crypto
				.createHmac("sha256", this.salt)
				.update(password)
				.digest("hex");
		} catch (error) {
			console.log(error);
			return error;
		}
	},
};

module.exports = mongoose.model("Student", student);
