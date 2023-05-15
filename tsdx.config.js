// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
const replace = require('@rollup/plugin-replace');
const scss = require('rollup-plugin-scss');
const typescript2 = require('rollup-plugin-typescript2');

module.exports = {
    // This function will run for each entry/format/env combination
    rollup(config, opts) {
        config.plugins = config.plugins.map(p => {
            p.name === 'replace' ? replace({
                'process.env.NODE_ENV': JSON.stringify(opts.env),
                preventAssignment: true,
            })
                : p;
        });
        config.plugins.push(scss());
        config.plugins.push(typescript2());
        return config; // always return a config.
    },
};