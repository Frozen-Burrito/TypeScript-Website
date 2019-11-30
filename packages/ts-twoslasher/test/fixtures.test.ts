import { readdirSync, readFileSync, lstatSync } from 'fs';
import { join, extname, parse } from 'path';
import { toMatchFile } from 'jest-file-snapshot';
import { twoslasher } from '../src/index';
import { format } from 'prettier';

expect.extend({ toMatchFile });

// To add a test, create a file in the fixtures folder and it will will run through
// as though it was the codeblock.

describe('with fixtures', () => {
  // Add all codefixes
  const fixturesFolder = join(__dirname, 'fixtures');
  const resultsFolder = join(__dirname, 'results');

  readdirSync(fixturesFolder).forEach(fixtureName => {
    const fixture = join(fixturesFolder, fixtureName);
    if (lstatSync(fixture).isDirectory()) {  return; }

    it('Fixture: ' + fixtureName, () => {
      const resultName = parse(fixtureName).name + '.json';
      const result = join(resultsFolder, resultName);

      const file = readFileSync(fixture, 'utf8');

      const fourslashed = twoslasher(file, extname(fixtureName).substr(1));
      const jsonString = format(JSON.stringify(fourslashed), {
        parser: 'json',
      });
      expect(jsonString).toMatchFile(result);
    });
  });


  const throwaFixturesFolder = join(__dirname, 'fixtures', 'throws');

  readdirSync(throwaFixturesFolder).forEach(fixtureName => {
    const fixture = join(throwaFixturesFolder, fixtureName);
    if (lstatSync(fixture).isDirectory()) {  return; }
    
    it('Throwing Fixture: ' + fixtureName, () => {
      const resultName = parse(fixtureName).name + '.json';
      const result = join(resultsFolder, resultName);

      const file = readFileSync(fixture, 'utf8');

      let thrown = false
      try {
        twoslasher(file, extname(fixtureName).substr(1))
      } catch(err) {
        thrown = true
        expect(err.message).toMatchFile(result);
      }

      if (!thrown) throw new Error("Did not throw")
    });
  });

});