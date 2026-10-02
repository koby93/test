import assert from 'node:assert/strict';
const response = await fetch('http://localhost:4000/api/v1/health/ready', { signal: AbortSignal.timeout(10000) });
assert.equal(response.status, 503);
const health = await response.json();
assert.equal(health.status, 'degraded');
assert.equal(health.checks.storage, 'down');
assert.equal((await fetch('http://localhost:4000/api/v1/health/live')).status, 200);
console.log('PASS: storage outage returns 503 readiness while process liveness remains available.');
