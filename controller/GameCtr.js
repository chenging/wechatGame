/**
 * 游戏控制
 * @author WH
 * @Time 2018-7-13
 *
 */
import Global from './Global';
import Modal from './Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        mStarManager: require('StarManager'),
        mYanhuaNode: require('yanhua'),
        mBishuaNode: require('Prop1'),
        mChuiziNode: require('Prop2'),
        mShowPropAni: require('PropAni'),
        // mMoneyBg: cc.Sprite,
        mMoneyLabel: cc.Label,

        mUsePropTip1: cc.Sprite,
        mUsePropTip2: cc.Sprite,
        mUsePropTip3: cc.Sprite,
        mUsePropTip4: cc.Sprite,

        mChuiziBtn: cc.Button,
        mBishuaBtn: cc.Button,
        mResetingBtn: cc.Button,
        mLiuxingBtn: cc.Button,

        mChuiziNum: cc.Label,
        mBishuaNum: cc.Label,
        mResetingNum: cc.Label,
        mLiuxingNum: cc.Label,

        mGuanka: cc.Label,
        mGuankaBg: cc.Label,

        mtargetScore: cc.Label,
        mtargetScoreBg: cc.Sprite,

        mScore: cc.Label,

        mLinkNode: cc.Node,
        mLinkNum: cc.Label,
        mLinkScore: cc.Label,

        mGuanka1: cc.Label, //关卡
        mGuankaBg1: cc.Label,

        mtargetScore1: cc.Label, //目标分数
        mtargetScoreBg1: cc.Label,

        tCombo: {
            type: cc.Node,
            default: [],
        }, //连击特效

        mReardTipNode1: cc.Node, //奖励结算节点
        mReardTip1: cc.Label,

        mReardTipNode2: cc.Node,
        mReardTip2: cc.Label,

        mGameOverTips: cc.Label,

        mSettingBtn: cc.Button,

        mStageClear: cc.Node,

        mLiuxing: {
            type: cc.Node,
            default: [],
        },

        liuxingNode: cc.Node,
        balance: cc.Label, //用户话费余额
        spAppidList: cc.Node, //特殊换量名单
        spAppidItem: cc.Prefab, //特殊换量预制
    },
    onShow() {
        if (Global.bannerAd) {
            //还原banner位置
            Global.bannerAd.style.top=Global.bannerOriginTop;
        }
        //用户可领奖
        if (Global.isCanReward) {
            Modal.getInstance().getModalController('billTelephone', (script) => {
                script.giveOutBillReward();
            })
            Global.isCanReward = false;
        }
    },
    onLoad() {
        this.overLeverCount = 0;
        this.init(this);
        if (Global.gameType == 'normal') {
            //普通进入
            this.startGame();
        } else {
            this.mStarManager.clearAllStar();
        }
        //监听发放奖励
        this.node.on("receiveProp", (e) => {
            let data = e.detail.propIndex;
            this.mShowPropAni.showAniUI(data);
        })
        //监听游戏通关
        this.node.on('adViewListener',(e)=>{
            if(e.detail.code==1){
                //发放奖励
                let data = [e.detail.result.propIndex];
                this.mShowPropAni.showAniUI(data);
                this.gotoNextLevel();
                this.openRun();
            }else{
                //继续游戏
                this.gotoNextLevel();
                this.openRun();
            }
        })
        //加载主页
        cc.director.preloadScene('Login', () => {

        })
    },

    start() {
        let self = this;
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onShow(self.onShow);
        }
    },

    init(obj) {
        this.ControlObj = obj;
        this.node.active = false;
        // this.mLinkNum.node.active = false;
        // this.mReardTip1.node.active = false;
        // this.mReardTip2.node.active = false;
        this.mGameOverTips.node.active = false;
        this.mStarManager.init(this);
        this.mYanhuaNode.init(this);
        this.mBishuaNode.init(this);
        this.mChuiziNode.init(this);
        this.mShowPropAni.init(this);
        this.mTime = 0;
        this.mFlagTime = 0;
        this.balance.string = `余额：${Global.GameModel.BillBalance}元`;
    },

    //开始游戏
    startGame() {
        Global.GameModel.mIsRevive = false;
        Modal.getInstance().getModalController('getReward', (script) => {
            script.isTenNum = 0;
            script.isBoxNum = 0;
        })
        this.node.active = true;
        this.node.zIndex = 0;
        this.mFlagTime = 0;
        this.mPropAni = null;
        Global.mUsePropType = 0;
        this.mSelectStar = null;
        Global.isKickBack = false;
        Global.GameModel.isOverWarn = false;
        //this.getPlayerDataSuccess();
        Global.GameModel.mLevel = Global.GameModel.mRecordGameLevel;
        Global.GameModel.mScore = Global.GameModel.mRecordGameScore;
        Global.GameModel.GameStatus = 1;
        if (!Global.IsNewUser[1]) {
            Global.IsNewUser[1] = true;
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                // Report.reportEvent(8);
            }
            Global.setlocalStorage('newUser', JSON.stringify(Global.IsNewUser));
        }
        Global.createBannerAd();
        if(Global.bannerAd){
            Global.bannerAd.show();
        }
        this.updateTopInfo(false);
        this.ShowUI();
        let self = this;
        //即将超越
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.openRun();
        }

        // this.mUserScoreGame.string = Global.GameModel.Money;
        //获取看视频增加星星的节点的坐标
        let moneyNode = this.node.getChildByName('top');
        Global.moneyPos = cc.v2(moneyNode.x - 180, moneyNode.y);
        //获取动态分数父节点的坐标
        Global.activityScorePos = cc.v2(moneyNode.x + 120, moneyNode.y + 170);
        this.overLeverCount = 0;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            //统计关卡开始
            let num = Global.GameModel.mLevel + 1;
            wx.aldStage.onStart({
                stageId: num, //关卡ID 该字段必传
                stageName: '第' + num + '关', //关卡名称  该字段必传
                userId: '', //用户ID 可选
            });
        }
        Global.eliminateNum = 0;
        this.updateUserMoney();
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
                    Global.createAppidList(res.result.self.promotion, node, this.spAppidItem, id, false);
                } else {
                    //无广告或报错时加载自有广告
                    Global.skeyid = '';
                    // Global.loadOurAppidList(node, this.spAppidItem, id, false);
                }
            })
        } else {
            //非微信平台加载自有广告
            Global.loadOurAppidList(node, this.spAppidItem, id, false);
        }
    },
    openRun() {
        let self = this;
        this.node.getChildByName('run').active = true;
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.postMessage({
                messageType: 0,
            });
            wx.postMessage({
                messageType: 6,
                MAIN_MENU_NUM: Global.rankKey,
                runScore: Global.GameModel.mScore,
                icon: Global.userInfo.icon,
                nick: Global.userInfo.nick,
            });
            self.node
                .getChildByName('run')
                .getChildByName('display')
                .getComponent(cc.WXSubContextView)
                .update();
            //8秒后隐藏
            clearTimeout(self.timer);
            self.timer = setTimeout(() => {
                if(self.node.getChildByName('run')){
                    self.node.getChildByName('run').active = false;
                }
                clearTimeout(self.timer);
            }, 5000);
        }
    },

    closeRank() {
        let self = this;
        self.unscheduleAllCallbacks();
    },
    //复活后继续游戏
    ReviveStartGame(score, level) {
        // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        // 	this.openRun();
        // }
        Global.GameModel.mScore = score;
        Global.GameModel.mLevel = level;

        Global.GameModel.mRecordGameScore = Global.GameModel.mScore;
        Global.setlocalStorage('gameScore', Global.GameModel.mScore);
        Global.GameModel.mRecordGameLevel = Global.GameModel.mLevel;
        Global.setlocalStorage('gameLevel', Global.GameModel.mLevel);
        Global.GameModel.mRecordStarInfo = null;
        Global.setlocalStorage('starInfo', 'false');

        this.mFlagTime = 0;
        this.mPropAni = null;
        Global.mUsePropType = 0;
        this.mSelectStar = null;
        Global.isKickBack = false;
        this.updateTopInfo(false);
        this.ShowUI();
        this.overLeverCount = 0;
    },

    //显示道具复活
    ReviveTool() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this.openRun();
        }
        Global.GameModel.mScore = Global.GameModel.endScore;
        Global.GameModel.mLevel = Global.GameModel.endLevel;

        Global.GameModel.mRecordGameScore = Global.GameModel.mScore;
        Global.setlocalStorage('gameScore', Global.GameModel.mScore);
        Global.GameModel.mRecordGameLevel = Global.GameModel.mLevel;
        Global.setlocalStorage('gameLevel', Global.GameModel.mLevel);
        Global.GameModel.mRecordStarInfo = null;
        Global.setlocalStorage('starInfo', 'false');

        this.mFlagTime = 0;
        this.mPropAni = null;
        Global.mUsePropType = 0;
        this.mSelectStar = null;
        Global.isKickBack = false;
        this.updateTopInfo(false);
        this.ShowUI();
    },

    back() {
        this.node.active = false;
        this.unscheduleAllCallbacks();
    },

    initMoney() {
        //Global.GameModel.mRecordMoney = Global.GameModel.Money;
        this.mMoneyLabel.string = Global.GameModel.Money;
        this.mChuiziNum.string = `x${Global.GameModel.tPropInfo[0] || 0}`;
        this.mBishuaNum.string = `x${Global.GameModel.tPropInfo[2] || 0}`;
        this.mResetingNum.string = `x${Global.GameModel.tPropInfo[1] || 0}`;
        this.mLiuxingNum.string = `x${Global.GameModel.tPropInfo[3] || 0}`;

        if (Global.GameModel.tPropInfo[0] == 0) {
            this.mChuiziNum.node.active = false;
            this.mChuiziNum.node.parent.getChildByName('an_22').active = true;
        } else {
            this.mChuiziNum.node.active = true;
            this.mChuiziNum.node.parent.getChildByName('an_22').active = false;
        }
        if (Global.GameModel.tPropInfo[1] == 0) {
            this.mResetingNum.node.active = false;
            this.mResetingNum.node.parent.getChildByName('an_22').active = true;
        } else {
            this.mResetingNum.node.active = true;
            this.mResetingNum.node.parent.getChildByName('an_22').active = false;
        }
        if (Global.GameModel.tPropInfo[2] == 0) {
            this.mBishuaNum.node.active = false;
            this.mBishuaNum.node.parent.getChildByName('an_22').active = true;
        } else {
            this.mBishuaNum.node.active = true;
            this.mBishuaNum.node.parent.getChildByName('an_22').active = false;
        }
        if (Global.GameModel.tPropInfo[3] == 0) {
            this.mLiuxingNum.node.active = false;
            this.mLiuxingNum.node.parent.getChildByName('an_22').active = true;
        } else {
            this.mLiuxingNum.node.active = true;
            this.mLiuxingNum.node.parent.getChildByName('an_22').active = false;
        }
    },

    updateTopInfo(isShow) {
        this.getAppExchangeList(4, this.spAppidList);
        this.initMoney();

        this.mScore.string = Global.GameModel.mScore;
        Global.GameModel.mBeginScore = Global.GameModel.mScore;
        Global.GameModel.mBeginLevel = Global.GameModel.mLevel;

        this.mGuanka.string = Global.GameModel.mLevel + 1;
        this.mGuankaBg.string = `第 ${Global.GameModel.mLevel + 1} 关`;
        this.mtargetScore.string = Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1);
        for (var i = 0; i < this.tCombo.length; i++) {
            this.tCombo[i].active = false;
        }
        // for (var i = 0; i < this.mStageClear.length; i++) {
        // 	this.mStageClear[i].node.active = false;
        // }
        this.mStageClear.active = false;

        this.isShowSuccessAni = false;

        this.mChuiziNum.string = `x${Global.GameModel.tPropInfo[0] || 0}`;
        this.mBishuaNum.string = `x${Global.GameModel.tPropInfo[2] || 0}`;
        this.mResetingNum.string = `x${Global.GameModel.tPropInfo[1] || 0}`;
        this.mLiuxingNum.string = `x${Global.GameModel.tPropInfo[3] || 0}`;

        if (Global.GameModel.tPropInfo[0] == 0) {
            this.mChuiziNum.node.active = false;
            this.mChuiziNum.node.parent.getChildByName('an_22').active = true;
        }
        if (Global.GameModel.tPropInfo[1] == 0) {
            this.mResetingNum.node.active = false;
            this.mResetingNum.node.parent.getChildByName('an_22').active = true;
        }
        if (Global.GameModel.tPropInfo[2] == 0) {
            this.mBishuaNum.node.active = false;
            this.mBishuaNum.node.parent.getChildByName('an_22').active = true;
        }
        if (Global.GameModel.tPropInfo[3] == 0) {
            this.mLiuxingNum.node.active = false;
            this.mLiuxingNum.node.parent.getChildByName('an_22').active = true;
        }

        this.mReardTipNode1.active = false;
        this.mReardTipNode2.active = false;
        this.mGameOverTips.node.active = false;

        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip3.node.active = false;
        this.mUsePropTip4.node.active = false;

        if (!isShow) {
            this.mLinkNode.active = false;
            this.mSettingBtn.node.active = false;
            // this.mMoneyBg.node.active = false;
            this.mChuiziBtn.node.active = false;
            this.mBishuaBtn.node.active = false;
            this.mResetingBtn.node.active = false;
            this.mLiuxingBtn.node.active = false;
            // var size = cc.view.getVisibleSize();
            // this.mGuankaBg.node.y = size.height / 2 + 100;
            // this.mtargetScoreBg.node.y = size.height / 2 + 100;
            // this.mScore.node.y = size.height / 2 + 100;

            // var action0 = cc.moveTo(Global.GameModel.moveTime1, cc.v2(this.mGuankaBg.node.x, size.height / 2 - 122));
            // var action1 = cc.moveTo(Global.GameModel.moveTime1, cc.v2(this.mtargetScoreBg.node.x, size.height / 2 - 122));
            // var action2 = cc.moveTo(Global.GameModel.moveTime1, cc.v2(this.mScore.node.x, size.height / 2 - 195));

            // this.mGuankaBg.node.runAction(action0);
            // this.mtargetScoreBg.node.runAction(action1);
            // this.mScore.node.runAction(action2);
        }

        if (Global.GameModel.mRecordStarInfo) {
            this.mSettingBtn.node.active = true;
            // this.mMoneyBg.node.active = true;
            this.mChuiziBtn.node.active = true;
            this.mBishuaBtn.node.active = true;
            this.mResetingBtn.node.active = true;
            this.mLiuxingBtn.node.active = true;
        }
        Global.setlocalStorage('gameLevel', Global.GameModel.mLevel);
        Global.GameModel.mRecordGameLevel = Global.GameModel.mLevel;
        //设置即将超越、顶部分数及话费卡的位置
        if (Global.isTargetModel('iPhone X')) {
            this.node.getChildByName('topScore').getComponent(cc.Widget).top = -20;
            this.node.getChildByName('run').getComponent(cc.Widget).top = 450;
            this.node.getChildByName('billAmount').getComponent(cc.Widget).top = 360;
            this.spAppidList.getComponent(cc.Widget).top = 370;
        }
    },

    createAni1(targetPos) {
        var action1 = cc.moveTo(0.2, targetPos);
    },

    ShowUI() {
        if (Global.GameModel.endData.length) {
            this.mSettingBtn.node.active = true;
            // this.mMoneyBg.node.active = true;
            this.mChuiziBtn.node.active = true;
            this.mBishuaBtn.node.active = true;
            this.mResetingBtn.node.active = true;
            this.mLiuxingBtn.node.active = true;

            this.mStarManager.initStar();
            return;
        }
        if (Global.GameModel.mRecordStarInfo) {
            this.mSettingBtn.node.active = true;
            // this.mMoneyBg.node.active = true;
            this.mChuiziBtn.node.active = true;
            this.mBishuaBtn.node.active = true;
            this.mResetingBtn.node.active = true;
            this.mLiuxingBtn.node.active = true;

            this.mStarManager.initStar();
            // if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            //     this.showSuccessAni();
            // }

            return;
        }

        this.mGuanka1.string = Global.GameModel.mLevel + 1;
        this.mGuankaBg.string = `第 ${Global.GameModel.mLevel + 1} 关`;
        this.mtargetScore1.string = Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1);
        this.mGuankaBg1.node.x = 640;
        this.mtargetScoreBg1.node.x = 630;

        var backCall = cc.callFunc(function () {
            this.mSettingBtn.node.active = true;
            // this.mMoneyBg.node.active = true;
            this.mChuiziBtn.node.active = true;
            this.mBishuaBtn.node.active = true;
            this.mResetingBtn.node.active = true;
            this.mLiuxingBtn.node.active = true;

            this.mStarManager.initStar();
            //复活赠送道具
            if (Global.GameModel.mIsRevive) {
                // var data = [0, 2, 1];
                let tStarListInfo = [0, 1, 2, 3];
                //在数组中抽取不重复的
                //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
                var temp_array = new Array();
                for (var index in tStarListInfo) {
                    temp_array.push(tStarListInfo[index]);
                }
                //取出的数值项,保存在此数组
                var return_array = new Array();
                for (var i = 0; i < 2; i++) {
                    //判断如果数组还有可以取出的元素,以防下标越界
                    if (temp_array.length > 0) {
                        //在数组中产生一个随机索引
                        var arrIndex = Math.floor(Math.random() * temp_array.length);
                        //将此随机索引的对应的数组元素值复制出来
                        return_array[i] = temp_array[arrIndex];
                        //然后删掉此索引的数组元素,这时候temp_array变为新的数组
                        temp_array.splice(arrIndex, 1);
                    } else {
                        //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
                        break;
                    }
                }
                this.mShowPropAni.showAniUI(temp_array);
            }

            // if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            //     this.showSuccessAni();
            // }
        }, this);

        var playEffectFunc = cc.callFunc(function () {
            Global.SoundModel.playEffect('readygo');
        }, this);
        //关卡加载动画
        var action3 = cc.moveTo(Global.GameModel.moveTime2, cc.v2(44, this.mGuankaBg1.node.y));
        var action4 = cc.moveTo(Global.GameModel.moveTime3, cc.v2(-800, this.mGuankaBg1.node.y));
        var action5 = cc.sequence(action3, cc.delayTime(Global.GameModel.delayTime2), action4, backCall);
        this.mGuankaBg1.node.runAction(action5);

        var totalTime =
            Global.GameModel.moveTime2 +
            Global.GameModel.delayTime2 -
            Global.GameModel.delayTime1 -
            Global.GameModel.moveTime2;
        var action6 = cc.moveTo(Global.GameModel.moveTime2, cc.v2(20, this.mtargetScoreBg1.node.y));
        var action7 = cc.moveTo(Global.GameModel.moveTime3, cc.v2(-800, this.mtargetScoreBg1.node.y));
        var action8 = cc.sequence(
            cc.delayTime(Global.GameModel.delayTime1),
            action6,
            playEffectFunc,
            cc.delayTime(totalTime),
            action7
        );
        this.mtargetScoreBg1.node.runAction(action8);

        var blink = cc.blink(totalTime - 0.3, 5);
        var action8 = cc.sequence(cc.delayTime(Global.GameModel.delayTime1 + Global.GameModel.moveTime2), blink);
        this.mtargetScoreBg.node.runAction(action8);

        //显示广告
        // if (Global.GameModel.mLevel % 2 == 0) {
        //
        // }
    },

    updateScore() {
        //this.mScore.string = Global.GameModel.mScore;
        if (Global.GameModel.mScore > Global.GameModel.MaxScore) {
            Global.GameModel.MaxScore = Global.GameModel.mScore;
            //this.mMaxScore.string = "历史最高分" + Global.GameModel.MaxScore;
            Global.setlocalStorage('maxScore', Global.GameModel.MaxScore);
        }
    },

    showLinkNum(num, score) {
        this.mLinkNode.stopAllActions();
        this.mLinkNode.setScale(0);
        this.mLinkNode.opacity = 255;
        this.mLinkNode.active = true;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip3.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mLinkNum.string = num;
        this.mLinkScore.string = score;
        var action1 = cc.scaleTo(0.2, 1);
        var action2 = cc.fadeOut(0.5);
        var action = cc.sequence(action1, cc.delayTime(2), action2);
        this.mLinkNode.runAction(action);
        this.mFlagTime = 0;
    },

    hideLinkNum() {
        this.mLinkNode.active = false;
    },
    //连击音效
    showComboEffect(size) {
        if (size <= 5) {
            return;
        }
        this.mYanhuaNode.startPlay();
        Global.SoundModel.playEffect('cancle');
        Global.SoundModel.playEffect('cancle2');
        var comboSprite = null;
        if (size >= 100) {
            comboSprite = this.tCombo[5];
            Global.SoundModel.playEffect('perfect');
        } else if (size >= 14) {
            comboSprite = this.tCombo[4];
            Global.SoundModel.playEffect('amazing');
        } else if (size >= 11) {
            comboSprite = this.tCombo[3];
            Global.SoundModel.playEffect('great');
        } else if (size >= 8) {
            comboSprite = this.tCombo[2];
            Global.SoundModel.playEffect('cool');
        } else {
            comboSprite = this.tCombo[1];
            Global.SoundModel.playEffect('good');
        }
        comboSprite.active = true;
        //播放骨骼动画
        let Armature = comboSprite.getComponent(dragonBones.ArmatureDisplay).armature();
        Armature.animation.play('newAnimation', 1);
        //监听动画播放完毕
        Armature.addEventListener(dragonBones.EventObject.COMPLETE, (res) => {
            comboSprite.active = false;
        }, this)
    },
    //显示通关提示
    showSuccessAni() {
        if (this.isShowSuccessAni) {
            return;
        }
        this.mYanhuaNode.startPlay();
        this.isShowSuccessAni = true;
        this.mStageClear.active = true;
        //重置动效后元素原始位置
        this.mStageClear.setScale(1);
        this.mStageClear.x = 0;
        this.mStageClear.y = 69;
        let pos = 240;
        if (cc.winSize.width / cc.winSize.height < 750 / 1500) {
            pos = 540;
        }
        //通关动画
        Global.SoundModel.playEffect('success');
        var action7 = cc.scaleTo(0.2, 0.2);
        var action8 = cc.moveTo(0.2, cc.v2(-120, cc.winSize.height / 2 - pos));
        var action9 = cc.sequence(cc.delayTime(1), cc.spawn(action7, action8), remove);
        var remove = cc.callFunc(function () {
            this.mStageClear.active = false;
        }, this);
        this.mStageClear.runAction(action9);
    },
    //获取元素世界坐标
    getElementPosition(node) {
        return node.parent.convertToWorldSpaceAR(node.position);
    },
    floatLeftStarMsg(leftNum) {
        this.mSettingBtn.node.active = false;
        var score = Global.GameModel.getLastRewardScore();
        this.mReardTipNode1.active = true;
        this.mReardTipNode2.active = true;
        this.mReardTip1.string = score;
        this.mReardTip2.string = leftNum;

        var callback = cc.callFunc(function () {
            this.mStarManager.createStarblinkAni();
        }, this);
        var action = cc.sequence(cc.delayTime(0.5), callback);
        this.node.runAction(action);
    },

    gotoNextLevel() {
        Global.eliminateNum = 0;
        this.updateTopInfo(true);
        this.ShowUI();
        // if (Global.GameModel.mLevel == 2 && Global.isNeedShowgetUserInfoButton && Global.getUserInfoButton) {
        //   Global.getUserInfoButton.show();
        // }
        this.overLeverCount++;
        if (this.overLeverCount % Global.bannerFresh == 0) {
            let moneyNode = this.node.getChildByName('top');
            Global.moneyPos = cc.v2(moneyNode.x - 180, moneyNode.y + 20);
        }
        if (Global.GameModel.MaxGuanka > Global.link_enable_level) {
            Global.IsShowSuggest = true;
            Global.LoginCtr.loadSuggestList(true);
        }
    },
    //打开游戏设置
    openSetting() {
        this.clearPropEffect();
        Modal.getInstance().getModalController('setting', (script) => {
            script.OpenSettingUI();
        })
    },
    //打开话费兑换成星星界面
    openExchangeStarBox(e) {
        Global.SoundModel.playEffect('button');
        Modal.getInstance().getModalController('billTelephone', (script) => {
            script.showExchangeView(e);
        })
    },
    onEnable() {
        cc.director.on('back', this.back, this);
    },

    onDisable() {
        cc.director.off('back', this.back, this);
        this.unscheduleAllCallbacks();
    },

    gotoGameOver() {
        // if (Global.GameModel.Money >= 5) {
        this.closeRank();
        Modal.getInstance().getModalController('revive', (script) => {
            script.openReviveUI();
        })
        let moneyNode = this.node.getChildByName('top');
        Global.moneyPos = cc.v2(moneyNode.x - 180, moneyNode.y + 20);
    },

    runChangeScore() {
        let self = this;
        var temScore = parseInt(this.mScore.string);
        var addScore = Global.GameModel.mScore - temScore;
        if (addScore > 100) {
            temScore += Math.floor(addScore / 20);
            this.mScore.string = temScore;
            this.mFlagTime = 0;
        } else if (addScore <= 100 && addScore > 50) {
            temScore += Math.floor(addScore / 10);
            this.mScore.string = temScore;
            this.mFlagTime = 0;
        } else if (addScore > 20 && addScore <= 50) {
            temScore += Math.floor(addScore / 5);
            this.mScore.string = temScore;
            this.mFlagTime = 0;
        } else if (addScore > 3 && addScore <= 20) {
            temScore += 1;
            this.mScore.string = temScore;
            this.mFlagTime = 0.05;
        } else if (addScore > 0 && addScore <= 3) {
            this.mFlagTime = 0.3;
            temScore += 1;
            if (temScore > Global.GameModel.mScore) {
                temScore = Global.GameModel.mScore;
            }
            this.mScore.string = temScore;
        }
    },

    //显示道具的呼吸效果
    huxiPropAni() {
        var action1 = cc.scaleTo(0.5, 0.8);
        var action2 = cc.scaleTo(0.5, 1);
        return cc.repeatForever(cc.sequence(action1, action2));
    },

    //使用重置道具
    UseResetting() {
        Global.SoundModel.playEffect('exchange');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击转换道具');
            //统计使用道具
            let num = Global.GameModel.mLevel + 1;
            wx.aldStage.onRunning({
                stageId: num, //关卡ID 该字段必传
                stageName: '第' + num + '关', //关卡名称  该字段必传
                userId: '', //用户ID 可选
                event: 'tools', //使用道具
                params: {
                    //参数
                    itemName: '转换', //购买商品名称  该字段必传
                    itemCount: '', //购买商品数量  可选，默认1
                    itemMoney: '', // 购买商品金额  可选 默认0
                    desc: '使用转换道具', //商品描述   可选
                },
            });
        }
        if (Global.GameModel.GameStatus == 0) {
            return;
        }

        if (this.mStarManager.isCanTouch == false || this.mStarManager.isCanRest == false) {
            return;
        }

        if (Global.mUsePropType == 2) {
            return;
        }
        if (Global.mUsePropType == 4) {
            return;
        }
        this.clearPropEffect();
        if (this.mPropAni) {
            this.node.stopAction(this.mPropAni);
            this.mPropAni = null;
        }

        this.mUsePropTip3.node.active = false;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mStageClear.active = false;
        var count = parseInt(Global.GameModel.tPropInfo[1]) || 0;
        var isCanBuy = true;
        if (count > 0) {
            isCanBuy = true;
        } else {
            if (Global.GameModel.Money < Global.GameModel.mPropCost) {
                isCanBuy = false;
            } else {
                Global.GameModel.Money -= Global.GameModel.mPropCost;
                //Global.GameModel.mRecordMoney
                Global.GameModel.tPropInfo[1] = parseInt(Global.GameModel.tPropInfo[1]) + 1;
                this.mResetingNum.string = Global.GameModel.tPropInfo[1];
                this.mResetingNum.string = 'x' + this.mResetingNum.string;
                if (Global.GameModel.tPropInfo[1] == 0) {
                    this.mResetingNum.node.active = false;
                    this.mResetingNum.node.parent.getChildByName('an_22').active = true;
                } else {
                    this.mResetingNum.node.active = true;
                    this.mResetingNum.node.parent.getChildByName('an_22').active = false;
                }
                this.mUsePropTip3.node.active = true;
                this.mUsePropTip1.node.active = false;
                this.mUsePropTip2.node.active = false;
                this.mUsePropTip4.node.active = false;
                isCanBuy = true;

                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    Global.api.changStar(3, '', res => {

                    });
                }
            }
        }

        if (isCanBuy) {
            this.mUsePropTip1.node.active = false;
            this.mUsePropTip2.node.active = false;
            this.mUsePropTip3.node.active = false;
            this.mUsePropTip4.node.active = false;
            this.mLinkNode.active = false;
            Global.mUsePropType = 2;
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                // Report.reportGold(Global.GameModel.mPropCost, Global.GameModel.Money, '', 10);
                // Report.reportEvent(4, 3);
            }

            Global.GameModel.tPropInfo[1] -= 1;
            if (Global.GameModel.tPropInfo[1] < 0) {
                Global.GameModel.tPropInfo[1] = 0;
            }

            this.UseResetingSuccess();
        } else {
            this.clearPropEffect();
            this.openStarShopLayer();
        }
    },

    UseResetingSuccess() {
        if (Global.mUsePropType == 2) {
            this.initMoney();
            this.mStarManager.resetStarPos();
            var callBack = cc.callFunc(function () {
                this.clearPropEffect();
            }, this);
            var action = cc.sequence(cc.delayTime(0.4), callBack);
            this.node.runAction(action);
        }
    },

    //使用锤子道具
    UseChuizi() {
        Global.SoundModel.playEffect('reward-show');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击锤子道具');
            //统计使用道具
            let num = Global.GameModel.mLevel + 1;
            wx.aldStage.onRunning({
                stageId: num, //关卡ID 该字段必传
                stageName: '第' + num + '关', //关卡名称  该字段必传
                userId: '', //用户ID 可选
                event: 'tools', //使用道具
                params: {
                    //参数
                    itemName: '炸弹', //购买商品名称  该字段必传
                    itemCount: '', //购买商品数量  可选，默认1
                    itemMoney: '', // 购买商品金额  可选 默认0
                    desc: '使用炸弹道具', //商品描述   可选
                },
            });
        }
        if (Global.GameModel.GameStatus == 0) {
            return;
        }
        if (Global.mUsePropType == 1) {
            this.clearPropEffect();

            return;
        }
        if (Global.mUsePropType == 4) {
            return;
        }
        this.clearPropEffect();
        if (this.mPropAni) {
            this.node.stopAction(this.mPropAni);
            this.mPropAni = null;
        }

        this.mUsePropTip3.node.active = false;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mStageClear.active = false;
        var count = parseInt(Global.GameModel.tPropInfo[0]) || 0;
        var isCanBuy = true;
        if (count > 0) {
            isCanBuy = true;
        } else {
            if (Global.GameModel.Money < Global.GameModel.mPropCost) {
                isCanBuy = false;
            } else {
                Global.GameModel.Money -= Global.GameModel.mPropCost;
                Global.GameModel.tPropInfo[0] += 1;
                this.mChuiziNum.string = 'x' + Global.GameModel.tPropInfo[0];
                this.mChuiziNum.node.active = true;
                this.mChuiziNum.node.parent.getChildByName('an_22').active = false;
                this.mMoneyLabel.string = Global.GameModel.Money;
                this.mUsePropTip3.node.active = true;
                this.mUsePropTip1.node.active = false;
                this.mUsePropTip2.node.active = false;
                this.mUsePropTip4.node.active = false;
                isCanBuy = true;
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    Global.api.changStar(3, '', res => {

                    });
                }
            }
        }

        if (isCanBuy) {
            this.mUsePropTip1.node.active = false;
            this.mUsePropTip2.node.active = true;
            this.mUsePropTip3.node.active = false;
            this.mUsePropTip4.node.active = false;
            this.mLinkNode.active = false;
            this.mPropAni = this.huxiPropAni();
            this.mChuiziBtn.node.runAction(this.mPropAni);
            Global.mUsePropType = 1;
            this.ClickChuiziPos();
        } else {
            this.clearPropEffect();
            this.openStarShopLayer();
            //显示购买星星的界面
        }
    },
    //点击锤子坐标
    ClickChuiziPos(star) {
        if (star) {
            if (this.mSelectStar == star) {
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    // Report.reportGold(Global.GameModel.mPropCost, Global.GameModel.Money, '', 10);
                    // Report.reportEvent(4, 1);
                }

                Global.GameModel.tPropInfo[0] -= 1;
                if (Global.GameModel.tPropInfo[0] < 0) {
                    Global.GameModel.tPropInfo[0] = 0;
                }
                this.UseChuiziSuccess();
                return;
            } else {
                var script = this.mSelectStar.getComponent('Star');
                script.setSelected(false);
                this.mSelectStar = star;
            }
        } else {
            this.mSelectStar = this.mStarManager.getStarRandom();
        }
        //被锤子选中的星星
        if (this.mSelectStar) {
            var script = this.mSelectStar.getComponent('Star');
            script.setSelected(true);
            var x = this.mSelectStar.x;
            var y = this.mSelectStar.y;
            this.mChuiziNode.ShowchuoziUI(x, y);
        }
    },

    UseChuiziSuccess() {
        //消除这个星星
        if (Global.mUsePropType == 1) {
            Global.SoundModel.playEffect('boom');
            this.initMoney();
            this.mStarManager.deleteSelectedList(true);
            this.clearPropEffect();
        }
    },

    UseBishua() {
        Global.SoundModel.playEffect('reward-show');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击喷漆道具');
            //统计使用道具
            let num = Global.GameModel.mLevel + 1;
            wx.aldStage.onRunning({
                stageId: num, //关卡ID 该字段必传
                stageName: '第' + num + '关', //关卡名称  该字段必传
                userId: '', //用户ID 可选
                event: 'tools', //使用道具
                params: {
                    //参数
                    itemName: '喷漆', //购买商品名称  该字段必传
                    itemCount: '', //购买商品数量  可选，默认1
                    itemMoney: '', // 购买商品金额  可选 默认0
                    desc: '使用喷漆道具', //商品描述   可选
                },
            });
        }
        if (Global.GameModel.GameStatus == 0) {
            return;
        }

        if (Global.mUsePropType == 3) {
            this.clearPropEffect();
            return;
        }
        if (Global.mUsePropType == 4) {
            return;
        }

        this.clearPropEffect();

        if (this.mPropAni) {
            this.node.stopAction(this.mPropAni);
            this.mPropAni = null;
        }

        this.mUsePropTip3.node.active = false;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mStageClear.active = false;
        var count = parseInt(Global.GameModel.tPropInfo[2]) || 0;
        var isCanBuy = true;
        if (count > 0) {
            isCanBuy = true;
        } else {
            if (Global.GameModel.Money < Global.GameModel.mPropCost) {
                isCanBuy = false;
            } else {
                Global.GameModel.Money -= Global.GameModel.mPropCost;
                Global.GameModel.tPropInfo[2] = Global.GameModel.tPropInfo[2] + 1;
                this.mBishuaNum.string = 'x' + Global.GameModel.tPropInfo[2];
                this.mBishuaNum.node.active = true;
                this.mBishuaNum.node.parent.getChildByName('an_22').active = false;
                this.mMoneyLabel.string = Global.GameModel.Money;
                this.mUsePropTip3.node.active = true;
                this.mUsePropTip1.node.active = false;
                this.mUsePropTip2.node.active = false;
                this.mUsePropTip4.node.active = false;
                isCanBuy = true;
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    Global.api.changStar(3, '', res => {

                    });
                }
            }
        }

        if (isCanBuy) {
            this.mUsePropTip1.node.active = true;
            this.mUsePropTip2.node.active = false;
            this.mUsePropTip3.node.active = false;
            this.mUsePropTip4.node.active = false;
            this.mLinkNode.active = false;
            this.mPropAni = this.huxiPropAni();
            this.mBishuaBtn.node.runAction(this.mPropAni);
            Global.mUsePropType = 3;
            this.ClickShowBishuaPos();
        } else {
            this.clearPropEffect();
            this.openStarShopLayer();
            //显示购买星星的界面
        }
    },

    ClickShowBishuaPos(star) {
        if (this.mSelectStar) {
            var script = this.mSelectStar.getComponent('Star');
            script.stopHuxiAni();
        }
        if (star) {
            this.mSelectStar = star;
        } else {
            this.mSelectStar = this.mStarManager.getStarRandom();
        }

        if (this.mSelectStar) {
            var script = this.mSelectStar.getComponent('Star');
            script.createHuxiAni();
            var color = script.getColor();
            var x = this.mSelectStar.x;
            var y = this.mSelectStar.y + 40;
            this.mBishuaNode.ShowbishuaUI(color, x, y);
        } else {
            if (this.mPropAni) {
                this.node.stopAction(this.mPropAni);
                this.mPropAni = null;
            }
            Global.mUsePropType = 0;
            this.mUsePropTip3.node.active = false;
            this.mUsePropTip1.node.active = false;
            this.mUsePropTip2.node.active = false;
            this.mUsePropTip4.node.active = false;
            this.mBishuaNode.close();
        }
    },

    //使用流星
    userLiuxing() {
        Global.SoundModel.playEffect('reward-show');
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击闪电道具');
            //统计使用道具
            let num = Global.GameModel.mLevel + 1;
            wx.aldStage.onRunning({
                stageId: num, //关卡ID 该字段必传
                stageName: '第' + num + '关', //关卡名称  该字段必传
                userId: '', //用户ID 可选
                event: 'tools', //使用道具
                params: {
                    //参数
                    itemName: '闪电', //购买商品名称  该字段必传
                    itemCount: '', //购买商品数量  可选，默认1
                    itemMoney: '', // 购买商品金额  可选 默认0
                    desc: '使用闪电道具', //商品描述   可选
                },
            });
        }
        if (Global.GameModel.GameStatus == 0) {
            return;
        }
        if (this.mStarManager.isCanTouch == false) {
            return;
        }

        if (Global.mUsePropType == 4) {
            return;
        }
        this.clearPropEffect();
        if (this.mPropAni) {
            this.node.stopAction(this.mPropAni);
            this.mPropAni = null;
        }

        this.mUsePropTip3.node.active = false;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mStageClear.active = false;
        var count = parseInt(Global.GameModel.tPropInfo[3]) || 0;
        var isCanBuy = true;
        if (count > 0) {
            isCanBuy = true;
        } else {
            if (Global.GameModel.Money < Global.GameModel.mPropCost) {
                isCanBuy = false;
            } else {
                Global.GameModel.Money -= Global.GameModel.mPropCost;
                Global.GameModel.tPropInfo[3] = Global.GameModel.tPropInfo[3] - 1;
                this.mLiuxingNum.string = 'x' + Global.GameModel.tPropInfo[3];
                this.mLiuxingNum.node.active = true;
                this.mLiuxingNum.node.parent.getChildByName('an_22').active = false;
                this.mMoneyLabel.string = Global.GameModel.Money;
                this.mUsePropTip3.node.active = false;
                this.mUsePropTip1.node.active = false;
                this.mUsePropTip2.node.active = false;
                this.mUsePropTip4.node.active = true;
                isCanBuy = true;
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    Global.api.changStar(3, '', res => {

                    });
                }
            }
        }

        if (isCanBuy) {
            this.mUsePropTip1.node.active = false;
            this.mUsePropTip2.node.active = false;
            this.mUsePropTip3.node.active = false;
            this.mUsePropTip4.node.active = true;
            this.mLinkNode.active = false;
            // this.mPropAni = this.huxiPropAni();
            // this.mLiuxingBtn.node.runAction(this.mPropAni);
            Global.mUsePropType = 4;
            this.mStarManager.isCanTouch = false;

            let now_num = this.mStarManager.getLeftStarNum();
            let nums = now_num >= 5 ? 5 : now_num;
            // if()
            let self = this;

            self.liuxingNode.active = true;

            for (let j = 0; j < this.mLiuxing.length; j++) {
                this.mLiuxing[j].active = false;
            }
            for (let i = 0; i < nums; i++) {
                let a = this.mLiuxingBtn.node.parent.convertToWorldSpaceAR(this.mLiuxingBtn.node.position);
                let pos = this.mLiuxing[1].parent.convertToNodeSpaceAR(a);
                this.mLiuxing[i].setPosition(pos);
                this.mLiuxing[i].active = true;
            }
            let list = this.mStarManager.getArrayItems(5);
            let num = 0;
            for (let j = 0; j < nums; j++) {
                let star = list[j];
                let speed = 1000;
                let time = 0;
                let x = star.x - this.mLiuxing[j].x;
                let y = star.y + this.mStarManager.node.y - this.mLiuxing[j].y;
                let xy = Math.sqrt(x * x + y * y);
                time = xy / speed;
                let k = j;
                var bezier = [
                    cc.v2(this.mLiuxing[j].x, this.mLiuxing[j].y),
                    cc.v2(this.mLiuxing[j].x, this.mLiuxing[j].y),
                    cc.v2(star.x, star.y + this.mStarManager.node.y),
                ];
                var bezierTo = cc.sequence(
                    cc.delayTime(j * 0.2),
                    cc.bezierTo(time, bezier),
                    cc.callFunc(function () {
                        num += 1;
                        // console.log('numnumnum   ',num)
                        self.mStarManager.selectOne(star, num, nums);
                        if (num == nums) {
                            self.liuxingNode.active = false;
                            self.mStarManager.isCanTouch = true;
                            Global.mUsePropType = 0;
                            for (let i = 0; i < nums; i++) {
                                self.mLiuxing[i]
                                    .getChildByName('particlesystem')
                                    .getComponent(cc.ParticleSystem)
                                    .resetSystem();
                            }
                        }
                    })
                );
                this.mLiuxing[j].runAction(bezierTo);
            }

            Global.GameModel.tPropInfo[3] -= 1;
            if (Global.GameModel.tPropInfo[3] < 0) {
                Global.GameModel.tPropInfo[3] = 0;
            }
            this.initMoney();
        } else {
            this.clearPropEffect();
            this.openStarShopLayer();
            //显示购买星星的界面
        }
    },

    //更新玩家的星星
    updateUserMoney() {
        this.mMoneyLabel.string = Global.GameModel.Money;
        this.balance.string = `余额：${Global.GameModel.BillBalance}元`;
    },

    clearPropEffect() {
        if (this.mPropAni) {
            this.node.stopAction(this.mPropAni);
            this.mPropAni = null;
        }
        this.mUsePropTip3.node.active = false;
        this.mUsePropTip1.node.active = false;
        this.mUsePropTip2.node.active = false;
        this.mUsePropTip4.node.active = false;
        this.mChuiziBtn.node.setScale(1);
        this.mBishuaBtn.node.setScale(1);
        this.mResetingBtn.node.setScale(1);
        this.mLiuxingBtn.node.setScale(1);

        if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            this.mStageClear.active = true;
        } else {
            this.mStageClear.active = false;
        }

        this.initMoney();
        if (Global.mUsePropType == 3) {
            this.mBishuaNode.close();
            if (this.mSelectStar) {
                var script = this.mSelectStar.getComponent('Star');
                script.stopHuxiAni();
                this.mSelectStar = null;
            }
        } else if (Global.mUsePropType == 1) {
            this.mChuiziNode.close();
            var script = this.mSelectStar.getComponent('Star');
            script.setSelected(false);
            this.mSelectStar = null;
        } else if (Global.mUsePropType == 2) {}

        Global.mUsePropType = 0;
    },

    changeStarColor(color) {
        if (Global.mUsePropType == 3) {
            this.initMoney();
            // this.mChuiziNum.string = Global.GameModel.tPropInfo[1] || 0;
            // this.mBishuaNum.string = Global.GameModel.tPropInfo[3] || 0;
            // this.mResetingNum.string = Global.GameModel.tPropInfo[2] || 0;

            var script = this.mSelectStar.getComponent('Star');
            script.color = color;
            script.updateImage(color);
            this.clearPropEffect();
        }
    },

    openStarShopLayer() {
        Modal.getInstance().getModalController('starShop', (script) => {
            script.openStarShop('game');
        })
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.aldSendEvent('点击游戏页加星按钮');
        }
    },

    update(dt) {
        this.mTime += dt;
        if (this.mTime >= this.mFlagTime) {
            this.mTime = 0;
            this.runChangeScore();
        }
        if (Global.isUpdateStar) {
            this.mMoneyLabel.string = Global.GameModel.Money;
            this.mChuiziNum.string = `x${Global.GameModel.tPropInfo[0] || 0}`;
            this.mBishuaNum.string = `x${Global.GameModel.tPropInfo[2] || 0}`;
            this.mResetingNum.string = `x${Global.GameModel.tPropInfo[1] || 0}`;
            this.mLiuxingNum.string = `x${Global.GameModel.tPropInfo[3] || 0}`;
            this.balance.string = `余额：${Global.GameModel.BillBalance}元`;
            Global.isUpdateStar = false;
        }
        //复活重新开始游戏
        if(Global.GameModel.mIsRevive){
            this.ReviveStartGame(Global.GameModel.mBeginScore, Global.GameModel.mBeginLevel);
            Global.GameModel.mIsRevive=false;
        }
        //再来一次
        if(Global.gameType=='replay'){
            this.startGame();
            Global.gameType='normal';
        }
        //使用重置道具
        if(Global.useToolType=='useResetting'){
            this.UseResetting();
            Global.useToolType='';
        }
        //使用流星道具
        if(Global.useToolType=='userLiuxing'){
            this.userLiuxing();
            Global.useToolType='';
        }
    },
});