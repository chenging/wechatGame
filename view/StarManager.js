import Global from '../controller/Global';
import Modal from '../controller/Modal';
cc.Class({
    extends: cc.Component,

    properties: {
        mStar: cc.Prefab,
        mStarParticle: {
            type: cc.Prefab,
            default: [],
        },
        mStarParticle1: {
            type: cc.Prefab,
            default: [],
        },
        mScore: cc.Label,
        mScoreLabel: cc.Prefab, //动态分数预制资源
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        let self = this;
        this.node.on(
            cc.Node.EventType.TOUCH_START,
            function (event) {
                var pos = event.touch.getLocation();
                pos.y -= 234;
                self.onTouch(pos);

                return true;
            },
            this.node
        );
    },

    start() {},

    init(obj) {
        this.mGameCtrObj = obj;
        this.needClear = false;
        this.clearSumTime = 0;
        this.startSchedule = false;
        this.stars = [];
        this.mSelectedList = [];
        this.isCanTouch = false;
        this.isCanRest = false;
        //this.mScoreLabel = null;

        this.mRecordColor = [];
    },

    initStar() {
        // if (this.mScoreLabel){
        //     //this.mScoreLabel.destroy();
        //     this.mScoreLabel.stopAllActions();
        //     Global.tTotalScoreObj.put(this.mScoreLabel);
        //     this.mScoreLabel = null;
        // }
        this.mRecordColor = [];
        this.tipGropStar = null;

        if (Global.GameModel.endData.length) {
            console.log(Global.GameModel.endData.length)
            this.ReinitMatrix();
            return;
        }
        if (Global.GameModel.mRecordStarInfo) {
            this.ReinitMatrix();
        } else {
            // var type = null;
            // if (Global.GameModel.mLevel + 1 > 5){
            //     var targetScore = Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1);
            //     var addScore = Global.GameModel.mScore - targetScore
            //     if (addScore >= 1000){
            //         type = 1;
            //     }
            //     else
            //     {
            //         type = 0;
            //     }
            // }

            // if (Global.GameModel.mIsRevive){
            //     type = 2;
            // }
            this.tStarList = Global.GameModel.getStarNumByLevel();
            this.initMatrix();
        }
    },

    ReinitMatrix() {
        this.mRecordColor = Global.GameModel.mRecordStarInfo;
        if (Global.GameModel.endData.length > 0) {
            this.mRecordColor = Global.GameModel.endData;
        }
        if (this.stars.length)
            for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                    if (this.stars[i][j]) {
                        this.stars[i][j].removeFromParent(true);
                    }
                }
            }
        this.isCanTouch = false;
        this.isCanRest = false;
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            this.stars[i] = [];
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.mRecordColor[i][j] != null) {
                    var color = this.mRecordColor[i][j];
                    //cc.log("i=%d,j=%d,color= %d",i,j,color);
                    if (color < 0) {
                        cc.log('i=%d,j=%d,color= %d', i, j, color);
                    }

                    var star = this.getPlayerPrefab();
                    var starScript = star.getComponent('Star');
                    starScript.init(this, color);
                    var pos = this.getPositionByIndex(i, j);
                    starScript.setDesPosition(pos);
                    starScript.initPos();
                    starScript.isPlayingAni = true;
                    starScript.setIndex_ij(i, j);
                    star.parent = this.node;
                    this.stars[i][j] = star;
                    if (Global.GameModel.mRecordSpecialStar != null) {
                        if (Global.GameModel.mRecordSpecialStar == i * 10 + j) {
                            starScript.setSpecialStar();
                        }
                    }
                } else {
                    this.stars[i][j] = null;
                }
            }
        }

        this.stopTipAction(3.5);
        var callBack = cc.callFunc(function () {
            this.setCanTouch();
        }, this);
        var action = cc.sequence(cc.delayTime(0.1), callBack);
        this.node.runAction(action);
    },

    initMatrix() {
        this.isCanTouch = false;
        this.isCanRest = false;
        // Global.GameModel.mBoxTimes = 0;
        // Global.GameModel.mRecordSpecialStar = Math.floor(Math.random()*100);
        // Global.setlocalStorage("SpecialStarPos", Global.GameModel.mRecordSpecialStar);

        if (this.stars.length)
            for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                    if (this.stars[i][j]) {
                        this.stars[i][j].removeFromParent(true);
                    }
                }
            }

        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            this.stars[i] = [];
            this.mRecordColor[i] = [];
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                var color = Global.GameModel.getStarColor();
                //cc.log("i=%d,j=%d,color= %d",i,j,color);
                if (color < 0) {
                    cc.log('i=%d,j=%d,color= %d', i, j, color);
                }

                var star = this.getPlayerPrefab();
                var starScript = star.getComponent('Star');
                starScript.init(this, color);
                var pos = this.getPositionByIndex(i, j);
                //console.log("i=%d,j=%d",i,j,pos);

                var y = Global.GameModel.getRandomY(i);
                var pos1 = cc.v2(pos.x, pos.y + y);

                star.setPosition(pos1);
                starScript.setDesPosition(pos);
                starScript.setIndex_ij(i, j);
                star.parent = this.node;
                this.stars[i][j] = star;
                this.mRecordColor[i][j] = color;

                // if (Global.GameModel.mRecordSpecialStar == (i * 10 + j)) {
                //     starScript.setSpecialStar();
                // }
            }
        }

        if (Global.GameModel.mBoxTimes > 3) {
            this.randBaoXiangPos();
            //Global.setlocalStorage("SpecialStarPos", Global.GameModel.mRecordSpecialStar);
        } else {
            if (Math.floor(Math.random() * 100) < 30) {
                this.randBaoXiangPos();
                //Global.setlocalStorage("SpecialStarPos", Global.GameModel.mRecordSpecialStar);
            } else {
                Global.GameModel.mBoxTimes += 1;
                Global.setlocalStorage('SpecialStarPos', 'false');
            }
        }

        Global.GameModel.mRecordStarInfo = this.mRecordColor;
        //Global.setlocalStorage("starInfo", JSON.stringify(Global.GameModel.mRecordStarInfo));

        this.stopTipAction(3.5);
        var callBack = cc.callFunc(function () {
            this.setCanTouch();
        }, this);
        var action = cc.sequence(cc.delayTime(1.2), callBack);
        this.node.runAction(action);
    },
    //随机宝箱位置
    randBaoXiangPos() {
        if (Global.box_share > 0) {} else {
            return;
        }
        //确定宝箱位置
        this.starGroup = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null && this.isExistInGroup(this.stars[i][j]) == false) {
                    this.starGroup.push(this.genSelectedList1(this.stars[i][j], true));
                }
            }
        }
        // cc.log("initMatrix starGroup:", this.starGroup);
        let randk = Global.randombt(0, this.starGroup.length - 1);
        while (this.starGroup[randk].length === 1) {
            randk = Global.randombt(0, this.starGroup.length - 1);
        }
        this.starGroup[randk][Global.randombt(0, this.starGroup[randk].length - 1)]
            .getComponent('Star')
            .setSpecialStar();
    },
    //设置是否可触摸
    setCanTouch() {
        // for(var i = 0;i < Global.GameModel.ROW_NUM;i++){
        //     for(var j = 0;j < Global.GameModel.COL_NUM;j++){
        //         if(this.stars[i][j] != null){
        //             var starScript = this.stars[i][j].getComponent('Star');
        //             starScript.initPos();
        //         }
        //     }
        // }
        this.isCanTouch = true;
        this.isCanRest = true;
        Global.GameModel.GameStatus = 1;
    },

    //获取星星的对象池
    getPlayerPrefab() {
        var playerObject = null;
        if (Global.tStarObj.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            playerObject = Global.tStarObj.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            cc.log('星星不足');
            playerObject = cc.instantiate(this.mStar);
        }

        return playerObject;
    },
    //根据索引获取星星位置
    getPositionByIndex(i, j) {
        var x = j * Global.STAR_WIDTH + Global.STAR_WIDTH / 2 - 375;
        var y = (Global.GameModel.COL_NUM - i) * Global.STAR_HEIGHT - Global.STAR_HEIGHT / 2;
        //cc.log("pos:",x,y);
        return cc.v2(x, y);
    },

    //触摸星星 pos为触摸的坐标点
    onTouch(pos) {
        Global.SoundModel.playEffect('touch');
        if (this.isCanTouch == false) {
            return;
        }

        this.stopTipAction(3.5);
        var s = this.getStarByTouch(pos);

        if (s != null) {
            if (Global.mUsePropType == 3) {
                this.mGameCtrObj.ClickShowBishuaPos(s);
                return;
            } else if (Global.mUsePropType == 1) {
                this.mSelectedList = [];
                this.mSelectedList.push(s);
                this.mGameCtrObj.ClickChuiziPos(s);
                return;
            } else if (Global.mUsePropType == 2) {
                return;
            }
            this.isCanTouch = false;
            this.isCanRest = false;
            this.genSelectedList(s);
            this.deleteSelectedList();
        }
    },

    //停止提示动作
    stopTipAction(time) {
        if (this.tipAction) {
            this.node.stopAction(this.tipAction);
            this.tipAction = null;
        }

        if (this.tipGropStar) {
            for (var m = 0; m < this.tipGropStar.length; m++) {
                this.tipGropStar[m].getComponent('Star').stopHuxiAni();
            }
            this.tipGropStar = null;
        }

        this.tipAction = cc.sequence(
            cc.delayTime(time),
            cc.callFunc(function () {
                this.getGroupOfStar();
            }, this)
        );

        this.node.runAction(this.tipAction);
    },

    //开始星星动画（调整其父节点GameNode的位置后，需要调整下面i的值，本次调整由-1变为-2）
    getStarByTouch(p) {
        var k = Math.floor(p.y / Global.STAR_HEIGHT); //这里要用K转一下int 不然得不到正确结果
        var i = Global.GameModel.ROW_NUM - 1 - k;
        var j = Math.floor(p.x / Global.STAR_WIDTH);
        if (i >= 0 && i < Global.GameModel.ROW_NUM && j >= 0 && j < Global.GameModel.COL_NUM && this.stars[i][j] != null) {
            if (this.stars[i][j].getComponent('Star').isSelected()) {
                for (var t = 0; t < Global.GameModel.ROW_NUM; t++) {
                    for (var q = 0; q < Global.GameModel.COL_NUM; q++) {
                        if (this.stars[t][q] != null) {
                            this.stars[t][q].getComponent('Star').setSelected(false);
                        }
                    }
                }
                //this.stars[i][j].getComponent('Star')
                return this.stars[i][j];
            } else {
                return this.stars[i][j];
            }
        } else {
            return null;
        }
    },

    //还有多少个星星0-个数 1-最高相连
    isNum(type) {
        this.starGroup = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null && this.isExistInGroup(this.stars[i][j]) == false) {
                    this.starGroup.push(this.genSelectedList1(this.stars[i][j], true));
                }
            }
        }
        let num = 0;
        let count = 0;
        for (var t = 0; t < this.starGroup.length; t++) {
            count += this.starGroup[t].length;
            if (num < this.starGroup[t].length) {
                num = this.starGroup[t].length;
            }
        }
        if (type == 0) {
            return count;
        }
        if (type == 1) {
            return num;
        }
    },

    //每次判断
    isPop() {
        //场内相连色块小于最大相连

        //满足重置提示条件
        if (
            this.isNum(0) <= 20 &&
            (Global.GameModel.Money >= 10 || parseInt(Global.GameModel.tPropInfo[1]) > 0) &&
            this.isNum(1) <= 3 &&
            Global.GameModel.isWarn == false &&
            Global.GameModel.mScore < Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)
        ) {
            Modal.getInstance().getModalController('useTool',(script)=>{
                script.ShowUI(0, 0);
            })
            return;
        }

        let scores = Global.GameModel.mScore;
        let tar = Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1);
        let end = tar - scores;
        //满足流星提示条件
        if (
            this.isNum(0) <= 20 &&
            (Global.GameModel.Money >= 10 || parseInt(Global.GameModel.tPropInfo[3]) > 0) &&
            Global.GameModel.isWarn == false &&
            Global.GameModel.mScore < Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)
        ) {
            Modal.getInstance().getModalController('useTool',(script)=>{
                script.ShowUI(0, 1);
            })
            return;
        }

        // if (index != null) {
        //     let tipGropStar = starGroup[index];
        //     tipGropStar
        // }
    },

    //重置星星的位置
    resetStarPos() {
        this.stopTipAction(3.5);
        var tStarListInfo = [];
        var tPos = [];
        var tempStar = [];
        var colorList = [];
        colorList[0] = [];
        colorList[1] = [];
        colorList[2] = [];
        colorList[3] = [];
        colorList[4] = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            var temp = [];
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                temp[j] = null;
                if (this.stars[i][j] != null) {
                    colorList[this.stars[i][j].getComponent('Star').color].push(this.stars[i][j]);
                    // tStarListInfo.push(this.stars[i][j]);
                    tPos.push(i * 10 + j);
                }
            }
            tempStar[i] = temp;
        }

        let length = 0;
        let dex = 0;
        for (let d = 0; d < colorList.length; d++) {
            if (colorList[d].length > length) {
                dex = d;
                length = colorList[d].length;
            }
        }

        let temps = colorList[0];
        colorList[0] = colorList[dex];
        colorList[dex] = temps;

        for (let k = 0; k < colorList.length; k++) {
            for (let m = 0; m < colorList[k].length; m++) {
                tStarListInfo.push(colorList[k][m]);
            }
        }

        for (var t = 0; t < tStarListInfo.length; t++) {
            var index = Math.floor(Math.random() * tPos.length);
            if (t < 2) {
                for (let k = 0; k < tPos.length; k++) {
                    if (tPos[k] == 90) {
                        index = k;
                        break;
                    }
                    if (tPos[k] == 91) {
                        index = k;
                        break;
                    }
                    if (tPos[k] == 80) {
                        index = k;
                        break;
                    }
                }
            }
            var number = tPos.splice(index, 1);
            var index_i = Math.floor(number[0] / 10);
            var index_j = number[0] % 10;
            tempStar[index_i][index_j] = tStarListInfo[t];
            var pos = this.stars[index_i][index_j].getPosition();
            var script = tStarListInfo[t].getComponent('Star');
            script.setIndex_ij(index_i, index_j);
            script.setTargetPos(pos);
        }

        this.stars = tempStar;
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    this.stars[i][j].getComponent('Star').moveToTargetPos();
                }
            }
        }
    },

    //随机获取其中的一个星星
    getStarRandom() {
        var tStarListInfo = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    tStarListInfo.push(this.stars[i][j]);
                }
            }
        }

        return tStarListInfo[Math.floor(Math.random() * tStarListInfo.length)];
    },

    //在数组中抽取不重复的
    getArrayItems(num) {
        var tStarListInfo = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    tStarListInfo.push(this.stars[i][j]);
                }
            }
        }
        //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
        var temp_array = new Array();
        for (var index in tStarListInfo) {
            temp_array.push(tStarListInfo[index]);
        }
        //取出的数值项,保存在此数组
        var return_array = new Array();
        for (var i = 0; i < num; i++) {
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
        return return_array;
    },

    //获得提示消除的星星组合
    getGroupOfStar() {
        this.starGroup = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null && this.isExistInGroup(this.stars[i][j]) == false) {
                    this.starGroup.push(this.genSelectedList1(this.stars[i][j], true));
                }
            }
        }

        var count = 0;
        var index = null;
        for (var t = 0; t < this.starGroup.length; t++) {
            var num = this.starGroup[t].length;
            if (num > count) {
                count = num;
                index = t;
            }
        }

        if (index != null) {
            this.tipGropStar = this.starGroup[index];
            for (var m = 0; m < this.tipGropStar.length; m++) {
                this.tipGropStar[m].getComponent('Star').createHuxiAni();
            }
        }
    },

    //这个星星是否存在于组合中
    isExistInGroup(star) {
        var starScript = star.getComponent('Star');
        var index_i = starScript.getIndexI();
        var index_j = starScript.getIndexJ();

        var isExist = false;
        for (var i = 0; i < this.starGroup.length; i++) {
            for (var j = 0; j < this.starGroup[i].length; j++) {
                var starScript1 = this.starGroup[i][j].getComponent('Star');
                var index_i1 = starScript1.getIndexI();
                var index_j1 = starScript1.getIndexJ();
                if (index_i1 == index_i && index_j1 == index_j) {
                    isExist = true;
                    break;
                }
            }

            if (isExist) {
                break;
            }
        }

        return isExist;
    },

    //流星删除单个
    selectOne(s, i, all) {
        this.stopTipAction(3.5);
        this.mSelectedList = [];
        this.mSelectedList.push(s);
        if (s != null) {
            if (Global.mUsePropType == 3) {
                this.mGameCtrObj.ClickShowBishuaPos(s);
                return;
            } else if (Global.mUsePropType == 1) {
                this.mSelectedList = [];
                this.mSelectedList.push(s);
                this.mGameCtrObj.ClickChuiziPos(s);
                return;
            } else if (Global.mUsePropType == 2) {
                return;
            }
            this.isCanTouch = false;
            this.isCanRest = false;
            // this.selectOne(s);
            if (i <= 5 && i == all) {
                this.deleteSelectedOne(true);
            } else {
                this.deleteSelectedOne();
            }
        }
    },

    deleteSelectedOne(end = false) {
        console.log('end    ', end);
        Global.eliminateNum += 1;
        let clerNum = this.mSelectedList.length;
        var index = 0;
        var list = Global.GameModel.getScoreList(this.mSelectedList.length);
        let score = 10;
        Global.GameModel.mScore += score;
        Global.setlocalStorage('gameScore', Global.GameModel.mScore);
        Global.GameModel.mRecordGameScore = Global.GameModel.mScore;
        if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            this.mGameCtrObj.showSuccessAni();
        }
        this.mGameCtrObj.updateScore();
        this.mGameCtrObj.showLinkNum(this.mSelectedList.length, score);

        var star = this.mSelectedList[index];
        if (star != null) {
            var starScript = star.getComponent('Star');
            starScript.deleteAni();
            if (starScript.isSpecialStar()) {
                //消除了宝箱弹出宝箱界面
                Modal.getInstance().getModalController('getReward',(script)=>{
                    script.ShowUI();
                })
            }
            //粒子效果
            this.showStarParticleEffect(starScript.getColor(), star.getPosition());

            this.stars[starScript.getIndexI()][starScript.getIndexJ()] = null;

            //star.destroy();

            var targetPos = star.parent.convertToWorldSpaceAR(star.position);
            var pos = this.node.parent.convertToNodeSpaceAR(targetPos);

            this.createScoreAni(10, pos, 40, false);

            starScript.clearAllInfo();
            Global.tStarObj.put(star);

            //播放音效
            Global.SoundModel.playEffect('music_pop');
        }
        if (end) {
            //||Global.eliminateNum==8
            if (clerNum >= 10) {
                //8连消界面弹出
                Modal.getInstance().getModalController('getReward',(script)=>{
                    script.ShowUI(1);
                })
            }

            this.createScoreAni(50, pos, 60, true);
            //道具礼包

            this.unschedule(this.mCallback);
            this.mCallback = null;
            //N秒钟后显示提示
            this.stopTipAction(3.5);
            //COMBO效果
            this.mGameCtrObj.showComboEffect(this.mSelectedList.length);
            //Audio::getInstance()->playCombo(selectedList.size());

            //this.refreshScore();
            this.adjustMatrix();

            for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                    if (this.stars[i][j] != null) {
                        var starScript = this.stars[i][j].getComponent('Star');
                        starScript.BoobAni();
                    }
                }
            }
            this.unschedule(this.setCanRest);
            this.isCanRest = false;
            let self = this;
            this.scheduleOnce(this.setCanRest, 0.3);
            self.isCanTouch = true;
            // var canPoint = cc.callFunc(function() {

            // }, this);

            // var action = cc.sequence(cc.delayTime(Global.GameModel.dropTime + 0.3),canPoint);
            // this.node.runAction(action)

            if (this.isEnded()) {
                Global.GameModel.endData = this.mRecordColor;
                Global.GameModel.endScore = Global.GameModel.mScore;
                Global.GameModel.endLevel = Global.GameModel.mLevel;
                Global.GameModel.GameStatus = 0;

                var num = 0;
                for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                    for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                        if (this.stars[i][j] == null) {
                            continue;
                        }
                        num += 1;
                    }
                }
                var score1 = Global.GameModel.getJiangli(num);
                //游戏结算,保存数据
                if (
                    Global.GameModel.mScore + score1 <
                    Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)
                ) {
                    Global.GameModel.mRecordStarInfo = null;
                    Global.setlocalStorage('starInfo', 'false');
                    Global.GameModel.mRecordGameScore = 0;
                    Global.setlocalStorage('gameScore', 0);
                    Global.GameModel.mRecordGameLevel = 0;
                    Global.setlocalStorage('gameLevel', 0);
                    Global.GameModel.mRecordSpecialStar = null;
                    Global.setlocalStorage('SpecialStarPos', 'false');
                    Global.GameModel.isPass = false;
                } else {
                    Global.GameModel.mRecordStarInfo = null;
                    Global.GameModel.mRecordSpecialStar = null;
                    Global.setlocalStorage('starInfo', 'false');
                    Global.setlocalStorage('gameLevel', Global.GameModel.mLevel + 1);
                    Global.GameModel.mRecordGameLevel = Global.GameModel.mLevel + 1;
                    Global.setlocalStorage('gameScore', Global.GameModel.mScore + score1);
                    Global.GameModel.mRecordGameScore = Global.GameModel.mScore + score1;
                    Global.setlocalStorage('SpecialStarPos', 'false');
                    Global.GameModel.isPass = true;
                }
                this.mGameCtrObj.floatLeftStarMsg(this.getLeftStarNum()); //通知layer弹出剩余星星的信息
            }
            this.isPop();
            // var action1 = cc.moveBy(0.01, cc.v2(0, 20));
            // var action = cc.sequence(cc.delayTime(mTimeTotal), action1, Callback);
            // this.mSelectedList[m].runAction(action);
            // mTimeTotal += delayTimeValue + 0.01;
            // delayTimeValue -= 0.01
            // if (delayTimeValue <= 0.03) {
            //     delayTimeValue = 0.03;
            // }
        }
    },

    genSelectedList1(s, flag) {
        var SelectedList = [];
        var travelList = [];
        travelList.push(s);

        for (var i = 0; i < 1000; i++) {
            var star = travelList[i];
            var linkStar = null;
            var starScript = star.getComponent('Star');
            var index_i = starScript.getIndexI();
            var index_j = starScript.getIndexJ();
            //上
            if (index_i - 1 >= 0 && (linkStar = this.stars[index_i - 1][index_j])) {
                var starScript1 = linkStar.getComponent('Star');
                if (
                    !starScript1.isSelected1() &&
                    starScript1.getColor() == starScript.getColor() &&
                    !this.isExistArray(travelList, this.stars[index_i - 1][index_j])
                ) {
                    travelList.push(this.stars[index_i - 1][index_j]);
                }
            }
            //下
            if (
                index_i + 1 < Global.GameModel.ROW_NUM &&
                (linkStar = this.stars[index_i + 1][index_j]) &&
                !this.isExistArray(travelList, this.stars[index_i + 1][index_j])
            ) {
                var starScript1 = linkStar.getComponent('Star');
                if (!starScript1.isSelected1() && starScript1.getColor() == starScript.getColor()) {
                    travelList.push(this.stars[index_i + 1][index_j]);
                }
            }
            //左
            if (index_j - 1 >= 0 && (linkStar = this.stars[index_i][index_j - 1])) {
                var starScript1 = linkStar.getComponent('Star');
                if (
                    !starScript1.isSelected1() &&
                    starScript1.getColor() == starScript.getColor() &&
                    !this.isExistArray(travelList, this.stars[index_i][index_j - 1])
                ) {
                    travelList.push(this.stars[index_i][index_j - 1]);
                }
            }
            //右
            if (index_j + 1 < Global.GameModel.COL_NUM && (linkStar = this.stars[index_i][index_j + 1])) {
                var starScript1 = linkStar.getComponent('Star');
                if (
                    !starScript1.isSelected1() &&
                    starScript1.getColor() == starScript.getColor() &&
                    !this.isExistArray(travelList, this.stars[index_i][index_j + 1])
                ) {
                    travelList.push(this.stars[index_i][index_j + 1]);
                }
            }
            if (!starScript.isSelected1()) {
                starScript.setSelected1(true);
                SelectedList.push(star);
            }
            if (travelList.length == SelectedList.length) {
                break;
            }
        }

        if (flag) {
            for (var i = 0; i < SelectedList.length; i++) {
                var starScript = SelectedList[i].getComponent('Star');
                starScript.setSelected1(false);
            }
        }

        return SelectedList;
    },

    genSelectedList(s, flag) {
        this.mSelectedList = [];
        var travelList = [];
        travelList.push(s);
        for (var i = 0; i < 1000; i++) {
            var star = travelList[i];
            var linkStar = null;
            var starScript = star.getComponent('Star');
            var index_i = starScript.getIndexI();
            var index_j = starScript.getIndexJ();
            // cc.log("index_i,index_j:", index_i, index_j);
            //上
            if (this.stars[index_i - 1] && this.stars[index_i - 1][index_j]) {
                if (index_i - 1 >= 0 && (linkStar = this.stars[index_i - 1][index_j])) {
                    var starScript1 = linkStar.getComponent('Star');
                    if (
                        !starScript1.isSelected() &&
                        starScript1.getColor() == starScript.getColor() &&
                        !this.isExistArray(travelList, this.stars[index_i - 1][index_j])
                    ) {
                        travelList.push(this.stars[index_i - 1][index_j]);
                    }
                }
            }

            //下
            if (this.stars[index_i + 1] && this.stars[index_i + 1][index_j]) {
                if (
                    index_i + 1 < Global.GameModel.ROW_NUM &&
                    (linkStar = this.stars[index_i + 1][index_j]) &&
                    !this.isExistArray(travelList, this.stars[index_i + 1][index_j])
                ) {
                    var starScript1 = linkStar.getComponent('Star');
                    if (!starScript1.isSelected() && starScript1.getColor() == starScript.getColor()) {
                        travelList.push(this.stars[index_i + 1][index_j]);
                    }
                }
            }
            //左
            if (this.stars[index_i] && this.stars[index_i][index_j - 1]) {
                if (index_j - 1 >= 0 && (linkStar = this.stars[index_i][index_j - 1])) {
                    var starScript1 = linkStar.getComponent('Star');
                    if (
                        !starScript1.isSelected() &&
                        starScript1.getColor() == starScript.getColor() &&
                        !this.isExistArray(travelList, this.stars[index_i][index_j - 1])
                    ) {
                        travelList.push(this.stars[index_i][index_j - 1]);
                    }
                }
            }
            //右
            if (this.stars[index_i] && this.stars[index_i][index_j + 1]) {
                if (index_j + 1 < Global.GameModel.COL_NUM && (linkStar = this.stars[index_i][index_j + 1])) {
                    var starScript1 = linkStar.getComponent('Star');
                    if (
                        !starScript1.isSelected() &&
                        starScript1.getColor() == starScript.getColor() &&
                        !this.isExistArray(travelList, this.stars[index_i][index_j + 1])
                    ) {
                        travelList.push(this.stars[index_i][index_j + 1]);
                    }
                }
            }
            if (!starScript.isSelected()) {
                starScript.setSelected(true);

                this.mSelectedList.push(star);
            }
            if (travelList.length == this.mSelectedList.length) {
                break;
            }
        }

        if (flag) {
            for (var i = 0; i < this.mSelectedList.length; i++) {
                var starScript = this.mSelectedList[i].getComponent('Star');
                starScript.setSelected(false);
            }
        }
        return this.mSelectedList;
    },

    isExistArray(tList, obj) {
        var starScript = obj.getComponent('Star');
        var index_i = starScript.getIndexI();
        var index_j = starScript.getIndexJ();
        var isExist = false;
        for (var i = 0; i < tList.length; i++) {
            var starScript1 = tList[i].getComponent('Star');
            var index_i1 = starScript1.getIndexI();
            var index_j1 = starScript1.getIndexJ();
            if (index_i1 == index_i && index_j1 == index_j) {
                isExist = true;
                break;
            }
        }
        return isExist;
    },

    setCanRest() {
        this.isCanRest = true;
    },

    deleteSelectedList(isUseProp) {
        let clerNum = this.mSelectedList.length;
        if (isUseProp == null) {
            if (this.mSelectedList.length <= 1) {
                // console.log("xiapoc   ", clerNum);
                //隐藏提示信息
                this.isCanTouch = true;
                this.isCanRest = true;
                this.mGameCtrObj.hideLinkNum();
                this.mSelectedList[0].getComponent('Star').setSelected(false);
                Global.SoundModel.playEffect('select');
                return;
            }
        }
        //统计消除次数
        if (clerNum >= 2) {
            Global.eliminateNum += 1;
        }

        //var index = 0;
        var list = Global.GameModel.getScoreList(this.mSelectedList.length);
        let score = this.mSelectedList.length * this.mSelectedList.length * 5;
        Global.GameModel.mScore += score;
        Global.setlocalStorage('gameScore', Global.GameModel.mScore);
        Global.GameModel.mRecordGameScore = Global.GameModel.mScore;
        if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            this.mGameCtrObj.showSuccessAni();
        }
        this.mGameCtrObj.updateScore();
        this.mGameCtrObj.showLinkNum(this.mSelectedList.length, score);

        var delayTimeValue = 0.1;
        var mTimeTotal = 0;
        //cc.log("sssssss:",this.mSelectedList.length);
        let lsoundIndex = 1;
        for (var m = 0; m < this.mSelectedList.length; m++) {
            //cc.log("m:",m);

            var Callback = cc.callFunc(
                function (target, index) {
                    var star = this.mSelectedList[index];
                    if (star != null) {
                        var starScript = star.getComponent('Star');
                        starScript.deleteAni();
                        if (starScript.isSpecialStar()) {
                            Modal.getInstance().getModalController('getReward',(script)=>{
                                script.ShowUI();
                            })
                        }
                        //粒子效果
                        this.showStarParticleEffect(starScript.getColor(), star.getPosition());

                        this.stars[starScript.getIndexI()][starScript.getIndexJ()] = null;

                        //star.destroy();

                        var targetPos = star.parent.convertToWorldSpaceAR(star.position);
                        var pos = this.node.parent.convertToNodeSpaceAR(targetPos);

                        this.createScoreAni(list[index], pos, 40, false);

                        starScript.clearAllInfo();
                        Global.tStarObj.put(star);

                        //播放音效
                        Global.SoundModel.playEffect('button');

                        // Global.SoundModel.playEffect('EliminateEffect' + lsoundIndex);
                        lsoundIndex++;
                        if (lsoundIndex > 14) {
                            lsoundIndex = 14;
                        }
                    }
                    index += 1;
                    if (index == this.mSelectedList.length) {
                        //8连消弹出广告 ||Global.eliminateNum==8
                        if (clerNum >= 10) {
                            Modal.getInstance().getModalController('getReward',(script)=>{
                                script.ShowUI(1);
                            })
                        }
                        this.createScoreAni(this.mSelectedList.length * this.mSelectedList.length * 5, pos, 60, true);
                        //道具礼包

                        this.unschedule(this.mCallback);
                        this.mCallback = null;
                        //N秒钟后显示提示
                        this.stopTipAction(3.5);
                        //COMBO效果
                        this.mGameCtrObj.showComboEffect(this.mSelectedList.length);
                        //Audio::getInstance()->playCombo(selectedList.size());

                        //this.refreshScore();
                        this.adjustMatrix();

                        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                                if (this.stars[i][j] != null) {
                                    var starScript = this.stars[i][j].getComponent('Star');
                                    starScript.BoobAni();
                                }
                            }
                        }
                        this.unschedule(this.setCanRest);
                        this.isCanRest = false;
                        let self = this;
                        this.scheduleOnce(this.setCanRest, 0.5);
                        self.isCanTouch = true;
                        // var canPoint = cc.callFunc(function() {

                        // }, this);

                        // var action = cc.sequence(cc.delayTime(Global.GameModel.dropTime + 0.3),canPoint);
                        // this.node.runAction(action)

                        if (this.isEnded()) {
                            Global.GameModel.endData = this.mRecordColor;
                            Global.GameModel.endScore = Global.GameModel.mScore;
                            Global.GameModel.endLevel = Global.GameModel.mLevel;

                            Global.GameModel.GameStatus = 0;
                            var num = 0;
                            for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
                                for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                                    if (this.stars[i][j] == null) {
                                        continue;
                                    }
                                    num += 1;
                                }
                            }
                            var score1 = Global.GameModel.getJiangli(num);
                            //游戏结算,保存数据
                            if (
                                Global.GameModel.mScore + score1 <
                                Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)
                            ) {
                                Global.GameModel.mRecordStarInfo = null;
                                Global.setlocalStorage('starInfo', 'false');
                                Global.GameModel.mRecordGameScore = 0;
                                Global.setlocalStorage('gameScore', 0);
                                Global.GameModel.mRecordGameLevel = 0;
                                Global.setlocalStorage('gameLevel', 0);
                                Global.GameModel.mRecordSpecialStar = null;
                                Global.setlocalStorage('SpecialStarPos', 'false');
                                Global.GameModel.isPass = false;
                            } else {
                                Global.GameModel.mRecordStarInfo = null;
                                Global.GameModel.mRecordSpecialStar = null;
                                Global.setlocalStorage('starInfo', 'false');
                                Global.setlocalStorage('gameLevel', Global.GameModel.mLevel + 1);
                                Global.GameModel.mRecordGameLevel = Global.GameModel.mLevel + 1;
                                Global.setlocalStorage('gameScore', Global.GameModel.mScore + score1);
                                Global.GameModel.mRecordGameScore = Global.GameModel.mScore + score1;
                                Global.setlocalStorage('SpecialStarPos', 'false');
                                Global.GameModel.isPass = true;
                            }
                            this.mGameCtrObj.floatLeftStarMsg(this.getLeftStarNum()); //通知layer弹出剩余星星的信息
                        } else {
                            this.isPop();
                        }
                    }
                },
                this,
                m
            );
            var action1 = cc.moveBy(0.01, cc.v2(0, 20));
            var action = cc.sequence(cc.delayTime(mTimeTotal), action1, Callback);
            this.mSelectedList[m].runAction(action);
            mTimeTotal += delayTimeValue + 0.01;
            delayTimeValue -= 0.01;
            if (delayTimeValue <= 0.03) {
                delayTimeValue = 0.03;
            }
        }
    },

    //获取分数的对象池
    getScorePrefab() {
        var obj = null;
        if (Global.tScoreObj.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            obj = Global.tScoreObj.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            obj = cc.instantiate(this.mScoreLabel);
        }

        return obj;
    },

    //获取分数的对象池
    getScorePrefab1() {
        var obj = null;
        if (Global.tTotalScoreObj.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            obj = Global.tTotalScoreObj.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            obj = cc.instantiate(this.mScoreLabel);
        }

        return obj;
    },

    //tScoreObj

    //创建动态分数动画
    createScoreAni(num, pos, fontsize, isShow) {
        if (isShow == false) {
            var scoreNode = this.getScorePrefab();
            scoreNode.setScale(1);
            scoreNode.opacity = 255;
            var label = scoreNode.getComponent(cc.Label);
            label.string = num;
            label.fontSize = fontsize;
            label.lineHeight = fontsize;
            scoreNode.position = pos;
            scoreNode.parent = this.node.parent;

            // var targetPos = this.mScore.node.position;
            // var size = cc.view.getVisibleSize();
            var targetPos = Global.activityScorePos;
            // if (cc.winSize.width / cc.winSize.height < 750 / 1500) {
            //     targetPos = cc.v2(100, cc.winSize.height / 2 - 74);
            // } else {
            //     targetPos = cc.v2(100, cc.winSize.height / 2 - 39);
            // }
            var action = cc.moveTo(0.5, cc.v2(targetPos.x, targetPos.y)).easing(cc.easeSineOut());
            var action2 = cc.scaleTo(0.5, 0.6);

            var action3 = cc.moveTo(0.8, cc.v2(targetPos.x, targetPos.y - 60));
            var action4 = cc.scaleTo(0.8, 0);

            var backCall = cc.callFunc(
                function (targetScore, mscoreObj) {
                    //this.refreshScore(num);
                    //node.destroy();
                    Global.tScoreObj.put(mscoreObj);
                },
                this,
                scoreNode
            );
            var action1 = cc.sequence(cc.spawn(action, action2), cc.spawn(action3, action4), backCall);
            scoreNode.runAction(action1);
        } else {
            // if (this.mScoreLabel){
            //     //this.mScoreLabel.destroy();
            //     this.mScoreLabel.stopAllActions();
            //     Global.tTotalScoreObj.put(this.mScoreLabel);
            //     this.mScoreLabel = null;
            // }

            var scoreLabel = this.getScorePrefab1();
            scoreLabel.setScale(0.3);
            scoreLabel.opacity = 255;

            if (pos.x < -280) {
                pos.x = -280;
            }

            if (pos.x > 280) {
                pos.x = 280;
            }

            var label = scoreLabel.getComponent(cc.Label);
            label.string = num;
            label.fontSize = fontsize;
            label.lineHeight = fontsize;
            scoreLabel.position = pos;
            scoreLabel.parent = this.node.parent;

            //var action1 = cc.delayTime(0.3);
            var action1 = cc.moveBy(0.6, cc.v2(0, 50));
            // var action4 = cc.scaleTo(0.2, 0.2);
            var action2 = cc.fadeOut(0.3);

            var backCall = cc.callFunc(
                function (targetScore, mscoreObj) {
                    Global.tTotalScoreObj.put(mscoreObj);
                    //this.mScoreLabel = null;
                },
                this,
                scoreLabel
            );
            var action = cc.sequence(action1, action4, action2, backCall);
            scoreLabel.runAction(action);
        }
    },

    adjustMatrix() {
        //垂直方向调整
        for (var i = Global.GameModel.ROW_NUM - 1; i >= 0; i--) {
            for (var j = Global.GameModel.COL_NUM - 1; j >= 0; j--) {
                if (this.stars[i][j] == null) {
                    var up = i;
                    var dis = 0;
                    while (this.stars[up][j] == null) {
                        dis += 1;
                        up -= 1;
                        if (up < 0) {
                            break;
                        }
                    }

                    for (var begin_i = i - dis; begin_i >= 0; begin_i--) {
                        if (this.stars[begin_i][j] == null) {
                            continue;
                        }
                        this.stars[begin_i + dis][j] = this.stars[begin_i][j];
                        var s = this.stars[begin_i + dis][j];
                        var starScript = s.getComponent('Star');
                        starScript.setIndex_ij(begin_i + dis, j);
                        starScript.setDesPosition(this.getPositionByIndex(begin_i + dis, j));
                        this.stars[begin_i][j] = null;
                    }
                } else {
                    continue;
                }
            }
        }
        //水平方向调整
        for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
            if (this.stars[Global.GameModel.ROW_NUM - 1][j] == null) {
                var des = 0;
                var right = j;
                while (this.stars[Global.GameModel.ROW_NUM - 1][right] == null) {
                    des += 1;
                    right += 1;
                    if (right >= 10) {
                        break;
                    }
                }
                for (var begin_i = 0; begin_i < Global.GameModel.ROW_NUM; begin_i++) {
                    for (var begin_j = j + des; begin_j < Global.GameModel.COL_NUM; begin_j++) {
                        if (this.stars[begin_i][begin_j] == null) {
                            continue;
                        }
                        this.stars[begin_i][begin_j - des] = this.stars[begin_i][begin_j];
                        var s = this.stars[begin_i][begin_j - des];
                        var starScript = s.getComponent('Star');
                        starScript.setIndex_ij(begin_i, begin_j - des);
                        starScript.setDesPosition(this.getPositionByIndex(begin_i, begin_j - des));
                        this.stars[begin_i][begin_j] = null;
                    }
                }
            }
        }

        Global.GameModel.mRecordSpecialStar = null;
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    var starScript = this.stars[i][j].getComponent('Star');
                    this.mRecordColor[i][j] = starScript.getColor();
                    if (starScript.isSpecialStar()) {
                        Global.GameModel.mRecordSpecialStar = i * 10 + j;
                    }
                } else {
                    this.mRecordColor[i][j] = null;
                }
            }
        }
        Global.GameModel.mRecordStarInfo = this.mRecordColor;
        Global.setlocalStorage('starInfo', JSON.stringify(Global.GameModel.mRecordStarInfo));
        Global.setlocalStorage('SpecialStarPos', Global.GameModel.mRecordSpecialStar);
    },

    updateStar(delta) {
        if (this.stars.length == 0) {
            return;
        }
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    var starScript = this.stars[i][j].getComponent('Star');
                    starScript.updatePosition();
                }
            }
        }
        // if(this.needClear){
        //     this.needClear = false;
        //     this.clearMatrixOneByOne();
        //     // this.clearSumTime += delta;
        //     // if(this.clearSumTime > Global.ONE_CLEAR_TIME){

        //     //     this.clearSumTime = 0;
        //     // }
        // }
    },

    //创建星星连续动画
    createStarblinkAni() {
        this.mGameCtrObj.mReardTipNode1.y = -400;
        this.mGameCtrObj.mReardTipNode1.x = 0;
        var tResidueList = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] == null) {
                    continue;
                }
                tResidueList.push(cc.v2(i, j));
            }
        }

        var action2 = cc.blink(1, 5);
        var finish = cc.callFunc(function () {
            this.clearMatrixOneByOne();
        }, this);
        if (tResidueList.length > 0) {
            this.mGameCtrObj.mReardTipNode1.runAction(action2);
            for (var j = 0; j < tResidueList.length; j++) {
                var a = tResidueList[j].x;
                var b = tResidueList[j].y;
                var action = cc.blink(1, 5);
                if (j == tResidueList.length - 1) {
                    var action1 = cc.sequence(action, finish);
                    this.stars[a][b].runAction(action1);
                } else {
                    this.stars[a][b].runAction(action);
                }
            }
        } else {
            this.mGameCtrObj.mReardTipNode2.runAction(cc.sequence(action2, finish));
        }
    },

    clearMatrixOneByOne() {
        this.tResidueList = [];
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] == null) {
                    continue;
                }
                this.stars[i][j].setScale(1);
                this.tResidueList.push(cc.v2(i, j));
            }
        }
        var index = -1;
        var jiangli = [2000, 1980, 1920, 1820, 1680, 1500, 1280, 1020, 720, 380, 0];
        if (Global.GameModel.mIsRevive) {
            jiangli = [2500, 2475, 2400, 2275, 2100, 1875, 1600, 1275, 900, 475, 0];
        }
        //this.mGameCtrObj.mReardTip2.string = "奖励" + jiangli[0]
        var action = cc.scaleTo(0.5, 1.3);
        this.mGameCtrObj.mReardTipNode1.runAction(action);

        if (this.tResidueList.length <= 10) {
            this.mGameCtrObj.showComboEffect(999);
        }

        if (this.tResidueList.length > 0) {
            this.mCallback1 = function () {
                index += 1;
                if (this.tResidueList[index] != null) {
                    if (index >= 10) {
                        this.unschedule(this.mCallback1);
                        this.mCallback1 = null;
                        for (var t = index; t < this.tResidueList.length; t++) {
                            var i = this.tResidueList[t].x;
                            var j = this.tResidueList[t].y;
                            if (this.stars[i][j] != null) {
                                this.showStarParticleEffect(
                                    this.stars[i][j].getComponent('Star').getColor(),
                                    this.stars[i][j].getPosition()
                                );
                                //this.stars[i][j].destroy();
                                this.stars[i][j].getComponent('Star').clearAllInfo();
                                Global.tStarObj.put(this.stars[i][j]);
                                this.stars[i][j] = null;
                                Global.SoundModel.playEffect('music_pop');
                            }
                        }
                        this.gameOver(this.tResidueList.length);
                    } else {
                        var i = this.tResidueList[index].x;
                        var j = this.tResidueList[index].y;
                        if (this.stars[i][j] != null) {
                            this.showStarParticleEffect(
                                this.stars[i][j].getComponent('Star').getColor(),
                                this.stars[i][j].getPosition()
                            );
                            this.stars[i][j].getComponent('Star').clearAllInfo();
                            Global.tStarObj.put(this.stars[i][j]);
                            this.stars[i][j] = null;
                        }
                        Global.SoundModel.playEffect('music_pop');
                        this.mGameCtrObj.mReardTip1.string = jiangli[index + 1];
                        if (jiangli[index + 1] >= 0 && jiangli[index + 1] < 10) {
                            this.mGameCtrObj.mReardTipNode1.x = -6;
                        } else if (jiangli[index + 1] >= 10 && jiangli[index + 1] < 100) {
                            this.mGameCtrObj.mReardTipNode1.x = -16;
                        } else if (jiangli[index + 1] >= 100 && jiangli[index + 1] < 1000) {
                            this.mGameCtrObj.mReardTipNode1.x = -26;
                        } else if (jiangli[index + 1] >= 1000 && jiangli[index + 1] < 10000) {
                            this.mGameCtrObj.mReardTipNode1.x = -47;
                        }
                    }
                } else {
                    this.unschedule(this.mCallback1);
                    this.mCallback1 = null;
                    this.gameOver(this.tResidueList.length);
                }
            };
            this.schedule(this.mCallback1, 0.3);
        } else {
            // console.log("jici")
            this.gameOver(this.tResidueList.length);
        }
    },
    //num剩余数量
    gameOver(num, nTime = 2) {
        console.log('游戏结果', Global.GameModel.isPass, num);

        Global.GameModel.endData = [];
        Global.GameModel.mIsRevive = false;
        if (num >= 10) {
            var remove = cc.callFunc(function () {
                this.mGameCtrObj.mReardTipNode1.active = false;
                this.mGameCtrObj.mReardTipNode2.active = false;
                this.updateUserScoreInfo();
            }, this);
            var action = cc.sequence(cc.delayTime(nTime), remove);
            this.mGameCtrObj.mReardTipNode1.runAction(action);
        } else {
            var score = Global.GameModel.getJiangli(num);

            var callback = cc.callFunc(function () {
                Global.GameModel.mScore += Global.GameModel.getJiangli(num) / 10;
                score -= Global.GameModel.getJiangli(num) / 10;
                this.mGameCtrObj.mReardTip1.string = score;
            }, this);
            var action1 = cc.moveTo(0.2, cc.v2(0, -300));
            // console.log('结算动画');
            // if(cc.winSize.width / cc.winSize.height < 750 / 1500){
            //     //适配iphonex
            //     action1=cc.moveTo(0.2, cc.v2(0, -300));
            // }
            var action2 = cc.repeat(cc.sequence(callback, cc.delayTime(0.08)), 10);
            var remove = cc.callFunc(function () {
                this.mGameCtrObj.mReardTip1.string = '0';
                this.mGameCtrObj.mReardTipNode1.active = false;
                this.mGameCtrObj.mReardTipNode2.active = false;
                this.updateUserScoreInfo();
            }, this);

            var action = cc.sequence(action1, action2, cc.delayTime(3.5), remove);
            this.mGameCtrObj.mReardTipNode1.runAction(action);
        }
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            let num1 = Global.GameModel.mLevel + 1;
            if (Global.GameModel.isPass) {
                //统计玩家已通关
                wx.aldStage.onEnd({
                    stageId: num1, //关卡ID 该字段必传
                    stageName: '第' + num1 + '关', //关卡名称  该字段必传
                    userId: '', //用户ID 可选
                    event: 'complate', //关卡完成  关卡进行中，用户触发的操作    该字段必传
                    params: {
                        desc: '关卡完成', //描述
                    },
                });
            } else {
                //统计玩家未通关
                wx.aldStage.onEnd({
                    stageId: num1, //关卡ID 该字段必传
                    stageName: '第' + num1 + '关', //关卡名称  该字段必传
                    userId: '', //用户ID 可选
                    event: 'fail', //关卡完成  关卡进行中，用户触发的操作    该字段必传
                    params: {
                        desc: '关卡失败', //描述
                    },
                });
            }
        }
    },

    //更新用户分数信息
    updateUserScoreInfo() {
        if (Global.GameModel.mScore >= Global.GameModel.getScoreByLevel(Global.GameModel.mLevel + 1)) {
            Global.GameModel.mLevel += 1;
            //过关弹框
            let options = {
                score: Global.GameModel.mScore,
                app_id: 'wxd519b1e4deaed039',
                open_id: Global.getLocalStorageSync('open_id')
            }
            Modal.getInstance().getModalController('adView',(script)=>{
                script.showAdView(options, (res) => {
                    if (res.code == 1) {
                        if (res.result.propIndex === null) {
                            //分享界面的回调
                            script.hideAdView();
                            this.mGameCtrObj.gotoNextLevel();
                            this.mGameCtrObj.openRun();
                        } 
                        // else {
                        //     //用户完成视频和banner界面的操作,发放奖励
                        //     let data = [res.result.propIndex];
                        //     this.mGameCtrObj.mShowPropAni.showAniUI(data);
                        //     this.mGameCtrObj.gotoNextLevel();
                        //     this.mGameCtrObj.openRun();
                            // script.hideAdView();
                        // }
                    } else {
                        //视频界面非用户主动关闭时不执行后续逻辑
                        if (res.type != 'video') {
                            this.mGameCtrObj.gotoNextLevel();
                            this.mGameCtrObj.openRun();
                            script.hideAdView();
                        }
                    }
                });
            })
            
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                //统计新关卡开始
                let num = Global.GameModel.mLevel + 1;
                wx.aldStage.onStart({
                    stageId: num, //关卡ID 该字段必传
                    stageName: '第' + num + '关', //关卡名称  该字段必传
                    userId: '', //用户ID 可选
                });
            }
        } else {
            this.mGameCtrObj.gotoGameOver();
        }
    },
    setNeedClear(b) {
        this.needClear = b;
    },

    isEnded() {
        var bRet = true;
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] == null) {
                    continue;
                }
                var curColor = this.stars[i][j].getComponent('Star').getColor();
                //上
                if (
                    i - 1 >= 0 &&
                    this.stars[i - 1][j] != null &&
                    this.stars[i - 1][j].getComponent('Star').getColor() == curColor
                ) {
                    return false;
                }

                //下
                if (
                    i + 1 < Global.GameModel.ROW_NUM &&
                    this.stars[i + 1][j] != null &&
                    this.stars[i + 1][j].getComponent('Star').getColor() == curColor
                ) {
                    return false;
                }
                //左
                if (
                    j - 1 >= 0 &&
                    this.stars[i][j - 1] != null &&
                    this.stars[i][j - 1].getComponent('Star').getColor() == curColor
                ) {
                    return false;
                }
                //右
                if (
                    j + 1 < Global.GameModel.COL_NUM &&
                    this.stars[i][j + 1] != null &&
                    this.stars[i][j + 1].getComponent('Star').getColor() == curColor
                ) {
                    return false;
                }
            }
        }
        return bRet;
    },

    getLeftStarNum() {
        var ret = 0;
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] == null) continue;
                ret++;
            }
        }
        return ret;
    },

    //清理所有的星星
    clearAllStar() {
        for (var i = 0; i < Global.GameModel.ROW_NUM; i++) {
            for (var j = 0; j < Global.GameModel.COL_NUM; j++) {
                if (this.stars[i][j] != null) {
                    this.stars[i][j].getComponent('Star').clearAllInfo();
                    Global.tStarObj.put(this.stars[i][j]);
                    this.stars[i][j] = null;
                }
            }
        }
    },

    //创建粒子特效
    showStarParticleEffect(color, position) {
        var starParticleObj = this.getStarAniPrefab(color);
        starParticleObj.parent = this.node;
        starParticleObj.setPosition(position);
        var flag = Global.GameModel.getIsPhoneModel();
        var data = Global.tStarAniObj;
        if (flag) {
            data = Global.tStarAniObj1;
        }
        starParticleObj.getComponent('starEffect').init(this, starParticleObj, 1.5, data);
    },

    //获取烟花的对象池
    getStarAniPrefab(color) {
        var mObject = null;
        var flag = Global.GameModel.getIsPhoneModel();
        var data = Global.tStarAniObj;
        var info = this.mStarParticle;
        if (flag) {
            data = Global.tStarAniObj1;
            info = this.mStarParticle1;
        }

        if (data[color].size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            mObject = data[color].get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            mObject = cc.instantiate(info[color]);
        }
        return mObject;
    },

    update(dt) {
        this.updateStar(dt);
    },
});