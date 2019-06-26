import Global from '../controller/Global';
let initData = [{
        id: 1,
        star_num: 100,
        money: 0.1,
    },
    {
        id: 2,
        star_num: 200,
        money: 0.2,
    },
    {
        id: 3,
        star_num: 300,
        money: 0.3,
    },
]; //用于调试话费兑换
cc.Class({
    extends: cc.Component,
    properties: {
        ejectNode: {
            default: null,
            type: cc.Node,
            tooltip: '视频广告界面',
        }, //显示视频广告
        bannerNode: {
            default: null,
            type: cc.Node,
            tooltip: 'banner广告界面',
        }, //显示banner广告
        rewardNode: {
            default: null,
            type: cc.Node,
            tooltip: '话费领取成功',
        },
        exchangeNode: {
            default: null,
            type: cc.Node,
            tooltip: '话费兑换',
        },
        balance: {
            default: null,
            type: cc.Label,
            tooltip: '话费余额兑换界面',
        },
        balance1: {
            default: null,
            type: cc.Label,
            tooltip: '话费余额奖励界面',
        },
        rewardAmount: {
            default: null,
            type: cc.Label,
            tooltip: '奖励金额',
        },
        exchangeStarList: {
            default: null,
            type: cc.Node,
            tooltip: '兑换的星星列表',
        },
        exchageStarItem: {
            default: null,
            type: cc.Prefab,
            tooltip: '预制兑换的星星',
        },
        preBill: {
            default: null,
            type: cc.Label,
            tooltip: '待兑换话费金额',
        },
        surplusNum: {
            default: null,
            type: cc.Label,
            tooltip: '话费剩余张数',
        },
        surplusTime: {
            default: null,
            type: cc.Label,
            tooltip: '剩余时间'
        },
        clickProgress: {
            default: null,
            type: cc.ProgressBar,
            tooltip: '点击按钮进度条'
        },
        buttonParticle: {
            default: null,
            type: cc.Prefab,
            tooltip: '按钮点击时的粒子效果'
        }
    },
    exchangeInfo: null, //待兑换信息
    isClick: false,
    clickOrigin: null, //点击来源 bill首页 billAmount 游戏页
    nowTime: null,
    onLoad() {
        //根据banner高度设置放弃奖励按钮的位置
        Global.setGiveUpBtnPosition(this.ejectNode,'close');
        Global.setGiveUpBtnPosition(this.exchangeNode,'close');
        Global.setGiveUpBtnPosition(this.bannerNode,'close');
        //监听兑换星星的点击事件
        this.node.on('exchangeStar', event => {
            Global.SoundModel.playEffect('button');
            let index = parseInt(event.target.parent.string);
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                let info = this.exchangeInfo.list[index];
                if (Global.GameModel.BillBalance < Number(info.money)) {
                    wx.showToast({
                        title: '余额不足，无法兑换',
                        icon: 'none',
                        duration: 2000,
                    });
                } else {
                    wx.showModal({
                        title: '温馨提示',
                        content: `确定使用${info.money}元话费兑换${info.star_num}个星星？`,
                        success: (res) => {
                            if (res.confirm) {
                                Global.api.changStar(1, info.id, res => {
                                    wx.showToast({
                                        title: '兑换成功',
                                        icon: 'none',
                                        duration: 2000,
                                    });
                                    //更新用户星星及话费余额
                                    Global.GameModel.BillBalance = Number(Number(Global.GameModel.BillBalance) - Number(info.money)).toFixed(
                                        2
                                    );
                                    this.balance.string = Global.GameModel.BillBalance + '元';
                                    Global.GameModel.Money = Number(Global.GameModel.Money) + Number(info.star_num);
                                    Global.isUpdateStar=true;
                                });
                            }

                        },
                    });

                }
                //阿拉丁事件统计
                if (this.clickOrigin == 'bill') {
                    let string = `点击「首页话费充值弹窗-${info.money}元话费按钮」`;
                    wx.aldSendEvent(string);
                } else {
                    let string = `点击「游戏中-上方话费充值卡-${info.money}元话费按钮」`;
                    wx.aldSendEvent(string);
                }
            } else {
                let info = initData[index];
                if (Global.GameModel.BillBalance < info.money) {
                    console.log('余额不足');
                } else {
                    Global.GameModel.BillBalance = Number(Number(Global.GameModel.BillBalance) - info.money).toFixed(2);
                    this.balance.string = Global.GameModel.BillBalance + '元';
                    Global.GameModel.Money = Number(Global.GameModel.Money) + Number(info.star_num);
                    Global.isUpdateStar=true;
                }
            }
        });
    },
    init(obj) {
        this.mGameCtrObj = obj;
        this.node.active = false;
    },
    //显示弹框界面 type为节点对应名称  ejectNode rewardNode exchangeNode
    showView(type) {
        this.node.active = true;
        this.node.zIndex = 10;
        this.ejectNode.active = false;
        this.bannerNode.active = false;
        this.rewardNode.active = false;
        this.exchangeNode.active = false;
        this[type].active = true;
        Global.setBtnStyle(this.rewardNode, 'zi_1_1', 'receive');
        //打开时动画
        this[type].setScale(0);
        var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
        var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
        this[type].runAction(cc.sequence(action1, action2));
    },
    //显示兑换界面
    showExchangeView(e) {
        Global.SoundModel.playEffect('button');
        this.showView('exchangeNode');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //获取兑换星星列表
            Global.api.getExchangeStarList(res => {
                this.exchangeInfo = res.result;
                this.balance.string = Global.GameModel.BillBalance + '元';
                this.surplusNum.string = `剩余${res.result.surplus_card_num}/${res.result.card_num}`;
                this.createStarPrefab(res.result.list);
            });
        } else {
            this.createStarPrefab(initData);
            this.balance.string = Global.GameModel.BillBalance + '元';
        }
        //判断点击来源
        this.clickOrigin = e.target.name;
    },
    //显示狂点话费领取奖励界面
    showBannerNodeView() {
        this.showView('bannerNode');
        //初始化进度条及倒计时
        this.clickProgress.progress = 0.5;
        this.nowTime = 10;
        this.surplusTime.string = `剩余 ${this.nowTime} 秒`;
        this.unschedule(this.cancelTime);
        //倒计时回调
        this.cancelTime = () => {
            if (this.nowTime > 0) {
                this.nowTime -= 1;
                this.surplusTime.string = `剩余 ${this.nowTime} 秒`;
                this.clickProgress.progress -= 1 / Global.clickTimes / 2;
            } else {
                this.node.active = false;
                this.unschedule(this.cancelTime);
                //用户不点击时充值banner
                Global.bannerAd.style.top=Global.bannerOriginTop;
            }
        }
        this.schedule(this.cancelTime, 1);
        Global.isCanReward = false;
        // console.log('按钮世界坐标',this.bannerNode.getChildByName('press-normal').convertToWorldSpaceAR(cc.v2(0, 0)));
    },
    //创建星星兑换列表
    createStarPrefab(array) {
        for (let i = 0, len = array.length; i < len; i++) {
            let starPrefab = cc.instantiate(this.exchageStarItem);
            starPrefab.string = i;
            starPrefab.getChildByName('star-' + array[i].id).active = true;
            starPrefab.getChildByName('num').getComponent(cc.Label).string = '星星x' + array[i].star_num;
            starPrefab
                .getChildByName('bill-btn')
                .getChildByName('btn-info')
                .getComponent(cc.Label).string = array[i].money + '元话费';
            starPrefab.setPosition(starPrefab.x, starPrefab.y - 110 * i);
            this.exchangeStarList.addChild(starPrefab);
        }
    },
    //关闭弹框
    closeView(e) {
        this.node.active = false;
        Global.SoundModel.playEffect('button');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if (this.clickOrigin == 'bill') {
                wx.aldSendEvent('点击「首页话费充值弹窗-关闭」');
            } else if (this.clickOrigin == 'billAmount') {
                wx.aldSendEvent('点击「游戏中-上方话费充值卡-关闭」');
            }
            if (e.target.name == 'close') {
                wx.aldSendEvent('点击「游戏中-获得充值卡-放弃奖励」');
            }
        }
        if (e.target.parent.name == 'bannerView') {
            //用户不点击时充值banner
            Global.bannerAd.style.top=Global.bannerOriginTop;
        }

    },
    //狂点领取奖励（banner广告）
    fastClickBtn(e) {
        Global.SoundModel.playEffect('button');
        // let particle=cc.instantiate(this.buttonParticle);
        // this.bannerNode.getChildByName('press-normal').addChild(particle);
        if (this.clickProgress.progress < 1) {
            this.clickProgress.progress += 1 / Global.clickTimes;
            // 进度条70%开始加载广告
            if (this.clickProgress.progress >= 0.7) {
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    //重设banner位置
                    if (!Global.isCanReward) {
                        Global.isCanReward = true;
                        Global.bannerAd.style.top=Global.bannerOriginTop;
                    }
                } else {
                    //非微信平台直接发奖
                    this.giveOutBillReward();
                }
            }
        }
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
        this.giveOutBillReward();
    },
    //观看视频领取话费
    lookVideo() {
        Global.SoundModel.playEffect('button');
        let self = this;
        if (Global.getLocalStorageSync('isOpen')) {
            let videoAd;
            if (this.isClick) return;
            this.isClick = true;
            let randomNum = Math.floor(Math.random() * 100);
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                //正式版
                if (randomNum > 40) {
                    //分享占比40%
                    this.shareToFriend();
                    this.isClick = false;
                } else {
                    wx.aldSendEvent('点击「游戏中-获得充值卡-立即领取按钮」');
                    wx.showToast({
                        title: '视频加载中，请稍后...',
                        icon: 'none',
                        duration: 2000,
                    });
                    wx.getNetworkType({
                        success: function (result) {
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
                                        console.log('未正常显示视频', err);
                                        wx.aldSendEvent('视频加载出错', {
                                            出错原因: err,
                                        });
                                        self.shareConfig();
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
                                        //高版本需要看完视频才下发奖励
                                        if ((res && res.isEnded) || res === undefined) {
                                            wx.aldSendEvent('用户看完视频');
                                            // 正常播放结束，可以下发游戏奖励
                                            self.giveOutBillReward();
                                        } else {
                                            wx.aldSendEvent('用户未看完视频');
                                            wx.showToast({
                                                title: '您未观看完视频，无法获得奖励',
                                                icon: 'none',
                                                duration: 2000,
                                            });
                                            // 播放中途退出，不下发游戏奖励
                                        }
                                    } else {
                                        //低版本直接下发奖励
                                        self.giveOutBillReward();
                                    }
                                }
                            }
                        },
                    });
                }


            } else {
                //非微信平台直接发放奖励
                this.isClick = false;
                self.giveOutBillReward();
            }
        } else {
            //提审版本直接发放奖励
            self.giveOutBillReward();
        }

    },
    //发放话费奖励
    giveOutBillReward() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            Global.api.getRewardBill(res => {
                this.rewardAmount.string = res.result.money;
                //增加余额
                Global.GameModel.BillBalance = Number(Number(Global.GameModel.BillBalance) + res.result.money).toFixed(2);
                this.balance1.string = Global.GameModel.BillBalance + '元';
                Global.isUpdateStar=true;
                this.showView('rewardNode');
            });
        } else {
            this.rewardAmount.string = 0.5;
            //增加余额
            Global.GameModel.BillBalance = Number(Number(Global.GameModel.BillBalance) + 0.5).toFixed(2);
            this.balance1.string = Global.GameModel.BillBalance + '元';
            Global.isUpdateStar=true;
            this.showView('rewardNode');
        }

    },
    //无视频时分享唤起分享
    shareConfig() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let obj = Global.getShareTitle();
            let shareInfo = {
                title: obj.title,
                imageUrl: obj.imgUrl,
                ald_desc: '分享领取话费奖励',
                query: '',
            };
            wx.aldShareAppMessage(shareInfo);
            this.giveOutBillReward();
        }
    },
    //将话费兑换为星星
    billToStar() {
        if (Global.GameModel.BillBalance < 20) {
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                if (this.clickOrigin == 'bill') {
                    wx.aldSendEvent('点击「首页话费充值弹窗-立即兑换按钮」');
                } else {
                    wx.aldSendEvent('点击「游戏中-上方话费充值卡-立即兑换按钮」');
                }
                wx.showModal({
                    title: '温馨提示',
                    content: '余额不足，无法兑换',
                    showCancel: false,
                    success: function (res) {},
                });
            } else {
                if (this.clickOrigin == 'bill') {
                    console.log('点击「首页话费充值弹窗-立即兑换按钮」');
                } else {
                    console.log('点击「游戏中-上方话费充值卡-立即兑换按钮」');
                }
            }
        }
    },
});