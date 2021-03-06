"use strict";
const assert = require("assert");
const cheerio = require("cheerio");
const uncss = require("uncss");

function HtmlWebpackUncssPlugin(options) {
  assert.equal(
    options,
    undefined,
    "The HtmlWebpackUncssPlugin does not accept any options"
  );
}

HtmlWebpackUncssPlugin.prototype.apply = compiler => {
  (compiler.hooks
    ? compiler.hooks.compilation.tap.bind(
        compiler.hooks.compilation,
        "html-webpack-uncss-plugin"
      )
    : compiler.plugin.bind(compiler, "compilation"))(function(compilation) {
    (compilation.hooks
      ? compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync.bind(
          compilation.hooks.htmlWebpackPluginAfterHtmlProcessing,
          "html-webpack-uncss-plugin"
        )
      : compilation.plugin.bind(
          compilation,
          "html-webpack-plugin-after-html-processing"
        ))(function(data, callback) {
      const $ = cheerio.load(data.html);
      const styles = [];
      $("style").map((i, el) => {
        const style = $(el).html();
        if (style) {
          styles.push(style);
        }
      });

      uncss($.html(), { raw: styles.join(" ") }, (error, output) => {
        if (error) {
          return callback(error);
        }
        $("style")
          .slice(1)
          .remove();
        $("style").text(output);
        data.html = $.html();
        return callback(null, data);
      });
    });
  });
};

module.exports = HtmlWebpackUncssPlugin;
