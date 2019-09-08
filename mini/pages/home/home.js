//const config = getApp().globalData.config

const serverAPI = require('../../server.api.js')

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


    const admin = wx.getStorageSync('admin', 'iiii')
    if (admin === 'hu') {
      this.setData({ isAdmin: true })
    }
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
    const lessons = app.globalData.allLessons
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
    wx.stopPullDownRefresh()
    // Todo: get new data from server!
    //this.initData()
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
      path: '/pages/list/list?lang=' + lang
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


  /*
   * xia dan
   */
  xiadan ()
  {
    console.log('xxxx')
    wx.request({
      url: 'https://weiyishijie.com/en_edu/api/v1/payment',
      data:{
        id: 'app.globalData.openid',//获取用户 openid
        fee:100 //商品价格
      },
      header: {'Content-Type': 'application/x-www-form-urlencoded'},
      method: 'POST',
      success: function (res) {
        console.log(res.data);
        console.log('调起支付');
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': 'MD5',
          'paySign': res.data.paySign,
          'success': function (res) {
            console.log('success');
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 3000
            });
          },
          'fail': function (res) {
            console.log(res);
          },
          'complete': function (res) {
            console.log('complete');
          }
        });
      },
      fail: function (res) {
        console.log(res.data)
      }
    });
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
