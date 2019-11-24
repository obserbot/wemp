// pages/course/course.js

const utils = require('../../utils/utils.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '课程',
  en: 'Lesson'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

let chapter_id = 0

Page({

  data: {
    isLogged: false,
    isEnrolled: false,
    lessonNid: 0,

    enrolledUsers: [],

    paras: [],
    isLoading: false,
    showPointer: 0,

    modalEnrollHidden: true,
    modalRemoveEnrollHidden: true,
    modalLackPointsHidden: true,

    localeCode: 'zh_hans',
    localeStrings: {},

    switchs: {
      hasDescription: false,
      hasObjectiveMain: false,
      hasObjectiveItems: false,
    },

    bookTitle: {},
    chapterTitle: {},
    chapterDesc: {},
    theAudio: {},
  },

  index_mp3s: [],
  loadAudioPoint: 0,
  audioPageNum: 2,  // 一次加载多少条语音
  audioPagePointer: 1, // 本次加载条数指针



    /*
    const inn = wx.createInnerAudioContext()
    inn.autoplay = true
    inn.src = "https://weiyishijie.com/en_edu/audiobooks/alice-in-wonderland/al01.mp3"
    inn.onPlay(() => {
      console.log('kkkkshile')
    })
    */


  onLoad (options)
  {
    if ( ! options.hasOwnProperty('cid')) {
      console.log('Error 81')
      return;
    }

    const that = this
    chapter_id = options.cid


    utils.setLocaleStrings(this)
    utils.setLocaleStrings(this, barTitles)

    me.getChapter(chapter_id)
      .then(data => {
        console.log('77uuuddd:', data)
        const theChapter = data
        this.setData({
          theChapter,
        })
      })
      .catch (er => {
      })
  },


  onShow ()
  {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle(barTitles)
      this.data.flagNavigationBarTitle = false
    }

    /*
    const localeCode = wx.T.getLanguageCode()
    this.setData({
      localeCode,
    })
    */

  },


  onUnload () {
    this.data.theAudio.media.stop()
  },

  /*
  onShareAppMessage (res) {
    const nid = this.data.lessonNid
    const title = this.data.localeStrings.lesson

    return {
      title: title,
      path: `/pages/lesson/lesson?nid=${nid}`
    }
  },
  */

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
    if (myPoints >= 5) {
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


  gotoChunk (ev)
  {
    const ckid = ev.currentTarget.dataset.ckid
    wx.navigateTo({
      url: `/pages/book_chunk/chunk?ckid=${ckid}`,
    })
  },


  /**
   * 用户点击“注册上课”确认按钮。
   */
  onEnroll () {
    const that = this
    const s3rd = wx.getStorageSync('session3rd') || false
    const userInfo = wx.getStorageSync('userInfo') || false;
    const nid = this.data.lessonNid
    if (s3rd && userInfo) {
      me.enrollLesson(s3rd, nid).then(data => {
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

        app.globalData.myPoints = data.points

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
   * Remove enrollment modal.
   */
  modalRemoveEnroll () {
    this.setData({
      modalRemoveEnrollHidden: false,
    })
  },

  /**
   * 用户点击“取消注册”的确定按钮。
   */
  modalRemoveEnrollConfirm () {
    this.setData({
      modalRemoveEnrollHidden: true,
    })

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
   * Remove enrollment modal.
   */
  modalRemoveEnrollCancel () {
    this.setData({
      modalRemoveEnrollHidden: true,
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

  /**
   * Callback onStop.
   */
  soundStop () {
    const paras = this.data.paras
    for (let i in paras) {
      if (paras[i].type === 2 && paras[i].media) {
        paras[i].play = ''
        paras[i].pause = false
        paras[i].media.stop()
      }
    }

    this.setData({
      paras,
    })
  },

  canPlay () {
    const index_mp3s = this.index_mp3s
    const count = this.loadAudioPoint + 1 // 下一条音频位置
    const paras = this.data.paras

    if (this.audioPagePointer > this.audioPageNum) {
      this.audioPagePointer = 1
      return
    }
    this.audioPagePointer += 1

    // 显示本条语音，以及至下一条语言之前的全部文本
    let isLoading = false
    let showPointer = this.data.showPointer
    if (count < index_mp3s.length) { // 加载下一条
      isLoading = true
      showPointer = parseInt(index_mp3s[count])

      paras[showPointer].media = wx.createInnerAudioContext()
      paras[showPointer].media.src = paras[showPointer].src
      paras[showPointer].media.onEnded(this.soundStop)
      paras[showPointer].media.onCanplay(this.canPlay)
    } else {
      showPointer = paras.length
    }
    this.loadAudioPoint = count

    this.setData({
      paras,
      showPointer,
      isLoading,
    })
  },

  /**
   * Play / Pause
   */
  switchPlaying (ev) {
    //const bookPieces = this.data.bookPieces
    const theAudio = this.data.theAudio
    if (theAudio.play == 'voicePlay') {
      theAudio.play = ''
      theAudio.pause = true
      theAudio.media.pause()
    }
    else {
      theAudio.play = 'voicePlay'
      theAudio.pause = false
      theAudio.media.play()
    }

    this.setData({
      theAudio
    })
  },

})
