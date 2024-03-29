//const config = getApp().globalData.config

const serverAPI = require('../../server.api.js')

const me = require('../../utils/wechat_user.js')
const utils = require('../../utils/utils.js')
import event from '../../utils/event'

// Constants
import * as CONSTS from '../../utils/constants'

const app = getApp()

Page({
  data: {
    localeStrings: {},
    languageCode: 'zh_hans',
    currentCategory: CONSTS.CATE_OPEN_CLASS,

    navTabs: [],
    tabTermId: [CONSTS.CATE_OPEN_CLASS, CONSTS.CATE_OPEN_CLASS, CONSTS.REAL_COURSE],
    tabId: [CONSTS.TAB_LESSONS, CONSTS.TAB_COURSES],
    tabNow: CONSTS.TAB_LESSONS,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 1,

    courses: [],
    courses_now: [],
    lessons_now: [],

    promotes: [],
  },

  onLoad (options) {
    // Clicked shared link.
    const course_nid = options.course_nid
    if (course_nid) {
      wx.navigateTo({
        url: `/pages/lesson/lesson?nid=${course_nid}`
      })
    }

    utils.setLocaleStrings(this)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI
    event.on("languageChanged", this, this.setLocaleLessons)  // Content of lessons

    /*
    let initCount = 0
    const initData = function() {
      if (app.globalData.status === 1) {
        that.setLocaleCourses( app.globalData.allCourses )
        that.setLocaleLessons()
      }
      else {
        if (initCount++ > 300) {
          console.log('long time')
        }
        else {
          setTimeout(initData, 200)
        }
      }
    }
    initData()
    */
    this.initData()
  },

  /**
   * Localize course info.
   */
  setLocaleCourses (initCourses = false) {
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

  /**
   * Localize lesson info.
   */
  setLocaleLessons () {
    /*
    const lessons = app.globalData.allLessons.filter((value, index, array) => {
      return value.promote == '1'
    })
    const lang_code = wx.T.getLanguageCode()
    const localeCountryNames = utils.getCountryNames()
    let lessons_now = []
    for (let ix in lessons) {
      lessons[ix].author.nationality = localeCountryNames[lessons[ix].author.iso2][lang_code]
      lessons_now.push(lessons[ix])
    }
    */




    // New promotes
    const promotes = app.globalData.allPromotes
    //console.log('pro', promotes)
    this.setData({
      promotes,
      //lessons_now, // To abandon
    })
  },

  onShow () {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }
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

        that.initData()
        wx.stopPullDownRefresh()
      })
      .catch (er => {
        wx.stopPullDownRefresh()
      })
  },


  onShareAppMessage (res)
  {
    const slogan = this.data.localeStrings.slogan
    const lang = wx.getStorageSync('languageIndex') || 0

    return {
      title: slogan,
      path: '/pages/home/home?lang=' + lang
    }
  },


  /**
   * Init data
   */
  initData () {
    const that = this
    let initCount = 0

    const init = function() {
      if (app.globalData.status === 1) {
        that.setLocaleLessons()
      }
      else {
        if (initCount++ > 300) {
          console.log('long time')
        }
        else {
          setTimeout(init, 200)
        }
      }
    }
    init()
  },

  /*
   * detail.
   */
  gotoDetail (ev) {
    const nid = ev.currentTarget.dataset.nid
    const type = ev.currentTarget.dataset.type
    if (type == "chapter") {
      wx.navigateTo({
        url: `/pages/chapter/chapter?nid=${nid}`,
      })
    }

    if (type == "lesson") {
      wx.navigateTo({
        url: `/pages/lesson/lesson?nid=${nid}`,
      })
    }
  },

  /*
   * Lesson detail.
   */
  toLessonDetail (ev) {
    let nid = ev.currentTarget.dataset.nid
    wx.navigateTo({
      url: `/pages/lesson/lesson?nid=${nid}`,
    })
  },

  /**
   * Navbar
   */
  tabClick (ev) {
    // Old:
    const currentCategory = ev.currentTarget.dataset.category
    const sliderOffset = ev.currentTarget.offsetLeft
    const activeIndex = ev.currentTarget.id

    this.setData({
      currentCategory,
      sliderOffset,
      activeIndex
    });

    this.setLocaleCourses()


    // New: Switch lessons/courses
    const tabNow = ev.currentTarget.dataset.which
    this.setData({
      tabNow
    });
    /*
    if (which === CONSTS.TAB_LESSONS) {
      console.log('lwons 38383')
    }
    else {
      console.log('course sffff38383')
    }
    */
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
