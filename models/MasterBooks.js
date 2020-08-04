const mongoose = require("mongoose");

const book = new mongoose.Schema({
	date: {
		type: Date,
		default: new Date(),
		trim: true,
	},
	accession_no: {
		type: String,
		min: 4,
		required: true,
		unique: true,
	},
	author: {
		type: String,
		min: 3,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	image: {
		data: Buffer,
		contentType: String,
	},
	edition: {
		type: Number,
	},
	place: {
		type: String,
	},
	publisher: {
		type: String,
	},
	year: { type: Number },
	pages: {
		type: Number,
	},
	volume: {
		type: Number,
	},
	cost: {
		type: Number,
	},
	class_no: {
		type: Number,
	},
	book_no: {
		type: Number,
	},
	bill_date: {
		type: String,
	},
});

module.exports = mongoose.model("Book", book);
