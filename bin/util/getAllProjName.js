/**
 * Created by Nonjene on 2017/2/10.
 */
const fs = require('fs');
const path = require('path');

const { projScanExclude, commSingleProjSubPage } = require('../config');

const DIR_SRC = path.join(process.cwd(), '/src');

const isProj = require('./isProj');
const _hasEntryFiles = require('./hasEntryFiles');

/**
 * 验证入口
 * @param {string} target
 * @param {string} dir
 */
const verifyEntry = (target, dir, opt) =>
  _hasEntryFiles(target, dir, [opt, 'hard'].join(',')).length > 0;
/**
 * 验证目录是否含有 commSingleProjSubPage 中的一个
 * @param {string} target
 * @param {string} opt "hard" or nothing
 */
const hasDuan = (target, opt) =>
  commSingleProjSubPage.some(duan => verifyEntry(target, duan, opt));

// 返回 baseDir 下的所有符合验证的 文件名，比如 baseDir/xxx 则返回 matchDirs:[xxx]
const ls = function(baseDir = DIR_SRC, opt = '') {
  const type = v => !!~opt.indexOf(v);
  let needGoDeep = [];
  let matchDirs = fs.readdirSync(baseDir).filter(dir => {
    let fullPath = path.join(baseDir, dir);

    if (fs.statSync(fullPath).isDirectory() && !~projScanExclude.indexOf(dir)) {
      if (type('proj')) {
        if (isProj(fullPath, 'abs')) {
           return true;
        } else {
          needGoDeep.push(dir);
          return false;
        }
      } else {
        needGoDeep.push(dir);
        return verifyEntry(fullPath, '', 'abs,hard');
      }
    } else {
      return false;
    }
  });

  return {
    matchDirs,
    needGoDeep
  };
};

const lsScope = function(scope = '', base = '', opt) {
  const dir = path.join(base, scope);
  const lsRes = ls(dir, opt);

  let list = lsRes.matchDirs.map(matchDir => path.join(scope, matchDir));

  if (lsRes.needGoDeep.length > 0) {
    lsRes.needGoDeep.map((deepScope) => {
      list = list.concat(lsScope(path.join(scope, deepScope), base, opt));
    });
  }
  return list;
};
/**
 * 获取 scope 下所有的项目目录。假如遇到识别为项目的位置，则不会再继续往里面遍历。
 * 识别参考 config.projContainsOneOf
 * - scope
 *      - page1
 *          - m
 *          - pc
 *      - scope2
 *          - page2
 *              ...
 * 返回 'scope/page1,scope/scope2/page2'
 * @param {Array} scope
 * @param {String} base  根目录
 * @returns {String}  base/scope 下的所有子目录字符串（不包含base/scope）, 以","隔开
 */
const getAllProjName = function(scope, base = DIR_SRC) {
  let list = [];
  if(!scope) scope = '';
  if (!Array.isArray(scope)) {
    scope = [scope];
  }

  scope.forEach(_scope => {
    list = [...list, ...lsScope(_scope, base, 'proj')];
  });

  return list.join(',');
};

/**
 * 获取 BUILD_TARGET 里面的所有子页面。
 * note: 识别参考值: config.entryInclude
 * 栗子：
 * - target
 *      - page1
 *          - m
 *          - pc
 *      - page2
 *          - index.js
 *          - index.html
 *          - config.json
 *          ...
 * 返回 [{
 *          subpath: 'page1',
 *          duan: 'm',
 *      },{
 *          subpath: 'page1',
 *          duan: 'pc',
 *      },{
 *          subPath: 'page2',
 *          duan: '',
 *      }
 *      ...
 *      ]
 * *****************************************
 * 有config.json
 *  无m pc
 *
 *
 * @param {String} target
 * @param {String} base 根目录，默认是src
 * @returns {Array}
 */
const getAllSubPageName = function(target, base = DIR_SRC) {
  const pages = lsScope(target, base, 'page').reduce((_aDirs, dir) => {
    const subpath = target
      ? dir.replace(path.join(target.toString()) + path.sep, '')
      : dir;

    if (subpath) {
      _aDirs.push({ subpath });
    }

    return _aDirs;
  }, []);
  return pages;
};

module.exports = {
  getAllProjName,
  getAllSubPageName,
  hasDuan,
  verifyEntry //验证入口是否合格（包含config.entryInclude）
};
