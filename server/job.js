"use strict";

const express = require("express");
const shortid = require("shortid");
const hat = require("hat");
const _ = require("lodash");

const { jwt } = require("./promisified-utils");

const secret = process.env.SECRET;

const router = express.Router();

router.get("/jobs", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  let companyId, companyName;
  jwt
    .verify(token, secret)
    .then(authData => {
      companyId = authData.companyId;
      companyName = authData.companyName;

      return Jobs.find({ companyId }).toArray();
    })
    .then(jobs => {
      res.json({
        companyId,
        companyName,
        success: true,
        jobs: jobs.map(x => _.omit(x, "_id"))
      });
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
      console.error(err);
    });
});

router.get("/job/:companyId/:id", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const { companyId, id } = req.params;

  Jobs.findOne({ companyId, id })
    .then(job => {
      if (!job) {
        throw new Error(
          `Could not find job with id ${id} under companyId ${companyId}`
        );
      }

      res.json({
        success: true,
        job: _.omit(job, "_id")
      });

      return Jobs.updateOne(
        { id },
        {
          $inc: {
            visitors: 1
          }
        }
      );
    })
    .then(result => {
      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        console.error(err);
      }
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
      console.error(err);
    });
});

router.post("/create-job", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const { id, title, description } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData =>
      Jobs.insertOne({
        id,
        title,
        description,
        companyId: authData.companyId,
        companyName: authData.companyName,
        test: [],
        visitors: 0
      })
    )
    .then(result => {
      if (result.insertedCount === 0) {
        throw new Error("Could not insert Job");
      }

      res.json({ success: true });
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
    });
});

router.post("/edit-job", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const { id, title, description } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData =>
      Jobs.updateOne(
        { id },
        {
          $set: {
            title,
            description
          }
        }
      )
    )
    .then(result => {
      if (result.matchedCount === 0) {
        throw new Error(`Could not find job with id ${id}`);
      }

      res.json({ success: true });
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
    });
});

router.post("/delete-job", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const { id } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData => Jobs.findOneAndDelete({ id }))
    .then(result => {
      if (result.ok !== 1) {
        throw new Error(`Could not delete job with id ${id}`);
      }

      res.json({ success: true });
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
      console.error(err);
    });
});

router.post("/edit-test", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const { id, test } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData =>
      Jobs.updateOne(
        { id },
        {
          $set: {
            test
          }
        }
      )
    )
    .then(result => {
      if (result.matchedCount === 0) {
        throw new Error(`Could not find job with id ${id}`);
      }

      res.json({ success: true });
    })
    .catch(err => {
      res.json({
        success: false,
        msg: err.message
      });
      console.error(err);
    });
});

module.exports = router;
