import u from 'unist-builder';

import { DOC_PARSE_IDENT, DOC_TYPE_JSON_EXAMPLE } from './constants';
import {
  maybeGetFileContents,
  getCurlCommandFromOperation,
  getMarkdownCodeBlock
} from './utils';

const build = async ({ type, node, index, parent }, { fetcher, baseUrl }) => {
  // #doc:json:example [[[experiences/post/:organization/experiences/simple]]]
  const jsonPath = node.value
    .replace(DOC_PARSE_IDENT, '')
    .replace(DOC_TYPE_JSON_EXAMPLE, '')
    .trim();

  // experiences/[[[post]]]/:organization/experiences/simple
  const method = jsonPath.split('/')[1];

  // experiences/post/[[[:organization/experiences]]]/simple
  const operationPath = jsonPath.split('/').slice(2, -1).join('/');

  const requestJson = await maybeGetFileContents(`${jsonPath}.request.json`, fetcher);
  const requestJsonQuery = await maybeGetFileContents(`${jsonPath}.request.query`, fetcher);
  const responseJson = await maybeGetFileContents(`${jsonPath}.response.json`, fetcher);
  const curl = getCurlCommandFromOperation({
    method,
    path: `/${operationPath}`,
    baseUrl,
  }, requestJsonQuery);

  if (!requestJson && !responseJson) {
    // eslint-disable-next-line max-len
    throw new Error(`Could not find request or response json at ${jsonPath}. Expected at least one in order to display example to user.`);
  }

  let response = [getMarkdownCodeBlock(curl, 'bash')];

  if (requestJson) {
    response = [
      ...response,
      { type: 'break' },
      { type: 'text', value: 'body.json' },
      { type: 'break' },
      getMarkdownCodeBlock(requestJson, 'json')
    ];
  }

  if (responseJson) {
    response = [
      ...response,
      { type: 'break' },
      { type: 'text', value: 'API Response' },
      { type: 'break' },
      getMarkdownCodeBlock(responseJson, 'json')
    ];
  }

  return response;
}

export default build;
