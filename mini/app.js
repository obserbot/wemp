// app.js

const server_api = require("server.api.js")
//const utils = require("utils/utils.js")
const me = require("utils/wechat_user.js")

// 多语言
// https://upupming.site/2018/07/23/mini-program-i18n/
import locales from './utils/locales'
import T from './utils/i18n'

// Constants
import * as Constants from 'utils/constants'

App({

  // options example:
  // {
  //   path: "pages/home/home",
  //   query: {
  //            lang: "0"
  //          },
  //   scene: 1007,
  //   shareTicket: "<Undefined>"
  // }
  onLaunch (options)
  {
    const that = this

    // Language
    let langIndex = 0
    if ('lang' in options.query) {
      langIndex = parseInt(options.query.lang) || 0
    }
    else {
      langIndex = wx.getStorageSync('languageIndex') || 0
    }
    T.registerLocale( locales )
    T.setLocaleByIndex( langIndex )
    T.setTabBarTitles()
    wx.T = T


      /*
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systeminfo = res
      },
    })
    */


    let session3rd = wx.getStorageSync('session3rd') || '';
    //session3rd = ''

    me.wxLoginToGetCode().then( code => {
      if (code === 'error') {
        console.log('error')
        return
      }

      // Request initial data with the CODE

      //if (session3rd.length > 20) {
        //this.globalData.myStatus = 1

        // Login, refresh session, get initial info, create a new user if necessary.
        // Loading...
        const lang_code = langIndex === 0 ? 'zh_hans' : 'en'
        wx.showLoading({ title: locales[lang_code].isLoading })

        me.initInfo(code, session3rd).then( data => {
          //that.connectSocket(session3rd)
          wx.setStorageSync('wid', data.wid)

          // Initiate global data
          that.globalData.allCourses = JSON.parse(data.all_courses)
          const lessons_json = JSON.parse(data.all_lessons)
          if (lessons_json.pstat === 'ok') {
            that.globalData.allLessons = lessons_json.lessons
          }
          that.globalData.status = 1

          if (data.uid === 689) {
            console.log('admin is you')
            wx.setStorageSync('admin', 'hu')
          }
          else {
            wx.setStorageSync('admin', 'kkkhu')
          }

          wx.hideLoading();
        }).catch( all_courses => {
          wx.hideLoading();
          wx.setStorageSync('session3rd', '')
        })
      /*
      }
      else {
        that.globalData.myStatus = 0
        that.loginWechat()
      }
      */

    }).catch( err => {
      console.log('catch', err)
    })
  },


  /**
   * 服务器登录，用 code 换取 session3rd.
   */
  loginWeiyi (code)
  {
    const that = this
    //console.log('lgin Weiyi')
    if (that.globalData.loginWeiyiCount < 50) {
      that.globalData.loginWeiyiCount += 1

      me.weiyiLogin(code).then( res => {
            wx.setStorageSync('session3rd', res.session3rd)
            wx.setStorageSync('wid', res.wid)
            that.globalData.myStatus = Constants.WEIYI_LOGIN_SUCCESS
          }).catch( res => {
            that.globalData.myStatus = Constants.WEIYI_LOGIN_ERROR
            setTimeout(() => {
              that.loginWeiyi(code)
            }, 7000)
          })
    }
    else {
      that.loginWechat() // 重新获取登录凭证
    }
  },


  /**
   * wx.login() 调用微信登录
   * 获取登录凭证 code，有效期 5 分钟
   */
  loginWechat ()
  {
    const that = this
    //console.log('lgin Wechat')

    wx.login({
      success: res => {
        if (res.code) {
          //me.wysjLog('launch', '-----------code');
          //me.wysjLog('launch', '-----------' + res.code);
          that.loginWeiyi(res.code)
        }
        else {
          // For debug. Delete for a while
          //me.wysjLog('launch', '-----------res error');
          //me.wysjLog('launch', res);
        }
      },
      fail: () => { // 网络未连接
        //me.wysjLog('launch', '----------- 22 res error');
        that.globalData.myStatus = Constants.NETWORK_ERROR
        setTimeout(() => {
          that.loginWechat()
        }, 5000)
      }
    });
  },


  // Websocket
  connectSocket(session3rd) {

    /*
    const that = this

    this.globalData.enSocket = wx.connectSocket({
      url: server_api.wssRoot + '?session=' + session3rd,
      header: { // 写与不写 header 都一样
        'content-type': 'application/json'
      },
      success: res => {
        //console.log('success websocket')
        //console.log(res)
        me.wysjLog('socket-connection-success', JSON.stringify(res))
      },
      fail: res => { // 根本不起作用
        //console.log('fails websocket')
        //console.log(res)
        me.wysjLog('socket-connection-fail', JSON.stringify(res))
      }
    })

    this.globalData.enSocket.onOpen( res => {
      console.log('opened', that.globalData.enSocket.readyState)
    })

    this.globalData.enSocket.onMessage( res => {
      //console.log('recieved 030303', that.globalData.enSocket.readyState)
      //console.log(res)

      let resObj
      try {
        resObj = JSON.parse(res.data)
      } catch (err) {
        return
      }

      if (resObj.type === 'history') {
        const pages = getCurrentPages()
        const nowPage = pages[pages.length - 1]
        if ('updateHistory' in nowPage) {
          nowPage.updateHistory(resObj.dialog)
        }
      }

      if (resObj.type === 'message_summary') {
        that.globalData.myMessageSummary = resObj.my_message_summary
      }
    })

    this.globalData.enSocket.onError( res => {
      console.log('error', res)
      console.log('opened', that.globalData.enSocket.readyState)
    })
    */
  },

  onShow ()
  {
    //me.wysjLog('launch', 'onShow')
  },

  onHide ()
  {
    //me.wysjLog('launch', 'onHide')
  },


  globalData:
  {
    status: 0,
    allCourses: [],
    allLessons: [],
    enSocket: {},
    myMessageSummary: [],
    myStatus: 0,
    loginWeiyiCount: 0,

    systeminfo: {},
    config: {}
  },

})
