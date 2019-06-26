cc.Class({
    extends: cc.Component,

    properties: {
       exchangeStarBtn: cc.Button,//兑换按钮
    },

    onLoad () {
        
    },
    //兑换 星星
    exchangeStar(e){
        this.exchangeStarBtn.node.dispatchEvent(new cc.Event.EventCustom('exchangeStar', true))
    }

});
