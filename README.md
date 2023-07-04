# About

Source code for the web portion of [supercharge.info](https://supercharge.info).

## Environment Setup

* nodejs
* npm

## Running Locally

### Localhost only

`npm install`
`npm run start`

http://localhost:9090/

### Running an open development server (choose port and comma-separated list of allowed hostnames)

`npm install`
`npm run start -- --env open --env port=9191 --env hosts=mydevsite,mydevsite.dev.supercharge.info`

http://mydevsite:9191 or http://mydevsite.dev.supercharge.info:9191

### Build without running

`npm run devbuild` or `npm run prodbuild`

## Forum

https://forum.supercharge.info/c/code