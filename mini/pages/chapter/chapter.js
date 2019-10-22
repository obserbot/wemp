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

  onLoad (options) {
    const that = this
    if ( ! options.hasOwnProperty('nid')) {
      console.log('Error')
      return;
    }

    const nid = options.nid // string
    me.getChapterDetails(nid).then(data => {
      console.log('UUU8882wiii', data)
      if (data.msg === 'ok') {
        WxParse.wxParse('content_text', 'md', data.content, that, 5)

        const theAudio = that.data.theAudio
        theAudio.play = ''
        theAudio.pause = false
        theAudio.media = wx.createInnerAudioContext()
        theAudio.media.src = "https://weiyishijie.com/en_edu/audiobooks/" + data.book_nid + "/" + data.mp3
        /*
        that.theAudio.media.onEnded(that.soundStop)
        that.theAudio.media.onCanplay(that.canPlay)
        */

        const chapterTitle = data.chapter_title
        const chapterDesc = data.descp
        const bookTitle = data.book_title

        that.setData({
          bookTitle,
          chapterTitle,
          chapterDesc,
          theAudio,
        })
      }
      /*
      const enrolledUsers = data.enroll_users

      const localeCountryNames = utils.getCountryNames()
      const userInfo = wx.getStorageSync('userInfo')
      const isLogged = userInfo ? true : false

      const my_uid = app.globalData.myUid ? app.globalData.myUid.toString() : 0
      const myinfoArr = enrolledUsers.filter((value, index, array) => {
        return value.uid === my_uid;
      })

      const isEnrolled = myinfoArr.length > 0
      const enableEnroll = data.enable_enroll === 1
      */

      const lang_code = wx.T.getLanguageCode()

      // New from postgresql
      const pg_lesson_id = data.pg_lesson_id
      if (pg_lesson_id) {
        me.pgLesson(pg_lesson_id).then( data => {
          const paras = JSON.parse(data.Lesson)
          const index_mp3s = []
          const texts = []
          let isShow = true
          let showPointer = 0

          for (let iy  in paras) {
            //console.log('INDEX: ', iy)
            //console.log(paras[iy])
            if (paras[iy].type === 2) { // mp3
              paras[iy].play = ''
              paras[iy].pause = false
              paras[iy].src = "https://weiyishijie.com/en_edu/wmmc/" + paras[iy].content
              index_mp3s.push(iy)

              if (isShow) {
                isShow = false
                showPointer = iy
              }
            } else if (paras[iy].type === 1) { // text
              paras[iy].wxparse_index = texts.length
              texts.push(paras[iy].content)
            }
          }

          // Trigger mp3 downloading
          if (index_mp3s.length > 0) {
            paras[index_mp3s[0]].media = wx.createInnerAudioContext()
            paras[index_mp3s[0]].media.src = paras[index_mp3s[0]].src
            paras[index_mp3s[0]].media.onEnded(that.soundStop)
            paras[index_mp3s[0]].media.onCanplay(that.canPlay)
          }
          that.index_mp3s = index_mp3s

          // Convert markdown
          if (texts.length > 0) {
            for (let iz=0; iz<texts.length; iz++) {
              WxParse.wxParse('paratext' + iz, 'md', texts[iz], that)
              if (iz === texts.length - 1) {
                WxParse.wxParseTemArray('textParaArray', 'paratext', texts.length, that)
              }
            }
          }

          const isLoading = showPointer < paras.length

          that.setData({
            paras,
            showPointer,
            isLoading,
          })
        }).catch(err => {
          console.log('dddaaaddd', err)
          //utils.showToastError()
        });
      }

      that.setData({
        lessonNid: nid,
      })

      // Mupltiple description
      const descp = that.data.chapterDesc[lang_code][0];
      WxParse.wxParse('chapter_desc', 'md', descp, that)
    }).catch(er => {
      console.log('error', er)
    })
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
