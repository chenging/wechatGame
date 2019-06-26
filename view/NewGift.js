let newgif;
import Global from '../controller/Global';
cc.Class({
	extends: cc.Component,

	properties: {
		mBg: cc.Sprite,
	},
	time: 0,

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		newgif = this;
	},

	start() {},

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

	init(obj) {
		this.mLoginObj = obj;
		this.node.active = false;
	},

	close() {
		Global.SoundModel.playEffect('button');
		this.node.active = false;
	},

	openNewGift() {
		if (Global.IsShowShare == false) {
			return;
		}
		this.node.active = true;
		this.mBg.node.setScale(0);
		var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
		var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
		this.mBg.node.runAction(cc.sequence(action1, action2));
	},

	onShow() {
		let self = newgif;
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
		this.shareSuccess();
	},

	GetReward() {
		Global.SoundModel.playEffect('button');
		//this.shareSuccess();
		let Path = Global.GameModel.getRandomSharePic();
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			let self = this;
			wx.updateShareMenu({
				withShareTicket: true,
				success: res => {
					// let shareInfo = Share.commonShare({ serial: 6, params: { shareUserId: Global.userInfo.userid } }, null, null, this);
                    self.time = new Date().getTime();
                    let obj=Global.getShareTitle();
					let shareInfo = {
						title: obj.title,
						imageUrl: obj.imgUrl,
						ald_desc: '分享获得游戏道具',
						query: '',
					};
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
			Global.api.getNewGiftReard(
				{
					userid: Global.userInfo.userid || '',
					token: Global.userInfo.token || '',
				},
				res => {
					if (res.data.tagcode == '00000000') {
						console.log('newGiftInfo:', res.data);
						self.getReardSuccess(res.data.current_coin);
					}
				}
			);
		} else {
			Global.GameModel.Money += 88;
			this.getReardSuccess(Global.GameModel.Money);
		}
	},

	getReardSuccess(money) {
		var addmoney = 88;
		this.node.active = false;
		this.mLoginObj.ControlObj.loadmRewardLayer(addmoney, money, true);
		Global.GameModel.isHaveNewGift = 1;
		this.mLoginObj.mNewGiftBtn.node.active = false;
		//this.mLoginObj.updateLoginUI();
	},

	// update (dt) {},
});
