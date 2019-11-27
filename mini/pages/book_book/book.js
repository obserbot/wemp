// pages/course/course.js

const utils = require('../../utils/utils.js')
const serverAPI = require('../../server.api.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '微移英语',
  en: 'BOOK'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()


Page({

  data:
  {
    languageCode: 'zh_hans',
    localeStrings: {},
    courseTitle: {},
    courseTutor: {},
    courseDesc: {},
    tutorDesc: {},
    coursePrice: 0,
  },


  onLoad (options)
  {
    utils.setLocaleStrings(this)
    utils.setLocaleStrings(this, barTitles)

    const book_id = options.bid
    if (book_id) {
      me.getShelf(book_id)
        .then(data => {
          //console.log('uuuddd:', data)
          const theBook = data
          this.setData({
            theBook,
          })

          const chapter_id = options.chapter_id
          if (chapter_id) {
            wx.navigateTo({
              url: `/pages/book_chapter/chapter?cid=${chapter_id}`,
            })
          }
        })
        .catch (er => {
          console.log('network error 12')
        })
    }
  },


  onShow ()
  {
    const that = this
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle(barTitles)
      this.data.flagNavigationBarTitle = false
    }

    //const localeCode = wx.T.getLanguageCode()


    // Mupltiple description
    //const descp = this.data.theBook.desc[localeCode];
    //WxParse.wxParse('course_desc', 'md', descp, that)

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
