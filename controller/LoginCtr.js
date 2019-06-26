/*
 * @Author: chenging
 * @file: 拆分后为login场景
 * @Date: 2019-05-06 17:49:31
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-20 11:37:02
 */
import Global from './Global';
import Modal from './Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        mYanhuaNode1: require('yanhua'), //烟花节点
        mGoAppid: cc.Node, //跳转小程序节点
        appidList: cc.Node, //跳转列表
        appidItem: cc.Prefab, //跳转item
        mSuggestion: cc.ScrollView, //猜你喜欢节点
        suggestionContent: cc.Node,
        mUserMoney: cc.Label,
        mUserScore: cc.Label,
        mUserRank: cc.Label,
        // mUserScoreGame: cc.Label,
        mNewGiftBtn: cc.Button,
        mInviteGiftBtn: cc.Button,
        mTipLayer: cc.Node,
        mStartNode: cc.Node,
        myHighestRecordLayer: cc.Node,
        _isShare: null,
        signCountTime: cc.Label, //每日礼包倒计时
        mStar: cc.Prefab,
        tStarAni: {
            type: cc.Prefab,
            default: [],
        },
        tYanhuaAni: {
            type: cc.Prefab,
            default: [],
        },
        tScoreLabel: cc.Prefab,
        tStarAni1: {
            type: cc.Prefab,
            default: [],
        },
        allSprite: {
            type: cc.SpriteFrame,
            default: [],
        },
        allJson: {
            type: cc.JsonAsset,
            default: [],
        },
        // AdNode: {
        //     type: cc.Node,
        //     default: null
        // }, //广告模块
    },
    mNewGiftLayer: null,
    time: 0,
    cb: null,
    isClick: false,
    _isLgoin: false, //判断是否登录
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        let self = this;
        Global.rankKey = 'RankStar2';
        // this.mNewGiftLayer.init(this);
        this.mNewGiftBtn.node.active = false;
        this.myHighestRecordLayer.active = false;

        this.mTipLayer.active = false;

        this.mInviteGiftBtn.node.active = true;

        this.mYanhuaNode1.init(this);


        this.mGoAppid.active = true;

        this.mSuggestion.node.active = false;
        Global.GameModel.mRecordStarInfo = null;
        Global.getlocalStorage('starInfo', res => {
            if (res) {
                if (res == 'false') {
                    Global.GameModel.mRecordStarInfo = null;
                } else {
                    Global.GameModel.mRecordStarInfo = JSON.parse(res);
                }
            }
        });

        Global.GameModel.mCurSelectMaxIndex = null;
        Global.getlocalStorage('selectMaxRecodeIndex', res => {
            if (res) {
                if (res == 'false') {
                    Global.GameModel.mCurSelectMaxIndex = null;
                } else {
                    Global.GameModel.mCurSelectMaxIndex = JSON.parse(res);
                }
            }
        });

        Global.myHighestRecordData = [];
        Global.getlocalStorage('myHighestRecordData', res => {
            if (!res) {
                Global.myHighestRecordData = [];
                Global.setlocalStorage(
                    'myHighestRecordData',
                    JSON.stringify(Global.myHighestRecordData)
                );
            } else {
                Global.myHighestRecordData = JSON.parse(res);
                // console.log('最高纪录', Global.myHighestRecordData);
            }
        });

        Global.GameModel.mRecordGameScore = 0;
        Global.getlocalStorage('gameScore', res => {
            if (res) {
                Global.GameModel.mRecordGameScore = parseInt(res);
            }
        });

        Global.GameModel.mRecordGameLevel = 0;
        Global.getlocalStorage('gameLevel', res => {
            if (res) {
                Global.GameModel.mRecordGameLevel = parseInt(res);
            }
        });

        if (localStorage.getItem('shareFist')) {
            let shareFist = JSON.parse(localStorage.getItem('shareFist'));
            if ((new Date().getTime() - shareFist.time) / 1000 >= 24 * 60 * 60) {
                Global.shareFirst = 1;
                let data = {
                    time: new Date().getTime(),
                    fist: 1,
                };
                localStorage.setItem('shareFist', JSON.stringify(data));
            } else {
                Global.shareFirst = Number(shareFist.fist);
            }
        }

        //let shareTitleArry = Global.GameModel.ShareData.data;
        //显示右上角转发按钮,并监听转发
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.showShareMenu({
                withShareTicket: true,
            });
            let obj = Global.getShareTitle();
            wx.aldOnShareAppMessage(() => {
                return {
                    title: obj.title,
                    imageUrl: obj.imgUrl,
                    query: '',
                };
            });
        }

        // this.mUserMoney.string = 0;
        this.mUserScore.string = 0;
        this.mUserRank.string = 0;
        Global.getlocalStorage('shareQunData', key => {
            if (!key) {
                Global.shareQunData.time = new Date(
                    new Date().setHours(0, 0, 0, 0)
                ).getTime();
                Global.shareQunData.shareTicketsList = [];
                Global.setlocalStorage(
                    'shareQunData',
                    JSON.stringify(Global.shareQunData)
                );
            } else {
                Global.shareQunData = JSON.parse(key);
                let nowTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
                if (Global.shareQunData.time) {
                    if (
                        Math.abs(Global.shareQunData.time - nowTime) >=
                        24 * 3600000
                    ) {
                        Global.shareQunData.time = nowTime;
                        Global.shareQunData.shareTicketsList = [];
                        Global.setlocalStorage(
                            'shareQunData',
                            JSON.stringify(Global.shareQunData)
                        );
                    }
                } else {
                    Global.shareQunData.time = new Date(
                        new Date().setHours(0, 0, 0, 0)
                    ).getTime();
                    Global.shareQunData.shareTicketsList = [];
                    Global.setlocalStorage(
                        'shareQunData',
                        JSON.stringify(Global.shareQunData)
                    );
                }
            }
        });

        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            Global.GameModel.Money = 0;
            this.updateLoginUI();
        }

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getSystemInfo({
                success: function (res) {
                    Global.GameModel.mSelfPhoneModel = res.model;
                },
            });
        }

        this.isShowInviteGifrLayer = false;
        this.isShowRankLayer = false;
        //增加星星节点
        let moneyNode = this.mUserMoney.node.parent;
        Global.moneyPos = cc.v2(moneyNode.x, moneyNode.y);
        this.originControl();
        //初始化道具及游戏数据
        Global.GameModel.tPropInfo = [1, 1, 1, 1];
        Global.GameModel.init();
        //加载游戏场景
        cc.director.preloadScene('newGame', () => {

        })
    },
    //原先control.js内容
    originControl() {
        let self = this;
        Global.GameModel.tResourcePic = this.allSprite;


        //加载星星的数据信息
        // cc.loader.loadRes("gameConfig", cc.RawAsset, function (err, res) {
        //     if (!err) {
        Global.GameModel.setGameData(this.allJson[0].json);
        //     }
        // });

        //加载手机型号
        // cc.loader.loadRes("gameModel", cc.RawAsset, function (err, res) {
        //     if (!err) {
        Global.GameModel.tPhoneModel = this.allJson[1].json;
        // }
        // });

        if (Global.tStarAniObj.length <= 0) {
            for (var i = 0; i < this.tStarAni.length; i++) {
                Global.tStarAniObj[i] = new cc.NodePool();
                for (var j = 0; j < 30; j++) {
                    var obj = cc.instantiate(this.tStarAni[i]);
                    Global.tStarAniObj[i].put(obj);
                }
            }
        }

        if (Global.tStarAniObj1.length <= 0) {
            for (var i = 0; i < this.tStarAni1.length; i++) {
                Global.tStarAniObj1[i] = new cc.NodePool();
                for (var j = 0; j < 30; j++) {
                    var obj = cc.instantiate(this.tStarAni1[i]);
                    Global.tStarAniObj1[i].put(obj);
                }
            }
        }

        if (Global.tYanhuaAniObj.length <= 0) {
            for (var i = 0; i < this.tYanhuaAni.length; i++) {
                Global.tYanhuaAniObj[i] = new cc.NodePool();
                for (var j = 0; j < 10; j++) {
                    var obj = cc.instantiate(this.tYanhuaAni[i]);
                    Global.tYanhuaAniObj[i].put(obj);
                }
            }
        }

        //初始化玩家
        if (Global.tStarObj == null) {
            Global.tStarObj = new cc.NodePool();
        }
        for (var j = 0; j < 100; j++) {
            var obj = cc.instantiate(this.mStar);
            Global.tStarObj.put(obj);
        }

        if (Global.tScoreObj == null) {
            Global.tScoreObj = new cc.NodePool();
        }
        for (var j = 0; j < 50; j++) {
            var obj = cc.instantiate(this.tScoreLabel);
            Global.tScoreObj.put(obj);
        }

        if (Global.tTotalScoreObj == null) {
            Global.tTotalScoreObj = new cc.NodePool();
        }
        for (var j = 0; j < 30; j++) {
            var obj = cc.instantiate(this.tScoreLabel);
            Global.tTotalScoreObj.put(obj);
        }

        Global.getlocalStorage('maxScore', res => {
            if (res) {
                Global.GameModel.MaxScore = parseInt(res);
            } else {
                Global.GameModel.MaxScore = 0;
            }
        });

        Global.IsNewUser = [false, false];
        Global.getlocalStorage('newUser', res => {
            if (res) {
                Global.IsNewUser = JSON.parse(res);
            }
        });


        // self.list['RankLayer'] = self.mRankManager;
        // self.mGameCtr.init(self);
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (typeof wx.getUpdateManager === 'function') {
                const updateManager = wx.getUpdateManager();

                updateManager.onCheckForUpdate(function (res) {
                    // 请求完新版本信息的回调

                    console.log('请求版本信息   ', res.hasUpdate);
                });

                updateManager.onUpdateReady(function () {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    console.log('新的版本已经下载好   ');
                    updateManager.applyUpdate();
                });

                updateManager.onUpdateFailed(function () {
                    console.log('新的版本下载失败   ');
                    // 新的版本下载失败
                });
            }
        }
    },
    update(dt) {
        if (Global.isUpdateStar) {
            this.updateUserMoney();
            Global.isUpdateStar = false;
        }
        this.getSignTime();
    },
    //计算是否可以继续领取每日奖励
    getSignTime() {
        let signTime = Global.getLocalStorageSync('signTime');
        let curTime = new Date().getTime();
        let resetTime = 60 * 60 * 1000;
        if (!signTime || curTime - signTime - resetTime > 0) {
            this.signCountTime.string = `可领取`;
            return true;
        } else {
            let counTime = signTime - curTime + resetTime;
            let h = parseInt(counTime / 3600 / 1000);
            h = h > 9 ? h : '0' + h;
            let m = parseInt((counTime - h * 3600 * 1000) / 60 / 1000);
            m = m > 9 ? m : '0' + m;
            let s = parseInt((counTime - h * 3600 * 1000 - m * 60 * 1000) / 1000);
            s = s > 9 ? s : '0' + s;
            this.signCountTime.string = `${h}:${m}:${s}`;
        }
    },
    exitMini() {
        wx.exitMiniProgram({
            success: res => {

            }
        })
    },
    onEnable() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.hideBannerAD();
            //用户登录后页面重新显示才重新加载广告
            if (this._isLgoin) {
                this.getAppExchangeList(4, this.appidList);
            }
        } else {
            this.getAppExchangeList(4, this.appidList);
        }
    },

    // onDisable() {
    //   if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    //     wx.offShow(this.onShow);
    //   }
    // },

    init(obj) {
        this.ControlObj = obj;
        this.node.active = true;
        this.node.zIndex = 1;
    },

    start() {
        let self = this;
        this.mYanhuaNode1.startPlay();
        Global.GameModel.GameStatus = 0;
        this.isReLogin = false;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //登录
            Global.source_app_id = wx.getLaunchOptionsSync().referrerInfo.appId || ''; //获取来源appid
            Global.api.login(Global.source_app_id, () => {
                this.updateUserMoney();
                this._isLgoin = true;
                this.getAppExchangeList(4, this.appidList);
                //判断是否显示每日签到
                if (this.getSignTime()) {
                    Modal.getInstance().getModalController('dayGift', (script) => {
                        script.openDayGift(this.getSignTime());
                    })
                }

                //渠道来源统计
                let info = JSON.parse(wx.getStorageSync('originInfo'));
                if (info.query['?qdw'] || info.query['qdw']) {
                    let options = {
                        source_app_id: info.referrerInfo.appId,
                        open_id: Global.getLocalStorageSync('open_id'),
                        qdw: this.getChannelParams(info.query)
                    }
                    Global.api.channelOriginStatistics(options, (res) => {
                        Global.setLocalStorageSync('originInfo', null);
                    })
                }

            });
            wx.onShow((res) => {
                self.onShows(res);
            });
        } else {
            Global.IsShowShare = true;
            this.updateLoginUI();
        }
    },
    //获取渠道参数
    getChannelParams(query) {
        if (query['?qdw']) {
            return query['?qdw'];
        }
        if (query['qdw']) {
            return query['qdw'];
        }
    },
    login() {
        return;
    },
    getLaunch() {
        let launchData = wx.getLaunchOptionsSync();
        if (launchData) {
            if (launchData.shareTicket) {
                this.showQunLeaderboard(launchData.shareTicket);
            }

            if (launchData.query) {
                console.log('query1:', launchData.query);
                //launchData.query = {"shareUserId":"55221446"};
                this.inviteNewUserSccess(launchData.query);
            } else {
                this.getUserInfoFunc();
            }
        } else {
            this.getUserInfoFunc();
        }
    },

    //显示群排行榜
    showQunLeaderboard(shareTicket) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let self = this;
            Global.getlocalStorage('lookQun', res => {
                if (res !== 'true') return;
                Global.setlocalStorage('lookQun', 'false');
                //self.mRankLayer.node.active = true;
                Global.log('showQunLeaderboard:', shareTicket);
                //self.mRankLayer.createGameRank(null,shareTicket);
                //this.mShareCanvas.node.active = true;
                //this.mShareCanvas.setType(0);

                // 发消息给子域
                // window.wx.postMessage({
                //     messageType: 5,
                //     MAIN_MENU_NUM: Global.rankKey,
                //     shareTicket: shareTicket
                // });
            });
        } else {
            Global.log('获取好友排行榜数据。x1');
        }
    },

    //邀请新玩家成功
    inviteNewUserSccess(query, isLogin) {
        if (JSON.stringify(query) === '{}') {
            if (isLogin == null) {
                this.getUserInfoFunc();
            }

            return;
        }
        let mIsLogin = isLogin;
        console.log('query2:', query);
        let self = this;
        if (query.shareUserId) {
            let shareUserId = query.shareUserId;
            if (shareUserId == Global.userInfo.userid) {
                self.getUserInfoFunc();
                return;
            }
            console.log('query3:', shareUserId);
            Global.api.sendInviteInfo({
                    shareUserId: shareUserId || '',
                    clickUserId: Global.userInfo.userid || '',
                    token: Global.userInfo.token || '',
                },
                res => {
                    if (res.data.tagcode == '00000000') {
                        console.log('inviteNewUserSccess:', res.data);
                        //self.ControlObj.mRankManager.createGameRank(res.data, 1);
                    }

                    if (mIsLogin == null) {
                        self.getUserInfoFunc();
                    }
                }
            );
        } else {
            if (mIsLogin == null) {
                self.getUserInfoFunc();
            }
        }
    },

    getUserInfoFunc(cb) {
        let self = this;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            Global.api.getUserInfo({
                    userid: Global.userInfo.userid || '',
                    token: Global.userInfo.token || '',
                },
                res2 => {
                    console.log('api.getUserInfo111:', res2);
                    Global.GameModel.Money = parseInt(res2.data.total_coin);
                    Global.GameModel.UserScore = parseInt(res2.data.max_score);
                    Global.GameModel.MaxGuanka = parseInt(res2.data.max_guanka);
                    Global.GameModel.nickname = res2.data.nickname;
                    Global.GameModel.avatarUrl = res2.data.avatar_url;
                    Global.GameModel.mUserRank = parseInt(res2.data.rank);
                    Global.GameModel.isHaveNewGift = parseInt(res2.data.new_gift_get);
                    Global.GameModel.isHaveTodayGift = parseInt(
                        res2.data.today_gift_get
                    );
                    if (Global.GameModel.UserScore < 10000) {
                        Global.GameModel.isHaveTodayGift = 1;
                    }
                    Global.SoundModel.playEffect('Home');
                    self.updateUserInfo();
                    Global.GameModel.loginSuc = true;
                    // if (Global.GameModel.loadGameSuc) {
                    Global.hideLoading();
                    // }

                    self.bCanLogin = false;
                    self.cckGetFlag();
                    self.mYanhuaNode1.startPlay();
                    //self.loadMoreGameInfo();

                    if (typeof cb == 'function' && cb) cb();
                    self.checkNeedUserInfo(function () {
                        if (Global.isNeedShowgetUserInfoButton) {
                            Global.getUserInfoButton.show();
                        } else {
                            Global.getUserInfoButton.hide();
                        }
                        //检查0分直接进游戏
                        if (Global.GameModel.UserScore === 0) {
                            self.directAccessToTheGame();
                            Global.getUserInfoButton.hide();
                        } else {}
                    });
                }
            );
        }
    },

    checkNeedUserInfo(cb) {
        wx.getSetting({
            success: function (res) {
                let authSetting = res.authSetting;
                if (authSetting['scope.userInfo'] === true) {
                    // 用户已授权，可以直接调用相关 API
                    Global.isNeedShowgetUserInfoButton = false;
                } else if (authSetting['scope.userInfo'] === false) {
                    // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
                    // wx.showToast({
                    //   title: "请点击右上角菜单->关于（疯狂消星星）->右上角菜单->设置 打开授权开关",
                    //   icon: 'none',
                    //   duration: 5000
                    // });
                    Global.isNeedShowgetUserInfoButton = true;
                } else {
                    Global.isNeedShowgetUserInfoButton = true;
                }
                if (cb) cb();
            },
        });
    },

    updateLoginUI() {
        if (Global.IsShowShare == false) {
            this.mNewGiftBtn.node.active = false;
            this.mInviteGiftBtn.node.active = false;
            this.node.getChildByName('ShareBtn').active = false;
            return;
        }

        this.mInviteGiftBtn.node.active = true;

        if (Global.GameModel.isHaveNewGift == 0) {
            // this.mNewGiftBtn.node.active = true;
        } else {
            this.mNewGiftBtn.node.active = false;
        }


        this.mNewGiftBtn.node.runAction(this.huxiPropAni());
        // this.mInviteGiftBtn.node.runAction(this.huxiPropAni());
    },

    /**
     *更新玩家信息
     *@author wh
     *@param data:服务器的数据
     *@return
     */
    updateUserInfo() {
        this.mUserMoney.string = Global.GameModel.Money;
        this.mUserScore.string = Global.GameModel.UserScore;
        this.mUserRank.string = Global.GameModel.mUserRank;
    },

    //更新玩家的星星
    updateUserMoney() {
        this.mUserMoney.string = Global.GameModel.Money;
    },
    //点击开始游戏后，统一执行的方法
    ClickstartGame() {
        this.mSuggestion.node.active = false;
        var action1 = cc.blink(1, 5);
        //动作执行后回调
        var backCall = cc.callFunc(function () {
            // this.node.active = false
            this.mFlag = false;
            this.mYanhuaNode1.clearYanhu();
            Global.gameType = 'normal';
            cc.director.loadScene('newGame');
        }, this);
        var action = cc.sequence(action1, backCall);
        this.mStartNode.runAction(action);
        if (Global.getUserInfoButton) {
            Global.getUserInfoButton.hide();
        }
    },
    //直接进游戏
    directAccessToTheGame() {
        Global.carom_share = Number(Global.numConf.carom_share);
        Global.box_share = Number(Global.numConf.box_share);
        Global.tips_share = Number(Global.numConf.tips_share);
        Global.again_share = Number(Global.numConf.again_share);
        Global.Resurrection_share = Number(
            Global.numConf.Resurrection_share
        );
        Global.setNumConf();
        this.mFlag = false;
        this.mYanhuaNode1.clearYanhu();
        Global.gameType = 'normal';
        cc.director.loadScene('newGame');
    },

    //开始游戏
    startGame() {
        if (this.mFlag) {
            return;
        }
        this.mFlag = true;
        Global.SoundModel.playEffect('button');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击开始游戏按钮');
        }
        if (Global.GameModel.mRecordGameScore > 0) {
            this.mTipLayer.active = true;
            this.mTipLayer.setScale(0);
            var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
            var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
            this.mTipLayer.runAction(cc.sequence(action1, action2));
        } else {
            Global.GameModel.mRecordStarInfo = null;
            Global.GameModel.mRecordGameLevel = 0;
            Global.GameModel.mRecordGameScore = 0;
            Global.carom_share = Number(Global.numConf.carom_share);
            Global.box_share = Number(Global.numConf.box_share);
            Global.tips_share = Number(Global.numConf.tips_share);
            Global.again_share = Number(Global.numConf.again_share);
            Global.Resurrection_share = Number(
                Global.numConf.Resurrection_share
            );
            Global.setNumConf();
            //Global.setlocalStorage("canGetJieSuanReward", true);
            Global.GameModel.mCurSelectMaxIndex = null;
            Global.setlocalStorage('selectMaxRecodeIndex', 'false');
            this.ClickstartGame();
        }
    },
    closeTipLayer() {
        this.mFlag = false;
        this.mTipLayer.active = false;
    },
    //重新开始游戏
    RestartGame() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「开始游戏-重新开始按钮」');
        }
        Global.SoundModel.playEffect('button');
        this.mTipLayer.active = false;
        Global.GameModel.mRecordStarInfo = null;
        Global.GameModel.mRecordGameLevel = 0;
        Global.GameModel.mRecordGameScore = 0;
        Global.carom_share = Number(Global.numConf.carom_share);
        Global.box_share = Number(Global.numConf.box_share);
        Global.tips_share = Number(Global.numConf.tips_share);
        Global.again_share = Number(Global.numConf.again_share);
        Global.Resurrection_share = Number(
            Global.numConf.Resurrection_share
        );
        Global.setNumConf();
        Global.GameModel.mCurSelectMaxIndex = null;
        Global.setlocalStorage('selectMaxRecodeIndex', 'false');
        this.ClickstartGame();
    },
    //继续游戏
    ContinueGame() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「开始游戏-继续游戏按钮」');
        }
        Global.SoundModel.playEffect('button');
        this.mTipLayer.active = false;
        Global.isFirstStartGame = true;
        this.ClickstartGame();
    },
    //打开设置
    openSetting() {
        Global.SoundModel.playEffect('button');
        Modal.getInstance().getModalController('setting', (script) => {
            script.OpenSettingUI(true);
        })
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击音效按钮');
        }
    },
    //打开星星商店
    openStarSjop() {
        Global.SoundModel.playEffect('button');
        Modal.getInstance().getModalController('starShop', (script) => {
            script.openStarShop('login');
        })
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击星星商店按钮');
        }
    },
    //打开话费兑换为星星弹框
    openExchangeStarBox(e) {
        Global.SoundModel.playEffect('button');
        Modal.getInstance().getModalController('billTelephone', (script) => {
            script.showExchangeView(e);
        })
    },
    //点击签到按钮,打开每日奖励
    clickSign() {
        Global.SoundModel.playEffect('button');
        Modal.getInstance().getModalController('dayGift', (script) => {
            script.openDayGift(this.getSignTime());
        })
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-每日奖励按钮」');
        }
    },

    //免费星星修正为分享领取奖励
    shareToFriend() {
        let obj = Global.getShareTitle();
        let shareInfo = {
            title: obj.title,
            imageUrl: obj.imgUrl,
        };
        wx.aldShareAppMessage(shareInfo);
        //分享完直接发放奖励
        Global.GameModel.Money += 10;
        Modal.getInstance().getModalController('getRewardEffect', (script) => {
            script.showReardAniUI(10, Global.GameModel.Money);
        })
    },
    //点击福利按钮，播放视频广告（看完即可获得分数增加200）
    clickWelfare() {
        if (this.isClick) return;
        this.isClick = true;
        let self = this;
        let randomNum = Math.floor(Math.random() * 100);
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-免费星星按钮」');
            if (randomNum > 50) {
                this.shareToFriend();
                this.isClick = false;
            } else {
                wx.showToast({
                    title: '视频加载中，请稍后...',
                    icon: 'none',
                    duration: 2000,
                });
                let videoAd;
                wx.getNetworkType({
                    success: function (result) {
                        // 返回网络类型, 有效值：
                        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                        var networkType = result.networkType;
                        if (networkType == 'none') {
                            wx.showModal({
                                title: '提示',
                                content: '您的网络已断开，请确保网络正常。',
                                success: function (res) {},
                            });
                            self.isClick = false;
                        } else {
                            videoAd = wx.createRewardedVideoAd({
                                adUnitId: 'adunit-515c075499abc5d2',
                            });

                            videoAd
                                .load()
                                .then(() => {
                                    console.log('视频广告显示正常', videoAd.show());
                                    wx.aldSendEvent('视频正常显示');
                                })
                                .catch(err => {
                                    self.isClick = false;
                                    self.openShare();
                                    wx.aldSendEvent('视频加载出错', {
                                        '出错原因': err,
                                    });
                                });

                            videoAd.onClose(videoClose);

                            function videoClose(res) {
                                self.isClick = false;
                                videoAd.offClose(videoClose);
                                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                                let version = false;
                                if (wx.getSystemInfoSync().SDKVersion >= '2.1.0') {
                                    version = true;
                                } else {
                                    version = false;
                                }

                                if (version) {
                                    if ((res && res.isEnded) || res === undefined) {
                                        wx.aldSendEvent('用户看完视频');
                                        Global.GameModel.Money += 10;
                                        Modal.getInstance().getModalController('getRewardEffect', (script) => {
                                            script.showReardAniUI(10, Global.GameModel.Money);
                                        })
                                    } else {
                                        //self.close();
                                        wx.aldSendEvent('用户未看完视频');
                                        wx.showToast({
                                            title: '您未观看完视频，无法获得奖励',
                                            icon: 'none',
                                            duration: 2000,
                                        });
                                        // 播放中途退出，不下发游戏奖励
                                    }
                                } else {
                                    Global.GameModel.Money += 10;
                                    Modal.getInstance().getModalController('getRewardEffect', (script) => {
                                        script.showReardAniUI(10, Global.GameModel.Money);
                                    })
                                }
                            }
                        }
                    },
                });
            }


        } else {
            Global.GameModel.Money += 10;
            Modal.getInstance().getModalController('getRewardEffect', (script) => {
                script.showReardAniUI(10, Global.GameModel.Money);
                this.isClick = false;
            })
        }
    },
    //打开新手礼包
    openNewGiftLayer() {
        Global.SoundModel.playEffect('button');
        this.loadmNewGiftLayer();
    },
    //分享
    openShare() {
        Global.SoundModel.playEffect('button');
        // let path = Global.GameModel.getRandomSharePic();
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let self = this;
            let obj = Global.getShareTitle();
            wx.aldShareAppMessage({
                title: obj.title,
                imageUrl: obj.imgUrl,
                ald_desc: '普通分享',
                query: '',
            });
            this._isShare = true;
        }
    },
    //打开排行榜
    openRank() {
        console.log('排行榜');
    },

    openFriendRank() {
        let self = this;
        if (this.isShowRankLayer || this.isShowInviteGifrLayer) return;

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            Global.api.getRankInfo({
                    userid: Global.userInfo.userid || '',
                    token: Global.userInfo.token || '',
                },
                res => {
                    if (res.data.tagcode == '00000000') {
                        console.log('RankUserInfo:', res.data);
                        self.isShowRankLayer = true;
                        self.ControlObj.loadmRankManager(res.data, 0);
                        self.ControlObj.mRankManager.createGameRank(res.data, 1);
                    }
                }
            );
        } else {
            self.isShowRankLayer = true;
            self.ControlObj.loadmRankManager(null, 0);
            this.ControlObj.mRankManager.createGameRank(null, 1);
        }
        this.hideBannerAD();
    },

    openInviteGift() {
        console.log('点击分享');
        Global.SoundModel.playEffect('button');
        if (this.isShowInviteGifrLayer || this.isShowRankLayer) return;

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.openShare();
        } else {
            //this.ControlObj.mRankManager.createGameRank(null, 1);
        }
        //this.ControlObj.mGameCtr.mGameOver.updateOverUI();
    },

    //显示道具的呼吸效果
    huxiPropAni() {
        var action1 = cc.scaleTo(0.5, 0.8);
        var action2 = cc.scaleTo(0.5, 1);
        return cc.repeatForever(cc.sequence(action1, action2));
    },

    sendGameScore: function (score) {
        Global.SoundModel.playEffect('button');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.moreGameClick();
        }
    },


    cckGetFlag() {
        console.log('cckGetFlag');
        let self = this;

        Global.IsShowSuggest = true;

        let nowTime = new Date().getHours();
        let link_time = openStatus.link_time.split('-');
        console.log('nowTime:', nowTime);
        console.log('link_time:', link_time);
    },

    loadMoreGameInfo() {},
    loadSuggestList(isFist = false) {
        //获取猜你喜欢列表
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {}
    },
    moreGameClick() {
        let self = this;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getSystemInfo({
                success: function (res) {
                    let version = res.SDKVersion;
                    version = version.replace(/\./g, '');
                    console.log(version);
                    if (parseInt(version) >= 220) {
                        wx.navigateToMiniProgram({
                            appId: Global.moreGameInfo.appid,
                            path: Global.moreGameInfo.page,
                            extraData: '',
                            success: res => {
                                console.log('打开其他小程序成功', res);
                            },
                            fail: res => {
                                console.log('打开其他小程序失败', res);
                            },
                        });
                    } else {
                        wx.previewImage({
                            urls: [Global.moreGameInfo.ad_image],
                            success: res => {
                                if (res) {}
                            },
                        });
                    }
                    self.loadMoreGameInfo();
                },
            });
        }
    },
    iconClick(obj, custom) {
        console.log('iconClick:' + custom);
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            console.log('iconClick data:', Global.SuggestList1[custom - 1]);
            // this.loadSuggestList();
        }
    },
    iconClick1(obj, custom) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            console.log('iconClick1:' + custom);
            console.log('iconClick1 data:', Global.SuggestList[custom - 1]);
        }
    },
    loadAvatarImage(avatarUrl, sprite) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        sprite.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                    }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
            }
        } else {
            cc.loader.load({
                    url: avatarUrl,
                    type: 'jpg',
                },
                (err, texture) => {
                    sprite.spriteFrame = new cc.SpriteFrame(texture);
                }
            );
        }
    },
    hideBannerAD: function () {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if (Global.bannerAd) {
                Global.bannerAd.hide();
            }
        }
    },

    //分段加载
    loadmNewGiftLayer() {
        let self = this;
        if (self.mNewGiftLayer) {
            self.mNewGiftLayer.openNewGift();
        } else {
            cc.loader.loadRes(`prefab/NewGiftLayer`, cc.Prefab, function (
                error,
                prefab
            ) {
                let panel = cc.instantiate(prefab);
                self.mNewGiftLayer = panel.getComponent('NewGift');
                self.mNewGiftLayer.node.parent = self.node;
                self.mNewGiftLayer.init(self);
                self.mNewGiftLayer.openNewGift();
            });
        }
    },
    //显示我的游戏最高记录
    showMyHighestRecord() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-最高纪录」');
        }
        Global.SoundModel.playEffect('button');
        if (Global.myHighestRecordData.length) {
            this.myHighestRecordLayer.getChildByName('kk_0').active = false;
            this.myHighestRecordLayer.getChildByName('kk_1').active = false;
            this.myHighestRecordLayer.getChildByName('kk_2').active = false;
            for (let i = 0; i < Global.myHighestRecordData.length; i++) {
                if (i > 2) break;
                this.myHighestRecordLayer.getChildByName('kk_' + i).active = true;
                this.myHighestRecordLayer
                    .getChildByName('kk_' + i)
                    .getChildByName('levelLabel')
                    .getComponent('cc.Label').string =
                    '   关卡:' + (Global.myHighestRecordData[i].levelNum + 1);
                this.myHighestRecordLayer
                    .getChildByName('kk_' + i)
                    .getChildByName('scoreLabel')
                    .getComponent('cc.Label').string =
                    '   分数:' + Global.myHighestRecordData[i].score;
            }
            this.myHighestRecordLayer.getChildByName('emptyTipLabel').active = false;
        } else {
            this.myHighestRecordLayer.getChildByName('kk_0').active = false;
            this.myHighestRecordLayer.getChildByName('kk_1').active = false;
            this.myHighestRecordLayer.getChildByName('kk_2').active = false;
            this.myHighestRecordLayer.getChildByName('emptyTipLabel').active = true;
        }
        this.myHighestRecordLayer.active = true;
        this._isClickLookVideo = false;
    },
    hdieMyHighestRecord() {
        this.myHighestRecordLayer.active = false;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-最高纪录-关闭按钮」');
        }
    },
    //从最高记录继续游戏
    continueRecord(obj, type) {
        cc.log('continueRecord type:' + type);
        let self = this;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-最高纪录-继续挑战按钮」');
        }
        if (this._isClickLookVideo) return;
        this._isClickLookVideo = true;
        this.continueRecordAD(() => {
            if (Global.myHighestRecordData[type]) {
                Global.GameModel.mRecordGameLevel =
                    Global.myHighestRecordData[type].levelNum;
                Global.GameModel.mRecordGameScore =
                    Global.myHighestRecordData[type].lastScore;
                Global.GameModel.mRecordStarInfo = null;
                //Global.setlocalStorage("canGetJieSuanReward", false);
                Global.GameModel.mCurSelectMaxIndex = type;
                Global.setlocalStorage(
                    'selectMaxRecodeIndex',
                    Global.GameModel.mCurSelectMaxIndex
                );
                self.ClickstartGame();
                self.hdieMyHighestRecord();
            }
        });
    },

    onShows(res) {
        let self = this;
        if (!this._isShare) {
            return;
        }
        this._isShare = null;

        if (self.node.active == false) {
            return;
        }

        if (res.shareTicket) {
            self.showQunLeaderboard(res.shareTicket);
        } else if (res.query) {
            self.inviteNewUserSccess(res.query, true);
        }
        let time = (new Date().getTime() - self.time) / 1000;
        let random = [`请尝试邀请更多好友来玩嘛`, `请不要频繁分享到同一个地方`];
        self._isClickLookVideo = false;
        if (self.time <= 0) {
            return;
        }
        if (time < Global.shareTime) {
            wx.showToast({
                title: '好东西要和群友分享哦',
                icon: 'none',
                duration: 2000,
            });
            return;
        }
        if (Global.isback == 0 && !Global.shareFirst) {
            if (Math.random() <= Global.shareOne / 100) {
                Global.isback = 0;
                self.getDoubleSuc();
            } else {
                Global.isback += 1;
                wx.showToast({
                    title: random[Math.floor(Math.random() * random.length)],
                    icon: 'none',
                    duration: 2000,
                });
            }
        } else if (Global.isback == 1 && !Global.shareFirst) {
            if (Math.random() <= Global.shareTwo / 100) {
                Global.isback = 0;
                self.getDoubleSuc();
            } else {
                Global.isback += 1;
                wx.showToast({
                    title: random[Math.floor(Math.random() * random.length)],
                    icon: 'none',
                    duration: 2000,
                });
            }
        } else {
            Global.isback = 0;
            self.getDoubleSuc();
            if (Global.shareFirst) {
                Global.shareFirst = 0;
                let data = {
                    time: new Date().getTime(),
                    fist: 0,
                };
                localStorage.setItem('shareFist', JSON.stringify(data));
            }
        }
        self.time = 0;
        self.hideBannerAD();
    },

    getDoubleSuc() {
        if (this.cb) {
            this.cb();
            this.cb = null;
        }
    },

    continueRecordAD(cb) {
        //视频激励广告
        let self = this;
        self.cb = cb;
        if (this.isClick) return;
        self.isClick = true;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getNetworkType({
                success: function (result) {
                    // 返回网络类型, 有效值：
                    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                    var networkType = result.networkType;
                    if (networkType == 'none') {
                        wx.showModal({
                            title: '提示',
                            content: '您的网络已断开，请确保网络正常。',
                            success: function (res) {},
                        });
                        self.isClick = false;
                    } else {
                        let videoAd = wx.createRewardedVideoAd({
                            adUnitId: 'adunit-515c075499abc5d2',
                        });

                        videoAd
                            .load()
                            .then(() => {
                                console.log('视频广告显示正常', videoAd.show());
                                wx.aldSendEvent('视频正常显示');
                            })
                            .catch(err => {
                                self.isClick = false;
                                console.log('未正常显示视频', err);
                                wx.aldSendEvent('视频加载出错', {
                                    出错原因: err,
                                });
                                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                                    let obj = Global.getShareTitle();
                                    wx.updateShareMenu({
                                        withShareTicket: true,
                                        success: res => {
                                            let shareInfo = {
                                                title: obj.title,
                                                imageUrl: obj.imgUrl,
                                                ald_desc: '分享可以继续游戏',
                                                query: '',
                                            };
                                            self.time = new Date().getTime();
                                            wx.aldShareAppMessage(shareInfo);
                                        },
                                    });
                                } else {
                                    cb();
                                }
                            });
                        videoAd.onError((err) => {

                        })
                        videoAd.onClose(videoClose);

                        function videoClose(res) {
                            self.isClick = false;
                            videoAd.offClose(videoClose);
                            // 小于 2.1.0 的基础库版本，res 是一个 undefined
                            let version = false;
                            if (wx.getSystemInfoSync().SDKVersion >= '2.1.0') {
                                version = true;
                            } else {
                                version = false;
                            }

                            console.log('看看是什么    ', version);
                            if (version) {
                                if ((res && res.isEnded) || res === undefined) {
                                    wx.aldSendEvent('用户看完视频');
                                    if (typeof cb == 'function' && cb) cb();
                                    // 正常播放结束，可以下发游戏奖励
                                } else {
                                    wx.aldSendEvent('用户未看完视频');
                                    // 播放中途退出，不下发游戏奖励
                                }
                            } else {
                                if (typeof cb == 'function' && cb) cb();
                            }
                            self._isClickLookVideo = false;
                        }
                    }
                },
            });
        } else {
            if (typeof cb == 'function' && cb) cb();
        }
    },
    //猜你喜欢
    guessLike() {
        this.mSuggestion.node.active = true;
        this.mSuggestion.node.zIndex = 10;
        this.getAppExchangeList(4, this.suggestionContent);
    },
    //关闭猜你喜欢
    closeLike() {
        this.mSuggestion.node.active = false;
    },
    //获取换量小程序名单列表 id 广告id 
    getAppExchangeList(id, node) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let options = {
                app_id: 'wxd519b1e4deaed039',
                ad_id: id,
                open_id: Global.getLocalStorageSync('open_id')
            }
            Global.api.getConfigAdInfo(options, (res) => {
                if (res.code == 200 && res.result.ad_type == 3 && res.result.self.promotion.length > 0) {
                    Global.skeyid = res.result.self.skeyid;
                    Global.createAppidList(res.result.self.promotion, node, this.appidItem, id, true);
                } else {
                    //无广告或报错时加载自有广告
                    Global.skeyid = '';
                    // Global.loadOurAppidList(node, this.appidItem, id, true);
                }
            })
        } else {
            //非微信平台加载自有广告
            Global.loadOurAppidList(node, this.appidItem, id, true);
        }
    },

});