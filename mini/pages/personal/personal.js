// personal.js

const utils = require('../../utils/utils.js')
const wechatUser = require('../../utils/wechat_user.js')
const server_api = require('../../server.api.js')

const WxParse = require('../../wxParse/wxParse.js')

const app = getApp()

Page({

  data:
  {
    languageCode: 'zh_hans',
    localeStrings: '',

    isLogged: false,
    myInfo: {},
    isFollowing: false,
    loading_class: '',
    follower_num: 0,

    userInfo: {},
    auth: {},
    thirduid: '',
    thirdavatar: '',
    thirdname: '',
    tutorDesc: {zh_hans: '', en: ''},
    breifDesc: {zh_hans: '', en: ''},
    theTutor: {},

    courses: [],
  },


  onLoad (query)
  {
    utils.setLocaleStrings(this)

    const myInfo = wx.getStorageSync('userInfo') || false
    //  console.log('info');
    //console.log(myInfo);
    if (myInfo) {
      this.setData({
        myInfo,
        isLogged: true
      })
    }

    if (query && query.thirduid) {
      const uid = query.thirduid
      //  console.log('duidddd')
      //  console.log(uid)
      this.getDarenInfo(uid)
      //this.getMultiUser(thirduid)

      // Courses of the teacher.
      const courses = app.globalData.allCourses.filter( item => {
        return uid == item.author.uid
      })
      this.setData({
        courses
      })
      //console.log('ddd courses', courses)
    } else {
      //this.getUserInfo()
      wx.showToast({
        title: 'Error 23',
        icon: 'none',
        duration: 1500
      })
    }
  },


  onShow () {
    /*
    const localeCode = wx.T.getLanguageCode()
    this.setData({
      localeCode,
    })
    */
  },

  /**
   *
   */
  getDarenInfo (uid)
  {
    const that = this
    const session3rd = wx.getStorageSync('session3rd') || ''

    wx.showLoading({ title: that.data.localeStrings.isLoading })

    wx.request({
      url: server_api.getDarenInfo,
      data: {
        uid,
        session3rd
      },
      success: (res) => {
        wx.hideLoading()
        console.log('gggjjjkkk121212data');
        console.log(res.data)
        const thirduid = res.data.info.uid
        const thirdname = res.data.info.name
        const thirdavatar = res.data.info.avatar
        //const thirddesc = res.data.info.description || ''
        const tutorDesc = res.data.info.tutor_desc
        const briefDesc = res.data.info.brief_desc
        const follower_num = res.data.info.follow_number
        const isFollowing = res.data.info.is_following === 1 ? true : false
        const qrCode = res.data.info.qr_code
        const showQrCode = res.data.info.show_qr_code

        const theTutor = {
          nationality: utils.getCountryNames(res.data.info.iso2),
        }

        const desc_zh = res.data.info.tutor_desc['zh_hans'];
        const desc_en = res.data.info.tutor_desc['en'];
        WxParse.wxParse('tutor_desc_zh', 'md', desc_zh, that)
        WxParse.wxParse('tutor_desc_en', 'md', desc_en, that)

        that.setData({
          thirduid,
          thirdavatar,
          thirdname,
          //thirddesc,
          tutorDesc,
          briefDesc,
          isFollowing,
          follower_num,

          theTutor,
          qrCode,
          showQrCode,
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: that.data.localeStrings.networkError,
          icon: 'none',
        })
      },
    })
  },


  // 用户点击“微信登陆”按钮，回调函数
  onGotUserInfo: function(res) {
    let that = this
    let userInfo = res.detail.userInfo
    if (userInfo === undefined) { //拒绝授权
      //console.log('refuse');
    }
    else {
      wechatUser.getUserInfo(userInfo).then(res => {
        //app.globalData.myItems = res.data.items;
        console.log('items');
        //console.log(res.data.items);
        that.setData({
          //businessExists: res.data.items.length > 0 ? true : false,
          //myItems: res.data.items,
          userInfo: wx.getStorageSync('userInfo'),
          isLogged: true
        });
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none',
          duration: 1300
        })
      });
    }
  },

  toggleFollow() {
    const that = this
    const is_following = this.data.isFollowing ? 1 : 0
    const session3rd = wx.getStorageSync('session3rd') || false
    this.setData({
      loading_class: 'weui-loading'
    })

    if (session3rd) {
      wx.request({
        url: server_api.toggleFollow,
        data: {
          is_following: is_following,
          session3rd: session3rd,
          daren_uid: that.data.thirduid,
        },
        success: (res) => {
          //console.log('res');
          //console.log(res);
          if (res.data.pstat == 'ok') {
            let isFollowing = that.data.isFollowing,
                follower_num = that.data.follower_num;
            if (res.data.result == 'following') {
              isFollowing = true
              follower_num++
            }
            else {
              isFollowing = false
              follower_num--
            }
            //const isFollowing = res.data.result == 'following' ? true : false
            this.setData({
              follower_num,
              isFollowing
            })
          }
        },
        fail: (res) => {
        },
        complete: (res) => {
          this.setData({
            loading_class: ''
          })
        }
      })
    }

  },

  gotoCourse (ev) {
    let nid = ev.currentTarget.dataset.nid
    wx.navigateTo({
      url: `/pages/course/course?nid=${nid}`,
    })
  },

  // 对话
  goDialog() {
    wx.navigateTo({
      url: '/pages/dialog/dialog?uid=' + this.data.thirduid + '&avatar=' + this.data.thirdavatar
    })
  },

  /**
   * Share message.
   */
  onShareAppMessage (res) {
    const lang = wx.getStorageSync('languageIndex') || 0
    const slogan = this.data.briefDesc[ this.data.languageCode ]
    const uid = this.data.thirduid
    return {
      title: slogan,
      path: `/pages/daren/daren?thirduid=${uid}`
    }
  },

  previewImage (res) {
    wx.previewImage({
      urls: [this.data.qrCode]
    });
  },

})
