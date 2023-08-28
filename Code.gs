/**
 * Robinhood API client.
 *
 * If the Robinhood API is made public, this client will
 * handle the OAuth2 dance and refresh token flow appropriately.
 */
function apiClient_() {
  this.get = function(url, data) {
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      // Convert the JavaScript object to a JSON string.
      'payload' : JSON.stringify(data)
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    // Actually doesn't do anything if responseCode == 400
    if (responseCode == 202) {
      throw responseText;
    } else if (responseCode == 201) {
      return responseText;
    } else if (responseCode !== 200) {
      Logger.log("Caught !==200");
      throw responseCode + ": " + responseText;
    }
    
    var responseJson = JSON.parse(responseText);
    return responseJson;
  };
}

function getRobinhoodData_(data) {
  var results = apiClient.get("https://51sta2ev0e.execute-api.us-east-1.amazonaws.com/prod/robinhood", data);
  return results;
}


var apiClient = new apiClient_();
var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

function robinhood_get_options_orders(data) { 
  var values = getRobinhoodData_(data);
  
  var d = new Date();
  var date = d.toDateString();
  var newSheet = spreadsheet.getSheetByName('Option Orders '+ date);
  
  if (newSheet === null) {
   newSheet = spreadsheet.insertSheet('Option Orders '+ date);
  }
  
  spreadsheet.setActiveSheet(newSheet);
  newSheet.getRange(1,1,values.length,values[0].length).setValues(values);
}

function robinhood_get_stocks_orders(data) {  
  var values = getRobinhoodData_(data);

  var d = new Date();
  var date = d.toDateString();
  var newSheet = spreadsheet.getSheetByName('Stock Orders '+ date);
  
  if (newSheet === null) {
   refreshSheet = spreadsheet.insertSheet('Stock Orders '+ date);
  }
  
  spreadsheet.setActiveSheet(newSheet);
  newSheet.getRange(1,1,values.length,values[0].length).setValues(values);
}

function robinhood_respond_to_challenge(data) {
  return getRobinhoodData_(data);
}


function onOpen() {
  var entries = [{ name: 'Export orders', functionName: 'promptLogin' }, { name: 'About us', functionName: 'aboutUsDialog' }];
  spreadsheet.addMenu('RobinSheets', entries);
}


function promptLogin() {
  var html = HtmlService.createHtmlOutputFromFile('export');
  var ui = SpreadsheetApp.getUi();
  
  ui.showModalDialog(html, 'Please login to Robinhood');
  
}

function aboutUsDialog() {
  var html = HtmlService.createHtmlOutputFromFile('about');
  var ui = SpreadsheetApp.getUi();
  
  ui.showModalDialog(html, 'Please login to Robinhood');
}
