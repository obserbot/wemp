// pages/daren.js

const serverAPI = require('../../server.api.js')
const utils = require('../../utils/utils.js')
const me = require('../../utils/wechat_user.js')
import event from '../../utils/event'

const app = getApp()

Page({
  data: {
    navTabs: [],
    sliderOffset: 0,

    localeStrings: {},

    shelfbooks: [],
  },


  onLoad (options)
  {
    // Clicked shared link.
    const uid = options.thirduid
    if (uid) {
      wx.navigateTo({
        url: `/pages/personal/personal?thirduid=${uid}`
      })
    }

    utils.setLocaleStrings(this)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI
    //event.on("languageChanged", this, this.setLocaleDarens)   // Content

    me.getShelf()
      .then(data => {
        console.log('ddd:fff:kk', data)
        const shelfbooks = data
        this.setData({
          shelfbooks,
        })
      })
      .catch (er => {
      })
  },


  onShow () {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }
  },


  /*
  onShareAppMessage (res)
  {
    return {
      title: '微移英语',
      path: '/pages/daren/daren'
    }
  },
  */

  /*
  onPullDownRefresh () {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || '';
    me.getGlobalInfo(s3rd)
      .then (data => {
        const allCourses = JSON.parse(data.all_courses)
        app.globalData.allCourses = allCourses
        app.globalData.status = 1
        that.setData({ allCourses })
        wx.stopPullDownRefresh()
      })
      .catch (er => {
        wx.stopPullDownRefresh()
      })
  },
  */

  gotoBook (ev)
  {
    const bid = ev.currentTarget.dataset.bid
    wx.navigateTo({
      url: `/pages/book_book/book?bid=${bid}`,
    })
  },

})
