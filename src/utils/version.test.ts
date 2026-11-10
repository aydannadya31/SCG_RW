import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSemanticVersion, formatSemanticVersion, bumpVersion } from './version';

test('parseSemanticVersion parses semantic versions properly', () => {
  const p1 = parseSemanticVersion('2.5.0');
  assert.equal(p1.major, 2);
  assert.equal(p1.minor, 5);
  assert.equal(p1.patch, 0);

  const p2 = parseSemanticVersion('v3.1.4');
  assert.equal(p2.major, 3);
  assert.equal(p2.minor, 1);
  assert.equal(p2.patch, 4);
});

test('formatSemanticVersion formats parts to string', () => {
  assert.equal(formatSemanticVersion(2, 5, 1), '2.5.1');
  assert.equal(formatSemanticVersion(3, 0, 0), '3.0.0');
});

test('bumpVersion increments patch by default and increments build number', () => {
  const res = bumpVersion('2.5.0', 1085, 'patch');
  assert.equal(res.nextVersion, '2.5.1');
  assert.equal(res.nextBuild, 1086);
});

test('bumpVersion increments minor and resets patch', () => {
  const res = bumpVersion('2.5.3', 1085, 'minor');
  assert.equal(res.nextVersion, '2.6.0');
  assert.equal(res.nextBuild, 1086);
});

test('bumpVersion increments major and resets minor & patch', () => {
  const res = bumpVersion('2.5.3', 1085, 'major');
  assert.equal(res.nextVersion, '3.0.0');
  assert.equal(res.nextBuild, 1086);
});
