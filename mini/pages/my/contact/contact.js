// contact.js

const utils = require('../../../utils/utils.js')
const serverAPI = require('../../../server.api.js')

Page({

  data: {

    localeStrings: '',
  },


  onLoad ()
  {
    utils.setLocaleStrings(this)

    //console.log('onLoad');
    // Scroll to bottom
    /*
    wx.createSelectorQuery().select("#page-wrap").boundingClientRect(function(rect) {
      wx.pageScrollTo({
        scrollTop: rect.bottom + 5000
      })
    }).exec()
    */
  },


  /**
   * Submit feedback.
   */
  submitForm (ev)
  {
    let content = ev.detail.value.myfeedback.trim()
    if (content.length === 0) {
      wx.showToast({
        title: this.data.localeStrings.emptyFeedbackError,
        icon: 'none',
        druation: 1500
      })
      return
    }

    const that = this
    const session3rd = wx.getStorageSync('session3rd') || ''
    wx.showLoading({ title: this.data.localeStrings.isSubmitting })

    wx.request({
      url: serverAPI.putFeedback,
      data: {content, session3rd},
      success: res => {
        console.log('||||***resul')
        console.log('feedback response:',res)
        //that.setLocaleCourses( res.data.courses )
      },
      fail: () => {
        utils.showToastError()
      },
      complete: () => {
        wx.hideLoading();
        /*
        if (isPullDown) {
          wx.stopPullDownRefresh()
        }
        */
      }
    })


    console.log('get it')
  },

})

