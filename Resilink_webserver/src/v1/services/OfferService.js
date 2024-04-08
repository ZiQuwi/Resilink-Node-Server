require('../loggers.js');
const winston = require('winston');

const getDataLogger = winston.loggers.get('GetDataLogger');
const updateDataODEP = winston.loggers.get('UpdateDataODEPLogger');
const deleteDataODEP = winston.loggers.get('DeleteDataODEPLogger');

const Utils = require("./Utils.js");
const AssetTypes = require("./AssetTypeService.js");
const Asset = require("./AssetService.js");


//Retrieves all valid offers for sale or lease in ODEP for RESILINK
const getAllOfferForResilinkCustom = async (url, token) => {

  //Retrieves all data needed to confirm the offers validity
    const allAssetType = await AssetTypes.getAllAssetTypesResilink(token);
    const allAssetResilink = await Asset.getAllAssetResilink(token);
    const allOffer = await Utils.fetchJSONData(
        'GET',
        url + "all", 
        headers = {'accept': 'application/json',
        'Authorization': token});
    var allOfferResilink = {};
    const data = await Utils.streamToJSON(allOffer.body);

    //Checks that none of the functions are error returns by ODEP
    if (allOffer.status == 401 || allAssetType[1] == 401 || allAssetResilink[1] == 401) {
      getDataLogger.error('error: Unauthorize', { from: 'getAllOfferForResilinkCustom', tokenUsed: token == null ? "Token not given" : token});
      return [allAssetType[1] == 401 ? allAssetType[0] : allAssetResilink[1] == 401 ? allAssetResilink[0] : data, 401];
    } else if(allOffer.status != 200 || allAssetType[1] != 200 || allAssetResilink[1] != 200) {
      getDataLogger.error("error trying to fetch Offer or Asset or AssetType from ODEP", { from: 'getAllOfferFilteredCustom', dataOffer: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
      return [allAssetType[1] != 200 ? allAssetType[0] : allAssetResilink[1] != 200 ? allAssetResilink[0] : data, allOffer.status];
    };

    //For each offer, checks if its validity date has not passed and if there is a quantity above 0 if it is an immaterial offer.
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element = data[key];
          if (
            new Date(element['validityLimit']) > new Date() && 
            ( allAssetType[0][allAssetResilink[0][element['assetId'].toString()]['assetType']]['nature'] !== null ?  
              (allAssetType[0][allAssetResilink[0][element['assetId'].toString()]['assetType']]['nature'] == "immaterial" ? 
              (element['remainingQuantity'] !== null ? element['remainingQuantity'] > 0 : true) : true) : false
            ) 
          ) 
          {
            allOfferResilink[element['offerId'].toString()] = element;
          }
        }
    }
    getDataLogger.info("successful data retrieval", { from: 'getAllOfferFilteredCustom', tokenUsed: token.replace(/^Bearer\s+/i, '')});
    return [allOfferResilink, allOffer.status];
};

//Filters valid ODEP offers with filter parameters set
const getAllOfferFilteredCustom = async (url, filter, token) => {    
  try {

    //Retrieves all data required to check values.
    const offerResilink = await getAllOfferForResilinkCustom(url, token);
    const allOffer = offerResilink[0];
    if (offerResilink[1] == 401) {
      getDataLogger.error('error: Unauthorize', { from: 'getAllOfferFilteredCustom', dataReceived: allOffer, tokenUsed: token == null ? "Token not given" : token});
      return [allOffer, offerResilink[1]];
    }
    const assetResilink = await Asset.getAllAssetResilink(token);
    const allAsset = assetResilink[0];
    if (assetResilink[1] == 401) {
      getDataLogger.error('error: Unauthorize', { from: 'getAllOfferFilteredCustom', dataReceived: allAsset, tokenUsed: token == null ? "Token not given" : token});
      return [allAsset, assetResilink[1]];
    }

    //Checks for each offer whether it does not meet one of the conditions expressed in the filter map.
    const allOfferFiltered = [];
    var isCompatible = true;
    for (const key in allOffer) {
      isCompatible = true;
      if (filter !== null) {
        if(filter.hasOwnProperty("assetType")){
          if (typeof filter["assetType"] !== "string") {
            var i = 0;
            var notFound = true;

            while ( i <= filter["assetType"].length && notFound) {
              if (allOffer[key]["assetType"] == filter["assetType"][i]) {
                notFound = false;
              }
              i++;
            };
            if (notFound) {
              isCompatible = false;
              continue;
            };
          } else {
            if (allAsset[allOffer[key]["assetId"]]["assetType"] != filter["assetType"]) {
              isCompatible = false;
              continue;
            }
          }
        };

        if(filter.hasOwnProperty("Properties")){
          if(allAsset[allOffer[key]["assetId"]].hasOwnProperty("specificAttributes")) {
            if (Object.keys(filter["Properties"]).length > 0 && filter["Properties"].every(attr2 => allAsset[allOffer[key]["assetId"]]["specificAttributes"].some(attr1 => attr1.attributeName.toUpperCase() == attr2.attributeName.toUpperCase() && attr1.value.toUpperCase() == attr2.value.toUpperCase())) == false) {
              isCompatible = false;
              continue;
            }
          } else {
            isCompatible = false;
            continue;
          }
            
        };

        if(filter.hasOwnProperty("latitude")){
            if(allAsset[allOffer[key]["assetId"]]["specificAttributes"] !== undefined) {
              const gpsAttribute = allAsset[allOffer[key]["assetId"]]["specificAttributes"].find(attribute => attribute.attributeName === "Gps");
              if (gpsAttribute !== undefined) {
                const regex = /<(-?\d+\.\d+),(-?\d+\.\d+)>/;
                const match = gpsAttribute["value"].match(regex);
                var pointInCircle = Utils.isInPerimeter(filter["latitude"], filter["longitude"], parseFloat(match[1]), parseFloat(match[2]), filter["distance"]);
                if(match === undefined && !pointInCircle) {
                  isCompatible = false;
                  continue;
                }
              } else {
                isCompatible = false;
                continue;
              }
            } else {
              isCompatible = false;
              continue;
            }
        }
    
        if(filter.hasOwnProperty("priceMin")){
          if (allOffer[key]["price"] < filter["priceMin"]) {
            isCompatible = false;
            continue;
          }
        };

        if(filter.hasOwnProperty("priceMax")){
          if (allOffer[key]["price"] > filter["priceMax"]) {
            isCompatible = false;
            continue;
          }
        };

        if(filter.hasOwnProperty("MaxQuantity")){
          if (allOffer[key]["remainingQuantity"] < filter["MaxQuantity"]) {
            isCompatible = false;
            continue;
          }
        }

        if(filter.hasOwnProperty("MinQuantity")){
          if (allOffer[key]["remainingQuantity"] < filter["MinQuantity"]) {
            isCompatible = false;
            continue;
          }
        }
    
        if(filter.hasOwnProperty("dateMin")){
          if (allOffer[key]["validityLimit"] < filter["dateMin"]) {
            isCompatible = false;
            continue;
          }
        };

        if(filter.hasOwnProperty("dateMax")){
          if (allOffer[key]["validityLimit"] > filter["dateMax"]) {
            isCompatible = false;
            continue;
          }
        };

        if(filter.hasOwnProperty("TransactionType")){
          if (allAsset[allOffer[key]["assetId"]]["transactionType"] != filter["TransactionType"]) {
            isCompatible = false;
            continue;
          }
        };

        if(isCompatible) {
          allOfferFiltered.push(allOffer[key]); 
        };
      } else {
        allOfferFiltered.push(allOffer[key]); 
      }
    };
    getDataLogger.info('success filtering data', { from: 'getAllOfferFilteredCustom', tokenUsed: token.replace(/^Bearer\s+/i, '')});
    return [JSON.stringify(allOfferFiltered), 200];
  } catch (e) {
    getDataLogger.error("filter had a problem", { from: 'getAllOfferFilteredCustom', tokenUsed: token.replace(/^Bearer\s+/i, '')});
    return[{error : e}, 500];
  }
};

//Retrieves all offers from a user in ODEP.
const getAllOfferOwnerCustom = async (url, Username, token) => {
  var allOfferOwner = {};

  //Retrives all offer in ODEP
  const allOffer = await Utils.fetchJSONData(
    'GET',
    url + "all", 
    headers = {'accept': 'application/json',
    'Authorization': token}
  );
  const data = await Utils.streamToJSON(allOffer.body)
  if (allOffer.status == 401) {
    getDataLogger.error('error: Unauthorize', { from: 'getAllOfferOwnerCustom', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
    return [data, allOffer.status];
  };
  if(allOffer.status != 200) {
    getDataLogger.error("error retrieving data", { from: 'getAllOfferOwnerCustom', data: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
    return [data, allOffer.status];
  }; 

  //Checks if the creator is the user in parameter
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const offer = data[key];
      if (offer["offerer"] === Username) {
        allOfferOwner[offer["offerId"].toString()] = offer;
      }
    }
  }
  getDataLogger.info('success retrieving offers & keep the owner\'s', { from: 'getAllOfferOwnerCustom', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  return [allOfferOwner, allOffer.status];
};

//Creates an offer in ODEP
const createOffer = async (url, body, token) => {
  updateDataODEP.warn('data to send to ODEP', { from: 'createOffer', dataToSend: body, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  const response = await Utils.fetchJSONData(
      'POST',
      url, 
      headers = {'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token},
      body);
  const data = await Utils.streamToJSON(response.body);
  if(response.status == 401) {
    updateDataODEP.error('error: Unauthorize', { from: 'createOffer', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
  } else if(response.status != 200) {
    updateDataODEP.error('error creating an offer', { from: 'createOffer', dataReceived: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  } else {
    updateDataODEP.info('success creating an offer', { from: 'createOffer', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  }
  return [data, response.status];
};

//Creates an offer, his asset and asset type associated 
const createOfferAsset = async (url, body, token) => {

  //Calls the function to create an asset and his asset type
  updateDataODEP.warn('data to send to ODEP', { from: 'createOfferAsset', dataToSend: body, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  const newsAsset = await Asset.createAssetCustom("http://90.84.194.104:10010/assets/", body['asset'], token);
  if (newsAsset[1] == 401) {
    updateDataODEP.error('error: Unauthorize', { from: 'createOfferAsset', dataReceived: newsAsset[0], tokenUsed: token == null ? "Token not given" : token});
    return [newsAsset[0], newsAsset[1]];
  } else if(newsAsset[1] != 200) {
    updateDataODEP.error('error creating one assetType', { from: 'createOfferAsset', tokenUsed: token.replace(/^Bearer\s+/i, '')});
    return [newsAsset[0], newsAsset[1]];
  } else {

    //Associates the assetId just created with the map containing the offer data 
    body['offer']['assetId'] = newsAsset[0]['assetId']; 
    const newOffer = await createOffer(url, body['offer'], token);
    if (newOffer[1] == 401) {
      updateDataODEP.error('error: Unauthorize', { from: 'createOfferAsset', dataReceived: newOffer[0], tokenUsed: token == null ? "Token not given" : token});
      return [newOffer[0], newOffer[1]];
    } else if(newOffer[1] != 200) {
      updateDataODEP.error('error creating one assetType', { from: 'createOfferAsset', tokenUsed: token.replace(/^Bearer\s+/i, '')});
      return [newOffer[0], newOffer[1]];
    } else {
      return [{'asset': newsAsset[0], 'offer': newOffer[0]}, 200];
    }
  }
};

//Retrieves all offer in ODEP
const getAllOffer = async (url, token) => {
  const response = await Utils.fetchJSONData(
      'GET',
      url + "all", 
      headers = {'accept': 'application/json',
      'Authorization': token}
  );
  const data = await Utils.streamToJSON(response.body);
  if(response.status == 401) {
    getDataLogger.error('error: Unauthorize', { from: 'getAllOffer', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
  } else if(response.status != 200) {
    getDataLogger.error('error retrieving all offers', { from: 'getAllOffer' , data: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  } else {
    getDataLogger.info('success retrieving all offers', { from: 'getAllOffer', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  }
  return [data, response.status];
};

//Retrieves an offer by id in ODEP
const getOneOffer = async (url, id, token) => {
  const response = await Utils.fetchJSONData(
      'GET',
      url + id, 
      headers = {'accept': 'application/json',
      'Authorization': token}
  );
  const data = await Utils.streamToJSON(response.body);
  if(response.status == 401) {
    getDataLogger.error('error: Unauthorize', { from: 'getOneOffer', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
  } else if(response.status != 200) {
    getDataLogger.error('error retrieving an offer', { from: 'getOneOffer' , data: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  } else {
    getDataLogger.info('success retrieving an offer', { from: 'getOneOffer', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  }
  return [data, response.status];
};

//Updates the offer by id in ODEP
const putOffer = async (url, body, id, token) => {
  updateDataODEP.warn('data to send to ODEP', { from: 'putOffer', dataToSend: body, tokenUsed: token == null ? "Token not given" : token});
  const response = await Utils.fetchJSONData(
      'PUT',
      url + id, 
      headers = {'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token},
      body
  );
  const data = await Utils.streamToJSON(response.body);
  if(response.status == 401) {
    updateDataODEP.error('error: Unauthorize', { from: 'putOffer', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
  } else if(response.status != 200) {
    updateDataODEP.error('error updating an offer', { from: 'putOffer', dataReceived: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  } else {
    updateDataODEP.info('success updating an offer', { from: 'putOffer', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  }
  return [data, response.status];
};

//Deletes an offer by id in ODEP
const deleteOffer = async (url, id, token) => {
  deleteDataODEP.warn('id to used in ODEP', { from: 'deleteOffer', offerId: id, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  const response = await Utils.fetchJSONData(
      'DELETE',
      url + id, 
      headers = {'accept': 'application/json',
      'Authorization': token}
  );
  const data = await Utils.streamToJSON(response.body);
  if(response.status == 401) {
    deleteDataODEP.error('error: Unauthorize', { from: 'deleteOffer', dataReceived: data, tokenUsed: token == null ? "Token not given" : token});
  } else if(response.status != 200) {
    deleteDataODEP.error('error deleting an offer', { from: 'deleteOffer', dataReceived: data, tokenUsed: token.replace(/^Bearer\s+/i, '')});
  } else {
    deleteDataODEP.info('success deleting an offer', { from: 'deleteOffer', tokenUsed: token.replace(/^Bearer\s+/i, '')});
  }
  return [data, response.status];
};

module.exports = {
    getAllOfferForResilinkCustom,
    getAllOfferFilteredCustom,
    getAllOfferOwnerCustom,
    createOffer,
    createOfferAsset,
    getAllOffer,
    getOneOffer,
    putOffer,
    deleteOffer
}