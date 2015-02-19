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
  var checkObjectSize = function(object){
    var size = 0, key;
    for (key in object) {
      if (object.hasOwnProperty(key)) size++;
    }
    return size;
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
      output: "img.js",
      keepLocal: true
    });
    var sniffyObject = {
      tag: options.tag,
      attribute: options.attribute,
    };
    var search = {};

    this.files.forEach(function(file){
      var html = file.src.filter(function(path){
        if(!grunty.file.exists(path)){
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
          search["#" + id] = encoded;
        }
      });

      sniffyObject.search = search;

      if(checkObjectSize(search) > 0){
        grunty.file.write(options.output, "var " + options.objectName + " = " + JSON.stringify(sniffyObject));
        grunty.log.ok("Sniffy Object Created: " + options.output);

        var outputLink = options.keepLocal ? _path.basename(options.output) : options.output;
        var sniffyScript = "\t<script src='" + outputLink + "'></script>\n";
        var script = "\t<script>\n\t\tvar sniffy = new Sniffy(" + options.objectName + ");\n\t\tsniffy.sniff();\n\t</script>\n";

        $("body").append(sniffyScript);
        $("body").append(script);

        grunty.file.write(file.dest, $.html());
        grunty.log.ok("HTML Created: " + file.dest);
      }
      else{
        grunty.log.ok("Sniffy Object Not Created because HTML contains no images");
      }
    })
  })

  grunty.registerMultiTask("sniffyCSS", "Encode CSS Background Images with Base64.", function(){
    var options = this.options({

    });

    this.files.forEach(function(file){
      var css = file.src.filter(function(path){
        if(!grunty.file.exists(path)){
          return false;
        }
        return true;
      }).map(function(path){
        return grunty.file.read(path)
      });

      var urlRegex = /url\(\s?(?:\"|\')([^(?!\"|\')]+)(?:\"|\')\s?\)/ig;

      css = css.toString();
      var newCSS = css.replace(urlRegex, function(match, url, offset, string){
        var abspath = _path.join(_path.dirname(file.dest), url)
        if(grunty.file.exists(abspath)){
          return "url(" + convertImage(grunty, abspath) + ")";
        }
        return match;
      })

      grunty.file.write(file.dest, newCSS);
      grunty.log.ok("CSS Created: " + file.dest);
      
    })
  })
};
