const { typeConversion } = require('../../src/utils/typeConversion');

describe('Error handling for typeConversion()', () => {
  test('throws error for unsupported conversion types', async () => {
    await expect(
      typeConversion({
        currentType: 'application/xml',
        finalType: 'application/json',
        fragmentData: '<root><name>Test</name></root>',
      })
    ).rejects.toThrow('Type conversion from application/xml to application/json is not supported.');
  });

  test('throws error for invalid JSON in convertToYaml', async () => {
    const invalidJson = '{ name: Ashwin }'; // Missing quotes around keys
    await expect(
      typeConversion({
        currentType: 'application/json',
        finalType: 'application/yaml',
        fragmentData: invalidJson,
      })
    ).rejects.toThrow('Failed to convert JSON to YAML');
  });

  test('throws error for malformed YAML to text/plain', async () => {
    const badYaml = 'name: ashwin\n- invalid'; // improper structure
    await expect(
      typeConversion({
        currentType: 'application/yaml',
        finalType: 'text/plain',
        fragmentData: badYaml,
      })
    ).rejects.toThrow('Failed to convert to plain text');
  });

  test('throws error when markdown-to-HTML fails due to binary data', async () => {
    const badMarkdown = Buffer.from([0xff, 0xfe, 0xfd]); // garbage binary
    const result = await typeConversion({
      currentType: 'text/markdown',
      finalType: 'text/html',
      fragmentData: badMarkdown,
    });
    expect(result).toContain('�');
  });

  test('throws error when CSV is malformed during CSV to JSON conversion', async () => {
    const badCSV = 'name,age\nashwin'; // age missing
    const result = await typeConversion({
      currentType: 'text/csv',
      finalType: 'application/json',
      fragmentData: badCSV,
    });

    const parsed = JSON.parse(result);
    expect(parsed[0]).toEqual({ name: 'ashwin' });
  });

  test('throws error for unsupported source format when converting to plain text', async () => {
    await expect(
      typeConversion({
        currentType: 'application/pdf',
        finalType: 'text/plain',
        fragmentData: 'some-data',
      })
    ).rejects.toThrow('Type conversion from application/pdf to text/plain is not supported');
  });

  test('throws error when image conversion fails due to non-image data', async () => {
    const fakeImage = 'this is not an image buffer';
    await expect(
      typeConversion({
        currentType: 'image/png',
        finalType: 'image/jpeg',
        fragmentData: fakeImage,
      })
    ).rejects.toThrow('Failed to convert image');
  });

  test('throws error when finalType is unknown', async () => {
    await expect(
      typeConversion({
        currentType: 'text/plain',
        finalType: 'application/pdf',
        fragmentData: 'test',
      })
    ).rejects.toThrow(
      'Type conversion from text/plain to application/pdf is currently not supported'
    );
  });
});
