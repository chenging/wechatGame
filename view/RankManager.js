/**
* 排行榜管理类
* @author WH
* @Time 2018-7-18
*
*/
import Global  from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        tab: {
            default: [],
            type: cc.Sprite,
        },
        mViewContent: cc.Node,
        mRankView: cc.Prefab,
        mGlobalRankScollview: cc.ScrollView,
        mRankLabel: cc.Label,
        mUserHeadIcon: cc.Sprite,
        mUserName: cc.Label,
        mRankSprite: {
            default: [],
            type: cc.Sprite,
        },
        mScore: cc.Label,
        mSelfRankBg: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.mSelectStatus = 0;  //0：全球排行榜  1：好友排行榜
        //this.mFriendRankNode.node.active = false;
    },

    start() {
        // this.tab[0].node.active = false;
        // this.tab[1].node.active = false;
        // this.tab[2].node.active = false;
        // this.tab[3].node.active = false;
    },
    //选择全球排行
    selectGlobalRank() {
        Global.SoundModel.playEffect("button")
        if (this.mSelectStatus == 0) {
            return;
        }
        this.mSelectStatus = 0;
        this.tab[0].node.active = false;
        // this.tab[1].node.active = true;
        // this.tab[2].node.active = true;
        // this.tab[3].node.active = false;

        if (this.GlobalRankInfo == null) {
            //屏蔽获取世界排行
            this.createGlobalRankLayer(this.GlobalRankInfo);
            // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //     let self = this;
            //     Global.api.getRankInfo({
            //         userid: Global.userInfo.userid || '',
            //         token: Global.userInfo.token || '',
            //     }, (res) => {
            //         if (res.data.tagcode == "00000000") {
            //             self.GlobalRankInfo = res.data;
            //             self.createGlobalRankLayer(self.GlobalRankInfo);
            //         }
            //     })

            // }
        }
        else {
            this.createGlobalRankLayer(this.GlobalRankInfo);
        }
    },
    //选择好友排行
    selectFriendRank() {
        Global.SoundModel.playEffect("button")
        if (this.mSelectStatus == 1) {
            return;
        }

        this.mSelectStatus = 1;
        this.tab[0].node.active = true;
        // this.tab[1].node.active = false;
        // this.tab[2].node.active = false;
        // this.tab[3].node.active = true;

        this.createFriendRankLayer();
    },

    init(obj) {
        this.ControlObj = obj;
        this.node.active = false;
    },

    createGameRank(data, flag, IsOver) {
        console.log('加载好友排行榜');
        this.node.zIndex = 6;
        this.node.active = true;
        this.GlobalRankInfo = data;
        this.mIsOverGame = IsOver;
        this.mSelectStatus = 0;
        this.selectFriendRank();
        // if (flag == 1) { //世界排行榜
        //     this.mSelectStatus = 1;
        //     this.selectGlobalRank(data);
        // }
        // else {
        //     this.mSelectStatus = 0;
        //     this.selectFriendRank();
        // }
    },
    createFriendRankLayer(shareTicket) {
        this.mSelfRankBg.active = false;
        this.mGlobalRankScollview.node.active = false;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            // this.ControlObj.loadmRank(0);
        } else {
            cc.log("排行榜: x1");
        }
    },


    createGlobalRankLayer(data) {
        this.mGlobalRankScollview.node.active = true;
        //this.mFriendRankNode.node.active = false;
        this.ControlObj.loadmRank(2);

        if (this.mViewContent) {
            this.mViewContent.removeAllChildren();
        }
        if (this.mCallback) {
            this.unschedule(this.mCallback);
            this.mCallback = null;
        }

        var index = 0;
        this.mCallback = function () {
            if (index < data.list.length) {
                let item = cc.instantiate(this.mRankView);
                item.getComponent('RankView').InitViewUI(this, data.list[index], index);
                this.mViewContent.addChild(item);
            }
            else {
                this.unschedule(this.mCallback);
                this.mCallback = null;
            }
            index += 1;
        }

        this.schedule(this.mCallback, 0.1);
        this.createSelfGlobalRank();
    },

    //关闭排行榜
    closeRankLayer() {
        Global.SoundModel.playEffect("button");
        this.node.active=false;
        // this.ControlObj.loadmRank(2);
        // this.node.active = false;
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        //     wx.postMessage({
        //         messageType: 0,
        //         MAIN_MENU_NUM: Global.rankKey,
        //     });
        // }

        // if (this.mIsOverGame) {
        //     this.ControlObj.loadmRank(3);
        // }

        // Global.LoginCtr.isShowRankLayer = false;
    },

    onDisable() {
        
    },

    createSelfGlobalRank() {
        // this.mSelfRankBg.active = true;
        this.mUserName.string = Global.GameModel.cutstr(Global.GameModel.nickname, 10);
        this.mRankSprite[0].node.active = false;
        this.mRankSprite[1].node.active = false;
        this.mRankSprite[2].node.active = false;
        this.mRankLabel.node.active = false;
        var rank = this.GlobalRankInfo.rank
        if (rank == 0 || rank > 100) {
            this.mRankLabel.node.active = true;
            this.mRankLabel.string = "100+";
        }
        else if (rank < 4) {
            this.mRankSprite[rank - 1].node.active = true;
        }
        else {
            this.mRankLabel.node.active = true;
            this.mRankLabel.string = rank;
        }

        //console.log("avatarUrl", Global.GameModel.avatarUrl);
        this.createImage(Global.GameModel.avatarUrl);
        this.mScore.string = Global.GameModel.UserScore;
    },

    createImage(avatarUrl) {
        if (window.wx !== undefined) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.mUserHeadIcon.spriteFrame = new cc.SpriteFrame(texture);
                        this.mUserHeadIcon.node.width = 72;
                        this.mUserHeadIcon.node.height = 72;

                    } catch (e) {
                        cc.log(e);
                        //this.avatarImgSprite.node.active = false;
                    }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
                //this.avatarImgSprite.node.active = false;
            }
        } else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                this.mUserHeadIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.mUserHeadIcon.node.width = 72;
                this.mUserHeadIcon.node.height = 72;
            });
        }
    },

    shareClick() {
        Global.LoginCtr.openShare();
    }


    // update (dt) {},
});
