// pages/course/course.js

const utils = require('../../utils/utils.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Lesson'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

Page({
  data: {
    isLogged: false,
    isEnrolled: false,
    lessonNid: 0,

    enrolledUsers: [],

    modalEnrollHidden: true,
    modalRemoveEnrollHidden: true,
    modalLackPointsHidden: true,

    localeCode: 'zh_hans',
    localeStrings: {},
    lessonTitle: {},
    lessonTutor: {},
    tutorDesc: {},
    coursePrice: 0,

    switchs: {
      hasDescription: false,
      hasObjectiveMain: false,
      hasObjectiveItems: false,
    },
  },

  onLoad (options) {
    const that = this
    if ( ! options.hasOwnProperty('nid')) {
      console.log('Error')
      return;
    }

    const nid = options.nid // string
    me.getLessonDetails(nid).then( data => {
      const enrolledUsers = data.enroll_users

      const lang_code = wx.T.getLanguageCode()
      const localeCountryNames = utils.getCountryNames()
      const userInfo = wx.getStorageSync('userInfo')
      const isLogged = userInfo ? true : false

      const my_uid = app.globalData.myUid.toString()
      const myinfoArr = enrolledUsers.filter((value, index, array) => {
        return value.uid === my_uid;
      })

      const isEnrolled = myinfoArr.length > 0

      that.setData({
        lessonNid: nid,
        isLogged,
        isEnrolled,
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

      // Mupltiple description
      const descp = that.data.lessonDesc[lang_code][0];
      WxParse.wxParse('lesson_desc', 'md', descp, that)
    })

        /*
        courseTutor.nationality = localeCountryNames[ courseTutor.iso2 ][ lang_code ]
        let coursePrice = theCourse[0].price
        */

          /*
        this.setData({
          userInfo,
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

  onShow () {
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

  onShareAppMessage (res) {
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
  onGotUserInfo (res) {
    const that = this
    const userInfo = res.detail.userInfo
    if (userInfo === undefined) { //拒绝授权
      // res.detail: errMsg:"getUserInfo:fail auth deny"
    } else {
      me.getUserInfo(userInfo, that.data.lessonNid).then(res => {
        const my_uid = res.data.uid
        const enrolledUsers = that.data.enrolledUsers
        enrolledUsers.push({
          uid: my_uid,
          avatar_url: userInfo.avatarUrl,
        })

        that.setData({
          enrolledUsers,
          userInfo,
          isEnrolled: true,
          isLogged: true
        });
      }).catch(err => {
        utils.showToastError()
      });
    }
  },

  /**
   * Show modal Enroll.
   */
  onModalEnroll () {
    const myPoints = app.globalData.myPoints
    if (myPoints > 25) {
      this.setData({
        modalEnrollHidden: false,
      })
    } else {
      this.setData({
        modalLackPointsHidden: false,
      })
    }
  },

  /**
   * Cancel enroll.
   */
  modalEnrollCancel () {
    this.setData({
      modalEnrollHidden: true,
    })
  },

  /**
   * Confirm enroll
   */
  modalEnrollConfirm () {
    this.onEnroll()
    this.setData({
      modalEnrollHidden: true,
    })
  },

  /**
   * Cancel enroll.
   */
  modalLackPointsCancel () {
    this.setData({
      modalLackPointsHidden: true,
    })
  },

  /**
   * Contact service for points.
   */
  modalContactService () {
    // Todo: log
    this.setData({
      modalLackPointsHidden: true,
    })

    wx.navigateTo({
      url: '/pages/my/contact/contact'
    })
  },

  /**
   * 用户点击“注册上课”按钮。
   */
  onEnroll () {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || false
    const userInfo = wx.getStorageSync('userInfo') || false;
    const nid = this.data.lessonNid
    if (s3rd && userInfo) {
      me.enrollLesson(s3rd, nid).then(res => {
        /*
        const index = app.globalData.allEnroll.indexOf( nid )
          if (index == -1) {
            app.globalData.allEnroll.push(nid)
          }
          */

        const my_uid = app.globalData.myUid.toString()
        const enrolledUsers = that.data.enrolledUsers
        enrolledUsers.push({
          uid: my_uid.toString(),
          avatar_url: userInfo.avatarUrl,
        })

        that.setData({
          enrolledUsers,
          isEnrolled: true,
        })
      })
    } else {
      utils.showToastError()
    }
  },

  /**
   * 用户点击“取消注册”按钮。
   */
  removeEnroll () {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || false
    const nid = this.data.lessonNid
    if (s3rd) {
      me.unenrollLesson(s3rd, nid).then(res => {
        const my_uid = app.globalData.myUid.toString()
        const enrolledUsers = that.data.enrolledUsers.filter((value, index, array) => {
          return value.uid !== my_uid;
        })

        that.setData({
          isEnrolled: false,
          enrolledUsers,
        })
      }).catch(err => {
        utils.showToastError()
      })
    } else {
      utils.showToastError()
    }
  },

  /**
   * Goto personal
   */
  toPersonal (ev) {
    let uid = ev.currentTarget.dataset.uid
    wx.navigateTo({
      url: `/pages/personal/personal?thirduid=${uid}`,
    })
  },

  /**
   * Goto WEOA
   */
  toWEOA (ev) {
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
  previewImage (res) {
    const url = this.data.groupQrUrl
    wx.previewImage({
      urls: [url]
    });
  },

})
