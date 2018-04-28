import drawQrcode from '../../utils/weapp.qrcode.esm.js'

Page({
  data: {
    hlsUrl: '',
    rtmpUrl: '',
  },
  onLoad: function (option) {
    this.getUrl(option)
  },
  onShareAppMessage: function () {
    return {
      title: '直播播放',
      path: 'pages/pullQRCode/index?hls=' + encodeURIComponent(this.data.hlsUrl) + '&rtmp=' + encodeURIComponent(this.data.rtmpUrl),
      imageUrl: '/res/img/share.png'
    }
  },
  getUrl: function (option) {
    var that = this
    if (!option) {
      wx.showToast({
        image: '/res/img/err_icon.png',
        title: '获取地址失败'
      })
      return
    }
    if (option.rtmp) {
      that.setData({
        rtmpUrl: decodeURIComponent(option.rtmp)
      })
      drawQrcode({
        width: 160,
        height: 160,
        canvasId: 'rtmpUrl',
        text: this.data.rtmpUrl
      })
    } else {
      wx.showToast({
        image: '/res/img/err_icon.png',
        title: '获取地址失败'
      })
    }
    if (option.hls) {
      that.setData({
        hlsUrl: decodeURIComponent(option.hls)
      })
      drawQrcode({
        width: 160,
        height: 160,
        canvasId: 'hlsUrl',
        text: this.data.hlsUrl
      })
    } else {
      wx.showToast({
        image: '/res/img/err_icon.png',
        title: '获取地址失败'
      })
    }
  },
})
