//const config = getApp().globalData.config

const serverAPI = require('../../server.api.js')

const me = require('../../utils/wechat_user.js')
const utils = require('../../utils/utils.js')
import event from '../../utils/event'

// Constants
import * as CONSTS from '../../utils/constants'

const app = getApp()

const barTitles = {
  zh_hans: '朗读',
  en: 'Read it'
}


//录音管理
const recorderManager = wx.getRecorderManager()
var tempFilePath;


Page({

  data:
  {
    myuid: '',
    isLogged: false,
    localeStrings: {},
    languageCode: 'zh_hans',

    chunk_id: 0,
    theChapter: {},
  },


  onLoad (options)
  {
    utils.setLocaleStrings(this)
    utils.setLocaleStrings(this, barTitles)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI

    const chunk_id = options.ckid
    const chunk_id_real = options.chunkid
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const theChapter = prevPage.data.theChapter

    const userInfo = wx.getStorageSync('userInfo') || false
    const isLogged = userInfo ? true : false

    const myuid = app.globalData.myUid

    this.setData({
      myuid,
      isLogged,
      chunk_id,
      chunk_id_real,
      theChapter,
    })
  },


  onShow ()
  {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }
  },


  onUnload () {
    this.stopAllRead()
  },


  /**
   * Play / Pause
   */
  switchPlaying (ev)
  {
    const that = this
    const ichunk = this.data.chunk_id
    const ichunk_real = this.data.chunk_id_real
    const iread = ev.currentTarget.dataset.iread

    const theChapter = this.data.theChapter
    const theRead = theChapter.chunks[ichunk_real][iread]
    console.log('theread', theRead)
    //const theRead = theChapter.infojson.chunks[ichunk].reads[iread]

    const root = 'https://weiyien.com/shelf/';
    if ( ! theRead['audio_url']) { // First play
      theRead['audio_url'] = root + theChapter.shelf_id + '/' + theChapter.chapter_id + '/' + ichunk_real + '/reads/' + theRead['filename']
    }

    if (theRead.isPlaying) {
      that.stopAllRead()
      return
    }

    that.stopAllRead()

    if (theRead.media) {
      theRead.media.onEnded(that.voiceStop)
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
    const chunks_info = theChapter.infojson.chunks
    for (let iz in chunks_info) {
      chunks_info[iz].nowchunk = ''
    }

    const chunks = theChapter.chunks
    for (let ix in chunks) {
      for (let iy in chunks[ix]) {
        if (chunks[ix][iy].media) {
            chunks[ix][iy].media.stop()
            chunks[ix][iy].isPlaying = false
            //chunks[ix].reads[iy].media.stop()
            //chunks[ix].reads[iy].isPlaying = false
        }
      }
    }

    /*
    const theChapter = this.data.theChapter
    const chunks = theChapter.chunks
    for (let ix in chunks) {
      chunks[ix].nowchunk = ''
      for (let iy in chunks[ix].reads) {
        if (chunks[ix].reads[iy].media) {
          chunks[ix].reads[iy].media.stop()
          chunks[ix].reads[iy].isPlaying = false
        }
      }
    }
    */

    this.setData({
      theChapter,
    })
  },


  voiceStop ()
  {
    this.stopAllRead()
  },





  //开始录音的时候
  audioStart: function ()
  {
    this.stopAllRead()

    const options = {
      duration: 90000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },


  //暂停录音
  pause: function () {
    recorderManager.onPause();
    console.log('暂停录音')
  },
  //停止录音
  stop: function () {
    this.stopAllRead()

    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const { tempFilePath } = res
    })
  },


  //播放声音
  play ()
  {
    this.stopAllRead()

    const audio = wx.createInnerAudioContext()
    audio.autoplay = true
    audio.src = this.tempFilePath
    audio.onPlay(() => {
      console.log('开始播放')
    })
    audio.onError(res => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },


  audioUpload ()
  {
    if ( ! this.tempFilePath) {
      utils.showToastError('noVoice')
      return
    }

    const that = this
    const theChapter = this.data.theChapter
    const chunk_id = this.data.theChapter.infojson.chunks[this.data.chunk_id].id
    const myuid = app.globalData.myUid
    const info = wx.getStorageSync('userInfo')
    const nickname = info.nickname
    const avatar = info.avatarUrl
    me.uploadAudio(
      this.tempFilePath,
      theChapter.shelf_id,
      theChapter.chapter_id,
      chunk_id,
      myuid,
      nickname,
      avatar,
    )
      .then( data => {
        me.getChapter(theChapter.chapter_id)
          .then(data => {
            console.log('88uuuddd:', data)
            const theChapter_new = data
            that.setData({
              theChapter: theChapter_new,
            })
          })
          .catch (er => {
            console.log('Error 82')
          })
      })
      .catch( res => {
      })
  },


  deleteAudio (ev)
  {
    const that = this
    const iread = ev.currentTarget.dataset.iread
    const theChapter = this.data.theChapter
    const book_id = theChapter.shelf_id
    const chapter_id = theChapter.chapter_id
    const chunk_id = this.data.theChapter.infojson.chunks[this.data.chunk_id].id
    const myuid = app.globalData.myUid
    const filename = theChapter.chunks[chunk_id][iread].filename
    console.log('cunk_id', chunk_id)
    console.log('read_id', iread)
    console.log('myuid', myuid)
    console.log('filename', filename)

    me.deleteAudio(book_id, chapter_id, chunk_id, myuid, filename)
      .then(res => {
        console.log('delete success')
        me.getChapter(chapter_id)
          .then(data => {
            const theChapter_new = data
            that.setData({
              theChapter: theChapter_new,
            })
          })
          .catch (er => {
            console.log('Error 82')
          })
      })
      .catch(er => {
        console.log('delete error', er)
      })
  },


  /*
   * 用户点击“开始录音”按钮（实际是登录按钮），回调函数，获取登录用户信息，并开始录音。
   */
  onGotUserInfo (res)
  {
    const that = this
    const userInfo = res.detail.userInfo
    if (userInfo === undefined) { //拒绝授权
      // res.detail: errMsg:"getUserInfo:fail auth deny"
    } else {
      me.getUserInfo(userInfo).then(res => {
        const my_uid = res.data.uid
        const enrolledUsers = that.data.enrolledUsers
        /*
        enrolledUsers.push({
          uid: my_uid,
          avatar_url: userInfo.avatarUrl,
        })
        */

        that.setData({
          userInfo,
          isLogged: true
        });
      }).catch(err => {
        utils.showToastError()
      });
    }
  },






})
