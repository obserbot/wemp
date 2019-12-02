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
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const theChapter = prevPage.data.theChapter
    this.setData({
      chunk_id,
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





  //开始录音的时候
  start: function ()
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


  upload: function ()
  {
    me.uploadAudio(this.tempFilePath)
  },







})
