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
    },
    tool: null,
    type: 0,
    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    },

    init(obj) {
        this.mGameCtrObj = obj;
        this.node.active = false;
    },

    start() {},

    //type:0-游戏 1-结束  tool:0-重置  1-流星
    ShowUI(type, tool) {
        this.type = type;
        this.tool = tool;
        Global.setGiveUpBtnPosition(this.node, 'btn_close');
        this.node.getChildByName('ziy_7').active = false;
        this.node.getChildByName('ziti_1').active = true;
        this.node.getChildByName('btn_again').active = false;
        this.node.getChildByName('btn_use').active = true;
        // this.node.getChildByName('ziy_8').active = false;
        if (Global.tips_share > 0) {
            Global.tips_share -= 1;
            Global.setNumConf();
        } else {
            return;
        }
        Global.GameModel.isWarn = true;
        if (tool == 0) {
            this.tProp[0].node.active = true;
            this.tProp[1].node.active = false;
            this.tTips[0].node.active = true;
            this.tTips[1].node.active = false;
            this.node.getChildByName('zi_11').getComponent(cc.Label).string = '转 换';
        } else {
            this.tProp[1].node.active = true;
            this.tProp[0].node.active = false;
            this.tTips[1].node.active = true;
            this.tTips[0].node.active = false;
            this.node.getChildByName('zi_11').getComponent(cc.Label).string = '闪 电';
        }

        this.node.active = true;
        this.mIndex = tool;
        this.mBg.node.setScale(0);
        var action1 = cc.scaleTo(Global.mTanChuan[0], Global.mTanChuan[1]);
        var action2 = cc.scaleTo(Global.mTanChuan[2], Global.mTanChuan[3]);
        this.mBg.node.runAction(cc.sequence(action1, action2));
    },

    useTool() {
        this.node.active = false;
        if (this.tool == 0) {
            Global.useToolType = 'useResetting';
        } else {
            Global.useToolType == 'userLiuxing'
        }
    },

    again() {
        let self = this;
        self.node.active = false;
        self.scheduleOnce(function () {
            if (self.tool == 0) {
                Global.useToolType = 'useResetting';
            } else {
                Global.useToolType == 'userLiuxing'
            }
        }, 0.5);
    },

    close() {
        this.node.active = false;
    },
    // update (dt) {},
});