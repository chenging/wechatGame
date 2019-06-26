/*
 * @Author: chenging
 * @file: 全局配置
 * @Date: 2019-06-05 14:57:13
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-19 13:56:42
 */
const GameModel = require('GameModel');
const SoundModel = require('SoundManager');
let Global = {
    AdController: null, //广告控制器
    ourAppidList: [{
        name: '欢乐奖多多',
        wx_app_id: 'wx4bd75c08588ffd94',
        path: 'pages/index/index?qdw=GktRVpZ9WkfFFab9Tj5VDhMUWmMwWYPRmwrsVzZ9T5bVTPYYDpyhDbZADkMZTNOJ',
        id:'1',
        click_action:'2'
    }], //自有小程序名单
    skeyid:'',//小程序汇报专用key
    GameModel:new GameModel(),
    SoundModel:new SoundModel(),
    moneyPos: null, //增加星星的节点坐标
    activityScorePos: null, //动态分数的坐标
    bannerHeight: 220, //根据banner高度适配的放弃奖励按钮位置
    api: null,
    isRevive: false,
    eliminateNum: 0, //统计每局消除次数
    isFirstStartGame: false, //是否是第一次开始游戏
    starOrigin: null, //用于判断点击到星星来源
    clickTimes: 20, //点击次数
    adType: 2, //广告类型，用于控制显示的广告界面
    source_app_id:'',//来源appid
    originInfo:null,//从其他小程序来源信息
    isCanReward: false, //判断用户是否点击了广告，是否给予奖励
    randombt: function (min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    },
    //创建猜你喜欢跳转名单  array 后台返回的名单 node 容器节点 prefab 预制资源  sprite 雪碧图节点 isShowName 是否显示小程序名称
    createAppidList(array, node,prefab, adId,isShowName) {
        node.removeAllChildren();
        for (let i = 0, len = array.length; i < len; i++) {
            let appPrefab = cc.instantiate(prefab);
            appPrefab.app_id=array[i].wx_app_id;
            let sprite=appPrefab.getChildByName('itemBg').getChildByName('mask').getChildByName('icon').getComponent(cc.Sprite);
            this.createImgFromUrl(array[i].icon, sprite);
            appPrefab.getChildByName('itemName').getComponent(cc.Label).string =array[i].name;
                if(isShowName){
                    appPrefab.getChildByName('itemName').active=true;
                }else{
                    appPrefab.getChildByName('itemName').active=false;
                }
            appPrefab.path = array[i].path;
            appPrefab.id = array[i].id;
            appPrefab.adId=adId;
            appPrefab.appName=array[i].name;
            appPrefab.clickType=array[i].click_action;
            node.addChild(appPrefab);
        }
    },
    //从url路径创建图像
    createImgFromUrl(url, sprite) {
        cc.loader.load({
                url: url,
                type: 'jpg',
            },
            (err, texture) => {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        );
    },
    //当广告返回错误或者无广告时，默认加载本地自有小程序名单 isShowName是否显示小程序名称
    loadOurAppidList(node,parefab, adId,isShowName){
        node.removeAllChildren();
        cc.loader.loadResDir('appid-icon', cc.SpriteFrame, (err, spriteFrame) => {
            for (let i = 0, len = spriteFrame.length; i < len; i++) {
                for (let j = 0, leng = this.ourAppidList.length; j < leng; j++) {
                    if (spriteFrame[i].name == this.ourAppidList[j].name) {
                        //随机4个小程序显示
                        let appPrefab = cc.instantiate(parefab);
                        appPrefab.app_id=this.ourAppidList[i].wx_app_id;
                        let sprite=appPrefab.getChildByName('itemBg').getChildByName('mask').getChildByName('icon').getComponent(cc.Sprite);
                        sprite.spriteFrame =spriteFrame[i];
                        appPrefab.getChildByName('itemName').getComponent(cc.Label).string =this.ourAppidList[j].name;
                        if(isShowName){
                            appPrefab.getChildByName('itemName').active=true;
                        }else{
                            appPrefab.getChildByName('itemName').active=false;
                        }
                        appPrefab.path = this.ourAppidList[j].path;
                        appPrefab.id = this.ourAppidList[j].id;
                        appPrefab.adId=adId;
                        appPrefab.appName=this.ourAppidList[j].name;
                        appPrefab.clickType=this.ourAppidList[j].click_action;
                        node.addChild(appPrefab);
                    }
                }
            }
        });
    },
    //根据提审版本设置按钮样式
    setBtnStyle(node,normal,check){
        if(this.getLocalStorageSync('isOpen')){
            node.getChildByName(normal).active=true;
            node.getChildByName(check).active=false;
        }else{
            node.getChildByName(normal).active=false;
            node.getChildByName(check).active=true;
        }
    },
    //获取本地存储
    getlocalStorage: function (key, cb) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getStorage({
                key: key,
                success: res => {
                    if (cb) cb(res.data);
                },
                fail: res => {
                    if (cb) cb(null);
                },
            });
        } else {
            let value = cc.sys.localStorage.getItem(key);
            if (cb) cb(value);
        }
    },
    //同步读取本地存储
    getLocalStorageSync(key) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let value = wx.getStorageSync(key);
            return value;
        } else {
            let value = cc.sys.localStorage.getItem(key);
            return value;
        }
    },
    //同步设置缓存
    setLocalStorageSync(key, value) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.setStorageSync(key, value);
        } else {
            cc.sys.localStorage.setItem(key, value);
        }
    },
    //设置本地存储
    setlocalStorage: function (key, value) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.setStorage({
                key: key,
                data: value,
                success: res => {},
                fail: res => {},
            });
        } else {
            cc.sys.localStorage.setItem(key, value);
        }
    },

    setGroup(groupid) {
        let nowTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        for (let i = 0; i < this.shareQunData.shareTicketsList.length; i++) {
            if (groupid == this.shareQunData.shareTicketsList[i]) {
                return false;
            }
        }
        this.shareQunData.time = nowTime;
        this.shareQunData.shareTicketsList.push(groupid);
        this.setlocalStorage(
            'shareQunData',
            JSON.stringify(this.shareQunData)
        );
        return true;
    },
    //获取今天的日期   "2018-09-18"
    getNowFormatDate: function () {
        let date = new Date();
        let seperator1 = '-';
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = '0' + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = '0' + strDate;
        }
        let currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    },

    setNumConf: function () {
        let data = {
            time: new Date().getTime(),
            data: {
                carom_share: this.carom_share,
                gasstation_share: this.gasstation_share,
                box_share: this.box_share,
                tips_share: this.tips_share,
                again_share: this.again_share,
                Resurrection_share: this.Resurrection_share,
            },
        };
        localStorage.setItem('numConf', JSON.stringify(data));
    },
    //获取分享标题和图片
    getShareTitle() {
        let index = Math.floor(Math.random() * this.shareConfig.length);
        return this.shareConfig[index];
    },
    getUserInfoButton: null,
    isNeedShowgetUserInfoButton: true,
    shareConfig: [{
            title: '给你推荐一款超好玩的小游戏，玩到根本停不下来',
            imgUrl: 'https://image.ih-tracking.com/takes-two/share/share.jpg',
        },
        {
            title: '一山不容二虎，除非都有这个爱好！',
            imgUrl: 'https://image.ih-tracking.com/takes-two/share/star.jpg',
        },
        {
            title: '玩游戏还能挣话费？还有这种好事！',
            imgUrl: 'https://image.ih-tracking.com/takes-two/share/bill.jpg',
        },
        {
            title:'这是你从未体验过的全新版本，快来试试！',
            imgUrl:'https://image.ih-tracking.com/takes-two/share/new-version.jpg'
        },
        {
            title:'三观合不合，一起玩下这款游戏就知道了！',
            imgUrl:'https://image.ih-tracking.com/takes-two/share/satisfy.jpg'
        },
        {
            title:'我已经到达997关，就问你行吗？',
            imgUrl:'https://image.ih-tracking.com/takes-two/share/invite-friend.jpg'
        }
    ], //分享配置
    userInfo: {},
    //分享到群的数据
    shareQunData: {
        time: '',
        shareTicketsList: []
    },
    moreGameInfo: null,
    codeVersion: '1.2.5',
    STAR_WIDTH: 75, //星星宽度
    STAR_HEIGHT: 75, //星星高度
    ONE_CLEAR_TIME: 0.03,
    mUsePropType: 0,
    IsPlayEffect: true,
    IsPlayMusic: true,
    IsNeedPlayer: false,
    mGameMusic: null,
    isKickBack: false,
    tStarObj: null,
    tStarAniObj: [],
    tStarAniObj1: [],
    tYanhuaAniObj: [],
    tScoreObj: null,
    tTotalScoreObj: null,
    IsShowShare: false,
    IsShowSuggest: false,
    link_enable_level: 999,
    bannerAd: null,
    IsNewUser: [],

    limitQuestionNum: 6,
    LastTime: null,
    IsHaveShare: false,
    TotalQuestionNum: 0,
    IsDayShareSuccess: 0,
    mTanChuan: [0.15, 1.2, 0.1, 1],
    myHighestRecordData: [],
    bannerFresh: 2,
    shareFirst: 1,
    shareTime: 2.5,
    shareOne: 0.5,
    shareTwo: 0.7,
    isback: 0,
    carom_share: 10,
    gasstation_share: 10,
    box_share: 10,
    tips_share: 10,
    again_share: 10,
    Resurrection_share: 999,
    numConfTime: 0,
    numConf: {
        carom_share: 10,
        gasstation_share: 10,
        box_share: 10,
        tips_share: 10,
        again_share: 10,
        Resurrection_share: 999,
    },
    mContr: null,
    isBind:false,
    isBlack: false,
    isUpdateStar:false,//是否更新玩家星星
    bannerOriginTop:null,//banner原始位置
    //创建banner广告
    createBannerAd() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let sysInfo = wx.getSystemInfoSync();
            if (sysInfo.SDKVersion >= '2.0.4') {
                if (this.bannerAd) {
                    this.bannerAd.destroy();
                }
                this.bannerAd = wx.createBannerAd({
                    adUnitId: 'adunit-c85a058403a8d798',
                    style: {
                        left: 0,
                        top: 0,
                        width: 0,
                        height: 0
                    },
                });
                //监听广告尺寸变化
                this.bannerAd.onResize((size) => {
                    this.bannerAd.style.height = size.height * 0.7;
                    this.bannerAd.style.width = size.width * 0.7;
                    this.bannerAd.style.left = (sysInfo.screenWidth - this.bannerAd.style.realWidth) / 2;
                    if (this.isTargetModel('iPhone 5')) {
                        this.bannerAd.style.top = sysInfo.screenHeight - this.bannerAd.style.realHeight;
                    } else if (this.isTargetModel('iPhone X')) {
                        this.bannerAd.style.top = sysInfo.screenHeight - this.bannerAd.style.realHeight+1;
                    } else {
                        this.bannerAd.style.top = sysInfo.screenHeight - this.bannerAd.style.realHeight - 5;
                    }
                    this.bannerOriginTop = this.bannerAd.style.top;
                })
                this.bannerAd.onError((err) => {

                })
            }
        }
    },

    //设置放弃按钮位置
    setGiveUpBtnPosition(parentNode, name) {
        let node = parentNode.getChildByName(name);
        let banerHeight;
        if (this.bannerAd) {
            banerHeight = this.bannerAd.style.realHeight ? this.bannerAd.style.realHeight : 100;//判断是否存在banner广告
        } else {
            banerHeight = 100;
        }
        node.getComponent(cc.Widget).target = cc.director.getScene().getChildByName('Canvas');
        if (!Global.getLocalStorageSync('isOpen')) {//广告位关闭时，增加放弃按钮的高度
           banerHeight=banerHeight+20;
        }
        if (this.isTargetModel('iPhone X')) {
            node.getComponent(cc.Widget).bottom = banerHeight * 2 + 80;
        } else if(this.isTargetModel('iPhone 5')){
            node.getComponent(cc.Widget).bottom = banerHeight * 2 + 30;
        }else{
            node.getComponent(cc.Widget).bottom = banerHeight * 2 + 20;
        }
    },
    //目标机型判断
    isTargetModel(name) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let sysInfo = wx.getSystemInfoSync();
            if (sysInfo.model.indexOf(name) > -1) {
                return true;
            }
            return false;
        }
        return false;
    },
    //保存最高纪录
    saveMyHighestRecord(level, score, lastScore, isGetReward) {
        cc.log(
            '保存游戏纪录:',
            level,
            score,
            lastScore,
            isGetReward,
            Global.GameModel.mCurSelectMaxIndex
        );
        var _index = Global.GameModel.mCurSelectMaxIndex;
        if (_index != null) {
            //原来有记录的，替换掉原来的记录就好了
            if (this.myHighestRecordData[_index].score < score) {
                this.myHighestRecordData[_index].score = score;
                this.myHighestRecordData[_index].levelNum = level;
                this.myHighestRecordData[_index].lastScore = lastScore;
                this.myHighestRecordData[_index].isGetReward = isGetReward;
            }
        } else {
            if (this.myHighestRecordData.length < 3) {
                this.myHighestRecordData.push({
                    levelNum: level,
                    score: score,
                    lastScore: lastScore,
                    isGetReward: isGetReward,
                });
            } else {
                for (var i = 0; i < this.myHighestRecordData.length; i++) {
                    if (this.myHighestRecordData[i].score < score) {
                        this.myHighestRecordData[i].score = score;
                        this.myHighestRecordData[i].levelNum = level;
                        this.myHighestRecordData[i].lastScore = lastScore;
                        this.myHighestRecordData[i].isGetReward = isGetReward;
                        break;
                    }
                }
            }
        }
        // _index = -1;
        // for (let i = 0; i < Global.myHighestRecordData.length; i++) {
        //   if (Global.myHighestRecordData[i].levelNum == level) {
        //     _index = i;
        //     break;
        //   }
        // }
        // if (_index != -1) {
        //   if (Global.myHighestRecordData[_index].score >= score) {
        //     return;
        //   }
        //   else {
        //     Global.myHighestRecordData[_index].score = score;
        //   }
        // }
        // else {
        //   Global.myHighestRecordData.push({levelNum: level, score: score, lastScore: lastScore});
        // }

        this.myHighestRecordData.sort(function (a, b) {
            return b['score'] - a['score'];
        });
        this.myHighestRecordData = this.myHighestRecordData.slice(0, 3);
        this.setlocalStorage(
            'myHighestRecordData',
            JSON.stringify(this.myHighestRecordData)
        );
    },
    gameType:'normal',//游戏类型
    useToolType:'',//使用道具类型
};
module.exports=Global;