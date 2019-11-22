// pages/course/course.js

const utils = require('../../utils/utils.js')
const serverAPI = require('../../server.api.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Course'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

let book_id = 0

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


  onLoad (options)
  {
    book_id = options.bid
    const audiobook_nid = options.bid



    utils.setLocaleStrings(this, barTitles)
  },


  onShow ()
  {
    const that = this
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle(barTitles)
      this.data.flagNavigationBarTitle = false
    }

    const localeCode = wx.T.getLanguageCode()

    const switchs = this.data.switchs

    // Mupltiple description
    //const descp = this.data.theBook.desc[localeCode];
    //WxParse.wxParse('course_desc', 'md', descp, that)

    me.getShelf(book_id)
      .then(data => {
        console.log('uuuddd:', data)
        const theBook = data
        this.setData({
          theBook,
        })
      })
      .catch (er => {
      })
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


  gotoChapter (ev)
  {
    let cid = ev.currentTarget.dataset.cid
    wx.navigateTo({
      url: `/pages/book_chapter/chapter?cid=${cid}`,
    })
  },


  /**
   * Group qr code for the lesson.
  previewImage (res) {
    const url = this.data.groupQrUrl
    wx.previewImage({
      urls: [url]
    });
  },
   */

})
