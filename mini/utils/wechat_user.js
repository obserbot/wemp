// utils/wechat_user.js

const server_api = require('../server.api.js')
const utils = require('../utils/utils.js')

/**
 * wx.login() 调用微信登录
 * 获取登录凭证 code，有效期 5 分钟
 */
function wxLoginToGetCode () {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res.code)
        }
        else {
          reject('error')
        }
      },
      timeout() {
        reject('timeout')
      },
      fail() {
        reject('failed')
      }
    })
  })
}

/**
 * Try login up to 3 times.
 */
function weiyiLogin (code) {
  return new Promise((resolve, reject) => {
      wx.request({
        url: server_api.wxLogin,
        data: {code},
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded'},
        success: res => {
          if (res.data.msg === 'ok') {
                /*
                wx.setStorageSync('session3rd', res.data.session3rd)
                wx.setStorageSync('wid', res.data.wid)
                resolve(res.data.session3rd)
                */
            resolve(res.data)
          }
          else {
                //console.log('Error 8: Cannot login on server.');
            reject(false)
          }
        },
        fail: () => {
              //console.log('Fails.');
          reject(false);
        }
      })
    })
}

/**
 * 用户初始化信息
 * @param session3rd
 * @param code
 */
function initInfo(code, session3rd) {
  return new Promise((resolve, reject) => {
    const localeStrings = wx.T.getLanguage()
    wx.showLoading({ title: localeStrings.isLoading })

    wx.request({
      url: server_api.getUserDetails,
      data: {code, session3rd},
      method: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      success(res) {
        //console.log('kkhuhu init  resss');
        //console.log(res);
        resolve(res.data)
      },
      fail(res) {
        console.log('Initiate info fails.', res)
      },
      complete() {
        wx.hideLoading();
      }
    });
  })
}

/**
 * 全局信息：公共信息，个人信息
 * @param session3rd
 */
function getGlobalInfo (session3rd) {
  //console.log('inin', session3rd)
  return new Promise((resolve, reject) => {
    const localeStrings = wx.T.getLanguage()
    wx.showLoading({ title: localeStrings.isLoading })

    wx.request({
      url: server_api.getGlobalInfo,
      data: {session3rd},
      method: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      success(res) {
        //console.log('global info');
        //console.log(res);
        resolve(res.data)
      },
      fail(res) {
        console.log('Getting global info fails.', res)
      },
      complete() {
        wx.hideLoading();
      }
    });
  })
}

/**
 * 授权获取用户名和头像成功，保存用户信息（远程、本地）
 *
 * 如果 lesson_nid > 0, 则同时注册该门课程。
 */
function getUserInfo (userInfo, lesson_nid = 0) {
  return new Promise((resolve, reject) => {
    const localeStrings = wx.T.getLanguage()
    wx.showLoading({ title: localeStrings.logining })

    const session3rd = wx.getStorageSync('session3rd') || ''
    const userinfo = JSON.stringify(userInfo)

    wx.request({
      url: server_api.updateUserInfo,
      data: {
        session3rd,
        userinfo,
        lesson_nid,
      },
      method: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      success(res) {
        wx.setStorageSync('userInfo', userInfo);
        if (res.data.updateSession3rd) {
          wx.setStorageSync('session3rd', res.data.newSession3rd)
        }
        resolve(res)
      },
      fail(res) {
        reject(false)
      },
      complete() {
        wx.hideLoading()
      }
    });

  });
}


// 获取 / 设置阅读位置
// scroll_top:
//   -1       获取位置
//   其他值   设置位置
let traceReading = function (article_nid, scroll_top) {

  return new Promise(function(resolve, reject) {
    let session3rd = wx.getStorageSync('session3rd') || false
    if (session3rd) {
      const current = Math.floor(Date.now() / 1000)

      wx.request({
        url: server_api.traceReading,
        data: {
          nid: article_nid,
          session3rd: session3rd,
          scroll_top: scroll_top,
          updated: current,
        },
        method: 'GET',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: (res) => {
          resolve(res)
        },
        fail: (res) => {
          reject(res)
        }
      })
    }
    else {
      reject("No session3rd")
    }
  })
};


/**
 * Log
 */
function wysjLog (type, info)
{
  const session3rd = wx.getStorageSync('session3rd') || ''

  const info_obj = {
    info,
    session3rd,
  }

  wx.request({
    url: server_api.wysjLog,
    data: {
      app: 'en_edu',
      type: type,
      info: JSON.stringify(info_obj)
    },
    success: res => {
    },
    fail: res => {
    }
  })
}


/*
 * Enroll
 */
function enrollLesson(session3rd, lesson_nid)
{
  return new Promise((resolve, reject) =>
    {
      const localeStrings = wx.T.getLanguage()
      wx.showLoading({ title: localeStrings.enrolling })

      wx.request({
        url: server_api.enrollLesson,
        data: {session3rd, lesson_nid},
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded'},
        success(res) {
          if (res.data.msg === 'ok') {
            resolve(res.data)
          }
          else {
            reject(false)
          }
        },
        fail(res) {
          console.log('Initiate info fails.', res)
          reject(false)
        },
        complete() {
          wx.hideLoading();
        }
      });
    })
}


/*
 * Remove enroll
 */
function unenrollLesson(session3rd, lesson_nid)
{
  return new Promise((resolve, reject) =>
    {
      const localeStrings = wx.T.getLanguage()
      wx.showLoading({ title: localeStrings.removingEnroll })

      wx.request({
        url: server_api.unenrollLesson,
        data: {session3rd, lesson_nid},
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded'},
        success(res) {
          if (res.data.msg === 'ok') {
            resolve(res.data)
          }
          else {
            reject(false)
          }
        },
        fail(res) {
          console.log('Initiate info fails.', res)
          reject(false)
        },
        complete() {
          wx.hideLoading();
        }
      });
    })
}

/**
 * Lesson API.
 */
function getLessonDetails (nid) {
  return new Promise((resolve, reject) => {
      const localeStrings = wx.T.getLanguage()
      wx.showLoading({ title: localeStrings.isLoading })

      wx.request({
        url: server_api.getLessonDetails,
        data: {nid},
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded' },
        success(res) {
          resolve(res.data)
        },
        fail(res) {
          utils.showToastError()
          reject(false)
        },
        complete() {
          wx.hideLoading();
          /*
          if (isPullDown) {
            wx.stopPullDownRefresh()
          }
          */
        }
      })
    })
}

module.exports = {
  wxLoginToGetCode,
  wysjLog,
  weiyiLogin,
  initInfo,
  getGlobalInfo,
  getUserInfo,
  enrollLesson,
  getLessonDetails,
  unenrollLesson,
  traceReading,
};

