/*
 * @Author: chenging
 * @Date: 2019-01-08 11:33:38
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-11 10:45:11
 * 笔刷道具
 */
import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        mStar: {
            type: cc.Sprite,
            default:[],
        }


    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(obj){
        this.mGameCtrObj = obj;
        this.node.active = false;

    },

    ShowbishuaUI(color, x, y){
        this.node.active = true;
        var index = 0;
        var temp = [];
        console.log(Global.GameModel.mGameData.Data, Global.GameModel.mLevel);
        for (var j = 0; j < 5; j++){
            temp.push(this.mStar[j]);
        }
        for (var i = 0; i < temp.length; i++){
            this.mStar[i].node.active = false;
            if (i != color){
                this.mStar[i].node.active = true;
               this.mStar[i].node.setPosition(cc.v2((-180 + 90*index), 50));
               index += 1;
            }
        }

        if (x < -135){
            x = -135;
        }

        if (x > 135){
            x = 135;
        }
        console.log(x,y);
        this.node.setPosition(cc.v2(x,y));
        this.node.zIndex= 101;
    },


    cilckStar(event, customEventData){
        Global.SoundModel.playEffect('paint');
        let starColor = customEventData
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        }

        Global.GameModel.tPropInfo[2] -= 1;
        if (Global.GameModel.tPropInfo[2] < 0){
            Global.GameModel.tPropInfo[2] = 0;
        }
        this.mGameCtrObj.changeStarColor(starColor);
    },

    callBack(){
        console.log("100")
        this.mGameCtrObj.clearPropEffect();
    },

    close(){
        this.node.active = false;
    },




    // update (dt) {},
});
