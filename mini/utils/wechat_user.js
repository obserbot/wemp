// utils/wechat_user.js

const server_api = require('../server.api.js')
const utils = require('../utils/utils.js')


/**
 * wx.login() 调用微信登录
 * 获取登录凭证 code，有效期 5 分钟
 */
function wxLoginToGetCode ()
{
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
        reject('3')
      },

      fail() {
        reject('2')
      }
    })

  })
}


/**
 * Try login up to 3 times.
 */
function weiyiLogin (code)
{
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
function initInfo(code, session3rd)
{
  //const that = this;

  return new Promise((resolve, reject) => {

    wx.request({
      url: server_api.getUserDetails,
      data: {code, session3rd},
      method: 'POST',
      header: {'content-type': 'application/x-www-form-urlencoded'},
      success(res) {
        //console.log('huhu init  resss');
        //console.log(res);
        resolve(res.data)
      },
      fail(res) {
        console.log('Initiate info fails.', res)
      }
    });
  })
}


/**
 * 授权获取用户名和头像成功，保存用户信息（远程、本地）
 */
function getUserInfo (userInfo)
{
  return new Promise(function (resolve, reject) {

    wx.setStorageSync('userInfo', userInfo);
    wx.showLoading({
      title: '登录中'
    });

    const session3rd = wx.getStorageSync('session3rd') || ''
    const userinfo = JSON.stringify(userInfo);
    if (userInfo !== undefined) {
      wx.request({
        url: server_api.updateUserInfo,
        data: {
          session3rd,
          userinfo,
        },
        method: 'POST',
        header: {'content-type': 'application/x-www-form-urlencoded'},
        success: res => {
          wx.hideLoading()
          if (res.data.updateSession3rd) {
            wx.setStorageSync('session3rd', res.data.newSession3rd)
          }
          resolve(res)
        },
        fail: res => {
          wx.hideLoading()
          reject(false)
        }
      });
    }
    else {
      wx.hideLoading();
      reject(false);
    }

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


module.exports = {
  wxLoginToGetCode,
  wysjLog,
  weiyiLogin,
  initInfo,
  getUserInfo,
  traceReading,
};


