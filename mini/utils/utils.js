// utils/utils.js

let formatDate = (nDate, date) => {
  if (isNaN(nDate.getTime())) {
    // 不是时间格式
    return '--'
  }
  let o = {
    'M+': nDate.getMonth() + 1,
    'd+': nDate.getDate(),
    'h+': nDate.getHours(),
    'm+': nDate.getMinutes(),
    's+': nDate.getSeconds(),
    // 季度
    'q+': Math.floor((nDate.getMonth() + 3) / 3),
    'S': nDate.getMilliseconds()
  }
  if (/(y+)/.test(date)) {
    date = date.replace(RegExp.$1, (nDate.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(date)) {
      date = date.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return date
}

let isValidMobile = (phone) => {
  let telReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[135678]|18[0-9]|14[579])[0-9]{8}$/
  if (telReg.test(phone.replace(/\s+/g, ''))) {
    return true
  }
  return false
}

let isEmptyObject = (obj) => {
  for (let i in obj) {
    return false
  }
  return true
}

let ifLogined = () => {
  let auth = wx.getStorageSync('auth') || {}
  if (auth.token && auth.uid) {
    return auth
  }
  return false
}

// 页面重新加载情形：
// 1、切换账号（包括登录、退出登录）;
// 2、当前页面数据为空（可能是第一次进入该页面，或前 N 次进入该页面但是没有刷出来数据，这时候有必要重新加载）;
let pageReload = (scopeAuth, dataList) => {
  let auth = ifLogined()
  let dataEmpty = (list) => {
    let empty = false
    let item = null
    for (let i = 0, len = list.length; i < len; i++) {
      item = list[i]
      if (isEmptyObject(item)) {
        empty = true
        break
      }
    }
    return empty
  }
  if ((auth.token !== scopeAuth.token || auth.uid !== scopeAuth.uid) || dataEmpty(dataList)) {
    return true
  }
}

// 比较版本号：left > right 1, left < right -1, left == right 0
// 用途：旧版本不执行写入、删除 日历操作
let cmpVersion = (left, right) => {
  if (typeof left + typeof right !== 'stringstring') {
    return false
  }
  let a = left.split('.')
  let b = right.split('.')
  let i = 0
  let len = Math.max(a.length, b.length)
  for (; i < len; i++) {
    if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
      return 1
    } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
      return -1
    }
  }
  return 0
}

var GetUrlRelativePath = function (url) {
  var arrUrl = url.split('//');
  var start = arrUrl[1].indexOf('/') + 1;
  var relUrl = arrUrl[1].substring(start);
  if (relUrl.indexOf('?') != -1) {
    relUrl = relUrl.split('?')[0];
  }
  return relUrl;
}


/**
 * 毫秒转换友好的显示格式
 * 输出格式：21小时28分钟15秒
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
function timeToDate(time)
{
    // 获取当前时间戳
    var currentTime = parseInt(new Date().getTime()/1000);
    var diffTime     = currentTime-time;
    var second         = 0;
    var minute         = 0;
    var hour         = 0;
    if (null != diffTime && "" != diffTime) {
        if (diffTime > 60 && diffTime < 60 * 60) {
            diffTime = parseInt(diffTime / 60.0) + "分钟" + parseInt((parseFloat(diffTime / 60.0) - parseInt(diffTime / 60.0)) * 60) + "秒";
        }
        else if (diffTime >= 60 * 60 && diffTime < 60 * 60 * 24) {
            diffTime = parseInt(diffTime / 3600.0) + "小时" + parseInt((parseFloat(diffTime / 3600.0) -
                parseInt(diffTime / 3600.0)) * 60) + "分钟" +
                parseInt((parseFloat((parseFloat(diffTime / 3600.0) - parseInt(diffTime / 3600.0)) * 60) -
                parseInt((parseFloat(diffTime / 3600.0) - parseInt(diffTime / 3600.0)) * 60)) * 60) + "秒";
        }
        else {
            //超过1天
            var date = new Date(parseInt(time) * 1000);
            diffTime = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
            //diffTime = parseInt(diffTime) + "秒";
        }
    }
    return diffTime;
}

/**
 * 设置头部导航栏标题，有两种情况：
 *
 * @param _this !== undefine 第一次打开
 *        _this === undefine 语言已经改变
 *
 */
function setLocaleStrings (_this = false, barTitles = false)
{
  const that = _this ? _this : this
  const languageCode = wx.T.getLanguageCode()
  const localeStrings = wx.T.getLanguage()

  that.setData({
    languageCode,
    localeStrings,
  })

  that.data.flagNavigationBarTitle = _this ? false : true

  if (!barTitles) {
    barTitles = {
      zh_hans: '微移英语',
      en: 'Weiyi English'
    }
  }
  wx.setNavigationBarTitle({
    title: barTitles[languageCode]
  })
}


/**
 * Get country names.
 */
function getCountryNames (iso2 = false)
{
  const localeCountryNames = {
      GB: {
        zh_hans: '英国',
        en: 'UK',
      },
      PL: {
        zh_hans: '波兰',
        en: 'Poland',
      },
      PH: {
        zh_hans: '菲律宾',
        en: 'Philippines',
      },
      UA: {
        zh_hans: '乌克兰',
        en: 'Ukraine',
      },
      US: {
        zh_hans: '美国',
        en: 'US',
      },
      CN: {
        zh_hans: '中国',
        en: 'China',
      },
      IT: {
        zh_hans: '意大利',
        en: 'Italy',
      },
      JM: {
        zh_hans: '牙买加',
        en: 'Jamaica',
      },
      MY: {
        zh_hans: '马来西亚',
        en: 'Malaysia',
      },
      FR: {
        zh_hans: '法国',
        en: 'France',
      },
      IN: {
        zh_hans: '印度',
        en: 'India',
      },
      CA: {
        zh_hans: '加拿大',
        en: 'Canada',
      },
      NZ: {
        zh_hans: '新西兰',
        en: 'New Zealand',
      },
      ZA: {
        zh_hans: '南非',
        en: 'South Africa',
      },
      TW: {
        zh_hans: '台湾',
        en: 'Taiwan',
      },
    }

  if (iso2 && localeCountryNames[iso2]) {
    return localeCountryNames[iso2]
  }
  else {
    return localeCountryNames
  }
}


/**
 * wx.showToast() for network error.
 */
function showToastError (error = 'networkError', duration = 1500)
{
  const localeStrings = wx.T.getLanguage()
  wx.showToast({
    title: localeStrings[error],
    icon: 'none',
    duration,
  })
}


/**
 * Generate random string.
 */
function generateRandom (len = 12)
{
  let text = ""
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i=0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}


module.exports = {
  setLocaleStrings,
  getCountryNames,
  showToastError,
  generateRandom,

  formatDate,
  isValidMobile,
  isEmptyObject,
  ifLogined,
  pageReload,
  cmpVersion,
  timeToDate,
}
