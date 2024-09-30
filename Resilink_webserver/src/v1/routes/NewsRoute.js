const express = require("express");
const router = express.Router();
const newsController = require("../controllers/NewsController.js");

/**
 * @swagger
 * tags:
 *   name: News
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "Unique identifier for the news article"
 *         url:
 *           type: string
 *           description: "The URL of the news article"
 *         country:
 *           type: string
 *           description: "The country from which the news article originates"
 *         institute:
 *           type: string
 *           description: "The news institute or source publishing the article"
 *         img:
 *           type: string
 *           description: "URL or data (as base64) representing the image associated with the news article"
 *         platform:
 *           type: string
 *           description: "The platform where the news is published, such as a website or app"
 */

/**
 * @swagger
 * /v1/news:
 *   post: 
 *     summary: create a news sources.
 *     tags: [News]
 *     requestBody:
 *       description: offer's data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                url: 
 *                    type: string
 *                country: 
 *                    type: string
 *                institute: 
 *                    type: string
 *                img:
 *                    type: string
 *                platform:
 *                    type: string
 *     responses:
 *       200:
 *         description: News from a country.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 url: 
 *                   type: string
 *                 country: 
 *                   type: string
 *                 institute: 
 *                   type: string
 *                 img:
 *                   type: string
 *                 platform:
 *                   type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post('/news/', newsController.createNews);

/**
 * @swagger
 * /v1/news/country:
 *   get: 
 *     summary: Get all the news from a country.
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: News from a country.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                    url: 
 *                      type: string
 *                    country: 
 *                      type: string
 *                    institute: 
 *                      type: string
 *                    platform:
 *                      type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/news/country', newsController.getNewsfromCountry);

/**
 * @swagger
 * /v1/news/ids:
 *   get: 
 *     summary: Get news from id list
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: ids
 *         description: List of news id.
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *     responses:
 *       200:
 *         description: Ok.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   url: 
 *                     type: string
 *                   country: 
 *                     type: string
 *                   institute: 
 *                     type: string
 *                   platform:
 *                     type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/news/ids', newsController.getNewsfromIdList);

/**
 * @swagger
 * /v1/news/owner/{id}:
 *   get:
 *     summary: Get all news from a prosumer
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string 
 *         required: true
 *         description: the prosummer id
 *     responses:
 *       200:
 *         description: Ok.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 country:
 *                   type: string
 *                 institute:
 *                   type: string
 *                 platform:
 *                   type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/news/owner/:id/', newsController.getNewsfromOwner);

/**
 * @swagger
 * /v1/news/countryOwner:
 *   get:
 *     summary: Get all news within a country without user's subcribed news
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string 
 *         required: false
 *         description: The country name
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string 
 *         required: false
 *         description: The owner name
 *     responses:
 *       200:
 *         description: Ok.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   url: 
 *                     type: string
 *                   country: 
 *                     type: string
 *                   institute: 
 *                     type: string
 *                   platform:
 *                     type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get('/news/countryOwner', newsController.getNewsfromCountryWithoutUserNews);

/**
 * @swagger
 * /v1/news/{id}/:
 *   delete: 
 *     summary: delete a News
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string 
 *         required: true
 *     responses:
 *       200:
 *         description: News successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       500:
 *         description: Error from RESILINK server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.delete('/news/:id/', newsController.deleteNews);

module.exports = router;