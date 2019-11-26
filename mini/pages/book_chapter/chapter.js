// pages/course/course.js

const utils = require('../../utils/utils.js')
const me = require('../../utils/wechat_user.js')

const barTitles = {
  zh_hans: '微移英语',
  en: 'Weiyi English'
}

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

let chapter_id = 0

let longTap = 0 // 0 not
                // 1 long tap
                // 2 tap (follows the long tap in a same action)


Page({

  data:
  {
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
        console.log('Error 82')
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

    longTap = 0
  },


  onUnload () {
    this.stopAllRead()
  },


  onShareAppMessage (res)
  {
    const shelf_id = this.data.theChapter.shelf_id
    const chapter_id = this.data.theChapter.chapter_id
    const brief = this.data.theChapter.infojson.brief
    const languageCode = this.data.languageCode

    return {
      title: brief[languageCode],
      path: `/pages/book_shelf/shelf?shelf_id=${shelf_id}&chapter_id=${chapter_id}`
    }
  },


  chunkLongTap (ev)
  {
    longTap = 1
  },


  gotoChunk (ev)
  {
    const ckid = ev.currentTarget.dataset.ckid
    if (ckid && this.data.theChapter.switch === 'on') {
      if (longTap === 0) {
        wx.navigateTo({
          url: `/pages/book_chunk/chunk?ckid=${ckid}`,
        })
      }
      else if (longTap === 1) {
        longTap = 2
      }
      else if (longTap === 2) {
        longTap = 0
      }
    }
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
  switchPlaying (ev)
  {
    const that = this
    const ichunk = ev.currentTarget.dataset.ichunk
    const iread = ev.currentTarget.dataset.iread

    const theChapter = this.data.theChapter
    const theRead = theChapter.infojson.chunks[ichunk].reads[iread]
    if ( ! (theRead && theRead['audio_url'])) {
      console.log('Error 35')
      return
    }

    if (theRead.isPlaying) {
      that.stopAllRead()
      return
    }

    that.stopAllRead()

    if (theRead.media) {
    }
    else {
      theRead.media = wx.createInnerAudioContext()
      theRead.media.src = theRead['audio_url']
      theRead.media.onEnded(that.voiceStop)
      //theRead.media.onCanplay( function() {that.voiceCanPlay(ichunk, iread)})
    }
    theRead.media.play()
    theRead.isPlaying = true

    theChapter.infojson.chunks[ichunk].nowchunk = 'nowchunk'

    this.setData({
      theChapter,
    })
  },


  stopAllRead ()
  {
    const theChapter = this.data.theChapter
    const chunks = theChapter.infojson.chunks
    for (let ix in chunks) {
      chunks[ix].nowchunk = ''
      for (let iy in chunks[ix].reads) {
        if (chunks[ix].reads[iy].media) {
          chunks[ix].reads[iy].media.stop()
          chunks[ix].reads[iy].isPlaying = false
        }
      }
    }

    this.setData({
      theChapter,
    })
  },


  voiceStop ()
  {
    this.stopAllRead()
  },


  voiceCanPlay (ichunk, iread)
  {
    const theRead = this.data.theChapter.infojson.chunks[ichunk].reads[iread]
    theRead.media.play()
  },

})
