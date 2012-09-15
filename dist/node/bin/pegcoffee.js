#!/usr/bin/env node
// Generated by CoffeeScript 1.3.3
(function() {
  var PEG, PEGjsCoffeePlugin, abort, args, exitFailure, exitSuccess, exportVar, fs, inputFile, inputStream, isOption, nextArg, options, outputFile, outputStream, printHelp, printVersion, readStream, util;

  util = require('util');

  fs = require('fs');

  PEG = require('pegjs');

  PEGjsCoffeePlugin = require('../lib/pegjs-coffee-plugin.js');

  printVersion = function() {
    return util.puts("PEG.js CoffeeScript Plugin " + PEGjsCoffeePlugin.VERSION);
  };

  printHelp = function() {
    return util.puts("Usage: pegcoffee [options] [--] [<input_file>] [<output_file>]\n\nGenerates a parser from the PEG grammar specified in the <input_file> and\nwrites it to the <output_file>.\n\nIf the <output_file> is omitted, its name is generated by changing the\n<input_file> extension to \".js\". If both <input_file> and <output_file> are\nomitted, standard input and output are used.\n\nOptions:\n  -e, --export-var <variable>  name of the variable where the parser object\n                               will be stored (default: \"module.exports\")\n      --cache                  make generated parser cache results\n      --track-line-and-column  make generated parser track line and column\n      --js                     use plain javascript in actions\n  -v, --version                print version information and exit\n  -h, --help                   print help and exit");
  };

  exitSuccess = function() {
    return process.exit(0);
  };

  exitFailure = function() {
    return process.exit(1);
  };

  abort = function(message) {
    util.error(message);
    return exitFailure();
  };

  args = process.argv.slice(2);

  isOption = function(arg) {
    return /^-/.test(arg);
  };

  nextArg = function() {
    return args.shift();
  };

  readStream = function(inputStream, callback) {
    var input;
    input = "";
    inputStream.on("data", function(data) {
      return input += data;
    });
    return inputStream.on("end", function() {
      return callback(input);
    });
  };

  exportVar = "module.exports";

  options = {
    cache: false,
    trackLineAndColumn: false,
    js: false
  };

  while (args.length > 0 && isOption(args[0])) {
    switch (args[0]) {
      case "-e":
      case "--export-var":
        nextArg();
        if (args.length === 0) {
          abort("Missing parameter of the -e/--export-var option.");
        }
        exportVar = args[0];
        break;
      case "--js":
        options.js = true;
        break;
      case "--cache":
        options.cache = true;
        break;
      case "--track-line-and-column":
        options.trackLineAndColumn = true;
        break;
      case "-v":
      case "--version":
        printVersion();
        exitSuccess();
        break;
      case "-h":
      case "--help":
        printHelp();
        exitSuccess();
        break;
      case "--":
        nextArg();
        break;
      default:
        abort("Unknown option: " + args[0] + ".");
    }
    nextArg();
  }

  switch (args.length) {
    case 0:
      process.stdin.resume();
      inputStream = process.stdin;
      outputStream = process.stdout;
      break;
    case 1:
    case 2:
      inputFile = args[0];
      inputStream = fs.createReadStream(inputFile);
      inputStream.on("error", function() {
        return abort("Can't read from file \"" + inputFile + "\".");
      });
      outputFile = args.length === 1 ? args[0].replace(/\.[^.]*$/, ".js") : args[1];
      outputStream = fs.createWriteStream(outputFile);
      outputStream.on("error", function() {
        return abort("Can't write to file \"" + outputFile + "\".");
      });
      break;
    default:
      abort("Too many arguments.");
  }

  readStream(inputStream, function(input) {
    var parser;
    if (!options.js) {
      PEGjsCoffeePlugin.addTo(PEG);
    }
    try {
      parser = PEG.buildParser(input, options);
    } catch (e) {
      if ((e.line != null) && (e.column != null)) {
        abort("" + e.line + ":" + e.column + ":" + e.message);
      } else {
        abort(e.message);
      }
    }
    outputStream.write("" + exportVar + " = " + (parser.toSource()) + ";\n");
    if (outputStream !== process.stdout) {
      return outputStream.end();
    }
  });

}).call(this);