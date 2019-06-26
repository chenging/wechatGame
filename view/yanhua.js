import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        tYanhua:{
            type: cc.Prefab,
            default:[],
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(obj){
        this.mGameCtrObj = obj;
        this.mTime = 0;
        this.playCount = 0;
        this.tYanse = [];
        this.tTime = [0.5,0.8,1,1.2];
        this.NeedTime = 0;
    },

    startPlay(isLogin){
        this.mIsLogin = isLogin;
        var num = Math.floor(Math.random()*3) + 5
        for (var i = 0; i < num; i++){
            var color = Math.floor(Math.random()*this.tYanhua.length);
            this.tYanse.push(color);
        }
        this.NeedTime = 0;
    },

    //获取烟花的对象池
    getYanhuaPrefab(color){
        var mObject = null;
        cc.log("color:",color)
        if (Global.tYanhuaAniObj[color].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            mObject = Global.tYanhuaAniObj[color].get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            cc.log("烟花不足");
            mObject = cc.instantiate(this.tYanhua[color]);
        }
        
        return mObject;
    },


    clearYanhu(){
        this.tYanse = [];
    },

    //Global.tYanhuaAniObj


    createYanhua(color){
        if (Math.round(Math.random()) == 0){
            Global.SoundModel.playEffect("yanhua1")
        }
        else
        {
            Global.SoundModel.playEffect("yanhua2")
        }


        var x = (Math.random() - 0.5)*350;
        var y = (Math.random() - 0.5)*300;
        if (this.mIsLogin){
            y = (Math.random() - 0.5)*200;
        }
        var yanhuaObj = this.getYanhuaPrefab(color);
        yanhuaObj.setPosition(cc.v2(x,y))
        yanhuaObj.parent = this.node; 
        yanhuaObj.getComponent('yanhuaManager').init(this, yanhuaObj, 5);
    },

    update (dt) {
        this.mTime += dt;
        if (this.mTime >= this.NeedTime){
            this.mTime = 0;
            if (this.tYanse.length > 0){
                var color = this.tYanse.shift();
                this.createYanhua(color);
                var randomNum = Math.round(Math.random())
                if (randomNum != 0){
                    var color = this.tYanse.shift();
                    if (color){
                        this.createYanhua(color);
                    }
                }
                var index = Math.floor(Math.random()*this.tTime.length);
                this.NeedTime = this.tTime[index];
            }
        }
    },
});
