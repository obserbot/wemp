// pages/daren.js

const serverAPI = require('../../server.api.js')
const utils = require('../../utils/utils.js')
import event from '../../utils/event'

const app = getApp()

Page({

  data: {
    localeStrings: {},
    darens: [],

    COUNT: 20,
    timeline: [],
    hotRecomment: [],
    hotRrecommendShow: true,
    auth: {},
    logined: true,
    rotate: '',
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
    event.on("languageChanged", this, this.setLocaleDarens)   // Content

    this.getDarens()
  },

  onShow() {

    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }
  },

  /*
  init() {
    this.setData({
      auth: {},
      rotate: '',
    })
    let auth = utils.ifLogined()
    this.setData({
      auth,
      logined: auth,
    })

    this.getBannerImgList()
    this.getEntryByTimeline(true)
    if (auth) {
      this.getEntryByHotRecomment()
    }
  },
  */

  onReachBottom () {
    //this.getEntryByTimeline()
  },

  onShareAppMessage(res) {

    return {
      title: '英语达人圈',
      path: '/pages/daren/daren'
    }
  },


  onPullDownRefresh ()
  {
    this.getDarens(true)
  },


  /**
   * Goto personal
   */
  toPersonal (ev)
  {
    let uid = ev.currentTarget.dataset.uid
    wx.navigateTo({
      url: `/pages/personal/personal?thirduid=${uid}`,
    })
  },


  getDarens(isPullDown = false) {

    const that = this
    wx.showLoading({ title: "加载中" })
    wx.request({
      url: serverAPI.getDarens,
      data: {},
      success: res => {
        //console.log('kkkkresul')
        //console.log(res)
        that.setLocaleDarens( res.data.darens )
      },
      fail: () => {
        wx.showToast({
          title: '网路开小差，请稍后再试',
          icon: 'none',
        })
      },
      complete: () => {
        wx.hideLoading();
        if (isPullDown) {
          wx.stopPullDownRefresh()
        }
      }
    })
  },

  setLocaleDarens(initDarens = false) {

    let darens = initDarens ? initDarens : this.data.darens
    const lang_code = wx.T.getLanguageCode()
    const localeCountryNames = utils.getCountryNames()
    for (let ix in darens) {
      darens[ix].nationality = localeCountryNames[ darens[ix].iso2 ][ lang_code ]
    }

    this.setData({
      darens
    })
  },
})
