const fs = require('fs');
const Nunjucks = require('nunjucks');
const getOptions = require('loader-utils').getOptions;
const path = require('path');

const includeRe = /{%\s*include\s*['"](.*?)['"]\s+%}/g

module.exports = function (source) {
  const options = getOptions(this);
  options.options = options.options || {};
  options.options.noCache = true;

  // Set up Nunjucks.
  const nunjucks = Nunjucks.configure(options.path, options.options);

  // Add globals.
  for (let global in options.globals) {
    nunjucks.addGlobal(global, options.globals[global]);
  }

  // Add dependencies with includes.
  let includes = getIncludes(path.dirname(this.resourcePath), source);
  includes = includes.filter(uniq).forEach(include => {
    this.addDependency(path.resolve(options.path, include));
  });

  return nunjucks.renderString(source, options.context);
};

function getIncludes (templatePath, source) {
  let includes = [];
  let match;
  while (match = includeRe.exec(source)) {
    includes.push(path.resolve(templatePath, match[1]));
  }
  includes = includes.filter(uniq);

  let retIncludes = includes.slice();
  for (let i = 0; i < includes.length; i++) {
    let includePath = path.resolve(templatePath, includes[i]);
    let includeDir = path.dirname(includePath);
    let includeSource = fs.readFileSync(includePath, 'utf8');
    retIncludes = retIncludes.concat(getIncludes(includeDir, includeSource));
  }

  return retIncludes;
}

function uniq (value, index, self) {
  return self.indexOf(value) === index;
}
