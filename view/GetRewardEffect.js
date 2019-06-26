import Global from '../controller/Global';
cc.Class({
	extends: cc.Component,

	properties: {
		tStar: {
			type: cc.Sprite,
			default: [],
		},
	},
	onLoad(){
        this.node.active = false;
		for (var i = 0; i < this.tStar.length; i++) {
			this.tStar[i].node.x = 0;
			this.tStar[i].node.y = 0;
			this.tStar[i].node.active = false;
		}
    },
	//发放奖励动画 money 奖励星星数 lastMoney 最后星星数量
	showReardAniUI(money, lastMoney) {
		Global.SoundModel.playEffect('reward-show');
		this.node.active = true;
		this.node.zIndex = 9;
		for (var i = 0; i < this.tStar.length; i++) {
			this.tStar[i].node.x = 0;
			this.tStar[i].node.y = 0;
			this.tStar[i].node.active = false;
		}
		var num = 10;
		if (money >= 10) {
			num = 10;
		} else {
			num = Math.ceil(money / 10);
		}

		for (var i = 0; i < num; i++) {
			this.tStar[i].node.x = (Math.random() - 0.5) * 400;
			this.tStar[i].node.y = (Math.random() - 0.5) * 600;
			this.tStar[i].node.active = true;
		}

		var size = cc.view.getVisibleSize();

		var addMoney = Math.floor(money / num);

		for (var i = 0; i < num; i++) {
			var action = cc.moveTo(0.5, Global.moneyPos);
			var callBack = cc.callFunc(function() {
				Global.GameModel.Money += addMoney;
				Global.isUpdateStar=true;

				//this.tStar[i].node.active = false;
			}, this);
			var action1 = cc.sequence(action, callBack);
			if (i == num - 1) {
				var callBack1 = cc.callFunc(function() {
					if (lastMoney != null) {
						Global.GameModel.Money = lastMoney;
                        Global.isUpdateStar=true;
					}
					this.node.active = false;
				}, this);
				action1 = cc.sequence(action, callBack, cc.delayTime(0.1), callBack1);
			}
			this.tStar[i].node.runAction(action1);
		}
        //后台更新
        if(cc.sys.platform===cc.sys.WECHAT_GAME){
            Global.api.changStar(2, '', res => {});
        }
	},

	// update (dt) {},
});
