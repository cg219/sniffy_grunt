# grunt-sniffy

> Create a Sniffy Object from a directory of imgs.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-sniffy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-sniffy');
```

## The "sniffy" task

### Overview
In your project's Gruntfile, add a section named `sniffy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  sniffy: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Sniffy Options

#### options.search
Type: `object`
Default value:

**REQUIRED**
Key Value pair of (id, encoded image);

#### options.tag
Type: `String`
Default value: `'img'`

The tag of what Sniffy should sniff for.

#### options.attribute
Type: `String`
Default value: `'src'`

The attribute Sniffy will alter.

#### options.objectName
Type: `String`
Default value: `'sniffyObject'`

Variable name the sniffy object will be binded to.

### SniffyHTML Options

#### options.output
Type: `String`
Default value: `'img.js'`

Destination of the fully constructed Sniffy Object

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  sniffy: {
    options: {
      search: {
        "#bg" : "blue.jpg",
        "#copyA" : "darkgrey.png",
        "#copyB" : "gold.png",
        "#another" : "green.png"
      }
    },
    test: {
        src: ["test/imgs"],
        dest: "test/output/img.js"
      }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
[0.1.0](https://github.com/cg219/grunt-sniffy/releases/tag/0.1.0)
[0.2.0](https://github.com/cg219/grunt-sniffy/releases/tag/0.2.0)
