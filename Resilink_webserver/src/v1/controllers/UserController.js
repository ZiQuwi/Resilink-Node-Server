require('../loggers.js');
const winston = require('winston');

const getDataLogger = winston.loggers.get('GetDataLogger');
const updateDataODEP = winston.loggers.get('UpdateDataODEPLogger');

const userService = require("../services/UserService.js");

const _pathUserODEP = 'http://90.84.174.128:4000/oauth/api/v1.0.0/users/';

const getTokenUser = async (req, res) => {
    try {
      const response = await userService.functionGetTokenUser(req.body);
      res.status(response[1]).send(response[0]);
    } catch (error) {
      getDataLogger.error('Catched error', { from: 'getTokenUser', data: error, bodySent: req.body});
      res.status(500).send({message: error.message})
    }
};

const createUser = async (req, res) => {
  try {
    const response = await userService.createUser(_pathUserODEP, req.body, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const createUserCustom = async (req, res) => {
  try {
    const response = await userService.createUserResilink(_pathUserODEP, req.body, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUserCustom', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const deleteUser = async (req, res) => {
  try {
    console.log(req.params.userId);
    const response = await userService.deleteUser(_pathUserODEP, req.params.userId, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const deleteUserODEPRESILINK = async (req, res) => {
  try {
    const response = await userService.deleteUserODEPRESILINK(_pathUserODEP, req.params.userId, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const getUserById = async (req, res) => {
  try {
    const response = await userService.getUserById(_pathUserODEP, req.params.userId, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const getAllUser = async (req, res) => {
  try {
    const response = await userService.getAllUser(_pathUserODEP, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const getAllUserCustom = async (req, res) => {
  try {
    const response = await userService.getAllUserCustom(_pathUserODEP, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'getAllUserCustom', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}


const getUserByEmail = async (req, res) => {
  try {
    const response = await userService.getUserByEmail(_pathUserODEP, req.params.userEmail, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}


const getUserByUsername = async (req, res) => {
  try {
    const response = await userService.getUserByUsername(_pathUserODEP, req.params.userName, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const updateUser = async (req, res) => {
  try {
    const response = await userService.updateUser(_pathUserODEP, req.params.userId, req.body, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const updateUserCustom = async (req, res) => {
  try {
    const response = await userService.updateUserCustom(_pathUserODEP, req.params.userId, req.body, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

const getUserbyIdCustom = async (req, res) => {
  try {
    const response = await userService.getUserByIdCustom(_pathUserODEP, req.params.userId, req.header('Authorization').replace(/^Bearer\s+/i, ''));
    res.status(response[1]).send(response[0]);
  } catch (error) {
    updateDataODEP.error('Catched error', { from: 'createUser', data: error, tokenUsed: req.header('Authorization') != null ? req.header('Authorization').replace(/^Bearer\s+/i, '') : "token not found"});
    res.status(500).send({message: error.message})
  }
}

  module.exports = {
    getTokenUser,
    createUser,
    createUserCustom,
    deleteUser,
    deleteUserODEPRESILINK,
    getUserById,
    getAllUser,
    getAllUserCustom,
    getUserByEmail,
    getUserByUsername,
    updateUser,
    updateUserCustom,
    getUserbyIdCustom
};
  