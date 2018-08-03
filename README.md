# remark-examples

[![NPM](https://img.shields.io/npm/v/remark-examples.svg)](https://npmjs.org/packages/remark-examples/)
[![Travis CI](https://img.shields.io/travis/grahamar/remark-examples.svg)](https://travis-ci.org/grahamar/remark-examples)
[![MIT License](https://img.shields.io/github/license/grahamar/remark-examples.svg)](https://en.wikipedia.org/wiki/MIT_License)

A [remark](https://github.com/wooorm/remark) plugin that dynamically populates local or remote RESTful API examples from links.

## Installation

```sh
$ npm install remark-examples
```

## Usage

This plugin is to be used with [remark](https://github.com/wooorm/remark), e.g.

```js
import Remark from 'remark';
import RemarkExamples from 'remark-examples';

Remark()
  .use(
    RemarkExamples({
      fetcher: filePath => {
        return get(
          `api/documentation/file?path=${encodeURIComponent(filePath)}`
        ).then(({ data }) => {
          if (data) {
            return JSON.stringify(data, null, 2);
          }
          return undefined;
        });
      },
      baseUrl: 'https://api.grhodes.io'
    })
  )
  .process(markdown, function (err, file) {
    if (err) throw err;

    console.log(String(file));
  });
```

This plugin does a conversion when the markdown file contains lines starting with `#doc:`

```md
#doc:json:example shipping-notifications/post/:organization/shipping-notifications/simple
```

The above will be converted to code:

    ```
    curl -X POST -d @body.json -u <api-token>: https://api.grhodes.io/:organization/shipping-notifications
    ```

    body.json

    ```
    { example: 'example body json' }
    ```

    API Response

    ```
    { example: 'example body' }
    ```
