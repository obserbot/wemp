// weoa.js

Page({

  data:
  {
    url: ''
  },


  onLoad (options)
  {
    const url = options.weoa
    this.setData({ url })
  },
})
