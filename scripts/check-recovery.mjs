import assert from 'node:assert/strict';
const deadline = Date.now() + 60000;
let recovered = false;
while (Date.now() < deadline) {
  try { const response = await fetch('http://localhost:4000/api/v1/health/ready', { signal: AbortSignal.timeout(5000) }); if (response.ok) { recovered = true; break; } } catch {}
  await new Promise(resolve => setTimeout(resolve, 1000));
}
assert.equal(recovered, true, 'Storage recovery did not restore platform readiness.');
console.log('PASS: readiness returns to 200 after object storage recovery.');
