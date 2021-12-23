//initialize metadataparser
const { getMetadata, metadataRuleSets } = require("page-metadata-parser");
const getMetaData = require("metadata-scraper");

const domino = require("domino");
const fetch = require("node-fetch");

exports.fetchMetadata = async (userUrl) => {
  const url = String(userUrl);
  const response = await fetch(url);
  const html = await response.text();
  const doc = domino.createWindow(html).document;
  const metadata = getMetadata(doc, url);
  return metadata;
};

//Fetch language metadata
exports.fetchLanguage = async (userUrl) => {
  const data = await getMetaData(userUrl);
  return data.language;
};
