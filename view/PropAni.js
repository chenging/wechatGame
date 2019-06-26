/*
 * @Author: chenging
 * @Date: 2019-01-08 11:33:38
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-11 11:32:07
 * 道具动画
 */
import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        tProp: {
            type: cc.Sprite,
            default: [],
        },

        tPropBtn: {
            type: cc.Button,
            default: [],
        },

        dragon: dragonBones.ArmatureDisplay
    },
    myDragon: dragonBones.Armature,
    datas: null,

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.myDragon = this.dragon.armature();
    },

    start() {

    },

    onEnable() {
        this.dragon.addEventListener(dragonBones.EventObject.START, this.eventHandler, this);
        this.dragon.addEventListener(dragonBones.EventObject.COMPLETE, this.eventHandler, this);
    },

    onDisable() {
        this.dragon.removeEventListener(dragonBones.EventObject.START, this.eventHandler, this);
        this.dragon.removeEventListener(dragonBones.EventObject.COMPLETE, this.eventHandler, this);
    },

    //骨骼动画
    eventHandler(event) {
        let self = this;
        //动画开始以及动画结束监听
        if (event.type === dragonBones.EventObject.START) {

        }
        else if (event.type === dragonBones.EventObject.COMPLETE) {
            var index = 0;
            this.mCallbackFunc = function () {
                if (index < this.datas.length) {
                    this.showPropBezier(this.datas[index]);
                }
                else {
                    this.unschedule(this.mCallbackFunc);
                    this.mCallbackFunc = null;
                }
                index += 1;
            }

            this.schedule(this.mCallbackFunc, 0.3);


            // var time = 0.5 * this.datas.length;
            let time = 1.85;
            var backCall1 = cc.callFunc(function () {
                this.node.active = false;
            }, this);

            var action = cc.sequence(cc.delayTime(time), backCall1);
            this.node.runAction(action);
        }
    },

    init(obj) {
        this.mGameCtrObj = obj;
        this.node.active = false;
    },

    showAniUI(data, box = false) {
        this.datas = data;
        this.node.active = true;
        this.dragon.node.active = false;
        for (var i = 0; i < this.tProp.length; i++) {
            this.tProp[i].node.active = false
        }
        if (box) {
            this.myDragon.animation.play('play', 1)
            this.dragon.node.active = true;
            return
        }

        var index = 0;
        this.mCallbackFunc = function () {
            if (index < data.length) {
                this.showPropBezier(data[index]);
            }
            else {
                this.unschedule(this.mCallbackFunc);
                this.mCallbackFunc = null;
            }
            index += 1;
        }

        this.schedule(this.mCallbackFunc, 0.3);


        var time = 1 + (0.5 * data.length);
        var backCall1 = cc.callFunc(function () {
            this.node.active = false;
        }, this);

        var action = cc.sequence(cc.delayTime(time), backCall1);
        this.node.runAction(action);

    },


    showPropBezier(index) {
        this.tProp[index].node.active = true;
        this.tProp[index].node.position = cc.v2(0, -157);

        var pos1 = this.tPropBtn[index].node.parent.convertToWorldSpaceAR(this.tPropBtn[index].node.getPosition());
        var pos2 = this.tProp[index].node.parent.convertToNodeSpaceAR(pos1);

        var bezier = [cc.v2(0, -157), cc.v2(-140, 0), pos2];
        var bezierTo = cc.bezierTo(1, bezier);

        var backCall = cc.callFunc(function () {
            this.tProp[index].node.active = false;
            Global.SoundModel.playEffect("reward");
            Global.GameModel.tPropInfo[index] += 1;
            Global.isUpdateStar=true;
        }, this);

        var action = cc.sequence(bezierTo, backCall);
        this.tProp[index].node.runAction(action);
    },

    // update (dt) {},
});
