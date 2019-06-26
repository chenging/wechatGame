import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
	extends: cc.Component,

	properties: {
		mBg: cc.Sprite,
	},
    time: 0,
    isClick:false,
	_fromName:null,//页面来源名称

	onLoad() {
        this.node.active = false;
        //设置放弃奖励按钮的位置
		// this.node.getChildByName('CloseBtn').getComponent(cc.Widget).bottom = Global.bannerHeight;
	},

	onEnable() {
		if (cc.sys.platform == cc.sys.WECHAT_GAME) {
			wx.onShow(this.onShow);
		}
	},

	onDisable() {
		if (cc.sys.platform == cc.sys.WECHAT_GAME) {
			wx.offShow(this.onShow);
		}
	},

	close() {
		Global.SoundModel.playEffect('button');
        this.node.active = false;
        if(cc.sys.platform===cc.sys.WECHAT_GAME){
            if(this._fromName=='login'){
                //首页
                wx.aldSendEvent('点击「首页-加星-放弃领取按钮」');
            }else{
                //游戏页
                wx.aldSendEvent('点击「游戏中-加星-放弃领取按钮」');
            }
        }
	},
	//打开星星商店
	openStarShop(fromName) {
        this._fromName=fromName;
		if (Global.gasstation_share > 0) {
		} else {
			wx.showToast({
				title: '加油站今日次数已领完，请明日再来',
				icon: 'none',
				duration: 2000,
			});
			return;
		}
        this.node.active = true;
        Global.setBtnStyle(this.node.getChildByName('dk_1'),'normal','receive');
        Global.setGiveUpBtnPosition(this.node,'CloseBtn');
		this.node.zIndex = 4;
		this.mBg.node.setScale(0);
		var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
		var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
		this.mBg.node.runAction(cc.sequence(action1, action2));
		this._isClickReward = false;
	},

	GetReward() {
		if (this.isClick) return;
		this.isClick = true;
		Global.SoundModel.playEffect('button');
		let self = this;
		let videoAd;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if(this._fromName=='login'){
                //首页
                wx.aldSendEvent('点击「首页-加星-立即领取按钮」')
            }else{
                //游戏页
                wx.aldSendEvent('点击「游戏中-加星-立即领取按钮」')
            }
			wx.getNetworkType({
				success: function(result) {
					// 返回网络类型, 有效值：
					// wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
					var networkType = result.networkType;
					if (networkType == 'none') {
						wx.showModal({
							title: '提示',
							content: '您的网络已断开，请确保网络正常。',
							success: function(res) {},
                        });
                        self.isClick=false;
					} else {
						videoAd = wx.createRewardedVideoAd({
							adUnitId: 'adunit-515c075499abc5d2',
						});

						videoAd
							.load()
							.then(() => {
								console.log('视频广告显示正常', videoAd.show());
								wx.aldSendEvent('视频正常显示');
							})
							.catch(err => {
                                self.isClick=false;
								console.log('未正常显示视频', err);
								wx.aldSendEvent('视频加载出错', {
									'出错原因': err,
								});
								self._isVideoAdErr = true;
								self.GetRewardShare();
							});

						videoAd.onClose(videoClose);

						function videoClose(res) {
                            self.isClick=false;
							videoAd.offClose(videoClose);
							// 小于 2.1.0 的基础库版本，res 是一个 undefined
							let version = false;
							if (wx.getSystemInfoSync().SDKVersion >= '2.1.0') {
								version = true;
							} else {
								version = false;
							}

							console.log('看看是什么    ', version);
							if (version) {
								if ((res && res.isEnded) || res === undefined) {
									wx.aldSendEvent('用户看完视频');
									self.shareSuccess();
									// 正常播放结束，可以下发游戏奖励
								} else {
									//self.close();
									wx.aldSendEvent('用户未看完视频');
									wx.showToast({
										title: '您未观看完视频，无法获得奖励',
										icon: 'none',
										duration: 2000,
									});
									// 播放中途退出，不下发游戏奖励
								}
							} else {
								self.shareSuccess();
							}
						}
					}
				},
			});
		}else{
            self.shareSuccess();
        }
	},

	onShow() {
		if (self.time <= 0) {
			return;
		}
		let time = (new Date().getTime() - self.time) / 1000;
		let random = [`请尝试邀请更多好友来玩嘛`, `请不要频繁分享到同一个地方`];
		console.log('这个时间是多少   ', time);
		if (time < Global.shareTime) {
			wx.showToast({
				title: '好东西要和群友分享哦',
				icon: 'none',
				duration: 2000,
			});
			return;
		}
		if (Global.isback == 0 && !Global.shareFirst) {
			if (Math.random() <= Global.shareOne / 100) {
				Global.isback = 0;
				self.getDoubleSuc();
			} else {
				Global.isback += 1;
				wx.showToast({
					title: random[Math.floor(Math.random() * random.length)],
					icon: 'none',
					duration: 2000,
				});
			}
		} else if (Global.isback == 1 && !Global.shareFirst) {
			if (Math.random() <= Global.shareTwo / 100) {
				Global.isback = 0;
				self.getDoubleSuc();
			} else {
				Global.isback += 1;
				wx.showToast({
					title: random[Math.floor(Math.random() * random.length)],
					icon: 'none',
					duration: 2000,
				});
			}
		} else {
			Global.isback = 0;
			self.getDoubleSuc();
			if (Global.shareFirst) {
				Global.shareFirst = 0;
				let data = {
					time: new Date().getTime(),
					fist: 0,
				};
				localStorage.setItem('shareFist', JSON.stringify(data));
			}
		}
		self.time = 0;
	},

	getDoubleSuc() {
		Global.gasstation_share -= 1;
		Global.setNumConf();
		this.shareSuccess();
	},

	GetRewardShare() {
		// let Path = Global.GameModel.getRandomSharePic();
		let self = this;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			let self = this;
			wx.updateShareMenu({
				withShareTicket: true,
				success: res => {
					// let shareInfo = Share.commonShare({ serial: 9, params: { shareUserId: Global.userInfo.userid } }, null, null, this);
                    let obj=Global.getShareTitle();
                    let shareInfo = {
						title: obj.title,
						imageUrl: obj.imgUrl,
						ald_desc: '分享获得星星',
					};
					self.time = new Date().getTime();
					wx.aldShareAppMessage(shareInfo);
				},
			});
		} else {
			this.shareSuccess();
		}
	},

	shareSuccess() {
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			let self = this;
			Global.GameModel.Money += 10;
            this.getReardSuccess(10, Global.GameModel.Money);
            this.isClick=false;
		} else {
			Global.GameModel.Money += 10;
            this.getReardSuccess(10, Global.GameModel.Money);
            this.isClick=false;
		}
	},

	getReardSuccess(money, lastMoney) {
		this.node.active = false;
		Modal.getInstance().getModalController('getRewardEffect',(script)=>{
            script.showReardAniUI(money, lastMoney);
        })
	},

	hideShareButton() {
		cc.log('hideShareButton', this.node);
		let self = this;
		this.node.getChildByName('dk_1').getChildByName('an_2').active = false;
		this.node.runAction(
			cc.sequence(
				cc.delayTime(2),
				cc.callFunc(() => {
					self.node.getChildByName('dk_1').getChildByName('an_2').active = true;
					cc.log('sssss');
				})
			)
		);
	},

	// update (dt) {},
});
