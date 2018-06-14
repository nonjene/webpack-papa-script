module.exports = {
  ftp: {
    host: '192.168.2.228',
    port: '',
    user: 'testlimincom',
    password: 'testlimincom'
  },

  staticFileConcatOrder: ['reset.js', 'config.js', 'responsive.js'],
  staticFileSubPath: 'static',
  staticFileName: 'common_test.js',

  commSingleProjSubPage: ['m', 'pc'],
  webpackConfig: {
    resolve: {
      alias: {
        common: 'modules/tools/common'
      }
    }
  },
  shouldCompileProceed: {
    production: null,
    development: null,
  },

  //本地开发环境
  developEnvType: {
    deploy: 'test',
    fetch: 'test'
  },
  //正式上线的环境
  productEnvType: {
    deploy: 'pro',
    fetch: 'produce'
  },
  deployEnvType: {
    pre: 'dist/pre',
    pro: 'dist/pro',
    test: 'build/activity'
  },
  deployEnvMapFetch: {
    pre: 'pre',
    pro: 'produce',
    test: 'test'
  },
  releaseEnvDesc: {
    pre: '预发环境😛',
    pro: '生产环境😝',
    test: '开发环境🤔'
  },
  fetchEnvDesc: {
    pre: '预发环境🥑',
    test: '测试环境🥝',
    produce: '生产环境🍓'
  }
};
