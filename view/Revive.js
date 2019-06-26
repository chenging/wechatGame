let revive;
import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        mTimeLabel: cc.Label,
        display: cc.WXSubContextView,
        mask: cc.Sprite,
        dt: 0,
        now_time: 10,
        countTime: 10,
        timer:null
    },
    
    isClick: false, //防重复点击
    _isPause: false,

    onLoad() {
        revive = this;
        //设置放弃复活按钮的位置
        this.node.getChildByName('an_gb_1').getComponent(cc.Widget).bottom = Global.bannerHeight;
    },

    start() {},

    init(obj) {
        this.mGameCtrObj = obj;
        this.node.active = false;
    },

    onEnable() {
        this.now_time = 10;
        this.countTime=10;
        this.dt = 0;
        this.mask.fillRange = 1;
        this.node.getChildByName('zi_10').y = -380;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onShow(this.onShow);
        }
    },

    onDisable() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.offShow(this.onShow);
        }
    },

    openReviveUI() {
        Global.SoundModel.playEffect('gameover');
        if (Global.Resurrection_share > 0) {

        } else {
            this.close();
            return;
        }
        this.node.active = true;
        Global.setBtnStyle(this.node, 'an_gb_6', 'video-live');
        Global.setGiveUpBtnPosition(this.node, 'an_gb_1');
        this.display.enabled = false;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.postMessage({
                messageType: 7,
            });

            let self = this;
            this.scheduleOnce(function () {
                self.display.update();
            }, 0.1);
        }
        clearInterval(this.timer);
        this.countTime=10;
        this._isPause=false;
        this.mTimeLabel.string = String(this.countTime);
        this.timer = setInterval(() => {
            if (!this._isPause) {
                if (this.countTime > 0) {
                    this.countTime -= 1;
                    this.mTimeLabel.string = String(this.countTime);
                } else {
                    this.countTime = 0;
                    clearInterval(this.timer);
                    this.close();
                }
            }
        }, 1000)

        this.isClick = false;
    },

    update(dt) {
        if (this.now_time > 0 && !this._isPause) {
            this.now_time -= dt;
            this.mask.fillRange = this.now_time / 10;
            this.dt += dt;
        }
    },

    close() {
        clearInterval(this.timer);
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击放弃复活');
        }

        var index = Global.GameModel.mCurSelectMaxIndex;
        Modal.getInstance().getModalController('gameOver', (script) => {
            script.updateOverUI(0);
        })
        Global.GameModel.mIsRevive = false;
        this.node.active = false;
    },

    ReviveAct() {
        this.openAct();
        this.node.stopAllActions();
        this.now_time = 0;
        // }
    },

    ActSuc() {
        // this.mGameCtrObj.openRun();
        this.node.active = false;
        this.node.stopAllActions();
        Global.GameModel.mIsRevive = true;
        // if(Global.bisReviveSendProp) {
        //   Global.GameModel.tPropInfo[1] += 1;
        //   Global.GameModel.tPropInfo[2] += 1;
        //   Global.GameModel.tPropInfo[3] += 1;
        //   Global.setlocalStorage("PropInfo", JSON.stringify(Global.GameModel.tPropInfo));
        // }
        this.mGameCtrObj.mGameOver.closeGameOver();
        this.mGameCtrObj.ReviveStartGame(Global.GameModel.mBeginScore, Global.GameModel.mBeginLevel);
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.showToast({
                title: '成功复活',
                icon: 'none',
                duration: 2000,
            });

        }
    },

    onShow() {
        let self = revive;
        if (self.time <= 0) {
            return;
        }
        let time = (new Date().getTime() - self.time) / 1000;
        let random = [`请尝试邀请更多好友来玩嘛`, `请不要频繁分享到同一个地方`];
        console.log('这个时间是多少   ', time);
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
    },

    getDoubleSuc() {
        Global.Resurrection_share -= 1;
        Global.setNumConf();
        this.ActSuc();
    },

    //视频广告
    openAct(callback) {
        let self = this;
        // if (this._isClickReward) return;
        let videoAd;
        let randk = Global.randombt(0, 99);
        self.time = new Date().getTime();
        let obj = Global.getShareTitle();
        let shareInfo = {
            title: obj.title,
            imageUrl: obj.imgUrl,
            ald_desc: '分享复活',
            query: '',
        };
        wx.aldShareAppMessage(shareInfo);
    },

    Revive() {
        console.log('修正为看视频免费复活');
        this._isPause = true;
        if (this.isClick) return;
        this.isClick = true;
        let self = this;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击免费复活');
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
                                Global.Resurrection_share += 1;
                                wx.aldSendEvent('视频正常显示');
                            })
                            .catch(err => {
                                self.isClick = false;
                                console.log('未正常显示视频', err);
                                wx.aldSendEvent('视频加载出错', {
                                    '出错原因': err,
                                });
                                self.time = new Date().getTime();
                                let obj = Global.getShareTitle();
                                let shareInfo = {
                                    title: obj.title,
                                    imageUrl: obj.imgUrl,
                                    ald_desc: '分享复活',
                                    query: '',
                                };
                                wx.aldShareAppMessage(shareInfo);
                            });
                        videoAd.onError((err) => {
                            self.openAct(()=>{})
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
                                    self.ReviveSuccess(Global.GameModel.Money);
                                    // 正常播放结束，可以下发游戏奖励
                                } else {
                                    self._isPause = false;
                                    wx.aldSendEvent('用户未看完视频');
                                    wx.showToast({
                                        title: '您未观看完视频，无法获得奖励',
                                        icon: 'none',
                                        duration: 2000,
                                    });
                                    // 播放中途退出，不下发游戏奖励
                                }
                            } else {
                                self.ReviveSuccess(Global.GameModel.Money);
                            }
                        }
                    }
                },
            });
        } else {
            this.ReviveSuccess(Global.GameModel.Money);
        }
    },
    //执行复活成功函数
    ReviveSuccess(money) {
        clearInterval(this.timer);
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.showToast({
                title: '恭喜成功复活',
                icon: 'none',
                duration: 2000,
            });
            wx.postMessage({
                messageType: 0,
                MAIN_MENU_NUM: Global.rankKey,
            });
        }
        this.node.active = false;
        this.node.stopAllActions();
        Global.GameModel.mIsRevive = true;
    },
    hideShareButton() {
        cc.log('hideShareButton', this.node);
        let self = this;
        this.node.getChildByName('an_gb_6').active = false;
        this.node.runAction(
            cc.sequence(
                cc.delayTime(2),
                cc.callFunc(() => {
                    self.node.getChildByName('an_gb_6').active = true;
                    cc.log('sssss');
                })
            )
        );
    },

    // update (dt) {},
});