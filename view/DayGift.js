
import AdController from '../test/CocosAdController';
let adController = new AdController();
import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        dayBg: {
            default: null,
            type: cc.Prefab,
            tooltip: '奖励道具'
        }, //道具
        videoPropList: {
            default: null,
            type: cc.Node,
            tooltip: '视频界面道具父节点'
        },
        bannerPropList: {
            default: null,
            type: cc.Node,
            tooltip: 'banner界面道具父节点'
        },
        signedPropList: {
            default: null,
            type: cc.Node,
            tooltip: '已签到界面道具父节点'
        },
        bannerView: {
            default: null,
            type: cc.Node,
            tooltip: 'banner弹框界面'
        },
        videoView: {
            default: null,
            type: cc.Node,
            tooltip: '视频弹窗界面'
        },
        signedView: {
            default: null,
            type: cc.Node,
            tooltip: '已签到界面'
        },
        bannerSurplusTime: {
            default: null,
            type: cc.Label,
            tooltip: 'banner界面倒计时'
        },
        bannerProgress: {
            default: null,
            type: cc.ProgressBar,
            tooltip: 'banner界面进度条'
        },
        videoBtn:{
            default: null,
            type: cc.Node,
            tooltip: '视频领取按钮'
        },
        _totalClickTimes: 10,
        _bannerAd: null,
        _clickBannerSuccess: null
    },
    time: 0,
    isClick: false,
    _propName: null, //记录道具界面父节点名称
    _clickBannerSuccess: false, //是否点击了banner
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.active=false;
        //设置放弃奖励按钮的位置
        //监听分享和点击banner结果
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.onShow((res) => {
                adController.getShareResult((res) => {
                    if(res.code==1){
                        this.shareSuccess();
                    }
                });
                if (this._clickBannerSuccess) {
                    this._clickBannerSuccess = false;
                    this.shareSuccess();
                }
            })
        }
    },
    //显示界面
    showView(type) {
        this.node.active = true;
        this.node.zIndex = 99;
        this.bannerView.active = false;
        this.videoView.active = false;
        this.signedView.active = false;
        this[type].active = true;
        Global.setBtnStyle(this.node.getChildByName('videoView'),'receive','an_lq');
        Global.setGiveUpBtnPosition(this.bannerView,'GiveUpBtn');
        Global.setGiveUpBtnPosition(this.videoView,'GiveUpBtn');
        let action = cc.repeatForever(cc.sequence(
            cc.scaleTo(0.68, 0.8),
            cc.scaleTo(0.8, 0.68)
        ));
        this.videoBtn.runAction(action);
    },
    //关闭界面
    hideView() {
        this.node.active = false;
        this.node.zIndex = 0;
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    },
    //在一个数组中随机取出n个不重复的索引值
    getIndexFromArray(n) {
        this._randomList = [0, 1, 2, 3, 4];
        let arr = [];
        for (let i = 0; i < n; i++) {
            let index = Math.floor(Math.random() * this._randomList.length);
            arr.push(this._randomList[index]);
            this._randomList.splice(index, 1);
        }
        return arr;
    },
    //随机生成三个类似道具
    randomThreeProp(node, view) {
        node.removeAllChildren();
        this._propName = node;
        let arr = this.getIndexFromArray(3);
        cc.loader.loadResDir('props', cc.SpriteFrame, (err, spriteFrame) => {
            for (let i = 0, len = spriteFrame.length; i < len; i++) {
                for (let j = 0, leng = arr.length; j < leng; j++) {
                    if (i == arr[j]) {
                        let appPrefab = cc.instantiate(this.dayBg);
                        appPrefab.string = spriteFrame[i].name;
                        let sprite = appPrefab.getChildByName('bn_06').getComponent(cc.Sprite);
                        sprite.spriteFrame = spriteFrame[i];
                        if(spriteFrame[i].name=='星星'){
                            appPrefab.getChildByName('prop_num').getComponent(cc.Label).string = spriteFrame[i].name + 'x10';
                        }else{
                            appPrefab.getChildByName('prop_num').getComponent(cc.Label).string = spriteFrame[i].name + 'x2';
                        }
                        
                        node.addChild(appPrefab);
                    }
                }
            }
            this.showView(view);
        });

    },
    //打开每日奖励界面 isCanReceive 是否符合领取条件
    openDayGift(isCanReceive) {
        if (!isCanReceive) {
            //不能领取界面
            this.randomThreeProp(this.signedPropList, 'signedView');
        } else {
            //通过接口获取界面
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                this.getAdInfo();
            } else {
                //随机界面
                // let index = Math.floor(Math.random() * 3);
                let index = 0;
                if (index == 0) {
                    this.randomThreeProp(this.videoPropList, 'videoView');
                } else if (index == 1) {
                    this.randomThreeProp(this.bannerPropList, 'bannerView');
                    this.bannerProgress.progress = 0.5;
                    this._totalClickTimes = 10;
                    let options = {
                        countTime: 10, //倒计时初始时间
                        progress: this.bannerProgress.progress, //进度条初始值
                        needTimes: this._totalClickTimes, //需要点击的次数，由服务端控制
                    }
                    this.bannerSurplusTime.string = `剩余 ${options.countTime} 秒`;
                    adController.countTimeClick(options, (res) => {
                        this.bannerProgress.progress = res.result.progress;
                        this.bannerSurplusTime.string = `剩余 ${res.result.countTime} 秒`;
                        //倒计时结束清除banner
                        if (res.result.countTime == 0) {
                            this.hideView();
                        }
                    });
                } else {
                    this.randomThreeProp(this.signedPropList, 'signedView');
                }

            }
        }
    },
    //获取广告信息
    getAdInfo() {
        let options = {
            app_id: 'wxd519b1e4deaed039',
            open_id: Global.getLocalStorageSync('open_id'),
            ad_id: 5
        }
        adController.getAdInfo(options, (res) => {
            if (res.code == 1) {
                if (res.result.ad_type == 1) {
                    //显示视频广告界面
                    this.randomThreeProp(this.videoPropList, 'videoView');
                } else if (res.result.ad_type == 2) {
                    //显示banner广告界面
                    this.randomThreeProp(this.bannerPropList, 'bannerView');
                    adController.createBannerAd('adunit-c85a058403a8d798');
                    wx.aldSendEvent('首页每日奖励-狂点banner请求成功');
                    //倒计时界面,传入初始化数据
                    this.bannerProgress.progress = 0.5;
                    this._totalClickTimes = res.result.click_num;
                    let options = {
                        countTime: 10, //倒计时初始时间
                        progress: this.bannerProgress.progress, //进度条初始值
                        needTimes: this._totalClickTimes, //需要点击的次数，由服务端控制
                    }
                    this.bannerSurplusTime.string = `剩余 ${options.countTime} 秒`;
                    adController.countTimeClick(options, (res) => {
                        this.bannerProgress.progress = res.result.progress;
                        this.bannerSurplusTime.string = `剩余 ${res.result.countTime} 秒`;
                        //倒计时结束关闭界面
                        if (res.result.countTime == 0) {
                            this.hideView();
                        }
                    });
                }
            } else {
               //显示视频广告界面
               this.randomThreeProp(this.videoPropList, 'videoView');
            }
        })
    },
    //点击观看视频按钮
    GetReward() {
        Global.SoundModel.playEffect('button');
        adController.createVideoAd('adunit-515c075499abc5d2', (res) => {
            if (res.code == 1) {
                this.shareSuccess();
            } else {
                wx.showToast({
                    title: '未看完视频，无法获得奖励',
                    icon: 'none',
                    duration: 2000,
                });
            }
        })
    },
    //点击banner
    clickBannerBtn(e) {
        this._bannerAd = adController.getBannerAd();
        if (this.bannerProgress.progress < 1) {
            this.bannerProgress.progress += 1 / this._totalClickTimes;
            // 进度条70%开始加载广告
            if (this.bannerProgress.progress >= 0.8) {
                if (this._bannerAd) {
                    this._bannerAd.show();
                    this._bannerAd.style.top = adController.getBannerPosition(e.target);
                    wx.aldSendEvent('首页每日奖励-用户点击了banner');

                }
                this._clickBannerSuccess = true;
                //banner显示后3秒隐藏
                clearTimeout(timeout);
                let timeout = setTimeout(() => {
                    this.hideView();
                    clearTimeout(timeout);
                }, 3000);
            }
        }
    },
    //放弃奖励
    giveUpReard() {
        Global.SoundModel.playEffect('button');
        this.hideView();
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击「首页-每日奖励-放弃奖励按钮」');
        }
    },
    //分享成功后逻辑（已更改为看视频成功后逻辑）
    shareSuccess() {
        Global.GameModel.Money += 10;
        this.giveOutPropReward(10, Global.GameModel.Money);
    },
    //发放道具奖励
    giveOutPropReward(money, lastMoney) {
        this.node.active = false;
        let str = this.getCurPropNodeName().join('');
        if (str.indexOf('炸弹') > -1) {
            //炸弹
            Global.GameModel.tPropInfo[0] = 3;
        }
        if (str.indexOf('转换') > -1) {
            //转换
            Global.GameModel.tPropInfo[1] = 3;
        }
        if (str.indexOf('喷漆') > -1) {
            //喷漆
            Global.GameModel.tPropInfo[2] = 3;
        }
        if (str.indexOf('闪电') > -1) {
            //闪电
            Global.GameModel.tPropInfo[3] = 3;
        }
        if (str.indexOf('星星') > -1) {
            Modal.getInstance().getModalController('getRewardEffect',(script)=>{
                script.showReardAniUI(money, lastMoney);
            })
        }
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.showToast({
                title: '奖励已发放',
                icon: 'none',
                duration: 2000,
            });
        }
        this.hideView();
        //缓存签到时间
        Global.setLocalStorageSync('signTime', new Date().getTime());
    },
    //获取当前生成的奖励道具节点名称
    getCurPropNodeName() {
        let children = this._propName.children;
        let arr = [];
        for (let i = 0; i < children.length; i++) {
            arr.push(children[i].string);
        }
        return arr;
    },
    //下发奖励
    getReardSuccess(money, lastMoney) {
        this.node.active = false;
        Modal.getInstance().getModalController('getRewardEffect',(script)=>{
            script.showReardAniUI(money, lastMoney);
        })
    },


    // update (dt) {},
});