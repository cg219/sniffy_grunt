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
  var cheerio = require("cheerio");
  var _path = require("path");
  var convertImage = function(grunt, abspath){
    var type = mime.lookup(abspath);

    if(type == "image/jpeg" || type == "image/png" || type == "image/gif"){
      var readOptions = { encoding: null };
      var file = grunt.file.read(abspath, readOptions);
      var encoded = "data:" + type + ";base64," + file.toString("base64");
      return encoded;
    }
  }

  grunty.registerMultiTask("sniffy", "Create a Sniffy Object from a directory of imgs.", function(){
    var options = this.options({
      tag : "img",
      attribute : "src",
      objectName: "sniffyObject"
    })
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
          var encoded = convertImage(grunty, abspath)
          search[getKey(filename, options.search)] = encoded;
        })
      })
      sniffyObject.search = search;
      grunty.file.write(file.dest, "var " + options.objectName + " = " + JSON.stringify(sniffyObject));
      grunty.log.ok("Sniffy Object Created: " + file.dest);
    })
  });

  grunty.registerMultiTask("sniffyHTML", "Create a Sniffy Object from a HTML file.", function(){
    var options = this.options({
      tag : "img",
      attribute : "src",
      objectName: "sniffyObject",
      output: "img.js"
    });
    var sniffyObject = {
      tag: options.tag,
      attribute: options.attribute,
    };
    var search = {};

    this.files.forEach(function(file){
      var html = file.src.filter(function(path){
        if(!grunty.file.exists){
          return false;
        }
        return true;
      }).map(function(path){
        return grunty.file.read(path)
      });

      var $ = cheerio.load(html.toString());

      $(options.tag).each(function(index, element){
        var $this = $(this);
        var src = $this.attr(options.attribute);
        var id = $this.attr("id");
        var abspath = _path.join(_path.dirname(file.src), src);
        var encoded = convertImage(grunty, abspath);

        if(id){
          $this.attr(options.attribute, "");
          search[id] = encoded;
        }
      });

      sniffyObject.search = search;

      grunty.file.write(options.output, "var " + options.objectName + " = " + JSON.stringify(sniffyObject));
      grunty.log.ok("Sniffy Object Created: " + file.dest);

      var sniffyScript = "<script src='" + options.output + "'></script>";
      var script = "<script>var sniffy = new Sniffy(" + options.objectName + ") sniffy.sniff();</script>";

      $("body").append(sniffyScript);
      $("body").append(script);

      grunty.file.write(file.dest, $.html());
      grunty.log.ok("HTML Created: " + file.dest);
      
    })
  })
};
