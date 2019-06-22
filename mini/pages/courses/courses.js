//const config = getApp().globalData.config

const serverAPI = require('../../server.api.js')

const utils = require('../../utils/utils.js')
import event from '../../utils/event'

// Constants
import * as CONSTS from '../../utils/constants'

const app = getApp()

Page({

  data:
  {
    localeStrings: {},
    languageCode: 'zh_hans',
    currentCategory: CONSTS.CATE_OPEN_CLASS,

    navTabs: [],
    tabTermId: [CONSTS.CATE_OPEN_CLASS, CONSTS.CATE_SMALL_CLASS],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 1,

    COUNT: 20,
    timeline: [],
    hotRecomment: [],
    hotRrecommendShow: true,
    auth: {},
    logined: true,
    rotate: '',

    courses: [],
    courses_now: [],
  },


  onLoad (options)
  {
    // Clicked shared link.
    const course_nid = options.course_nid
    console.log('course nid', course_nid)
    if (course_nid) {
      wx.navigateTo({
        url: `/pages/lesson/lesson?nid=${course_nid}`
      })
    }

    utils.setLocaleStrings(this)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI
    event.on("languageChanged", this, this.setLocaleCourses)  // Content

    this.getEntries()
  },


  /**
   * Localize course info.
   */
  setLocaleCourses (initCourses = false)
  {
    let courses = initCourses ? initCourses : this.data.courses
    const lang_code = wx.T.getLanguageCode()
    const localeCountryNames = utils.getCountryNames()
    const category = this.data.currentCategory
    let courses_now = []
    for (let ix in courses) {
      //courses[ix].title = courses[ix][title_lang]
      courses[ix].title = courses[ix]['course_title'][lang_code]
      courses[ix].author.nationality = localeCountryNames[courses[ix].author.iso2][lang_code]
      if (courses[ix].course_category == category) {
        courses_now.push(courses[ix])
      }
    }
    this.setData({
      courses,
      courses_now
    })
  },


  onShow ()
  {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }

      /* origin
    if (utils.pageReload(this.data.auth, [this.data.timeline])) {
      wx.startPullDownRefresh({})
    }
    */
  },


  onPullDownRefresh ()
  {
    this.getEntries(true)
  },


  getBannerImgList() {

    /*
    const auth = this.data.auth
    wx.request({
      url: `${config.bannerRequestUrl}/get_banner`,
      data: {
        position: 'explore',
      },
      success: (res) => {
      },
      fail: () => {
        wx.showToast({
          title: '网路开小差，请稍后再试',
          icon: 'none',
        })
      },
    })
    */
  },

  // 获取 timeline 推荐列表
  // 翻页：将最后一条的 verifyCreatedAt 赋值给 before 字段即可
  getEntryByTimeline(reload) {
    const auth = this.data.auth
    let timeline = this.data.timeline
    if (utils.isEmptyObject(timeline) || reload) {
      timeline = [{ verifyCreatedAt: '' }]
    }
    let rankIndex = (timeline.slice(-1)[0].verifyCreatedAt) || ''
    wx.request({
      url: `${config.timelineRequestUrl}/get_entry_by_timeline`,
      data: {
        src: 'web',
        uid: auth.uid || '',
        device_id: auth.clientId,
        token: auth.token,
        limit: this.data.COUNT,
        category: 'all',
        recomment: 1,
        before: rankIndex,
      },
      success: (res) => {
        let data = res.data
        if (data.s === 1) {
          wx.hideLoading()
          let list = (data.d && data.d.entrylist) || []
          console.log('list entry')
          console.log(list)
          this.setData({
            timeline: reload ? list : this.data.timeline.concat(list),
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
      complete: () => {
        wx.stopPullDownRefresh()
      },
    })
  },
  onReachBottom () {
    //this.getEntryByTimeline()
  },


  /**
   * Share message.
   */
  onShareAppMessage (res)
  {
    const lang = wx.getStorageSync('languageIndex') || 0
    const slogan = lang === 0 ? '来自全球的英语教师，带给你不一样的英语课！' : 'Find your favorate English tutors and courses!'
    return {
      title: slogan,
      path: '/pages/courses/courses?lang=' + lang
    }
  },


  /**
   * Get all courses.
   */
  getEntries (isPullDown = false)
  {
    const that = this
    wx.showLoading({ title: that.data.localeStrings.isLoading })

    wx.request({
      url: serverAPI.getCourses,
      data: {},
      success: (res) => {
        console.log('!!***resul')
        console.log(res)
        that.setLocaleCourses( res.data.courses )
        app.globalData.allCourses = res.data.courses
      },
      fail: () => {
        utils.showToastError()
      },
      complete: () => {
        wx.hideLoading();
        if (isPullDown) {
          wx.stopPullDownRefresh()
        }
      }
    })
  },


  /*
   * Goto 一个课程的详细介绍
   */
  toCourseDetail (ev)
  {
    let nid = ev.currentTarget.dataset.nid
    wx.navigateTo({
      url: `/pages/lesson/lesson?nid=${nid}`,
    })
  },


  /**
   * Navbar
   */
  tabClick (ev)
  {
    const currentCategory = ev.currentTarget.dataset.category
    const sliderOffset = ev.currentTarget.offsetLeft
    const activeIndex = ev.currentTarget.id

    this.setData({
      currentCategory,
      sliderOffset,
      activeIndex
    });

    this.setLocaleCourses()
  },


  /**
   * https://www.wangjiankai.com/2018/07/01/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9B%91%E5%90%AC%E9%A1%B5%E9%9D%A2%E6%BB%91%E5%8A%A8%E8%B7%9D%E9%A1%B6%E9%83%A8%E8%B7%9D%E7%A6%BB%EF%BC%88%E8%BF%94%E5%9B%9E%E9%A1%B6%E9%83%A8%EF%BC%89/<Paste>
   * 回到顶部功能
  fnShowToTop (ev)
  {
    let that = this
    let query = wx.createSelectorQuery()
    console.log('dddff')
    query.selectViewport().scrollOffset()
    query.exec( res => {
      console.log(res[0].scrollTop)
      let position = 'inherit'
      if (res[0].scrollTop > 0) {
        position = 'fixed'
      }
      else {

      }
      that.setData({
        position
      })
    })
  },
   */

})
