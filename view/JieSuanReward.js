import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        mScoreLb: cc.Label,
        mMoneyNum: cc.Label,
        mMask: cc.Node,
        mBg: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(obj){
        this.mGameCtrObj = obj;
        this.node.active = false;
    },

    openUI(){
        this.node.active = true;
        this.mScoreLb.string = Global.GameModel.mScore;
        this.mMoneyNum.string = Global.GameModel.getJieSuanReward();

        this.mBg.node.setScale(0);
        var action1 = cc.scaleTo(Global.mTanChuan[0],Global.mTanChuan[1]);
        var action2 = cc.scaleTo(Global.mTanChuan[2],Global.mTanChuan[3]);
        this.mBg.node.runAction(cc.sequence(action1, action2));

    },

    getReardBtn(){
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let self = this;
            let num = Global.GameModel.getJieSuanReward();
            Global.api.sendAddMoney({
                userid: Global.userInfo.userid || '',
                token: Global.userInfo.token || '',
                coin: num,
            }, (res) => {
                console.log("sendAddMoneySuccess",res);
                if (res.data.tagcode == "00000000"){
                    self.node.active = false;
                    var count = Global.GameModel.getJieSuanReward();
                    Global.GameModel.Money += count;
                    self.mGameCtrObj.ControlObj.loadmRewardLayer(count,Global.GameModel.Money);
                    self.mGameCtrObj.mGameOver.updateOverUI(1);
                    //Global.setlocalStorage("canGetJieSuanReward",false);
                }
                        
            })
        }
        else
        {
            this.node.active = false;
            var count = Global.GameModel.getJieSuanReward();
            Global.GameModel.Money += count;
            this.mGameCtrObj.ControlObj.loadmRewardLayer(count,Global.GameModel.Money);
            this.mGameCtrObj.mGameOver.updateOverUI(1);
            //Global.setlocalStorage("canGetJieSuanReward",false);
        }  
    },


    close(){
        this.node.active = false;
    },

    // update (dt) {},
});
