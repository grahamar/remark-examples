/**
 * Eat the expection if a file is not found and return undefined instead.
 */
export const maybeGetFileContents = async (filePath, fetcher) => {
  try {
    return await fetcher(filePath);
  } catch (e) {
    return undefined;
  }
}

export const getCurlCommandFromOperation = (operation, queryString) => {
  const method = operation.method.toUpperCase();
  const path = operation.path;
  const baseUrl = operation.baseUrl;
  const search = queryString ? `?${queryString}` : '';
  const uri = queryString ? `'${baseUrl}${path}${search}'` : `${baseUrl}${path}${search}`;

  switch (method) {
  case 'GET':
    return `curl -u <api-token>: ${uri}`;
  default:
    return `curl -X ${method} -d @body.json -u <api-token>: ${uri}`;
  }
}

export const getMarkdownCodeBlock = (content, lang = '') => {
  if (typeof content === 'undefined') {
    return { type: 'code', lang, value: '' };
  }

  return { type: 'code', lang, value: content.trim() };
}
