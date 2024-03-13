// import { dirname } from "path";
// import { fileURLToPath } from "url";
const { dirname } = require("path");
const { fileURLToPath } = require("url");
/**
 *
 * @param {ImportMeta} meta
 */
function fileDirName(meta) {
  const __filename = fileURLToPath(meta.url);
  const __dirname = dirname(__filename);
  return { __dirname, __filename };
}

/**
 *
 * @param {Array} list
 * @param {object} item
 * @param {number} lv
 */
function formatChildren(list, item, lv) {
  list[lv] = list[lv] || [];
  list[lv].push(item.id);
  let children = item.children;
  if (children) {
    for (let i = 0, l = children.length; i < l; i++) {
      formatChildren(list, children[i], lv + 1);
    }
  }
}

module.exports = {
  fileDirName,
  formatChildren,
};
