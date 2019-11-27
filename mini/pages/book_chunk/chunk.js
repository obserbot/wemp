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
//音频组件控制
const innerAudioContext = wx.createInnerAudioContext()
var tempFilePath;






Page({

  data:
  {
    localeStrings: {},
    languageCode: 'zh_hans',

    theChunk: {},
  },


  onLoad (options)
  {
    utils.setLocaleStrings(this)
    utils.setLocaleStrings(this, barTitles)
    event.on("languageChanged", this, utils.setLocaleStrings) // UI

    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const theChapter = prevPage.data.theChapter

    const ckid = options.ckid
    if (ckid) {
      const theChunk = theChapter.infojson.chunks[ckid]
      this.setData({
        theChunk,
      })
    }
    console.log('the chat:', theChapter)
  },


  onShow ()
  {
    if (this.data.flagNavigationBarTitle) {
      wx.T.setNavigationBarTitle()
      this.data.flagNavigationBarTitle = false
    }
  },







  //开始录音的时候
  start: function ()
  {
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
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const { tempFilePath } = res
    })
  },
  //播放声音
  play: function () {
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

  },

  upload: function ()
  {
    me.uploadAudio(this.tempFilePath)
  /*
  */
  },







})
