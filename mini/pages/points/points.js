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

    isAdmin: false,
  },

  onLoad (options) {
    // Clicked shared link.
    utils.setLocaleStrings(this)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI
    event.on("languageChanged", this, this.setLocaleLessons)  // Content of lessons

    const myPoints = app.globalData.myPoints

    this.setData({
      myPoints
    })
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
    const lessons = app.globalData.allLessons.filter((value, index, array) => {
      return value.promote == '1'
    })
    const lang_code = wx.T.getLanguageCode()
    const localeCountryNames = utils.getCountryNames()
    let lessons_now = []
    for (let ix in lessons) {
    /*
      lessons[ix].nid = lessons[ix]['nid']
      lessons[ix].title = lessons[ix]['course_title'][lang_code]
    */
      lessons[ix].author.nationality = localeCountryNames[lessons[ix].author.iso2][lang_code]
      lessons_now.push(lessons[ix])
    }

    this.setData({
      lessons_now
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

  /**
   * Share message.
   */
  onShareAppMessage (res) {
    const lang = wx.getStorageSync('languageIndex') || 0
    const slogan = lang === 0
      ? '来自全球的英语教师，带给你不一样的英语课！'
      : 'Find your favorate English tutors and courses!'
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
        //that.setLocaleCourses( app.globalData.allCourses )
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
   * Button Buy.
   */
  buyPoints () {
    me.buy().then(res => {
      console.log('buy res:', res)
    }).catch(er => {
      console.log('buy error:', er)
    })
    console.log('bubyyyy')
  },

})
