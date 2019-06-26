/*
 * @Author: chenging
 * @Date: 2019-01-08 11:33:38
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-11 09:47:44
 * 锤子道具
 */
import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(obj){
        this.mGameCtrObj = obj;
        this.node.active = false;

    },

    ShowchuoziUI(x, y){
        this.node.active = true;
        this.node.setPosition(cc.v2(x,y));
        this.node.zIndex = 101;
        this.node.scaleX = -1;
        if (x < -225){
            this.node.scaleX = 1;
        }
    },

    close(){
        this.node.active = false;
    },




    // update (dt) {},
});
