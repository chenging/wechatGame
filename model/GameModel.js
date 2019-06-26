//=======================================================
//存储数据的文件
//=======================================================
cc.Class({
    extends: cc.Component,

    properties: {
        ROW_NUM: 10,
        COL_NUM: 10,
        nickname: "", //玩家名字
        avatarUrl: "", //玩家头像
        GameStatus: 0, //0：游戏准备阶段  1：游戏开始
        mScore: 0, //当前分数
        UserScore: 0, //最高分数
        mLevel: 0, //玩家关卡等级
        Money: 0, //玩家的星星
        BillBalance:10,//玩家话费余额
        mGameData: null, //游戏的数据
        tColor: null,//颜色的数组
        tPropInfo: [], //道具的信息  0: 锤子  1： 重置  2： 笔刷   3: 流星
        MaxGuanka: 0,//最大关卡
        mUserRank: 0,//世界排行
        mNextRank: 0,//下一个排行榜

        mPropCost: 10,//道具花费星星数量

        isHaveNewGift: 0, //0：没有领取，1：已经领取
        isHaveTodayGift: 0,//0:没有领取，1：已经领取

        //记录游戏开始的分数和关卡
        mRecordGameScore: 0,
        mRecordGameLevel: 0,
        mRecordStarInfo: null,

        mBeginScore: 0,//开场的分数
        mBeginLevel: 0,//开场的等级
        mIsRevive: false, //当前这局是否是复活


        mRecordMoney: 0,//记录金币
        mRecordPropInfo: [],
        mRecordSpecialStar: null,

        tResourcePic: [],
        tPhoneModel: [],
        mSelfPhoneModel: null,

        isRevive: false,

        loadGameSuc:false,
        loginSuc:false,

        mBoxTimes: 0,

        //本关卡是否提示过
        isWarn:false,

        //本关卡是否结算提示过
        isOverWarn:false,

        //是否已经通关
        isPass:false,

        //储存最后数据
        endData:[],
        endScore:0,
        endLevel:0,

        mCurSelectMaxIndex: null,
        
    },

    // LIFE-CYCLE CALLBACKS:
    //游戏初始化
    init() {
        this.GameStatus = 0;
        this.mScore = 0;
        this.setGameConfig();
    },
    //设置游戏状态
    setGameStatus(status) {
        this.GameStatus = status;
    },
    //设置游戏数据
    setGameData(data) {
        this.mGameData = data;
    },

    //随机获取星星数量
    getStarNumByRandom(num, type) {
        var total = 0;
        for (var i = 0; i < this.mGameData.length; i++) {
            if (this.mIsRevive) {
                if (type == 2) {
                    total += parseInt(this.mGameData[i].value);
                    if (num < total) {
                        return parseInt(this.mGameData[i].color);
                    }
                }
            }
            else {
                if (type == parseInt(this.mGameData[i].type)) {
                    total += parseInt(this.mGameData[i].value);
                    if (num < total) {
                        return parseInt(this.mGameData[i].color);
                    }
                }
            }

        }

    },

    //根据关卡获取星星数量
    getStarNumByLevel(level, type) {
        // console.log("看看当前的关卡    ", this.mLevel)
        //绿红黄紫蓝
        let types = 0;
        var total = 0
        for (var i = 0; i < this.mGameData.length; i++) {
            if (this.mIsRevive) {
                if (parseInt(this.mGameData[i].type) == 2) {
                    total += parseInt(this.mGameData[i].value);
                    types = parseInt(this.mGameData[i].type);
                }
            }
            else {
                this.isWarn = false;
                
                if (this.mLevel + 1 > 5) {
                    if ((this.mLevel + 1) % 5 == 0){
                        if (parseInt(this.mGameData[i].type) == 4) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else if ((this.mLevel + 1) % 5 == 1){
                        if (parseInt(this.mGameData[i].type) == 2) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else if ((this.mLevel + 1) % 5 == 2){
                        if (parseInt(this.mGameData[i].type) == 4) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else if ((this.mLevel + 1) % 5 == 3){
                        if (parseInt(this.mGameData[i].type) == 5) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else if ((this.mLevel + 1) % 5 == 4){
                        if (parseInt(this.mGameData[i].type) == 3) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    // if ((this.mLevel + 1) % 5 == 0) {
                    //     if (parseInt(this.mGameData[i].type) == 5) {
                    //         total += parseInt(this.mGameData[i].value);
                    //         types = parseInt(this.mGameData[i].type);
                    //     }
                    // }
                    // else {
                    //     if (parseInt(this.mGameData[i].type) == (this.mLevel + 1) % 5) {
                    //         total += parseInt(this.mGameData[i].value);
                    //         types = parseInt(this.mGameData[i].type);
                    //     }
                    // }
                }
                else {
                    if (this.mLevel + 1 == 4){
                        if (parseInt(this.mGameData[i].type) == 3) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else if (this.mLevel + 1 == 5){
                        if (parseInt(this.mGameData[i].type) == 4) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    else
                    {
                        if (parseInt(this.mGameData[i].type) == this.mLevel + 1) {
                            total += parseInt(this.mGameData[i].value);
                            types = parseInt(this.mGameData[i].type);
                        }
                    }
                    
                }
            }
        }
        // console.log("isRevive:",this.mIsRevive, "    types:",types);
        

        var tempData = [];
        var ResidueNum = 100;
        this.tColor = [];
        var temp = [0, 1, 2, 3, 4];
        let a = 100;
        for (var i = 0; i < 5; i++) {
            if (i < 4) {
                var randomNum = Math.floor(Math.random() * total);
                var num = this.getStarNumByRandom(randomNum, types);
                // var num = this.getStarNumByRandom(randomNum, 10);
                // console.log("随机到    ", num, types, i)
                if (num > ResidueNum) {
                    num = ResidueNum;
                }
                a -= num;
                var n = Math.floor(Math.random() * temp.length);
                var index = temp.splice(n, 1);
                tempData[index[0]] = num;

                for (var j = 0; j < num; j++) {
                    this.tColor.push(index[0]);
                }
                ResidueNum -= num;
            }
            else {
                var n = Math.floor(Math.random() * temp.length);
                var index = temp.splice(n, 1);
                tempData[index[0]] = ResidueNum;
                for (var j = 0; j < ResidueNum; j++) {
                    this.tColor.push(index[0]);
                }
                //console.log("最后一个   ", a)
            }
        }
        return tempData;
    },
    //获取星星颜色
    getStarColor() {
        var color = 0;
        var index = Math.floor(Math.random() * this.tColor.length);
        var color = this.tColor.splice(index, 1);

        return color[0];
    },
    //获取关卡等级分数
    getScoreByLevel(level) {
        var score = 0;
        var tScore = [0, 1000, 2500, 4000, 6000, 8000];
        //var addScore = [3000, 3000, 4000, 4000, 5000, 4000, 4000, 3000, 3000, 4000]
        if (level > 0 && level <= 5) {
            score = tScore[level];
        }
        else {
            score = tScore[5]
            for (var i = 6; i <= level; i++) {
                var addscore = (i - 5) * 100 + 2000;
                if (addscore > 4000) {
                    addscore = 4000;
                }
                score += addscore
            }
        }

        return score;
    },
    //获取奖励
    getJiangli(size) {
        var jiangli = [2000, 1980, 1920, 1820, 1680, 1500, 1280, 1020, 720, 380];
        if (this.mIsRevive) {
            jiangli = [2500, 2475, 2400, 2275, 2100, 1875, 1600, 1275, 900, 475];
        }
        if (size > 9 || size < 0) {
            return 0;
        }
        return jiangli[size];
    },

    getLastRewardScore(){
        if (this.mIsRevive) {
            return 2500;
        }
        else
        {
            return 2000
        }
    },

    //获得结算奖励
    getJieSuanReward(){
        if (this.mScore >= 0 && this.mScore <= 10000){
            return 10;
        }
        else if (this.mScore > 10000 && this.mScore <= 30000){
            return 20;
        }
        else if (this.mScore > 30000 && this.mScore <= 100000){
            return 30;
        }
        else {
            return 50;
        }
    },

    getRandomSharePic() {
        var text = "烧脑又益智，你不来试试？";
        var path = this.tResourcePic[5];
        return [path, text];
    },

    //随机每一层的位置
    getRandomY(layer) {
        var start_y = 1400;
        var dis_y1 = 150;
        var dis_y2 = 100;

        var startPosY = start_y + dis_y2 * (this.ROW_NUM - layer);
        var y = startPosY + Math.floor(Math.random() * dis_y1);

        return y;
    },

    //更新玩家金币
    updateUserMoney(money) {
        this.Money += money;
        if (this.Money <= 0) {
            this.Money = 0;
        }
    },

    getScoreList(count) {
        var list = [];
        for (var i = 1; i <= count; i++) {
            var num = ((i * i) - ((i - 1) * (i - 1))) * 5;
            list[i - 1] = num;
        }

        return list;
    },


    getIsPhoneModel() {
        var flag = false;
        if (!this.tPhoneModel) {
            return flag;
        }

        if (!this.mSelfPhoneModel) {
            return flag;
        }
        for (var i = 0; i < this.tPhoneModel.Data.length; i++) {
            if (this.mSelfPhoneModel.indexOf(this.tPhoneModel.Data[i].model) != -1) {
                flag = true;
                break;
            }
        }
        return flag;
    },

    isiPhoneX() {
        var flag = false;
        if (!this.mSelfPhoneModel) {
            return flag;
        }
        if (this.mSelfPhoneModel.indexOf("iPhone X") != -1) {
            flag = true;
        }

        return flag;
    },

    GetLength(str) {
        ///<summary>获得字符串实际长度，中文2，英文1</summary>
        ///<param name="str">要获得长度的字符串</param>
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    },

    //js截取字符串，中英文都能用 
    //如果给定的字符串大于指定长度，截取指定长度返回，否者返回源字符串。 
    //字符串，长度 

    /** 
     * js截取字符串，中英文都能用 
     * @param str：需要截取的字符串 
     * @param len: 需要截取的长度 
     */
    cutstr(str, len) {
        var str_length = 0;
        var str_len = 0;
        var str_cut = new String();
        str_len = str.length;
        for (var i = 0; i < str_len; i++) {
            var a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4 
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length >= len) {
                str_cut = str_cut.concat("...");
                return str_cut;
            }
        }
        //如果给定字符串小于指定长度，则返回源字符串； 
        if (str_length < len) {
            return str;
        }

    },

    deepClone(obj) {
        let objClone = Array.isArray(obj) ? [] : {};
        if (obj && typeof obj === "object") {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = deepClone(obj[key]);
                    } else {
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    },

    //游戏配置数据
    setGameConfig() {
        this.moveTime1 = 0.3; //开始游戏，关卡，目标分数和当前分数从上面移到游戏中的时间。
        this.moveTime2 = 0.3; //关卡和目标分数从左边移到游戏中的时间。
        this.moveTime3 = 0.1; //关卡和目标分数从游戏中移出的时间。
        this.delayTime1 = 0.8; //关卡和目标分数从左边移到游戏中的时间间隔。
        this.delayTime2 = 2; //关卡和目标分数在游戏中的停留时间。
        this.dropTime = 0.2; //下落时间

    },

});
