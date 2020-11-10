"use strict";

var path = require("path");

var utils = require("./utilities");
const fs = require('fs');

var constants = {
  configFileName: "DynamicLinks.NOS",
  domainSetup: "setup_DomainName",
  pathSetup: "setup_DomainPath"
};

module.exports = function(context) {
  var cordovaAbove8 = utils.isCordovaAbove(context, 8);
  var cordovaAbove7 = utils.isCordovaAbove(context, 7);
  var defer;
  if (cordovaAbove8) {
    defer = require("q").defer();
  } else {
    defer = context.requireCordovaModule("q").defer();
  }
  
  var platform = context.opts.plugin.platform;
  var platformConfig = utils.getPlatformConfigs(platform);
  if (!platformConfig) {
    utils.handleError("Invalid platform", defer);
  }
  
  var wwwPath = utils.getResourcesFolderPath(context, platform, platformConfig);
  var sourceFolderPath = utils.getSourceFolderPath(context, wwwPath);
  
  console.log("---DEBUGGYN----");
  console.log(platformConfig);
  console.log("wwwPath" + wwwPath);
  var files = utils.getFilesFromPath(wwwPath);
  console.log(files);
  console.log("sourceFolderPath " + sourceFolderPath);
  files = utils.getFilesFromPath(sourceFolderPath);
  console.log(files);
  console.log('pluginDir ' + context.opts.plugin.dir);
  console.log("----------------");
  files = utils.getFilesFromPath(context.opts.plugin.dir);
  console.log(files);
  console.log('AppId: ' + utils.getAppId(context));
  
  var configFilePath = "";
  if (platform == 'ios') configFilePath = path.join(wwwPath,constants.configFileName);
  else configFilePath = path.join(context.opts.projectRoot, "www",constants.configFileName);
  var configData = fs.readFileSync(configFilePath, 'utf8');
  var configJSON = JSON.parse(configData);
  
  var configValues = new Object(); var foundConfig = false;
  for (var x = 0; x < configJSON.length;x++) {
    if (configJSON[x].app.toLowerCase() == utils.getAppId(context).toLowerCase()) {
      configValues = configJSON[x];
      foundConfig = true;
    }
  }
  if (!foundConfig) utils.handleError("No matching config found in " + constants.configFileName, defer);

  var pluginConfig = path.join(context.opts.plugin.dir,"plugin.xml");
  var data = fs.readFileSync(pluginConfig, 'utf8');
  var result = data.replace(constants.domainSetup, configValues.domain);
  result = data.replace(constants.pathSetup, configValues.path);
  fs.writeFileSync(pluginConfig, result, 'utf8');
  /*
  var zip = new AdmZip(googleServicesZipFile);

  var targetPath = path.join(wwwPath, constants.googleServices);
  
  zip.extractAllTo(targetPath, true);

  var files = utils.getFilesFromPath(targetPath);
  if (!files) {
    utils.handleError("No directory found", defer);
  }

  var fileName = files.find(function (name) {
    return name.endsWith(platformConfig.firebaseFileExtension);
  });
  if (!fileName) {
    utils.handleError("No file found", defer);
  }

  var sourceFilePath = path.join(targetPath, fileName);
  var destFilePath = path.join(context.opts.plugin.dir, fileName);

  utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
  //console.log('Copied ' + sourceFilePath + ' to ' + destFilePath);
  if (cordovaAbove7) {
    var destPath = path.join(context.opts.projectRoot, "platforms", platform, "app");
    
    if (!utils.checkIfFolderExists(destPath) && platform == "ios") {
      destPath = path.join(context.opts.projectRoot,"platforms",platform);
      var projectName = utils.getFilesFromPath(destPath).find(function (name) {
        return name.endsWith(".xcodeproj");                                                    
      }).replace(".xcodeproj","");

      destPath = path.join(context.opts.projectRoot,"platforms",platform,projectName);
      
      //console.log(utils.getFilesFromPath(destPath));
    }
    

    if (utils.checkIfFolderExists(destPath)) {
      var destFilePath = path.join(destPath, fileName);
      utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
      //console.log('Copied ' + sourceFilePath + ' to ' + destFilePath);
    }
  }
      */
  return defer.promise;
}
