/**
 * Created by Nonjene on 2017/2/10.
 */
const fs = require('fs');
const path = require('path');

const { projScanExclude, commSingleProjSubPage } = require('../config');

const DIR_SRC = path.join(process.cwd(), '/src');

const isProj = require('./isProj');
const hasEntryFiles = require('./hasDuan');

let ls = function(baseDir = DIR_SRC) {
  let needGoDeep = [];
  let matchDirs = fs.readdirSync(baseDir).filter(dir => {
    let fullPath = path.join(baseDir, dir);

    if (fs.statSync(fullPath).isDirectory() && !~projScanExclude.indexOf(dir)) {
      if (isProj(fullPath, 'abs')) {
        return true;
      } else {
        needGoDeep.push(fullPath);
        return false;
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

/**
 * 获取 scope 下所有的项目目录（包含m或pc文件夹或proj.json的页面）。如:
 * - scope
 *      - page1
 *          - m
 *          - pc
 *      - scope2
 *          - page2
 *              ...
 * 返回 'scope/page1,scope/scope2/page2'
 * @param scope
 * @param base  根目录
 * @returns {string}  base/scope 下的所有子目录字符串（不包含base/scope）, 以","隔开
 */
const getAllProjName = function(scope, base = DIR_SRC) {
  let list = [];

  function doit(dir) {
    let lsRes = ls(dir);

    list = [
      ...list,
      ...lsRes.matchDirs.map(matchDir =>
        path.join(dir, matchDir).replace(path.join(base) + path.sep, '')
      )
    ];

    if (lsRes.needGoDeep.length > 0) {
      lsRes.needGoDeep.map(dir => {
        return doit(dir);
      });
    }
  }

  if (Array.isArray(scope)) {
    scope = scope.map(_scope => path.join(base, _scope));
  } else if (typeof scope === 'string') {
    scope = [path.join(base, scope)];
  } else {
    scope = [base];
  }

  scope.forEach(_scope => doit(_scope));

  return list.join(',');
};

/**
 * 验证入口
 * @param {string} target 
 * @param {string} dir 
 */
const verifyEntry = (target, dir) => hasEntryFiles(target, dir).length > 0;
/**
 * 验证目录是否含有 commSingleProjSubPage 中的一个
 * @param {string} target 
 * @param {string} opt "hard" or nothing
 */
const hasDuan = (target, opt) => commSingleProjSubPage.some(duan=>verifyEntry(target, duan, opt));

/**
 * 获取 BUILD_TARGET 里面的所有子页面（包含 config.projContainsOneOf 值的页面）。如:
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
 * @param BUILD_TARGET
 * @param duans   commSingleProjSubPage
 * @param base 根目录，默认是src
 * @returns {Array}
 */
const getAllSubPageName = function(BUILD_TARGET, duans, base) {
  return getAllProjName(BUILD_TARGET, base)
    .split(',')
    .reduce((_aDirs, dir) => {
      const subpath = BUILD_TARGET
        ? dir.replace(path.join(BUILD_TARGET.toString()) + path.sep, '')
        : dir;

      // getAllProjName 是拿到所有包含pc或m或proj.json的文件夹
      // 所以还要辨别是否有配置 duans, 并且，该文件夹中是否含有至少其中一个。
      if (duans && duans.length && hasDuan(dir, 'easy')) {
        duans.forEach(duan => _aDirs.push({ subpath, duan }));
      } else {
        _aDirs.push({ subpath, duan: '' });
      }

      return _aDirs;
    }, []);
};

module.exports = {
  getAllProjName,
  getAllSubPageName,
  hasDuan,
  verifyEntry,  //验证入口是否合格（包含config.entryInclude）
};
