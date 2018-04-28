const app = getApp()
Page({
  data: {
    pushing: false, 
    isServerAutoUrl: false, // 是否是来自服务器的链接
    showModeMenu: false,
    rearCamera: false, // 后置摄像头
    livePusherContext: {},
    url: '', // 目前仅支持 flv, rtmp 格式
    enableCamera: true, // 摄像头开关
    beauty: 0, 
    whiteness: 0,
    mode: 'HD', //清晰度 SD（标清）, HD（高清）, FHD（超清）, RTC（实时通话）
    orientation: 'vertical', // 竖屏	vertical，horizontal
    muted: false,
    hlsUrl: '',
    rtmpUrl: ''
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
    this.getUserLimits()
    this.createContext();
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })   
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    var that = this
    if (that.data.pushing) {
      that.data.livePusherContext.stop()
      setTimeout(function () {
        that.data.livePusherContext.start()
      }, 100)
    }
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
      title: '直播推流',
      path: 'pages/push/index',
      imageUrl: '/res/img/share.png'
    }
  },
  createContext: function () {
    this.setData({
      livePusherContext: wx.createLivePusherContext('videoPush')
    })
  },
  // 获取用户授权
  getUserLimits: function () {
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: function () {},
            fail: function () {
              wx.showToast({
                image: '/res/img/err_icon.png',
                title: '相机授权失败'
              })
            }
          })
        }
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: function () {},
            fail: function () {
              wx.showToast({
                image: '/res/img/err_icon.png',
                title: '录音授权失败'
              })
            }
          })
        }
      },
      fail: function () {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '授权失败'
        })
      }
    })
  },
  pullQRCode: function () {
    if (!this.data.isServerAutoUrl) {
      wx.showToast({
        image: '/res/img/err_icon.png',
        title: '不支持扫码'
      })
      return
    }
    var that = this
    if (!that.recordJumpToQRCode) {
      that.recordJumpToQRCode = setTimeout(function () {
        that.recordJumpToQRCode = ''
      }, 1000)
      wx.navigateTo({
        url: '/pages/pullQRCode/index?hls=' + encodeURIComponent(that.data.hlsUrl) + '&rtmp=' + encodeURIComponent(that.data.rtmpUrl)
      })
    }
  },
  inputPushUrl: function (e) {
    this.checkUrl(e.detail.value)
    if (e.detail.value !== this.data.url) {
      this.setData({
        url: e.detail.value,
        isServerAutoUrl: false
      })
    }
  },
  getPushUrl: function () {
    var that = this
    wx.showLoading({ title: '请求中', mask: true })
    wx.request({
      method: 'POST',
      url: 'https://app.netease.im/appdemo/weApp/popLive',
      success: function  (res) {
        wx.hideLoading()
        if (res.data && res.data.code === 200) {
          that.setData({
            url: res.data.data.pushUrl,
            hlsUrl: res.data.data.hlsPullUrl,
            rtmpUrl: res.data.data.rtmpPullUrl,
            isServerAutoUrl: true
          })
          wx.showToast({
            title: '获取地址成功'
          })
        } else {
          wx.showToast({
            image: '/res/img/err_icon.png',
            title: '无可用的地址'
          })
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '获取地址失败'
        })
      }
    })
  },
  // 扫描完成填充地址栏
  scanQRCode: function () {
    var that = this
    that.stop()
    wx.scanCode({
      success: function (res) {
        console.log(res)
        if (res.scanType === 'QR_CODE' && res.errMsg === 'scanCode:ok') {
          that.setData({
            url: res.result,
            isServerAutoUrl: false
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
    if (/^(rtmp|RTMP):\/\/[\w\/\.=?&_=-]+$/.test(str)) {
      return true
    }
    wx.showToast({
      image: '/res/img/err_icon.png',
      title: '地址不可用'
    })
    return false
  },
  // 播放推流
  play: function () {
    if (!this.checkUrl(this.data.url)) {
      return
    }
    var that = this
    this.data.livePusherContext.start({
      success: function (res) {
        that.setData({
          pushing: true
        })
      },
      fail: function (res) {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '推流失败'
        })
      }
    })
  },
  // 停止推流
  stop: function () {
    var that = this
    that.setData({
      pushing: false,
      url: '',
      isServerAutoUrl: false,
      enableCamera: true
    })
    that.data.livePusherContext.stop()
  },
  // 暂停推流
  pause: function () {
    var that = this
    this.data.livePusherContext.pause({
      success: function (res) {
        that.setData({
          pushing: false
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
  // 恢复推流
  resume: function () {
    var that = this
    this.data.livePusherContext.resume({
      success: function (res) {
        that.setData({
          pushing: true
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
  // 切换摄像头
  handoverCamera: function () {
    var that = this
    this.data.livePusherContext.switchCamera({
      success: function (res) {
        that.setData({
          rearCamera: !that.data.rearCamera
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
  switchBeauty: function () {
    this.setData({
      beauty: this.data.beauty ? 0 : 10
    })
  },
  switchWhiteness: function () {
    this.setData({
      whiteness: this.data.whiteness ? 0 : 10
    })
  },
  showHideMode: function () {
    this.setData({
      showModeMenu: !this.data.showModeMenu
    })
  },
  switchMode: function (data) {
    this.setData({
      mode: data.target.dataset.type,
      showModeMenu: false
    })
  },
  switchOrientation: function () {
    this.setData({
      orientation: this.data.orientation === 'vertical' ? 'horizontal' : 'vertical'
    })
  },
  switchMuted: function () {
    this.setData({
      muted: !this.data.muted
    })
  },
  switchCamera: function () {
    var that = this
    that.setData({
      enableCamera: !that.data.enableCamera
    })
    if (that.data.pushing) {
      that.data.livePusherContext.stop()
      setTimeout(function () {
        that.data.livePusherContext.start()
      }, 500)
    } 
  },
  statechange: function (e) {
    if ([-1307, -1308, -1309, -1310, 3001, 3002, 3003, 3004, 3005].indexOf(+e.detail.code) !== -1) {
      this.stop()
      setTimeout(function () {
        wx.showToast({
          image: '/res/img/err_icon.png',
          title: '推流失败' + e.detail.code
        })
      }, 500)
    }
  },
  error: function (e) {
    console.log('live-pusher errMsg:', e.detail.errMsg, ', errCode:', e.errCode)
    this.stop()
    setTimeout(function () {
      wx.showToast({
        image: '/res/img/err_icon.png',
        title: '推流失败'
      })
    }, 800)
  }
})
