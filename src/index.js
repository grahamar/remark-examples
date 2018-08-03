import visit from 'unist-util-visit';

import jsonExamples from './json-example';
import resourceOp from './resource-op';
import resource from './resource';
import section from './section';
import include from './include';
import moduleU from './module';
import model from './model';
import enumU from './enum';

import {
  PLUGIN_NAME,
  DOC_PARSE_IDENT,
  DOC_TYPE_RESOURCE_OPERATION,
  DOC_TYPE_JSON_EXAMPLE,
  DOC_TYPE_RESOURCE,
  DOC_TYPE_MODEL,
  DOC_TYPE_ENUM,
  DOC_TYPE_SECTION,
  DOC_TYPE_MODULE,
  DOC_TYPE_INCLUDE,
} from './constants';

const types = {
  [DOC_TYPE_RESOURCE_OPERATION]: resourceOp,
  [DOC_TYPE_JSON_EXAMPLE]: jsonExamples,
  [DOC_TYPE_RESOURCE]: resource,
  [DOC_TYPE_SECTION]: section,
  [DOC_TYPE_INCLUDE]: include,
  [DOC_TYPE_MODULE]: moduleU,
  [DOC_TYPE_MODEL]: model,
  [DOC_TYPE_ENUM]: enumU,
};

/**
 * Process docItem
 *
 * @param {Object} docItem
 *
 * @return {Promise}
 */
const processDocItem = async (docItem, options) => {
  const { docType, node, index, parent } = docItem;
  let replacement = node;

  try {
    if (docType in types) {
      replacement = await types[docType](docItem, options);
    } else {
      throw new Error(`Type not found: ${docType}`);
    }

    parent.children.splice(index, replacement.length, ...replacement);
  } catch (error) {
    console.error(`Failed processing ${docType}. Details: ${error}`, node.position, PLUGIN_NAME);
  }

  const item = {
    docType,
    node: replacement,
    index,
    parent,
  };

  return item;
};

/**
 * Operates on lines starting with `#doc:`.
 * example:
 * - #doc:json:example orders/put/:organization/orders/:number/submissions/simple
 *
 * @param {object} ast
 * @return {Promise}
 */
const visitLink = async (ast, options) => {
  const docItems = [];

  visit(ast, 'text', (node, index, parent) => {
    if (node.value.startsWith(DOC_PARSE_IDENT)) {
      const docType = node.value.replace(DOC_PARSE_IDENT, '').split(' ')[0];
      docItems.push({ docType, node, index, parent });
    }
  });

  if (!docItems.length) {
    return Promise.resolve(ast);
  }

  return Promise.all(docItems.map(docItem => processDocItem(docItem, options))).then(() => ast);
};

/**
 * Export the attacher which accepts options and returns the transformer to
 * act on the MDAST tree, given a VFile.
 *
 * @link https://github.com/unifiedjs/unified#function-attacheroptions
 * @return {function}
 */
export default (options) => {
  const attacher = () => {
    const { fetcher, baseUrl } = options;

    /**
     * @link https://github.com/unifiedjs/unified#function-transformernode-file-next
     * @link https://github.com/syntax-tree/mdast
     * @param {object} ast MDAST
     * @param {function} next
     * @return {object}
     */
    return async node => visitLink(node, { fetcher, baseUrl });
  };

  return attacher;
};
