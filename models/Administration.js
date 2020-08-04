const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1 } = require("uuid");
const Schema = mongoose.Schema;

const profile = new Schema(
	{
		//TODO: add max length of empId
		empId: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		empFirstName: {
			type: String,
			maxlength: 15,
			required: true,
			trim: true,
		},
		empLastName: {
			type: String,
			maxlength: 15,
			required: true,
			trim: true,
		},
		roleInLibrary: {
			type: String,
			default: "librarian",
			enum: ["admin", "librarian"],
		},
		collegeCode: {
			type: String,
			maxlength: 10,
			trim: true,
			required: true,
			unique:true
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
		encry_password: {
			type: String,
			trim: true,
		},
		salt: String,
	},
	{ timestamps: true }
);
profile
	.virtual("password")
	.set(function (password) {
		console.log(password);
		this.salt = v1()
		console.log(typeof this.securePassword);
		this.encry_password = this.securePassword(password);
	})
	.get(function () {
		return this.password;
	});

profile.methods = {
	authenticate: function (password) {
		return this.securePassword(password) === this.encry_password;
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
		}
	},
	getSecurePassword: function () {
		return this.encry_password
	},
};

module.exports = mongoose.model("Profile", profile);
