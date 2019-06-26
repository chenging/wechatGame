/**
* 星星类
* @author WH
* @Time 2018-8-12
*
*/
import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        mSelectIcon: cc.Sprite,
        mSpecialStar: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(obj, color){
        this.mStarManagerObj = obj;
        this.color = color;
        this.selected = false;
        this.updateImage(this.color);
        this.mSpeed = 40;
        this.isPlayingAni = false;
        this.mSelectIcon.node.active = false;
        this.mHuxiAni = null;
        this.node.scale = 1;
        this.selected1 = false;
        this.mTargetPos = cc.v2(0,0);
        this.mSpecialStar.node.active = false;  
    },

    updateImage(color){
        this.getComponent(cc.Sprite).spriteFrame = Global.GameModel.tResourcePic[color];
    },

    setSpecialStar(){
        this.mSpecialStar.node.active = true; 
    },

    isSpecialStar(){
        return this.mSpecialStar.node.active;
    },

    getColor(){
        return this.color;
    },

    isSelected(){
        return this.selected;
    },

    setSelected(flag){
       this.selected = flag; 
       this.mSelectIcon.node.active = this.selected;
    },

    isSelected1(){
        return this.selected1;
    },

    setSelected1(flag){
       this.selected1 = flag; 
       //this.mSelectIcon.node.active = this.selected1;
    },

    setDesPosition(p){
        this.desPosition = p;
    },

    setIndex_ij(i,j){
        this.index_i = i;
        this.index_j = j;
    },

    setTargetPos(pos){
        this.mTargetPos = pos;
    },

    getIndexI(){
        return this.index_i;
    },

    getIndexJ(){
        return this.index_j;
    },

    initPos(){
        this.node.position = this.desPosition;
    },

    deleteAni(){
        this.node.runAction(cc.moveBy(0.2, cc.v2(0,10)))
    },

    updatePosition(dt){
        if (this.isPlayingAni){
            return
        }
        if (this.desPosition.y != this.node.y){
            this.node.y -= this.mSpeed;
            if (this.node.y <= this.desPosition.y){
                this.initPos();
                this.isPlayingAni = true;
                if (this.index_i == 0 && this.index_j == 0){
                    this.mStarManagerObj.setCanTouch();
                }

                if (this.index_j%10 == 0){
                    // Global.SoundModel.playEffect("drop")
                }
            }
        }
    },

    //反弹效果
    BoobAni(){
        if (this.node.x == this.desPosition.x && this.node.y == this.desPosition.y){
            return;
        }
        if (Global.isKickBack){
            // var action1 = cc.moveTo(Global.GameModel.dropTime, cc.v2(this.desPosition.x, this.desPosition.y - 20)).easing(cc.easeSineOut());
            // if (this.node.x != this.desPosition.x && this.node.y != this.desPosition.y)
            // {
            //     action1 = cc.moveTo(Global.GameModel.dropTime, cc.v2(this.desPosition.x - 20, this.desPosition.y - 20)).easing(cc.easeSineOut());
            // }
            // else if (this.node.x != this.desPosition.x && this.node.y == this.desPosition.y){
            //     action1 = cc.moveTo(Global.GameModel.dropTime, cc.v2(this.desPosition.x - 20, this.desPosition.y)).easing(cc.easeSineOut());
            // }
            // else if (this.node.x == this.desPosition.x && this.node.y != this.desPosition.y){
            //     action1 = cc.moveTo(Global.GameModel.dropTime, cc.v2(this.desPosition.x, this.desPosition.y - 20)).easing(cc.easeSineOut());
            // }
       
            // var action2 = cc.moveTo(0.1, this.desPosition);
            // var backCall = cc.callFunc(function() {
            //     this.node.position = this.desPosition;
            // }, this);
            // var action = cc.sequence(action1,action2,backCall);
            // this.node.runAction(action)
        }
        else
        {
            var action2 = cc.moveBy(0.2, cc.v2(0,40))
            var x = this.desPosition.x - this.node.x;
            var y = this.desPosition.y - this.node.y;

            var action1 = cc.moveTo(Global.GameModel.dropTime, cc.v2(this.node.x, this.desPosition.y)).easing(cc.easeSineOut());
            var action3 = cc.moveTo(0.1, cc.v2(this.desPosition.x, this.desPosition.y)).easing(cc.easeSineOut());
            var backCall = cc.callFunc(function() {
                // Global.SoundModel.playEffect("drop") 
                this.node.position = this.desPosition;
            }, this);

            if (x == 0 && y != 0){
                var action = cc.sequence(action2,action1,backCall);
                this.node.runAction(action)
            }
            else if (x != 0 && y == 0){
                var action = cc.sequence(cc.delayTime(Global.GameModel.dropTime + 0.2),action3,backCall);
                this.node.runAction(action)
            }
            else if (x != 0 && y != 0){
                var action = cc.sequence(action2,action1,action3,backCall);
                this.node.runAction(action)
            }



            
            // if (this.node.x != this.desPosition.x && this.node.y == this.desPosition.y){
            //     action = cc.sequence(cc.delayTime(Global.GameModel.dropTime) action1,backCall); 
            // }
            // this.node.runAction(action)
        }
        

    },
    //星星的呼吸动作
    createHuxiAni(){
        if (this.mHuxiAni){
            return;
        }
        var action1 = cc.scaleTo(0.5,0.8);
        var action2 = cc.scaleTo(0.5,1);
        this.mHuxiAni = cc.repeatForever(cc.sequence(action1, action2));

        this.node.runAction(this.mHuxiAni);

    },

    //停止星星的呼吸动作
    stopHuxiAni(){
        if (this.mHuxiAni){
            this.node.setScale(1);
            this.node.stopAction(this.mHuxiAni);
            this.mHuxiAni = null;
        }
       
    },

    //移动到指定的位置
    moveToTargetPos(){
        var action = cc.moveTo(0.4,this.mTargetPos);
         var backCall = cc.callFunc(function() {
            this.node.position = this.mTargetPos;
            this.desPosition = this.mTargetPos;
        }, this);
        var action1 = cc.sequence(action,backCall);
        this.node.runAction(action1);    
    },

    clearAllInfo(){
        this.selected = false;
        this.mSpeed = 40;
        this.isPlayingAni = true;
        this.mSelectIcon.node.active = false;
        this.mHuxiAni = null;
        this.selected1 = false;
        this.mTargetPos = cc.v2(0,0);

        this.node.stopAllActions();
    },
    // update (dt) {},
});
