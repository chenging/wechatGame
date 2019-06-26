/**
 * 游戏结束类
 * @author WH
 * @Time 2018-7-13
 *
 */
import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
	extends: cc.Component,

	properties: {
		mScore: cc.Label,
		mRank: cc.Label,
		mChaoyue: cc.Label,
		mUpdateIcon: cc.Sprite,
        mDownIcon: cc.Sprite,
	},
	bannerNum: 0,

	// LIFE-CYCLE CALLBACKS:

	onLoad() {},

	initUI() {},

	init(obj) {
		this.GameControlObj = obj;
		this.node.active = false;
	},
    closeGameOver(){
        this.node.active=false;
    },
	//显示游戏结算
	updateOverUI(isGetReward) {
		if (Global.isNeedShowgetUserInfoButton && Global.getUserInfoButton) {
			Global.getUserInfoButton.show();
		}
		this.unscheduleAllCallbacks();
		// Global.SoundModel.playEffect("gameover");
		Global.GameModel.GameStatus = 2;
		this.node.active = true;
		this.node.zIndex = 3;
		Global.GameModel.mIsRevive = false;
		this.mUpdateIcon.node.active = false;
		this.mDownIcon.node.active = false;
		this.mScore.string = Global.GameModel.mScore;
		this.mRank.string = Global.GameModel.UserScore;
		var flag = 0;
		if (Global.GameModel.mNextRank > 0 && Global.GameModel.mUserRank == 0) {
			flag = 1;
		} else if (Global.GameModel.mNextRank < Global.GameModel.mUserRank && Global.GameModel.mUserRank > 0) {
			flag = 1;
		} else if (Global.GameModel.mNextRank > Global.GameModel.mUserRank && Global.GameModel.mUserRank > 0) {
			flag = 2;
		}
		Global.GameModel.mUserRank = Global.GameModel.mNextRank;
		// if (flag == 1){
		//     this.mUpdateIcon.node.active = true;
		// }
		// else if (flag == 2){
		//     this.mDownIcon.node.active = true;
		// }

		var num = ((Global.GameModel.mScore * 0.01) / (1 + Global.GameModel.mScore * 0.01)) * 100;
		this.mChaoyue.string = '已经超越了' + Math.floor(num) + '%的玩家';
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			Modal.getInstance().getModalController('rank',(script)=>{
                script.showUI(0);
            })
		} else {
			cc.log('横向排行榜: x1');
		}
		//保存最高记录
		Global.saveMyHighestRecord(
			Global.GameModel.mLevel,
			Global.GameModel.mScore,
			Global.GameModel.mBeginScore,
			isGetReward
		);

		if (Global.GameModel.UserScore < Global.GameModel.mScore) {
			Global.GameModel.UserScore = Global.GameModel.mScore;
		}

		// if (wx.getSystemInfoSync().screenHeight == 812 && wx.getSystemInfoSync().screenWidth == 375) {
		// 	this.node.getChildByName('add_wechat').getComponent(cc.Widget).top = 98;
		// } else {
		// 	this.node.getChildByName('add_wechat').getComponent(cc.Widget).top = 16;
		// }
	},
    //全部排行
	SearchRank() {
		let self = this;
        Modal.getInstance().getModalController('rankManager',(script)=>{
            script.createGameRank(null,0,true);
        })
	},
	share() {
		let path = Global.GameModel.getRandomSharePic();
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			// Report.reportEvent(15, 2);
			let self = this;
			wx.updateShareMenu({
				withShareTicket: false,
				success: res => {
					// let shareInfo = Share.commonShare({ serial: 3, params: { shareUserId: Global.userInfo.userid } }, success, fail, this);
					function success(res) {}
					function fail(res1) {
						console.log('shareAppMessage fail', res1);
                    }
                    let obj=Global.getShareTitle();
					wx.aldShareAppMessage({
						title: obj.title,
						imageUrl: obj.imgUrl,
						ald_desc: '分享复活',
						query: '',
					});
				},
			});
		}
		this.bannerNum += 1;
		if (this.bannerNum >= Global.bannerFresh) {
			this.bannerNum = 0;
		}
	},

	RePlay() {
		console.log('点了再来一次');
		this.node.active = false;
		Global.GameModel.mScore = 0;
		Global.GameModel.mLevel = 0;
		Global.carom_share = Number(Global.numConf.carom_share);
		Global.box_share = Number(Global.numConf.box_share);
		Global.tips_share = Number(Global.numConf.tips_share);
		Global.again_share = Number(Global.numConf.again_share);
		Global.Resurrection_share = Number(Global.numConf.Resurrection_share);
		Global.setNumConf();
		Global.gameType='replay';

		this.bannerNum += 1;
		if (this.bannerNum >= Global.bannerFresh) {
			this.bannerNum = 0;
		}
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
		}
	},
	//关闭,返回登录页
	close() {
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			wx.postMessage({
				messageType: 0,
				MAIN_MENU_NUM: Global.rankKey,
			});
		}
		this.node.active = false;
		cc.director.preloadScene('Login', () => {
            cc.director.loadScene('Login');
        })
		Global.GameModel.mScore = 0;
		Global.GameModel.mLevel = 0;
		Global.GameModel.GameStatus = 0;
	},
	hideShareButton() {
		cc.log('hideShareButton', this.node);
		let self = this;
		this.node.getChildByName('InviteBtn').active = false;
		this.node.runAction(
			cc.sequence(
				cc.delayTime(2),
				cc.callFunc(() => {
					self.node.getChildByName('InviteBtn').active = true;
					cc.log('sssss');
				})
			)
		);
	},
	// update (dt) {},
});
