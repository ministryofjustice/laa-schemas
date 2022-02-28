# laa-schemas
JSON schema definitions and examples for LAA Digital.

Note: this is a prototype.

## Schemas

Crime applications:
- [Base schema](https://github.com/ministryofjustice/laa-schemas/blob/main/prototyping/criminal-legal-aid/schemas/laa-application.json) for applications
- [Sub schemas](https://github.com/ministryofjustice/laa-schemas/tree/main/prototyping/criminal-legal-aid/schemas) for sections of a legal aid application
- [Conditional rules](https://github.com/ministryofjustice/laa-schemas/tree/main/prototyping/criminal-legal-aid/schemas/conditions) for when data is required

## Examples

- [Application for criminal legal aid](https://github.com/ministryofjustice/laa-schemas/blob/main/prototyping/criminal-legal-aid/examples/laa-application.json)
- [Sub sections of criminal application](https://github.com/ministryofjustice/laa-schemas/blob/main/prototyping/criminal-legal-aid/examples) including means assessment, 'interests of justice' test and case details

## Tolerant schemas

A script for generating 'tolerant' versions of schemas has been added to `/lib`. These schemas have all `required` type properties stripped out. (This is intended for 'in progress' applications, where we want to permit incomplete data that does not include all required fields for a full application)

To generate tolerant schemas, first install the app:
- Download or clone the repository
- Run `npm install` in the project folder to install all modules and their dependencies

Then run the script:
- Run `npm run generate`

Tolerant versions are saved within a `/tolerant` sub-folder of the original schema directory.

This script is currently configured for `crime applications schemas` (referred to above). To add a new set of schemas, add the relevant path to [config.paths](https://github.com/ministryofjustice/laa-schemas/blob/main/lib/generate-tolerant-schemas.js#L7).
