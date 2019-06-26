import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        tMusicBtn: {
            type: cc.Button,
            default: [],
        },
        mBackBtn: cc.Button,
        mUserID: cc.Label,
        mVersion: cc.Label,
        mBg: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onLoad() {
        this.node.active=false;
    },
    //打开设置界面
    OpenSettingUI(flag) {
        this.node.active = true;
        this.node.zIndex = 8;
        if (Global.IsNeedPlayer == false) {
            this.tMusicBtn[0].node.active = false;
            this.tMusicBtn[1].node.active = false;
            if (flag) {  //在登录界面打开
                this.mBackBtn.node.active = false;
                this.tMusicBtn[2].node.y = 132 - 144;
                this.tMusicBtn[3].node.y = 132 - 144;
            }
            else {
                this.mBackBtn.node.active = true;
                this.tMusicBtn[2].node.y = 46;
                this.tMusicBtn[3].node.y = 46;
            }
        }
        else {
            if (flag) {  //在登录界面打开
                this.mBackBtn.node.active = false;
                this.tMusicBtn[0].node.y = 200 - 144;
                this.tMusicBtn[1].node.y = 200 - 144;
                this.tMusicBtn[2].node.y = 62 - 144;
                this.tMusicBtn[3].node.y = 62 - 144;
            }
            else {
                this.mBackBtn.node.active = true;
                this.tMusicBtn[0].node.y = 260 - 144;
                this.tMusicBtn[1].node.y = 260 - 144;
                this.tMusicBtn[2].node.y = 122 - 144;
                this.tMusicBtn[3].node.y = 122 - 144;
            }


            if (Global.SoundModel.IsPlayMusic) {
                this.tMusicBtn[0].node.active = true;
                this.tMusicBtn[1].node.active = false;
            }
            else {
                this.tMusicBtn[0].node.active = false;
                this.tMusicBtn[1].node.active = true;
            }
        }


        if (Global.SoundModel.IsPlayEffect) {
            this.tMusicBtn[2].node.active = true;
            this.tMusicBtn[3].node.active = false;
        }
        else {
            this.tMusicBtn[2].node.active = false;
            this.tMusicBtn[3].node.active = true;
        }

        this.mUserID.string = "角色ID：" + Global.userInfo.userid;
        this.mVersion.string = "v" + Global.codeVersion;
        this.mBg.node.setScale(0);
        var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
        var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
        this.mBg.node.runAction(cc.sequence(action1, action2));
    },

    //打开音乐
    openMusic() {
        Global.SoundModel.playEffect("button");
        Global.setlocalStorage("isPlayMusic", "true");

        this.tMusicBtn[0].node.active = true;
        this.tMusicBtn[1].node.active = false;
        // this.mGameMusic = cc.audioEngine.play(cc.url.raw("resources/effect/music.ogg"), true, 1);
        // Global.SoundModel.IsPlayMusic = true;
        Global.SoundModel.openMusic('bg-music');
        Global.SoundModel.openEffect();
    },

    //关闭音乐
    closeMusic() {
        Global.SoundModel.playEffect("button");
        Global.setlocalStorage("isPlayMusic", "false");
        this.tMusicBtn[0].node.active = false;
        this.tMusicBtn[1].node.active = true;
        // cc.audioEngine.stop(this.mGameMusic);
        // Global.SoundModel.IsPlayMusic = false;
        Global.SoundModel.closeMusic();
        Global.SoundModel.closeEffect();
    },
    //打开音效
    openEffect() {
        Global.setlocalStorage("isPlayEffect", "true");
        this.tMusicBtn[2].node.active = true;
        this.tMusicBtn[3].node.active = false;
        // Global.SoundModel.openEffect();
        Global.SoundModel.openMusic('bg-music');
        Global.SoundModel.openEffect();
    },
    //关闭音效
    closeEffect() {
        Global.setlocalStorage("isPlayEffect", "false");
        this.tMusicBtn[2].node.active = false;
        this.tMusicBtn[3].node.active = true;
        // Global.SoundModel.closeEffect();
        Global.SoundModel.closeMusic();
        Global.SoundModel.closeEffect();
    },
    //返回主页
    backHome() {
        cc.director.loadScene('Login');
        Global.SoundModel.playEffect("button");
    },

    close() {
        Global.SoundModel.playEffect("button");
        this.node.active = false;
    },

    RePlay() {
        Global.GameModel.mScore = 0;
        Global.GameModel.mLevel = 0;

        this.node.active = false;

        // cc.director.loadScene('Game');
        // this.GameControlObj.ControlObj.mRank.node.active = false;
        // this.GameControlObj.startGame();
    },

    // update (dt) {},
});
