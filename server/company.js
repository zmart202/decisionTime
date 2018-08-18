"use strict";

const express = require("express");
const shortid = require("shortid");
const hat = require("hat");
const { omit } = require("ramda");

const { hashPassword, comparePasswords, jwt } = require("./promisified-utils");
const sample = require("./sample-test");

const secret = process.env.SECRET;

const router = express.Router();

router.post("/create-company", (req, res) => {
  const db = req.app.locals.db;
  const Companies = db.collection("companies");
  const { name } = req.body;

  const id = hat();

  Companies.insertOne({
    name,
    id
  })
    .then(result => {
      if (result.insertedCount === 0) {
        throw new Error("Could not insert company");
      }

      res.json({
        id,
        success: true
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

router.post("/signup", (req, res) => {
  const db = req.app.locals.db;
  const CompanyUsers = db.collection("companyUsers");
  const Companies = db.collection("companies");
  const { firstName, lastName, email, companyId, password } = req.body;

  let companyName;
  Companies.findOne({ id: companyId })
    .then(company => {
      if (!company) {
        throw new Error(
          `Could not find company with id ${companyId}. Signup failed`
        );
      }

      companyName = company.name;

      return hashPassword(password);
    })
    .then(hash =>
      CompanyUsers.insertOne({
        firstName,
        lastName,
        email,
        companyId,
        companyName,
        password: hash
      })
    )
    .then(result => {
      if (result.insertedCount === 0) {
        throw new Error("Server error: could not insert user");
      }

      return jwt.sign(
        {
          email,
          companyId,
          companyName
        },
        secret
      );
    })
    .then(token => {
      res.json({
        token,
        success: true
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

router.post("/login", (req, res) => {
  const db = req.app.locals.db;
  const CompanyUsers = db.collection("companyUsers");
  const { email, password } = req.body;

  let companyName, companyId;
  CompanyUsers.findOne({
    email
  })
    .then(user => {
      if (!user) {
        throw new Error(`Could not find user with email ${email}`);
      }

      companyName = user.companyName;
      companyId = user.companyId;

      return comparePasswords(password, user.password);
    })
    .then(success => {
      if (!success) {
        throw new Error("Password does not match records");
      }

      return jwt.sign(
        {
          email,
          companyName,
          companyId
        },
        secret
      );
    })
    .then(token => {
      res.json({
        token,
        companyId,
        success: true
      });
    })
    .catch(err => {
      res.status(403).json({
        success: false,
        msg: err.message
      });
      console.error(err);
    });
});

router.get("/auth", (req, res) => {
  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData => {
      res.json({
        ...authData,
        success: true
      });
    })
    .catch(err => {
      res.status(403).json({
        success: false,
        msg: err.message
      });
    });
});

router.get("/applicants", (req, res) => {
  const db = req.app.locals.db;
  const Applicants = db.collection("applicants");

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  let companyName, companyId;
  jwt
    .verify(token, secret)
    .then(authData => {
      companyName = authData.companyName;
      companyId = authData.companyId;

      return Applicants.find({
        companyId: authData.companyId
      }).toArray();
    })
    .then(applicants => {
      res.json({
        applicants,
        companyName,
        success: true
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

router.get("/applicant/:id", (req, res) => {
  const db = req.app.locals.db;
  const Applicants = db.collection("applicants");
  const Jobs = db.collection("jobs");

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  const { id } = req.params;

  jwt
    .verify(token, secret)
    .then(_ => Applicants.findOne({ id }))
    .then(applicant => {
      if (!applicant) {
        throw new Error(`Could not find applicant with id ${id}`);
      }

      res.json({
        applicant,
        success: true
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

router.post("/create-applicant", (req, res) => {
  const db = req.app.locals.db;
  const Jobs = db.collection("jobs");
  const Applicants = db.collection("applicants");

  const { firstName, lastName, email, id, jobId, jobTitle } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  let companyId, companyName;
  jwt
    .verify(token, secret)
    .then(authData => {
      companyId = authData.companyId;
      companyName = authData.companyName;

      return Jobs.findOne({
        companyId,
        id: jobId
      });
    })
    .then(job => {
      if (!job) {
        throw new Error(
          `Could not find job with id ${
            req.body.jobId
          } and companyId ${companyId}`
        );
      }

      return Applicants.insertOne({
        firstName,
        lastName,
        email,
        jobId,
        jobTitle,
        companyId,
        companyName,
        id,
        test: job.test,
        completed: false,
        timestamp: new Date(),
        testTimestamp: null,
        secondsElapsed: 0,
        answerData: null
      });
    })
    .then(result => {
      if (result.insertedCount === 0) {
        throw new Error("Could not create applicant");
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

router.post("/edit-applicant", (req, res) => {
  const db = req.app.locals.db;
  const Applicants = db.collection("applicants");
  const { id, firstName, lastName } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData =>
      Applicants.updateOne(
        { id },
        {
          $set: {
            firstName,
            lastName
          }
        }
      )
    )
    .then(result => {
      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        throw new Error("Could not update applicant");
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

router.post("/remove-applicant", (req, res) => {
  const db = req.app.locals.db;
  const Applicants = db.collection("applicants");
  const { email, id } = req.body;

  const bearer = req.headers["authorization"];
  const token = bearer.split(" ")[1];

  jwt
    .verify(token, secret)
    .then(authData => Applicants.deleteOne({ email, id }))
    .then(result => {
      if (result.deletedCount === 0) {
        throw new Error(`Could not remove applicant with id ${id}`);
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

module.exports = router;
