/*
 * @Author: chenging
 * @Date: 2019-01-08 11:33:38
 * @LastEditors: chenging
 * @LastEditTime: 2019-06-13 15:32:02
 * 音效控制
 */
cc.Class({
    extends: cc.Component,

    properties: {
        IsPlayEffect: true,
        IsPlayMusic: true,
        soundList:[],
        mBgMusic: null,
    },
    //初始化音频资源
    initSound(callback){
        cc.loader.loadResDir('sound', (complete, total) => {
            callback({
                complete: complete,
                total: total
            })
        }, (err, clip) => {
            if (err) {
                cc.log('加载音频资源出错');
                return;
            }
            //处理音频数组
            for(let i=0,len=clip.length;i<len;i++){
                this.soundList[clip[i].name]=clip[i];
            }
            this.playBgm('bg-music');
        })
    },
     //播放音效
    playEffect(name, volume = 1) {
        if (this.IsPlayEffect) {
            if (this.soundList[name]) {
                cc.audioEngine.play(this.soundList[name], false, volume);
            }
            else {
            }
        }
    },

    //播放背景音乐
    playBgm(name, volume = 1) {
        if (this.IsPlayMusic) {
            if (this.soundList[name]) {
                cc.audioEngine.stopAll();
                this.mBgMusic = cc.audioEngine.play(this.soundList[name], true, volume);
            }
            else {
            }
        }
    },

    //选择静音
    closeMusic() {
        this.stopAll();
        this.IsPlayMusic = false;
        this.mBgMusic = null;
    },

    closeEffect() {
        this.IsPlayEffect = false;
    },

    //取消静音
    openMusic(bgm, volume = 1) {
        this.IsPlayMusic = true;
        this.playBgm(bgm, volume);
    },

    openEffect() {
        this.IsPlayEffect = true;
    },
    //停止所有音乐
    stopAll() {
        cc.audioEngine.stopAll();
    },

    //暂停音乐
    pauseMusic() {
        if (this.mBgMusic) {
            if (this.IsPlayMusic) {
                cc.audioEngine.pause(this.mBgMusic);
            }
        }
    },

    //继续播放
    resumeMusic() {
        if (this.mBgMusic) {
            if (this.IsPlayMusic) {
                cc.audioEngine.resume(this.mBgMusic);
            }
        }
    }, 
});
