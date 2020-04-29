# Gulp 4 starter
---
---

## How-Tos

### How to add new page?
- add html file inside `src/pages` directory
- add page info to `PAGE_DATA` in `config/variables.js`

### How to add new stylesheet?
- add .scss file not starting with `_` in `src/pages` or `src/shared/styles` directory

### How to add new script?
- add .js file in `src` directory
- add script info to `scriptsArray` in `config/tasks/scripts.js`
- add script basename to `includedScripts` array in `PAGE_DATA` in `config/variables.js`

### How to include block of text only in debug mode?
- html

start with `<!-- DEBUG_START` and end with `DEBUG_END -->`

- styles and js

start with `// DEBUG_START` and end with `// DEBUG_END`

## Features
- multi-site
- file watching
- browsersync server with css injection
- custom template string replacement like `{{STATIC_PATH}}`
- cache busting

## Disclaimer
This template was not meant to be production-ready for more than basic, landing pages. There are far better tools available for that purpose.
