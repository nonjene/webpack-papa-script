/**
 * Created by Nonjene on 2017/2/10.
 */
const fs = require("fs");
const path = require("path");

const ExcludeDir = ['modules', 'module', 'static', 'm', 'pc', 'components', 'component'];

const DIR_SRC = path.join(process.cwd(), '/src');

const isProj = require('./isProj');

let ls = function (baseDir = DIR_SRC) {
  let needGoDeep = [];
  let matchDirs = fs
    .readdirSync(baseDir)
    .filter(dir => {
      let fullPath = path.join(baseDir, dir);

      if (fs.statSync(fullPath).isDirectory() && ExcludeDir.every(exDir => exDir !== dir)) {
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
  }
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
 * @returns {string}
 */
const getAllProjName = function (scope, base = DIR_SRC) {
  let list = [];

  function doit(dir) {

    let lsRes = ls(dir);

    list = [...list, ...lsRes.matchDirs.map(matchDir => path.join(dir, matchDir).replace(base + path.sep, ''))];

    if (lsRes.needGoDeep.length > 0) {
      lsRes.needGoDeep.map(dir => {
        return doit(dir)
      });
    }
  }

  if (Array.isArray(scope)) {
    scope = scope.map(_scope => path.join(base, _scope))
  }
  else if (typeof scope === 'string') {
    scope = [path.join(base, scope)]
  }
  else {
    scope = [base]
  }

  scope.forEach(_scope => doit(_scope));

  return list.join(',');
};

/**
 * 获取 BUILD_TARGET 里面的所有子页面（包含m或pc文件夹的页面）。如:
 * - target
 *      - page1
 *          - m
 *          - pc
 *      - page2
 *          ...
 * 返回 [{
 *          subpath: 'page1',
 *          duan: 'm',
 *      },{
 *          subpath: 'page1',
 *          duan: 'pc',
 *      },
 *      ...
 *      ]
 *
 *
 * @param BUILD_TARGET
 * @param DUAN
 * @param base 根目录，默认是src
 * @returns {Array}
 */
const getAllSubPageName = function (BUILD_TARGET, DUAN, base) {
  return getAllProjName(BUILD_TARGET, base).split(',').reduce((_aDirs, dir) => {
    //getAllProjName是拿到所有包含pc或m或proj.json的文件夹，所以还要把pc和m拼上

    DUAN.forEach(duan => {
      _aDirs.push({
        subpath: BUILD_TARGET ? dir.replace(BUILD_TARGET + path.sep, '') : dir,
        duan
      });
    });

    return _aDirs;
  }, [])
};

module.exports = {
  getAllProjName,
  getAllSubPageName,
};