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
  onLaunch (options) {
    const that = this

    // Todo: Language resolvation order:
    //
    // 1. url argument 'lang'
    // 2. local storage 'languageCode'
    // 3. setting in server for existing users
    // 4. WeChat language
    // 5. default 'zh_CN'

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
     * 全局数据更新逻辑：
     * 1. app.js 请求并保存全局数据。
     * 2. 具体页面查询全局数据。如数据为空，可能是异步请求暂未返回，定时多次查询。
     *    2.1 查询到全局数据，则正常显示。
     *    2.2 多次查询不到，则显示错误信息。
     * 3. 具体页面更新数据（下拉更新、重进入更新、其他更新），页面更新后，更新全局数据。
     *
     * Todo：设置本地数据缓存机制，避免频繁请求。
     */

    const session3rd = wx.getStorageSync('session3rd') || '';

    // Log system info
    /*
    wx.getSystemInfo({
      success: res => {
        //that.globalData.systeminfo = res
      },
    })
    */

    me.wxLoginToGetCode().then(code => {
      if (code === 'error') {
        console.log('error')
        return
      }

      // Request initial data with the CODE

      //if (session3rd.length > 20) {
        //this.globalData.myStatus = 1

        // Login, refresh session, get initial info, create a new user if necessary.
        // Loading...
        me.initInfo(code, session3rd).then(data => {
          // data.enroll_nids: ["123", "234"]
          //that.connectSocket(session3rd)
          wx.setStorageSync('wid', data.wid)
          wx.setStorageSync('session3rd', data.session3rd)

          // Initiate global data
          //console.log('COURSES', JSON.parse(data.all_courses))
          that.globalData.allCourses = JSON.parse(data.all_courses)
          that.globalData.allEnroll = data.enroll_nids
          that.globalData.myUid = data.uid // Number
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
        }).catch( all_courses => {
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
      // Todo: Repeat requiring several times.
      // Todo: Check network connecting.
      console.log('Fail to get code', err)
    })
  },

  /**
   * 服务器登录，用 code 换取 session3rd.
   */
  loginWeiyi (code) {
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
  loginWechat () {
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
  connectSocket (session3rd) {

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
    allEnroll: [],
    enSocket: {},
    myMessageSummary: [],
    myStatus: 0,
    loginWeiyiCount: 0,
  },
})
