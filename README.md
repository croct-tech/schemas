<p align="center">
  <a href="https://croct.com" target="_blank">
    <picture>
        <source media="(min-width: 769px) and (prefers-color-scheme: light)" srcset="https://github.com/croct-tech/plug-js/blob/master/.github/assets/header-light.svg">
        <source media="(min-width: 769px) and (prefers-color-scheme: dark)" srcset="https://github.com/croct-tech/plug-js/blob/master/.github/assets/header-dark.svg">
        <source media="(max-width: 768px) and (prefers-color-scheme: dark)" srcset="https://github.com/croct-tech/plug-js/blob/master/.github/assets/header-dark-mobile.svg">
        <source media="(max-width: 768px) and (prefers-color-scheme: light)" srcset="https://github.com/croct-tech/plug-js/blob/master/.github/assets/header-light-mobile.svg">
        <img src="https://github.com/croct-tech/plug-js/blob/master/.github/assets/header-light-mobile.svg" alt="Croct JavaScript SDK" title="Croct JavaScript SDK" width="100%">
    </picture>
  </a>
  <br/>
  <strong>Croct Schemas</strong><br/>
  Schemas for Croct configurations, APIs, and more.
</p>

## Introduction

This repository provides schemas to validate configurations, API payloads, and other structures used by Croct.

## JSON schemas

To use a JSON schema in your JSON configuration, include the `$schema` keyword referencing the appropriate schema URL:

```json
{
  "$schema": "https://schema.croct.com/v1/content.json",
  "type": "boolean",
  "value": {
    "type": "static",
    "value": true
  }
}
```

### Available schemas

Below is a list of available JSON schemas:

| Schema         | URL                                                                                                            |
|----------------|----------------------------------------------------------------------------------------------------------------|
| Content        | [`https://schema.croct.com/json/v1/content.json`](https://schema.croct.com/json/v1/content.json)               |
| Content schema | [`https://schema.croct.com/json/v1/content-schema.json`](https://schema.croct.com/json/v1/content-schema.json) |
| Template       | [`https://schema.croct.com/json/v1/template.json`](https://schema.croct.com/json/v1/template.json)             |
| Web event      | [`https://schema.croct.com/json/v1/web-event.json`](https://schema.croct.com/json/v1/web-event.json)           |

## Documentation

Visit our [official documentation](https://docs.croct.com).

## Support

Join our official [Slack channel](https://croct.link/community) to get help from the Croct team and other developers.

## Contribution

Contributions are always welcome! 

- Report any bugs or issues on the [issue tracker](https://github.com/croct-tech/plug-js/issues).
- For major changes, please [open an issue](https://github.com/croct-tech/plug-js/issues) first to discuss what you would like to change.
- Please make sure to update tests as appropriate. Run tests with `npm test`.

## License

This library is licensed under the [MIT license](LICENSE).
