const app = getApp()
Page({
  data: {
    playing: false,
    fullScreen: false,
    videoContext: {},
    src: '',
    playSrc: ''
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  // 生命周期函数--监听页面卸载
  onUnload: function () {
    this.stop()
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },
  onShareAppMessage: function () {
    return {
      title: '点播播放',
      path: 'pages/video/index',
      imageUrl: '/res/img/share.png'
    }
  },
  createContext: function() {
    this.setData({
      videoContext: wx.createVideoContext('video')
    })
  },
  inputSrc: function (e) {
    if (this.checkUrl(e.detail.value)) {
      this.setData({
        playSrc: e.detail.value
      })
      this.createContext();
    } else {
      this.setData({
        playSrc: ''
      })
    }
    this.setData({
      src: e.detail.value
    })
  },
  tip: function () {
    if (this.data.src === '') {
      wx.showToast({
        icon: 'none',
        title: '请获取地址'
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '请确认地址'
      })
    }
  },
  getSrc: function () {
    var that = this
    that.stop()
    wx.showLoading({ title: '请求中', mask: true })
    wx.request({
      method: 'POST',
      url: 'https://app.netease.im/appdemo/weApp/vodUrl',
      success: function (res) {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          that.createContext();              
          that.setData({
            playSrc: res.data.data,
            src: res.data.data
          })
          wx.showToast({
            title: '获取地址成功'
          })
        } else {
          wx.showToast({
            image: '/res/img/err_icon.png',
            title: '获取地址失败'
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '获取地址出错'
        })
      }
    })
  },
  scanQRCode: function () {
    var that = this
    this.stop()
    wx.scanCode({
      success: function (res) {
        if (res.scanType === 'QR_CODE' && res.errMsg === 'scanCode:ok') {
          that.createContext();
          that.setData({
            src: res.result
          })
          if (that.checkUrl(res.result)) {
            that.setData({
              playSrc: res.result
            })
          } else {
            that.setData({
              playSrc: ''
            })
          }
        } else {
          wx.showToast({
            image: '/res/img/err_icon.png',
            title: '获取地址失败'
          })
        }
      }
    })
  },
  checkUrl: function (str) {
    if (/^(http|HTTP|https|HTTPS):\/\/[\w\/\.=?&_=-]+(\.mp4)[\w\/\.=?&_=-]*$/.test(str)) {
      return true
    }
    wx.showToast({
      image: '/res/img/err_icon.png',
      title: '不支持的地址'
    })
    return false
  },
  play: function () {
    if (this.checkUrl(this.data.playSrc)) {
      this.setData({
        playing: true
      })
    } else {
      this.data.videoContext.stop()
    }
  },
  pause: function () {
    this.setData({
      playing: false
    })
  },
  ended: function () {
    this.setData({
      playing: false
    })
    var that = this
    setTimeout(function () {
      that.data.videoContext.exitFullScreen()
    }, 500)
  },
  stop: function() {
    if (this.data.videoContext && this.data.videoContext.stop) {
      this.setData({
        playing: false,
        fullScreen: 'vertical',
      }) 
      this.data.videoContext.stop();
    }
  },
  fullscreenchange: function (e) {
    this.setData({
      fullScreen: e.detail.fullScreen
    })
    wx.showToast({
      icon: 'none',
      title: this.data.fullScreen ? '全屏' : '退出全屏',
    })
  },
  error: function (e) {
    console.error('error: ', e)
    this.stop()
    wx.showToast({
      image: '/res/img/err_icon.png',
      title: '播放失败'
    })
  },
})
