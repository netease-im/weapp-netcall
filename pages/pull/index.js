const app = getApp()
Page({
  data: {
    pulling: false,
    livePlayerContext: {},
    src: '', //	音视频地址。目前仅支持 flv, rtmp 格式
    mode: 'live', // live（直播），RTC（实时通话）
    autoplay: false, 
    muted: false, 
    orientation: 'vertical', // 画面方向，可选值有 vertical，horizontal
    objectFit: 'contain', // 填充模式，可选值有 contain，fillCrop
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
    this.createContext();
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
      title: '直播播放',
      path: 'pages/pull/index',
      imageUrl: '/res/img/share.png'
    }
  },
  createContext: function () {
    this.setData({
      livePlayerContext: wx.createLivePlayerContext('livePlayer')
    })
  },
  inputSrc: function (e) {
    this.checkUrl(e.detail.value)
    this.setData({
      src: e.detail.value
    })
    this.createContext();
  },
  scanQRCode: function () {
    var that = this
    that.data.livePlayerContext.stop()
    wx.scanCode({
      success: function(res) {
        console.log(res)
        if (res.scanType === 'QR_CODE' && res.errMsg === 'scanCode:ok') {
          that.createContext();
          that.setData({
            src: res.result
          })
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
    if (/^(rtmp|RTMP):\/\/[\w\/\.?&_=-]+$/.test(str) || /^(http|HTTP|https|HTTPS):\/\/[\w\/\.&_=-]+\.flv[\w\/\.=?&_-]*$/.test(str)) {
      return true
    }
    wx.showToast({
      image: '/res/img/err_icon.png',
      title: '不可用的地址'
    })
    return false
  },
  play: function () {
    if (!this.checkUrl(this.data.src)) {
      return
    }
    var that = this
    this.data.livePlayerContext.play({
      success: function (res) {
        that.setData({
          pulling: true
        })
      },
      fail: function (res) {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '播放失败'
        })
      }
    })
    that.setData({
      pulling: true
    })
  },
  stop: function () {
    var that = this
    this.data.livePlayerContext.stop({
      success: function (res) {
        that.setData({
          pulling: false
        })
      },
      fail: function (res) {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '操作失败'
        })
      }
    })
  },
  pause: function () {
    var that = this
    this.data.livePlayerContext.pause({
      success: function (res) {
        that.setData({
          pulling: false
        })
      },
      fail: function (res) {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '操作失败'
        })
      }
    })
  },
  resume: function () {
    var that = this
    this.data.livePlayerContext.resume({
      success: function (res) {
        that.setData({
          pulling: true
        })
      },
      fail: function (res) {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '操作失败'
        })
      }
    })
  },
  switchMuted() {
    this.setData({
      muted: !this.data.muted
    })
  },
  switchOrientation() {
    this.setData({
      orientation: this.data.orientation === 'vertical' ?  'horizontal' : 'vertical'
    })
  },
  swicthObjectFit() {
    this.setData({
      objectFit: this.data.objectFit === 'contain' ?  'fillCrop' : 'contain'
    })
  },
  statechange(e) {
    if ([2006, 3005].indexOf(+e.detail.code) !== -1) {
      this.stop()
      setTimeout(function () {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '主播停止推流' + e.detail.code
        })
      }, 800)
    }
    if ([-2301, 3001, 3002, 3003].indexOf(+e.detail.code) !== -1) {
      this.stop()
      setTimeout(function () {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '播放失败' + e.detail.code 
        })
      }, 800)
    }
  },
  fullscreenchange(e) {
    console.log('fullscreenchange: ', e.detail)
  },
  netstatus(e) {
    console.log('live-player info:', e.detail.info)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
    wx.showToast({
      image: '/res/img/err_icon.png',
      title: '播放失败'
    })
  }
})
