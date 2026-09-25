const { chromium } = require('playwright-core')
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5173/create'
const results = []
const ok = (n, d = '') => results.push(`PASS ${n}${d ? ' :: ' + d : ''}`)
const fail = (n, d = '') => results.push(`FAIL ${n}${d ? ' :: ' + d : ''}`)
module.exports = { chromium, EDGE, URL, results, ok, fail }
