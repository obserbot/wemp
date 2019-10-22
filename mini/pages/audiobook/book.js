// pages/course/course.js

const utils = require('../../utils/utils.js')
const serverAPI = require('../../server.api.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Course'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

Page({
  data: {
    localeCode: 'zh_hans',
    localeStrings: {},
    courseTitle: {},
    courseTutor: {},
    courseDesc: {},
    tutorDesc: {},
    coursePrice: 0,

    switchs: {
      hasDescription: false,
      hasObjectiveItems: false,
    },
  },

  onLoad (options) {
    const audiobook_nid = options.nid

    if (audiobook_nid) {
      //console.log(app.globalData.allCourses)
      //app.globalData.allCourses = []
      const books = app.globalData.allAudiobooks.find( item => {
        return audiobook_nid == item.nid
      })

      console.log('books', books)

      if (books.nid) {
        const lang_code = wx.T.getLanguageCode()
        const localeCountryNames = utils.getCountryNames()
        //let courseId = theCourse[0].nid

        this.setData({
          theBook: books

          // todo: Remove all below.
          /*
          courseTitle: theCourse[0].course_title,
          courseNid: course_nid,
          courseDesc: {
            zh_hans: theCourse[0].desc_string_zh_hans,
            en:      theCourse[0].desc_string_en
          },
          courseObjective:      theCourse[0].objectives,
          courseObjectiveItems: theCourse[0].objectives_items,
          courseTutor,
          coursePrice,
          */
        })
      }
      //console.log('theCourse:', theCourse)
    }

    utils.setLocaleStrings(this, barTitles)
  },

  onShow () {
    const that = this
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle(barTitles)
      this.data.flagNavigationBarTitle = false
    }

    const localeCode = wx.T.getLanguageCode()

    const switchs = this.data.switchs

    /*
    this.setData({
      localeCode,
      switchs,
    })
    */

    // Mupltiple description
    const descp = this.data.theBook.desc[localeCode];
    WxParse.wxParse('course_desc', 'md', descp, that)
  },

  /*
  onShareAppMessage (res) {
    const nid = this.data.courseNid
    const courseTitle = this.data.nowCourse.title[this.data.localeCode]

    return {
      title: courseTitle,
      path: `/pages/courses/courses?course_nid=${nid}`
    }
  },
  */

  gotoChapter (ev) {
    let nid = ev.currentTarget.dataset.nid
    wx.navigateTo({
      url: `/pages/chapter/chapter?nid=${nid}`,
    })
  },

  /**
   * Group qr code for the lesson.
   */
  previewImage (res) {
    const url = this.data.groupQrUrl
    wx.previewImage({
      urls: [url]
    });
  },

})
