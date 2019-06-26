cc.Class({
    extends: cc.Component,

    properties: {
       mColor: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.particleSystem = this.node.getComponent(cc.ParticleSystem);
        this.particleSystem.stopSystem();
    },

    start () {
    },

    init(obj,selfObj, delaytime, yanhuaobj){
        this.myanhuaObj = obj;
        this.mSelfObj = selfObj;
        this.node.stopAllActions();
        this.particleSystem.resetSystem();
        var callBack = cc.callFunc(function () {
			yanhuaobj[this.mColor].put(this.mSelfObj)
        }, this);
        var action = cc.sequence(cc.delayTime(delaytime), callBack);
        this.node.runAction(action);
    },
    // update (dt) {},
});
