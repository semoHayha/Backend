//mBook denotes master book
const fs = require("fs");
const Book = require("../../models/MasterBooks");
const { IncomingForm } = require("formidable");

exports.getBook = (req, res, next, accession_no) => {
	console.log(accession_no);
	Book.findOne({ accession_no: accession_no }, (err, book) => {
		console.log(book);
		req.book = book
		next()
	})

}

//create book with unique accession no.
exports.createBook = async (req, res) => {
	const form = new IncomingForm();
	form.keepExtensions = true;
	  form.parse(req, async (error, fields, file) => {
		if (error) {
			return res.json({ error: "Internal server error" });
		  }
		  console.log(file);
		const {
			startingAccessionNo,
			totalBooks,
			author,
			title,
			edition,
			place,
			publisher,
			year,
			pages,
			volume,
			cost,
			book_no,
			bill_date,
			class_no
		} = fields;


	let booksArray = [];

	let accessionIsPresent = false;
	let checkError = false;
	let alreadyPresentAccessionNo = null;

	for (let i = 0; i < Number(totalBooks); i++) {
		let accessionNo = Number(startingAccessionNo) + i;

		//check if accession no. is already present or not
		//if present then assign accessionIsPresent to true
		await Book.findOne({ accession_no: accessionNo }, (error, data) => {
			if (error) {
				checkError = true;
			}
			if (data) {
				accessionIsPresent = true;
				alreadyPresentAccessionNo = accessionNo;
			}
		});

		//if accessionIsPresent is true, then, break for loop
		if (accessionIsPresent || checkError) {
			break;
		}

		// create book with unique accession number
		const book = new Book({
			author:author,
			title:title,
			edition:edition,
			place:place,
			publisher:publisher,
			year:year,
			pages:pages,
			volume:volume,
			cost:cost,
			book_no:book_no,
			accession_no: accessionNo,
			bill_date: bill_date,
			class_no:class_no
		});

		if (file.image) {
			book.image.data = fs.readFileSync(file.image.path)
			book.image.contentType = file.image.type
		}
		//add book to books array
		booksArray = [...booksArray, book];

		}
		if (accessionIsPresent) {
			return res.json({
				message: `${alreadyPresentAccessionNo} is already present`,
			});
		}
		if (checkError) {
			return res.status(501).json({ error: "Internal server error" });
		}
	
		Book.insertMany(booksArray, (error, data) => {
			if (error) {
				return res.status(501).json({
					error: res.json({ error: error }),
				});
			}
			return res.json({ success: true, data: data });
		});
	});
};

// fetch all books without image
exports.fetchAllBooks = (req, res) => {
	Book.find().sort("accession_no").exec((error, books) => {
		if (error) {
			return res.json({error:"Internal server error"})
		}
		books.forEach((book) => {
			book.image= undefined
		})
		return res.json(books)
	})
}

//TODO: fetch books according to search criteria without image


//fetch image
exports.getImage = (req, res) => {
	console.log(req.book.image.data);
	if (req.book.image.data) {
		res.set("Content-Type", req.book.image.contentType)
		return res.send(req.book.image.data)
	}
}