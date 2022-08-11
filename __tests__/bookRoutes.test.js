const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

process.env.NODE_ENV === "test"

describe("Book Routes Test", function () {
    let b1, b2

  beforeEach(async function () {
    await db.query("DELETE FROM books");

    b1 = await Book.create({
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
      });
    b2 = await Book.create({
        isbn: "0691896728345",
        amazon_url: "http://a.co/eobPtX2",
        author: "Jeanne Savery",
        language: "english",
        pages: 345,
        publisher: "Princeton University Press",
        title: "A Lady's Deception",
        year: 2017
      });
  });


  describe("GET /books", function () {
    test("gets list of books", async function () {
        let response = await request(app)
            .get("/books/")
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            "books": [
                b2, b1
        ]});
    });
  });

  describe("GET /books/:id", function(){
    test("gets detail for one book", async function() {
        let response = await request(app)
            .get("/books/0691161518");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({"book": b1});
    });
    test("handles when id is not valid", async function(){
        let response = await request(app)
            .get("/books/1234567890");
        expect(response.status).toBe(404)
        expect(response.body).toEqual({"error": {"message": "There is no book with an isbn '1234567890", "status": 404}})
    })
  })

  describe("POST /books/", function(){
    test("posts valid book data to db", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: "0678945645",
                amazon_url: "http://a.co/eobPtX2",
                author: "Beverly Cleary",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Ramona and Beezus",
                year: 2002
              });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({"book": {
            "isbn": "0678945645",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Beverly Cleary",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Ramona and Beezus",
            "year": 2002
          }})
    }),
    test("handles isbn that is too short", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: "053",
                amazon_url: "http://a.co/eobPtX2",
                author: "Beverly Cleary",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Ramona and Beezus",
                year: 2002
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn does not meet minimum length of 10"], "status": 400}
        })
    }),
    test("handles isbn that is too long", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: "05348912686126831",
                amazon_url: "http://a.co/eobPtX2",
                author: "Beverly Cleary",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Ramona and Beezus",
                year: 2002
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn does not meet maximum length of 13"], "status": 400}
        })
    }),
    test("handles data of the wrong type", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: 5358942678,
                amazon_url: true,
                author: 30.32,
                language: [2,2],
                pages: "hi",
                publisher: true,
                title: {title: "Ramona and Beezus"},
                year: "1999"
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn is not of a type(s) string", "instance.amazon_url is not of a type(s) string", "instance.author is not of a type(s) string", "instance.language is not of a type(s) string", "instance.pages is not of a type(s) integer", "instance.publisher is not of a type(s) string", "instance.title is not of a type(s) string", "instance.year is not of a type(s) integer"], "status": 400}
        })
    }),
    test("handles negative number data", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: "0678945645",
                amazon_url: "http://a.co/eobPtX2",
                author: "Beverly Cleary",
                language: "english",
                pages: -264,
                publisher: "Princeton University Press",
                title: "Ramona and Beezus",
                year: -2002
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.pages must be greater than or equal to 0", "instance.year must be greater than or equal to 0"], "status": 400}
        })
    }), 
    test("handles invalid url", async function(){
        let response = await request(app)
            .post("/books/")
            .send({
                isbn: "0678945645",
                amazon_url: "hi",
                author: "Beverly Cleary",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Ramona and Beezus",
                year: 2002
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.amazon_url does not conform to the \"uri\" format"], "status": 400}
        })
    }),
    test("handles missing data", async function(){
        let response = await request(app)
            .post("/books/")
            .send({test: "test"
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance requires property \"isbn\"", 
        "instance requires property \"amazon_url\"", 
        "instance requires property \"author\"", 
        "instance requires property \"language\"", 
        "instance requires property \"pages\"", 
        "instance requires property \"publisher\"", 
        "instance requires property \"title\"", 
        "instance requires property \"year\""], "status": 400}
        })
    })
  }), 
  
  describe("PUT /books/:isbn", function(){
    test("updates valid book data to db", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: "0691161518",
                amazon_url: "http://a.co/eobPtX21",
                author: "Matthew B. Lane",
                language: "spanish",
                pages: 265,
                publisher: "Harvard University Press",
                title: "Power-Up: Unlocking the Hidden Science in Video Games",
                year: 2011
              });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({"book": {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX21",
            "author": "Matthew B. Lane",
            "language": "spanish",
            "pages": 265,
            "publisher": "Harvard University Press",
            "title": "Power-Up: Unlocking the Hidden Science in Video Games",
            "year": 2011
          }})
    }),
    test("handles isbn that is too short", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: "0666",
                amazon_url: "http://a.co/eobPtX21",
                author: "Matthew B. Lane",
                language: "spanish",
                pages: 265,
                publisher: "Harvard University Press",
                title: "Power-Up: Unlocking the Hidden Science in Video Games",
                year: 2011
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn does not meet minimum length of 10"], "status": 400}
        })
    }),
    test("handles isbn that is too long", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: "05348912686126831",
                amazon_url: "http://a.co/eobPtX21",
                author: "Matthew B. Lane",
                language: "spanish",
                pages: 265,
                publisher: "Harvard University Press",
                title: "Power-Up: Unlocking the Hidden Science in Video Games",
                year: 2011
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn does not meet maximum length of 13"], "status": 400}
        })
    }),
    test("handles data of the wrong type", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: 5358942678,
                amazon_url: true,
                author: 30.32,
                language: [2,2],
                pages: "hi",
                publisher: true,
                title: {title: "Ramona and Beezus"},
                year: "1999"
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.isbn is not of a type(s) string", "instance.amazon_url is not of a type(s) string", "instance.author is not of a type(s) string", "instance.language is not of a type(s) string", "instance.pages is not of a type(s) integer", "instance.publisher is not of a type(s) string", "instance.title is not of a type(s) string", "instance.year is not of a type(s) integer"], "status": 400}
        })
    }),
    test("handles negative number data", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: "0691161518",
                amazon_url: "http://a.co/eobPtX21",
                author: "Matthew B. Lane",
                language: "spanish",
                pages: -265,
                publisher: "Harvard University Press",
                title: "Power-Up: Unlocking the Hidden Science in Video Games",
                year: -2011
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.pages must be greater than or equal to 0", "instance.year must be greater than or equal to 0"], "status": 400}
        })
    }), 
    test("handles invalid url", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({
                isbn: "0691161518",
                amazon_url: "hi",
                author: "Matthew B. Lane",
                language: "spanish",
                pages: 265,
                publisher: "Harvard University Press",
                title: "Power-Up: Unlocking the Hidden Science in Video Games",
                year: 2011
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance.amazon_url does not conform to the \"uri\" format"], "status": 400}
        })
    }),
    test("handles missing data", async function(){
        let response = await request(app)
            .put("/books/0691161518")
            .send({test: "test"
              });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({"error": {"message": ["instance requires property \"isbn\"", 
        "instance requires property \"amazon_url\"", 
        "instance requires property \"author\"", 
        "instance requires property \"language\"", 
        "instance requires property \"pages\"", 
        "instance requires property \"publisher\"", 
        "instance requires property \"title\"", 
        "instance requires property \"year\""], "status": 400}
        })
    })
  }),

  describe("DELETE /books/:isbn", function(){
    test("deletes book from db", async function(){
        let response = await request(app)
            .delete("/books/0691161518")
        expect(response.status).toBe(200);
        expect(response.body).toEqual({"message": "Book deleted"})
    }),
    test("handles invalid isbn", async function(){
        let response = await request(app)
            .delete("/books/1234567894");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({"error": {"message": "There is no book with an isbn '1234567894", "status": 404}})
    })
  }),

  afterAll(async function () {
    await db.end();
  })

})