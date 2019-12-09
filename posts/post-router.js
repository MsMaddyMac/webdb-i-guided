const express = require('express');

// database access using knex
const knex = require('../data/db-config.js');

const router = express.Router();

// return a list of posts from the database
// returns a promise
router.get('/', (req, res) => {
    // select * from posts (gets all posts in database)
    knex
    .select('*')
    .from('posts')
    .then(posts => {
        res.status(200)
        .json(posts);
    })
    .catch(error => {
        console.log(error);
        res.status(500)
        .json({ errorMessage: 'Error getting the posts.' })
    });
});


router.get('/:id', (req, res) => {
    // select * from posts where id = req.params.id
    knex.select('*')
        .from('posts')
        // .where("id", "=", req.params.id)
        .where({ id: req.params.id })
        .first() // equivalent to posts[0] grabbing first element from the post array. This returns only the object.
        .then(post => {
            res.status(200)
            .json(post);
        })
    .catch(error => {
        console.log(error);
        res.status(500)
        .json({ errorMessage: 'Error getting the post.' })
    })
});

router.post('/', (req, res) => {
    // insert into () values ()
    const postData = req.body;

    // please validate before calling the database
    // knex.insert(postData).into('posts) -other way to write it
    knex('posts')
    .insert(postData, "id") // second argument will show a warning on console when using SQLite. We are setting it up this way for the future when we move to using MySQL or Postgres.
    .then(ids => {
        const id = ids[0];

        return knex('posts')
            .select("id", "title", "contents")
            .where({ id })
            .first()
            .then(post => {
            res.status(201).json(post);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: 'Error adding post.' })
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const changes = req.body;

    //validate the data
    knex('posts')
    .where({ id }) // Always filter on update so that it won't update all the records
    .update(changes)
    .then(count => {
        if(count > 0) {
            res.status(200).json({ message: `${count} record(s) updated.` });
        } else {
            res.status(404).json({ errorMessage: 'Post not found.' })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: 'Error updating post.' })
    });
});

router.delete('/:id', (req, res) => {
    knex('posts')
    .where({ id: req.params.id })
    .del()
    .then(count => {
        res.status(200).json({ message: `${count} record(s) deleted.` });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Error deleting post.' })
    });
});

module.exports = router;