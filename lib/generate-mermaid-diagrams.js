'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const config = {
  paths: [
    {
      schemas: '/prototyping/criminal-legal-aid/schemas',
      images: '/prototyping/criminal-legal-aid/diagrams'
    },
    {
      schemas: '/prototyping/general',
      images: '/prototyping/general/diagrams'
    }
  ],
  repo: 'https://raw.githubusercontent.com/ministryofjustice/laa-schemas/main'
}

const generateFromSchema = async (paths) => {
  try {

    let schemaDir = path.join(__dirname, '..' + paths.schemas);
    let diagramsDir = path.join(__dirname, '..' + paths.images);
    let files = await fs.promises.readdir( schemaDir );
    for( const filename of files ) {
      const title = path.parse(filename).name;
      const fromPath = path.join( schemaDir, filename );
      const toPath = path.join( diagramsDir, title + '.mmd' );

      const stat = await fs.promises.stat( fromPath );
      if( stat.isFile() ) {
        console.log( "File found at '%s'", fromPath );
        let rawSchema = await fs.promises.readFile( fromPath, 'utf8' );
        let parsedSchema = JSON.parse(rawSchema);
        let converter = new GenerateMermaidMarkdown(parsedSchema, title, paths);
        let markdown = converter.convertSchema();
        if (markdown) {
          console.log('Saving markdown to %s', toPath);
          await fs.promises.writeFile( toPath, markdown);
        }
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

_.each(config.paths, generateFromSchema);

class GenerateMermaidMarkdown {

  constructor(schema, name, paths) {
    this.schema = schema;
    this.assignProperties = (data) => data.properties || data.items && data.items.properties;
    this.schema.properties = this.assignProperties(schema);
    this.name = name;
    this.paths = paths;
    this.attributes = _.keys(this.schema.properties);
    this.getReferenceValue = (obj) => obj && obj["$ref"];
    this.hasProperties = (v) => typeof v === 'object' && v.properties || (v.items && v.items.properties);
  }

  convertSchema() {
    let sections = [];
    let links = [];

    const addSections = (section, parent) => {
      section.properties = this.assignProperties(section);
      _.each(section.properties, (values, k) => {

         let definition = this.getObjDefinition(values);
         if (definition) {
           values = this.schema.definitions[definition];
         }

         let remote = this.getObjRemote(values, this.paths);
         if (remote) {
           values.properties = { ["[click_to_see]"]: remote.key };
           links.push({ url: remote.url, model: remote.key, class: k });
         }

         if(this.hasProperties(values)) {
           values.properties = this.assignProperties(values);
           sections.push({ key: k, values, parent });
           addSections(values, k);
         }
      });
    }

    addSections(this.schema, this.name);
    return this.generateMarkdownOutput({ sections, links });
  }

  schemaToImageUrl(url) {
    // NB doesn't work for general folder - for now, everyting at root /general
    url = url.replace(this.paths.schemas, this.paths.images);
    return url.replace('.json', '.svg');
  }

  getObjRemote(obj) {
    let ref = this.getReferenceValue(obj);
    if(ref && ref.includes(config.repo)) {
      let imageUrl = this.schemaToImageUrl(ref);
      let imageName = imageUrl.split("/").pop();
      let className = path.parse(imageName).name;
      return {
        key: className,
        url: imageUrl
      };
    }
  }

  getObjDefinition(obj) {
    let ref = this.getReferenceValue(obj);
    if(ref && ref.includes('#/definitions')) {
      let key = ref.split("/").pop();
      return key;
    }
    return;
  }

  generateMarkdownOutput(data) {
    const indent = '  ';
    const relationship = ' --> ';

    let output = 'classDiagram\n';
    _.each(data.sections, (section) => {
      output += indent + section.parent + relationship + section.key + '\n';
      output += '  class ' + section.key + ' {' + '\n';
      _.each(section.values.properties, (property, id) => {
        output += indent + indent + id + '\n';
      });
      output += '  }' + '\n\n';
    });

    _.each(this.attributes, attr => {
      output += indent + this.name + ': ' + attr + '\n';
    });

    _.each(data.links, link => {
      output += '\n' + "  click " + link.class + " href \"" + link.url + "\" \"Click to see " + link.model + "\"";
    });

    return output;
  }

}
