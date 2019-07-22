// pages/lesson/lesson.js

const utils = require('../../utils/utils.js')
const serverAPI = require('../../server.api.js')

const app = getApp()

Page({

  data:
  {
    localeCode: 'zh_hans',
    localeStrings: {},
    //courseId: '0',
    courseTitle: '',
    courseTutor: {},
    courseDesc: {},
    tutorDesc: {},
    coursePrice: 0,

    switchs: {
      hasDescription: false,
      hasObjectiveMain: false,
      hasObjectiveItems: false,
    },

    kkk: '<view>iiiikkk</view>',
    messages: [],
  },


  onLoad (options)
  {
    const that = this
    console.log('lssonsonsons', options.nid)
    const lesson = app.globalData.allLessons.filter( item => {
      return options.nid == item.nid
    })

    console.log('iii', lesson)
    const messages = lesson[0].messages
    for (let ix in messages) {
      if (messages[ix].type === 'audio') {
        console.log('iiiaudo---------')
        messages[ix].media = wx.createInnerAudioContext()
        messages[ix].media.src = messages[ix].src
        messages[ix].media.onEnded(that.soundStop)
      }
    }
    this.setData({
      messages
    })

    /*
    const day_id = options.dayid
    if (day_id) {
      this.getLessonDetails(day_id)
    }
    */
  },


  onShow ()
  {

    const switchs = this.data.switchs

    // Objectives Main existing
    // "" or "objective main string"
    // Objectives Items existing
    // [] or has items array.


  },


  /*
  onShareAppMessage(res) {
    return {
      title: '英语课程',
      path: '/pages/home/home'
    }
  },
  */


  /**
   * Get lesson content.
   */
  getLessonDetails (day_id)
  {
    const that = this
    wx.showLoading({ title: "正在加载" })

    wx.request({
      url: serverAPI.getLesson + '/' + day_id,
      success: res => {
        console.log('COURSE***resul')
        console.log(res)
        const messages = []
        const lessons = res.data.day[0].lessons
        let audio
        let length

        for (let i in lessons) {
          if (lessons[i].image) {
            messages.push({
              type: 'image',
              src: 'https://weiyishijie.com/french/storage/' + lessons[i].image,
            })
          }
          if (lessons[i].body) {
            messages.push({
              type: 'text',
              text: lessons[i].body,
            })
          }

          audio = JSON.parse(lessons[i].audio)
          //console.log('audio', audio)
          //console.log('audio', audio[0])
          //console.log('audio', audio.length)
          if (audio.length > 0) {
            length = messages.push({
              type: 'audio',
              paused: 'paused',
              media: wx.createInnerAudioContext(),
              src: 'https://weiyishijie.com/french/storage/' + audio[0].download_link
            })
            messages[length - 1].media.src = messages[length - 1].src
            messages[length - 1].media.onEnded(that.soundStop)
            /*
              function(i) {
                  console.log('skkkoude stop here')
                  //let lesson = this.data.lesson
                  const messages = that.data.messages
                  messages[i].paused = 'paused'
                  //lesson[index].paused = 'paused'
                  that.setData({
                    messages
                  })
                }(length - 1);
                */

          }
        }

        that.setData({
          messages
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
   * Callback onStop.
   */
  soundStop ()
  {
    console.log('7778888soude stop here')
    let index = 3
    //let lesson = this.data.lesson
    const messages = this.data.messages
    for (let i in messages) {
      if (messages[i].type === 'audio') {
        messages[i].paused = 'paused'
        messages[i].running2 = ''
        messages[i].running3 = ''
      }
    }
    //messages[index].paused = 'paused'
    //lesson[index].paused = 'paused'
    this.setData({
      messages
    })
    /*
    */
  },


  /**
   * Play / Pause
   */
  switchPlaying (ev)
  {
    let index = ev.currentTarget.dataset.index
    console.log('index', index)
    const messages = this.data.messages
    if (messages[index].paused == 'paused') {
      console.log('1111')
      messages[index].paused = ''
      messages[index].running2 = 'running2'
      messages[index].running3 = 'running3'
      messages[index].media.play()
      //this.sound.play()
    }
    else {
      console.log('22222')
      messages[index].paused = 'paused'
      messages[index].media.pause()
      //this.sound.pause()
    }

    this.setData({
      messages
    })
  }

})
