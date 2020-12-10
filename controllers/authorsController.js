const express = require("express");
const router = express.Router();

// Database
const db = require("../models");

// Current Path = '/authors'

// GET Index
router.get("/", (req, res) => {
  // Query DB for all authors
  db.Author.find({}, (err, allAuthors) => {
    if (err) return console.log(err);

    const context = {
      authors: allAuthors,
      title: "All Authors",
    };

    res.render("authors/index", context);
  });
});

// GET New
router.get("/new", (req, res) => {
  res.render("authors/new");
});

// GET SHOW
router.get("/:authorId", (req, res) => {
  // Query DB for author by ID
  db.Author.findById(req.params.authorId)
    .populate({ path: "articles" })
    .exec((err, foundAuthor) => {
      if (err) return console.log(err);

      const context = {
        author: foundAuthor,
      };

      res.render("authors/show", context);
    });
});

// POST Create
router.post("/", (req, res) => {
  // console.log(req.body);

  // Query DB to create new author
  db.Author.create(req.body, (err, newAuthor) => {
    if (err) return console.log(err);

    res.redirect("/authors");
  });
});

// GET Edit
router.get("/:authorId/edit", (req, res) => {
  // Query DB for author By ID So we can pre-populate the edit form
  db.Author.findById(req.params.authorId, (err, foundAuthor) => {
    if (err) return console.log(err);

    const context = {
      author: foundAuthor,
    };

    res.render("authors/edit", context);
  });
});

// PUT Update
router.put("/:authorId", (req, res) => {
  // VALIDATE DATA (Coming soon)
  // Query DB to update record by ID
  db.Author.findByIdAndUpdate(
    req.params.authorId,
    req.body,
    { new: true },
    (err, updatedAuthor) => {
      if (err) return console.log(err);

      // Redirect to show route
      res.redirect(`/authors/${updatedAuthor._id}`);
    }
  );
});

// DELETE Destroy
router.delete("/:authorId", (req, res) => {
  // Query DB to delete record by ID
  db.Author.findByIdAndDelete(req.params.authorId, (err, deletedAuthor) => {
    if (err) return console.log(err);

    db.Article.remove(
      {
        _id: {
          $in: deletedAuthor.articles,
        },
      },
      (err, data) => {
        console.log("data", data);
        // Redirect to index route
        res.redirect("/authors");
      }
    );
  });
});

module.exports = router;
