import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
       leaderBoard: cc.Sprite,
    },

    onLoad () {
        this.type = 0; //0:点击关闭，把这个界面关闭， 1：点击关闭，退到下一个界面，当前界面不关闭
        this.times = 0;
    },

    start () {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.tex = new cc.Texture2D();
        }
    },

    init(obj){
        this.ControlObj = obj;
        this.type = 0;
        this.node.active = false;
    },

    showUI(type){
        this.type = type;
        this.node.active = true;
        this.node.zIndex = 7;
        console.log("havehave",type)
        // wx.showToast({
        //     title: '功能修复中',
        //     icon: 'none',
        //     duration: 2000,
        // });
        return;
        if (type == 0){
            wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: Global.rankKey,
            });
        }
        else if (type == 1){
            wx.postMessage({
                messageType: 4,
                MAIN_MENU_NUM: Global.rankKey,
            });
        }
    },

    HideNode(){
        // this.friendBg.active = false;
        // this.BackButton.node.active = false;
        // this.GroupRankButton.node.active = false;
        // this.maskBg.node.active = false;
    },

    ShowNode(){
        // this.friendBg.active = true;
        // this.BackButton.node.active = true;
        // this.GroupRankButton.node.active = true;
        // this.maskBg.node.active = true;
    },

    setType(tp){
        this.type = tp;
    },


    //由排行榜返回主界面
    onBackHome() {
        if (this.type == 0){
            this.node.active = true;
            if(cc.sys.platform === cc.sys.WECHAT_GAME)
              wx.postMessage({
                  messageType: 4,
                  MAIN_MENU_NUM: Global.rankKey,
              });
        }
        else if(this.type == 1){
            this.node.active = false;
        }

    },
     // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (!this.tex) {
            return;
        }
        this.tex.initWithElement(sharedCanvas);
        this.tex.handleLoadedTexture();
        this.leaderBoard.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    // called every frame
    update (dt) {
        // if (cc.sys.platform === cc.sys.WECHAT_GAME && this.node.active) {
        //     if (this.times > 0.1){
        //         this.times = 0;
        //         this._updateSubDomainCanvas();
        //     }
        //     else
        //     {
        //         this.times += dt;
        //     }

        // }
    },
});
