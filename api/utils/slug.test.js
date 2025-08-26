import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug } from './slug.js';

test('generateSlug converts title to URL-friendly slug', () => {
    const slug = generateSlug('Hello World!');
    assert.strictEqual(slug, 'hello-world');
});

test('generateSlug removes non-alphanumeric characters', () => {
    const slug = generateSlug('React & Node.js Basics');
    assert.strictEqual(slug, 'react-nodejs-basics');
});

test('generateSlug collapses whitespace and trims hyphens', () => {
    const slug = generateSlug('  Multiple   Spaces -- and symbols!!!  ');
    assert.strictEqual(slug, 'multiple-spaces-and-symbols');
});
