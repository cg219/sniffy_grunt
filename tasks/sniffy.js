/*
 * grunt-sniffy
 * https://github.com/cg219/sniffy_grunt
 *
 * Copyright (c) 2015 Clemente Gomez
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunty) {

  var mime = require("mime");
  var getKey = function(value, object){
    return Object.keys(object).filter(function(key){
      return object[key] === value;
    });
  }

  grunty.registerMultiTask("sniffy", "Create a Sniffy Object from a directory of imgs.", function(){
    var options = this.options({
      tag : "img",
      attribute : "src",
      objectName: "sniffyObject"
    })
    var fs = require("fs");
    var utils = require("util");
    var sniffyObject = {
      tag: options.tag,
      attribute: options.attribute,
    };
    var search = {};

    this.files.forEach(function(file){
      file.src.filter(function(path){
        if(grunty.file.isDir(path)){
          return true;
        }
        else{
          grunty.log.writeln("Skipped " + path + ". Needs to be a Directory.");
          return false;
        }
      }).map(function(path){
        grunty.file.recurse(path, function(abspath, dir, sub, filename){
          var type = mime.lookup(abspath);
          if(type == "image/jpeg" || type == "image/png" || type == "image/gif"){
            var readOptions = { encoding: null };
            var file = grunty.file.read(abspath, readOptions);
            var encoded = "data:" + type + ";base64," + file.toString("base64");
            search[getKey(filename, options.search)] = encoded;
          }
        })
      })
      sniffyObject.search = search;
      grunty.file.write(file.dest, "var " + options.objectName + " = " + JSON.stringify(sniffyObject));
      grunty.log.ok("Sniffy Object Created: " + file.dest);
    })
  })
};
