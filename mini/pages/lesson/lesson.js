// pages/course/course.js

const utils = require('../../utils/utils.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Course'
}

const app = getApp()

Page({

  data:
  {
    isLogged: false,
    isEnrolled: false,
    lessonNid: 0,

    enrolledUsers: [],
    enrollNum: 0,

    localeCode: 'zh_hans',
    localeStrings: {},
    //courseId: '0',
    lessonTitle: {},
    lessonTutor: {},
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
    const that = this
    if ( ! options.hasOwnProperty('nid')) {
      console.log('Error')
      return;
    }

    const nid = options.nid // string
    me.getLessonDetails(nid).then( data =>
      {
        console.log('ddaata', data)
        const enrolledUsers = data.enroll_users

        const lang_code = wx.T.getLanguageCode()
        const localeCountryNames = utils.getCountryNames()
        const userInfo = wx.getStorageSync('userInfo')
        const isLogged = userInfo ? true : false
        const isEnrolled = app.globalData.allEnroll.includes(nid)
        console.log('ll', lang_code)
        console.log(data.lesson_title)

        that.setData({
          enrolledUsers,
          lessonTutor: data.author,
          lessonTitle: data.lesson_title,
          lessonDesc: {
            zh_hans: data.desc.zh_hans,
            en:      data.desc.en
          },
          time1: data.time1,
          time2: data.time2,
          time3: data.time3,
        })
      })

        /*
        courseTutor.nationality = localeCountryNames[ courseTutor.iso2 ][ lang_code ]
        let coursePrice = theCourse[0].price
        */

          /*
        this.setData({
          userInfo,
          isLogged,
          isEnrolled,
          lessonNid: nid,
          lessonTutor,
          lessonTitle: theLesson.lesson_title,
          lessonTime3: {
            zh_hans: theLesson.time3.zh_hans,
            en:      theLesson.time3.en,
          },
          courseNid: course_nid,
          courseObjective:      theCourse[0].objectives,
          courseObjectiveItems: theCourse[0].objectives_items,
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
          groupQrUrl: theCourse[0].group_qr,
          weoa_url: theCourse[0].weoa_url,
        })
      */
      //console.log('theCourse:', theCourse)

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
    const nid = this.data.lessonNid
    //const nid = this.data.courseNid
    const courseTitle = this.data.courseTitle[this.data.localeCode]

    return {
      title: courseTitle,
      path: `/pages/courses/courses?course_nid=${nid}`
    }
  },


  /*
   * 用户点击“注册上课”按钮（实际是登录按钮），回调函数，获取登录用户信息，并注册上课（如果尚未注册）。
   */
  onGotUserInfo (res)
  {
    const that = this
    const userInfo = res.detail.userInfo
    if (userInfo === undefined) { //拒绝授权
      // res.detail: errMsg:"getUserInfo:fail auth deny"
    }
    else {
      me.getUserInfo(userInfo, that.data.lessonNid).then(res => {
        that.setData({
          userInfo,
          isEnrolled: true,
          isLogged: true
        });
      }).catch((err) => {
        utils.showToastError()
      });
    }
  },


  /**
   * 用户点击“注册上课”按钮。
   */
  onEnroll ()
  {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || false
    const nid = this.data.lessonNid
    console.log('ennnroooo', s3rd)
    if (s3rd) {
      me.enrollLesson(s3rd, nid).then( res =>
        {
          const enrollNum = that.data.enrollNum + 1
          const index = app.globalData.allEnroll.indexOf( nid )
          if (index == -1) {
            app.globalData.allEnroll.push(nid)
          }

          that.setData({
            enrollNum,
            isEnrolled: true,
          })
        })
    }
    else {
      utils.showToastError()
    }
  },


  /**
   * 用户点击“取消注册”按钮。
   */
  removeEnroll ()
  {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || false
    const nid = this.data.lessonNid
    if (s3rd) {
      me.unenrollLesson(s3rd, nid).then( res =>
        {
          let enrollNum = that.data.enrollNum - 1
          const index = app.globalData.allEnroll.indexOf( nid )
          if (index > -1) {
            app.globalData.allEnroll.splice(index, 1)
          }

          that.setData({
            enrollNum,
            isEnrolled: false,
          })
        })
    }
    else {
      utils.showToastError()
    }
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


  /*
  onPullDownRefresh ()
  {
    wx.stopPullDownRefresh()
    // Todo: get new data from server!
    //this.initData()
    //this.getEntries(true)
  },
  */


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
