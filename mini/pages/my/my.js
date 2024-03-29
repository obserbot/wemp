// my.js

const utils = require('../../utils/utils.js')
const config = getApp().globalData.config

const serverAPI = require('../../server.api.js')
const me = require('../../utils/wechat_user.js')
const enedu_message = require('../../utils/enedu_message.js')
const app = getApp()

import event from '../../utils/event.js'

Page({
  data: {
    localeStrings: '',
    languages: ['简体中文', 'English'],
    langIndex: 0,

    isLogged: false,
    last_reading_list: [],
    wid: 0,
    myPoints: 0,
    message_summary: [],

    userInfo: {},
    userNotificationNum: 0,
    auth: {},
  },

  onLoad () {
    utils.setLocaleStrings(this)

    const wid = wx.getStorageSync('wid', 0)
    const message_summary = app.globalData.myMessageSummary
    const langIndex = wx.getStorageSync('languageIndex') || 0
    this.setData({
      langIndex,
      wid,
      message_summary
    })
  },

  onShow () {
    const userInfo = wx.getStorageSync('userInfo') || false
    const myPoints = app.globalData.myPoints
    if (userInfo) {
      this.setData({
        userInfo,
        myPoints,
        isLogged: true
      })
    }

    const list = wx.getStorageSync('last_reading_list') || []
    const last_reading_list = list.map(function(item) {
      item['updated_string'] = utils.timeToDate(item['updated'])
      return item
    })

    this.setData({ last_reading_list })
  },

  onPullDownRefresh () {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || '';
    me.getGlobalInfo(s3rd)
      .then (data => {
        app.globalData.allCourses = JSON.parse(data.all_courses)
        const lessons_json = JSON.parse(data.all_lessons)
        if (lessons_json.pstat === 'ok') {
          app.globalData.allLessons = lessons_json.lessons
        }
        app.globalData.status = 1

        // Points
        if (that.data.isLogged) {
          const myPoints = data.points
          app.globalData.myPoints = myPoints
          that.setData({
            myPoints,
          })
        }

        //that.initData()
        wx.stopPullDownRefresh()
      })
      .catch (er => {
        wx.stopPullDownRefresh()
      })
  },

  // 消息中心消息条数
  userNotificationNum() {
    const auth = this.data.auth
    wx.request({
      url: `${config.notifyRequestUrl}/getUserNotificationNum`,
      data: {
        src: 'web',
        uid: auth.uid,
        token: auth.token,
      },
      success: (res) => {
        let data = res.data
        if (data.s === 1) {
          this.setData({
            userNotificationNum: data.d && data.d.notification_num,
          })
        } else {
          wx.showToast({
            title: data.m.toString(),
            icon: 'none',
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网路开小差，请稍后再试',
          icon: 'none',
        })
      },
    })
  },

  /*
   * 用户点击“登陆”按钮，回调函数
   */
  onGotUserInfo (res) {
    let that = this
    let userInfo = res.detail.userInfo
    if (userInfo === undefined) { //拒绝授权
      //console.log('refuse');
    }
    else {
      me.getUserInfo(userInfo).then(res => {
        //app.globalData.myItems = res.data.items;
        //console.log('items');
        //console.log(res.data.items);
        const myPoints = app.globalData.myPoints
        that.setData({
          //businessExists: res.data.items.length > 0 ? true : false,
          //myItems: res.data.items,
          myPoints,
          userInfo: wx.getStorageSync('userInfo'),
          isLogged: true
        });
      }).catch((err) => {
        utils.showToastError()
      });
    }
  },

  navigateItem (ev) {
    wx.navigateTo({
      url: ev.currentTarget.dataset.url,
    })
  },

  /**
   * Goto Points.
   */
  gotoPoints (ev) {
    wx.navigateTo({
      url: '../points/points'
    })
  },

  /**
   * Goto Feedback.
   */
  gotoFeedback (ev) {
    wx.navigateTo({
      url: './contact/contact'
    })
  },

  /**
   * Change language.
   */
  changeLanguage (ev) {
    let langIndex = parseInt(ev.detail.value)
    //console.log('index')
    //console.log(langIndex)
    this.setData({
      langIndex
    })
    wx.T.setLocaleByIndex( langIndex )
    utils.setLocaleStrings(this)
    event.emit('languageChanged')

    wx.T.setTabBarTitles()

    wx.setStorageSync('languageIndex', this.data.langIndex)
  },
})
