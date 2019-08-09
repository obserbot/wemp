// pages/course/course.js

const utils = require('../../utils/utils.js')
const serverAPI = require('../../server.api.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Course'
}

const app = getApp()

Page({

  data:
  {
    isLogged: false,

    localeCode: 'zh_hans',
    localeStrings: {},
    //courseId: '0',
    lessonTitle: {},
    courseTutor: {},
    courseDesc: {},
    tutorDesc: {},
    coursePrice: 0,

    switchs: {
      hasDescription: false,
      hasObjectiveMain: false,
      hasObjectiveItems: false,
    },
  },


  onLoad (options)
  {
    const lesson_nid = options.nid
    //this.getCourseDetails(course_nid) // 不要每次都重新抓取, 只有在landing pages, 才需要

    if (lesson_nid) {
      console.log('alllllll')
      console.log(app.globalData.allCourses)
      //app.globalData.allCourses = []
      let theLesson = app.globalData.allLessons.filter( item => {
        return lesson_nid == item.nid
      })
      console.log('ttt cour', theLesson)

      if (theLesson.length > 0) {
        const lang_code = wx.T.getLanguageCode()
        const localeCountryNames = utils.getCountryNames()
        //let courseId = theCourse[0].nid
        /*
        let courseTutor = theCourse[0].author
        courseTutor.nationality = localeCountryNames[ courseTutor.iso2 ][ lang_code ]
        let coursePrice = theCourse[0].price
        */

        this.setData({
          //courseId,
          lessonTitle: theLesson[0].lesson_title,
          /*
          courseNid: course_nid,
          courseDesc: {
            zh_hans: theCourse[0].desc_string_zh_hans,
            en:      theCourse[0].desc_string_en
          },
          courseObjective:      theCourse[0].objectives,
          courseObjectiveItems: theCourse[0].objectives_items,
          courseTutor,
          tutorDesc: {
            zh_hans: theCourse[0].author.desc_zh_hans,
            en:      theCourse[0].author.desc_en,
          },
          coursePrice,
          courseTime1: {
            zh_hans: theCourse[0].time1.zh_hans,
            en:      theCourse[0].time1.en,
          },
          courseTime2: {
            zh_hans: theCourse[0].time2.zh_hans,
            en:      theCourse[0].time2.en,
          },
          courseTime3: {
            zh_hans: theCourse[0].time3.zh_hans,
            en:      theCourse[0].time3.en,
          },
          groupQrUrl: theCourse[0].group_qr,
          weoa_url: theCourse[0].weoa_url,
      */
        })
      }
      //console.log('theCourse:', theCourse)
    }

    utils.setLocaleStrings(this, barTitles)
  },


  onShow ()
  {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle(barTitles)
      this.data.flagNavigationBarTitle = false
    }

    const localeCode = wx.T.getLanguageCode()

    /*
    const switchs = this.data.switchs

    // Objectives Main existing
    // "" or "objective main string"
    switchs.hasObjectiveMain = this.data.courseObjective[localeCode] ? true : false
    // Objectives Items existing
    // [] or has items array.
    if (typeof this.data.courseObjectiveItems[localeCode] !== 'undefined'
        && this.data.courseObjectiveItems[localeCode].length > 0) {
      switchs.hasObjectiveItems = true
    }

    this.setData({
      localeCode,
      switchs,
    })
    */


    this.setData({
      localeCode,
    })
  },


  onShareAppMessage (res)
  {
    const nid = this.data.courseNid
    const courseTitle = this.data.courseTitle[this.data.localeCode]

    return {
      title: courseTitle,
      path: `/pages/courses/courses?course_nid=${nid}`
    }
  },


  getCourseDetails(course_nid) {

    const that = this
    wx.showLoading({ title: "加载中" })

    wx.request({
      url: serverAPI.getCourseDetails,
      data: {
        nid: course_nid,
        //position: 'explore',
      },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: (res) => {
        console.log('COURSE***resul')
        console.log(res)
        // Todo: need to abandon
        let desc_zh_hans = res.data.course_details.tutor.desc_zh_hans
        let desc_en      = res.data.course_details.tutor.desc_en
        desc_zh_hans = desc_zh_hans ? desc_zh_hans : res.data.course_details.tutor.description
        desc_en      = desc_en      ? desc_en      : res.data.course_details.tutor.description

        const lang_code = wx.T.getLanguageCode()
        const title_lang = 'title_' + lang_code
        const localeCountryNames = utils.getCountryNames()
        //let courseTitle = res.data.course_details.title
        const courseTitle = res.data.course_details[title_lang]
        let tutorWrap = res.data.course_details.tutor
        tutorWrap.nationality = localeCountryNames[tutorWrap.iso2][lang_code]

        that.setData({
          courseTitle,
          courseTutor: tutorWrap,
          courseDesc: {
            zh_hans: res.data.course_details.desc_zh_hans,
            en: res.data.course_details.desc_en
          },
          tutorDesc: {
            'zh_hans': desc_zh_hans,
            'en': desc_en
          }
        })
      },
      fail: () => {
        wx.showToast({
          title: '网路开小差，请稍后再试',
          icon: 'none',
        })
      },
      complete: () => {
        wx.hideLoading();
      }
    })
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


  /**
   * Goto WEOA
   */
  toWEOA (ev)
  {
    const weoa_url = this.data.weoa_url
    wx.navigateTo({
      url: `/pages/weoa/weoa?weoa=${weoa_url}`,
    })
  },


  /**
   * Group qr code for the lesson.
   */
  previewImage (res)
  {
    const url = this.data.groupQrUrl
    wx.previewImage({
      urls: [url]
    });
  },

})
