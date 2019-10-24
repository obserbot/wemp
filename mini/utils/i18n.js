// utils/i18n.js

let T = {
  locale: null, // 'zh_hans', 'en'
  locales: {},
  langCode: ['zh_hans', 'en']
}


T.registerLocale = locales =>
{
  T.locales = locales;
}


T.setLocale = code =>
{
  T.locale = code;
}


T.setLocaleByIndex = index =>
{
  T.setLocale(T.langCode[index]);
}


T.getLanguage = () =>
{
  return T.locales[T.locale];
}


T.getLanguageCode = () =>
{
  return T.locale
}


T.setNavigationBarTitle = (navigationBarTitles = false) =>
{
  if (!navigationBarTitles) {
    navigationBarTitles = {
      zh_hans: '微移英语',
      en: 'Weiyi English'
    }
  }
  const lang_code = T.getLanguageCode()
  wx.setNavigationBarTitle({
    title: navigationBarTitles[lang_code]
  })
}


T.setTabBarTitles = () =>
{
  const titles = [
    {
      zh_hans: '首页',
      en: 'Home'
    },
    {
      zh_hans: '教师',
      en: 'Tutors'
    },
    {
      zh_hans: '课程',
      en: 'Courses'
    },
    {
      zh_hans: '我的',
      en: 'My'
    }
  ]

  const lang_code = T.getLanguageCode()
  for(let i in titles) {
    wx.setTabBarItem({
      'index': parseInt(i),
      'text': titles[i][lang_code]
    })
  }
}


export default T
