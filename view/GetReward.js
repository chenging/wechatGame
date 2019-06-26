import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        tProp: {
            type: cc.Sprite,
            default: [],
        },

        tTips: {
            type: cc.Label,
            default: [],
        },
        mBg: cc.Sprite,
        _isTen: -1,
    },
    isTenNum: 0,
    isBoxNum: 0,
    time: 0,
    isClick: false, //防重复点击
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.active = false;
    },
    onEnable() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onShow(this.onShow);
        }
    },

    onDisable() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.offShow(this.onShow);
        }
    },

    ShowUI(isTen = 0) {
        Global.SoundModel.playEffect('reward-show');
        //设置放弃奖励按钮的位置
        Global.setBtnStyle(this.node.getChildByName('dk_1'), 'no-video', 'zi_1_1');
        Global.setGiveUpBtnPosition(this.node, 'an_gb');
        // 0 炸弹 1 转换 2 喷漆 3 闪电 -1 话费
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //微信平台由后台控制道具显示
            Global.api.getProps(res => {
                let index = this.getPropIndex(res.result.props_id);
                if (index < this.tProp.length) {
                    this._isTen = isTen;
                    if (isTen == 1) {
                        //十连礼包
                        this.node.getChildByName('dk_1').getChildByName('ziti_1').active = true;
                        this.node.getChildByName('dk_1').getChildByName('zi_11').active = false;
                        //修正为全部需要看视频
                        this.node.getChildByName('dk_1').getChildByName('zi_1_1').active = true;
                        this.node.getChildByName('dk_1').getChildByName('no-video').active = false;
                    } else {
                        //宝箱
                        this.node.getChildByName('dk_1').getChildByName('ziti_1').active = true;
                        //显示看视频的按钮，隐藏不看视频的按钮
                        this.node.getChildByName('dk_1').getChildByName('zi_1_1').active = true;
                        this.node.getChildByName('dk_1').getChildByName('no-video').active = false;
                        this.node.getChildByName('dk_1').getChildByName('zi_11').active = true;
                    }
                    this.node.active = true;
                    //显示道具弹框
                    this.mIndex = index;
                    for (var i = 0; i < this.tProp.length; i++) {
                        this.tProp[i].node.active = i == this.mIndex;
                        this.tTips[i].node.active = i == this.mIndex;
                    }
                } else {
                    this.node.active = false;
                    //根据广告类型判断显示话费弹框或banner广告弹框
                    if (res.result.ad_type == 1) {
                        //视频广告
                        Modal.getInstance().getModalController('billTelephone', (script) => {
                            script.showView('ejectNode');
                        })
                    } else if (res.result.ad_type == 2) {
                        //banner广告
                        Modal.getInstance().getModalController('billTelephone', (script) => {
                            script.showBannerNodeView();
                        })
                        //赋值点击次数
                        Global.clickTimes = Number(res.result.click_num);
                    } else {
                        //猜你喜欢
                    }
                    wx.aldSendEvent('游戏中获得充值卡');
                }
            });
        } else {
            //非微信平台直接随机
            let index = Math.floor(Math.random() * 5);
            console.log('随机的', index)
            if (index < this.tProp.length) {
                this._isTen = isTen;
                if (isTen == 1) {
                    //十连礼包
                    this.node.getChildByName('dk_1').getChildByName('ziti_1').active = true;
                    this.node.getChildByName('dk_1').getChildByName('zi_11').active = false;
                    //修正为全部需要看视频
                    this.node.getChildByName('dk_1').getChildByName('zi_1_1').active = true;
                    this.node.getChildByName('dk_1').getChildByName('no-video').active = false;
                } else {
                    //宝箱
                    this.node.getChildByName('dk_1').getChildByName('ziti_1').active = true;
                    //显示看视频的按钮，隐藏不看视频的按钮
                    this.node.getChildByName('dk_1').getChildByName('zi_1_1').active = true;
                    this.node.getChildByName('dk_1').getChildByName('no-video').active = false;
                    this.node.getChildByName('dk_1').getChildByName('zi_11').active = true;
                }
                this.node.active = true;
                //显示道具弹框
                this.mIndex = index;
                for (var i = 0; i < this.tProp.length; i++) {
                    this.tProp[i].node.active = i == this.mIndex;
                    this.tTips[i].node.active = i == this.mIndex;
                }
            } else {
                //显示话费弹框
                this.node.active = false;
                //根据广告类型判断显示话费弹框或banner广告弹框
                if (Global.adType == 1) {
                    //视频广告
                    Modal.getInstance().getModalController('billTelephone', (script) => {
                        script.showView('ejectNode');
                    })
                } else if (Global.adType == 2) {
                    //banner广告
                    Modal.getInstance().getModalController('billTelephone', (script) => {
                        script.showBannerNodeView();
                    })
                } else {
                    //猜你喜欢
                }
            }
        }

        this.mBg.node.setScale(0);
        var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
        var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
        this.mBg.node.runAction(cc.sequence(action1, action2));

        this._isClickReward = false;
    },
    //根据后台道具ID返回道具前端对应的index
    getPropIndex(id) {
        if (id == 4) {
            return 0;
        } else {
            return id;
        }
    },
    //游戏内看视频领奖励按钮
    getRewardBtn() {
        Global.SoundModel.playEffect('button');
        this.GetReward();
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击领取道具');
        }
    },

    close() {
        this.node.active = false;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击放弃领取道具');
        }
        if (this._isTen == 1) {} else {}
    },
    //分享给好友
    shareToFriend() {
        let obj = Global.getShareTitle();
        let shareInfo = {
            title: obj.title,
            imageUrl: obj.imgUrl,
        };
        wx.aldShareAppMessage(shareInfo);
        //分享完直接发放奖励
        this.shareSuccess();
    },
    GetReward() {
        let self = this;
        if (this.isClick) return;
        this.isClick = true;
        let videoAd;
        let randomNum = Math.floor(Math.random() * 100);
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //正式版
            if (randomNum > 40) {
                //分享占比40%
                this.shareToFriend();
                this.isClick = false;
            } else {
                //视频占比60%
                wx.showToast({
                    title: '视频加载中，请稍后...',
                    icon: 'none',
                    duration: 2000,
                });
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
                                    if (self._isTen == 1) {} else {}
                                    console.log('视频广告显示正常', videoAd.show());
                                    wx.aldSendEvent('视频正常显示');
                                })
                                .catch(err => {
                                    self.isClick = false;
                                    console.log('未正常显示视频', err);
                                    self.GetRewardShare();
                                    wx.aldSendEvent('视频加载出错', {
                                        出错原因: err,
                                    });
                                });
                            videoAd.onError((err) => {
                                self.GetRewardShare();
                                self.isClick = false;
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
                                        self.shareSuccess();
                                        // 正常播放结束，可以下发游戏奖励
                                        if (self._isTen == 1) {} else {}
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
                                    self.shareSuccess();
                                    if (self._isTen == 1) {} else {}
                                }
                            }
                        }
                    },
                });
            }

        } else {
            this.isClick = false;
            this.shareSuccess();
        }
    },

    onShow() {
        let self = getreward;
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
        if (this._isTen == 1) {
            Global.carom_share -= 1;
            Global.setNumConf();
        } else {
            Global.box_share -= 1;
            Global.setNumConf();
        }
        this.shareSuccess();
    },

    GetRewardShare() {
        let se = 4;
        if (this._isTen == 1) {
            se = 7;
        }
        let Path = Global.GameModel.getRandomSharePic();
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let self = this;
            if (self._isTen == 1) {} else {}
            wx.updateShareMenu({
                withShareTicket: true,
                success: res => {
                    // let shareInfo = Share.commonShare({ serial: se, params: { shareUserId: Global.userInfo.userid } }, null, null, this);
                    let obj = Global.getShareTitle();
                    let shareInfo = {
                        title: obj.title,
                        imageUrl: obj.imgUrl,
                        ald_desc: '分享获得道具',
                        query: '',
                    };
                    self.time = new Date().getTime();
                    wx.aldShareAppMessage(shareInfo);
                },
            });
        } else {
            this.shareSuccess();
        }
    },

    shareSuccess() {
        this.node.active = false;
        //发送领取道具事件
        var data = [this.mIndex];
        let CustomEvent = new cc.Event.EventCustom("receiveProp", true);
        CustomEvent.setUserData({
            propIndex: data
        });
        this.node.dispatchEvent(CustomEvent);
        this.node.active = false;
    },

    hideShareButton() {
        cc.log('hideShareButton', this.node);
        let self = this;
        this.node.getChildByName('zi_1_1').active = false;
        this.node.runAction(
            cc.sequence(
                cc.delayTime(2),
                cc.callFunc(() => {
                    self.node.getChildByName('zi_1_1').active = true;
                    cc.log('sssss');
                })
            )
        );
    },
    // update (dt) {},
});