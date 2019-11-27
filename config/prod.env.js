'use strict'

if (process.env.npm_lifecycle_event === 'build:dev') {
  process.env.BASE_API = 'cme-dev.bumo.io'
  process.env.PROTOCOL = 'http://'
} else if (process.env.npm_lifecycle_event === 'build:test' || process.env.npm_lifecycle_event === 'dev:test') {
  process.env.BASE_API = 'cme.bumotest.io'
  process.env.PROTOCOL = 'https://'
} else if (process.env.npm_lifecycle_event === 'build:prod' || process.env.npm_lifecycle_event === 'dev:prod') {
  process.env.BASE_API = 'cme.bumo.io'
  process.env.PROTOCOL = 'https://'
} else {
  process.env.BASE_API = 'cme.bumo.io'
  process.env.PROTOCOL = 'https://'
}

module.exports = {
  NODE_ENV: '"production"',
  BASE_API: '"' + process.env.BASE_API + '"',
  PROTOCOL: '"' + process.env.PROTOCOL + '"'
}
