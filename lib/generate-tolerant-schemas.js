'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const config = {
  paths: [
    '/prototyping/criminal-legal-aid/schemas'
  ]
}

const generateTolerantSchemas = async (schemaPath) => {
  try {
    let schemaDir = path.join(__dirname, '..' + schemaPath);
    let files = await fs.promises.readdir( schemaDir );
    for( const filename of files ) {
      const fromPath = path.join( schemaDir, filename );
      const toPath = path.join( schemaDir + '/tolerant', filename );

      const stat = await fs.promises.stat( fromPath );
      if( stat.isFile() ) {
        console.log( "'%s' is a file.", fromPath );
        let originalSchema = await fs.promises.readFile( fromPath, 'utf8' );
        let slackSchema = slackenSchema(JSON.parse(originalSchema));
        let newSchema = setTolerantPaths(JSON.stringify(slackSchema), schemaPath)
        await fs.promises.writeFile( toPath, newSchema);
        console.log( "Copied '%s'->'%s'", fromPath, toPath );
      }
      else if( stat.isDirectory() ) {
        console.log( "'%s' is a directory.", fromPath );
      }
    }
  }
  catch( e ) {
    console.error( "Err", e );
  }
};

_.each(config.paths, generateTolerantSchemas);

const slackenSchema = (schema) => {
  stripRequiredProperties(schema);
  slackenSubSchema(schema);
  return schema;
}

const stripRequiredProperties = (data) => {
  delete data.required;
  delete data.allOf;
  delete data.dependentRequired;
  return data;
}

const slackenSubSchema = (schema) => {
  _.each(schema, (child, key) => {
    stripRequiredProperties(schema[key])

    if(typeof child === 'object') {
      if (key === 'properties' || key === 'definitions') { slackenSchema(schema[key]) };
      if (child.properties) { slackenSchema(schema[key].properties); }
    }
  });
}

const setTolerantPaths = (text, currentPath) => {
  let pathRegex = new RegExp(currentPath,'g');
  return text.replace( pathRegex, path.join( currentPath, 'tolerant' ));
};

module.exports = {};
