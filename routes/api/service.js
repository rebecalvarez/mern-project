const router = require('express').Router();
// const servicesController = require('../../controllers/servicesController');
const axios = require('axios');
const AUTH_KEY = `Basic ${process.env.REACT_APP_CARMD_AUTH_KEY}`;
const PARTNER_TOKEN = process.env.REACT_APP_CARMD_PARTNER_TOKEN;
const db = require('../../models');

// Matches with "/api/service/availableFields"

router.get('/availableFields', (req, res) => {
  const BASEURL = 'https://api.carmd.com/v3.0/fields?';
  console.log(req.query);
  let queryURL;
  const year = `year=${req.query.year}&`;
  const make = `make=${req.query.make}&`;
  const model = `model=${req.query.model}&`;
  const mileage = `mileage=${req.query.mileage}`;
  const vin = `vin=${req.query.vin}&`;
  req.query.vin
    ? (queryURL = BASEURL + vin + mileage)
    : (queryURL = BASEURL + year + make + model + mileage);
  console.log(queryURL);
  axios
    .get(queryURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: AUTH_KEY,
        'Partner-Token': PARTNER_TOKEN
      }
    })
    .then(function(response) {
      // console.log(response.data);
      res.send(response.data.data);
    })
    .catch(err =>
      console.log(err.message, 'no available fields for this model!')
    );
});

router.get('/getMaintenance', (req, res) => {
  const BASEURL = 'https://api.carmd.com/v3.0/maint?';
  // console.log(req.query);
  let queryURL;
  const year = `year=${req.query.year}&`;
  const make = `make=${req.query.make}&`;
  const model = `model=${req.query.model}&`;
  const mileage = `mileage=${req.query.mileage}`;
  const vin = `vin=${req.query.vin}&`;
  req.query.vin
    ? (queryURL = BASEURL + vin + mileage)
    : (queryURL = BASEURL + year + make + model + mileage);
  console.log(queryURL);
  axios
    .get(queryURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: AUTH_KEY,
        'Partner-Token': PARTNER_TOKEN
      }
    })
    .then(function(response) {
      // Starting object to send to DB
      const maintenanceData = {};
      // Array for maintenance services with its appropriate properties
      maintenanceData.maintenanceServices = [];
      for(var i = 0; i < response.data.data.length; i++) {
        maintenanceServiceItem = {};
        maintenanceServiceItem.description = response.data.data[i].desc;
        maintenanceServiceItem.dueMileage = response.data.data[i].due_mileage;
        maintenanceServiceItem.totalCost = response.data.data[i].repair.total_cost;
        maintenanceServiceItem.completed = false;
        maintenanceData.maintenanceServices.push(maintenanceServiceItem);
      }
      // Adding category type to maintenanceData to later show in appropriate section
      maintenanceData.category = 'maintenance';
      // Saving maintenanceData to MongoDb
      db.Service.collection
        .save(maintenanceData)
        .then(function(dbServices) {
          // Mapping through array of maintenance services along with descritpion and due mileage
          const dbResponse = dbServices.ops[0].maintenanceServices.map(
            data => `${data.description} at ${data.dueMileage} for average cost of ${data.totalCost}`
          );
          // Sending response to Client
          res.json(dbResponse);
        })
        .catch(function(error) {
          return error;
        });
    })
    .catch(err => console.log(err.message, 'maintenance doesn\'t exist!'));
});

router.get('/getRecalls', (req, res) => {
  const BASEURL = 'https://api.carmd.com/v3.0/recall?';
  console.log(req.query);
  let queryURL;
  const year = `year=${req.query.year}&`;
  const make = `make=${req.query.make}&`;
  const model = `model=${req.query.model}&`;
  const vin = `vin=${req.query.vin}&`;
  req.query.vin
    ? (queryURL = BASEURL + vin)
    : (queryURL = BASEURL + year + make + model);
  console.log(queryURL);
  axios
    .get(queryURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: AUTH_KEY,
        'Partner-Token': PARTNER_TOKEN
      }
    })
    .then(function(response) {
      // Starting object to send to DB
      const recallData = {};
      // Array for recall services with its appropriate properties
      recallData.recallServices = [];
      // Loop through response length and save items
      for (var i = 0; i < response.data.data.length; i++) {
        recallServiceItem = {};
        recallServiceItem.description = response.data.data[i].desc;
        recallServiceItem.correctiveAction = response.data.data[i].corrective_action;
        recallServiceItem.consequence = response.data.data[i].consequence;
        recallServiceItem.recallDate = response.data.data[i].recall_date;
        recallServiceItem.completed = false;
        recallData.recallServices.push(recallServiceItem);
      }
      // Adding category to recall data object
      recallServiceItem.category = 'recall';
      db.Service.collection
        // Save recall data object with array recallServices
        .save(recallData)
        .then(function(dbServices) {
          // Loop through recallServices array to map out each item's details
          const dbResponse = dbServices.ops[0].recallServices.map(
            data => `${data.description} for CORRECTIVE ACTION: ${data.correctiveAction} at ${data.recallDate}, CONSEQUENCE COULD BE: ${data.consequence}`
          );
          // console.log(dbResponse);
          res.json(dbResponse);
        })
        .catch(function(error) {
          return error;
        });
    })
    .catch(err => console.log(err.message, 'recalls don\'t exist!'));
});

router.get('/getUpcoming', (req, res) => {
  const BASEURL = 'https://api.carmd.com/v3.0/upcoming?';
  console.log(req.query);
  let queryURL;
  const year = `year=${req.query.year}&`;
  const make = `make=${req.query.make}&`;
  const model = `model=${req.query.model}&`;
  const mileage = `mileage=${req.query.mileage}`;
  const vin = `vin=${req.query.vin}&`;
  req.query.vin
    ? (queryURL = BASEURL + vin + mileage)
    : (queryURL = BASEURL + year + make + model + mileage);
  console.log(queryURL);
  axios
    .get(queryURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: AUTH_KEY,
        'Partner-Token': PARTNER_TOKEN
      }
    })
    .then(function(response) {
      // const upcomingData = response.data.data;
      //   const upcomingData = response.data.data.map(
      //     data => `repair: ${data.desc} total cost: ${data.total_cost}\n`
      //   );
      //   console.log(upcomingData);
      //   res.send(upcomingData);
      // })
      const upcomingData = {};
      upcomingData.upcomingServices = [];
      for (var i = 0; i < response.data.data.length; i++) {
        upcomingServiceItem = {};
        upcomingServiceItem.description = response.data.data[i].desc;
        upcomingServiceItem.probability = response.data.data[i].probability;
        upcomingServiceItem.totalCost = response.data.data[i].total_cost;
        upcomingData.upcomingServices.push(upcomingServiceItem);
      }
      upcomingData.category = 'upcoming';
      upcomingData.completed = false;
      db.Service.collection
        .save(upcomingData)
        .then(function(dbServices) {
          dbServices.ops;
          const dbResponse = dbServices.ops.map(
            data => `repair: ${data.desc} total cost: ${data.total_cost}`
          );
          console.log(dbResponse);
          res.json(dbResponse);
        })
        .catch(function(error) {
          return error;
        });
    })
    .catch(err => console.log(err.message, 'no upcoming repairs!'));
});

router.get('/getWarranty', (req, res) => {
  const BASEURL = 'https://api.carmd.com/v3.0/warranty?';
  console.log(req.query);
  let queryURL;
  const year = `year=${req.query.year}&`;
  const make = `make=${req.query.make}&`;
  const model = `model=${req.query.model}&`;
  const vin = `vin=${req.query.vin}&`;
  req.query.vin
    ? (queryURL = BASEURL + vin)
    : (queryURL = BASEURL + year + make + model);
  console.log(queryURL);
  axios
    .get(queryURL, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: AUTH_KEY,
        'Partner-Token': PARTNER_TOKEN
      }
    })
    .then(function(response) {
      // const warrantyData = response.data.data;
      //   const warrantyData = response.data.data.map(
      //     data => `warranty: ${data.type}\n criteria:${data.criteria}\n`
      //   );
      //   console.log(warrantyData);
      //   res.send(warrantyData);
      // })
      const warrantyData = {};
      warrantyData.warrantyServices = [];
      for (var i = 0; i < response.data.data.length; i++) {
        warrantyServiceItem = {};
        warrantyServiceItem.type = response.data.data[i].type;
        warrantyServiceItem.criteria = response.data.data[i].criteria;
        warrantyServiceItem.maxMiles = response.data.data[i].max_miles;
        warrantyServiceItem.maxYear = response.data.data[i].max_year;
        warrantyData.warrantyServices.push(warrantyServiceItem);
      }
      warrantyData.category = 'warranty';
      warrantyData.completed = false;
      db.Service.collection
        .save(warrantyData)
        .then(function(dbServices) {
          dbServices.ops;
          const dbResponse = dbServices.ops.map(
            data => `warranty: ${data.type} criteria ${data.criteria}`
          );
          console.log(dbResponse);
          res.json(dbResponse);
        })
        .catch(function(error) {
          return error;
        });
    })
    .catch(err => console.log(err.message, 'warranty info doesn\'t exist!'));
});

// router.route('/')
//   // .get(servicesController.findAll)
//   .get(servicesController.create);

// Matches with "/api/books/:id"
// router
//   .route('/:id')
//   .get(servicesController.findById)
//   .put(servicesController.update)
//   .delete(servicesController.remove);

module.exports = router;
