import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        appidNode: cc.Node, //跳转的单例
        unlock: cc.Node,
        _clickTime: null, //点击预览时间
        _qrcodeParmas: null, //点击二维码时汇报的参数
    },

    onLoad() {
        //当父节点高度较小时，缩放到父节点高度
        if (this.appidNode.height > this.appidNode.parent.height) {
            this.appidNode.height = 120;
            this.appidNode.width = 120;
            //呼吸动效
            let action = cc.repeatForever(cc.sequence(
                cc.scaleTo(0.6, 0.8),
                cc.scaleTo(0.8, 0.6)
            ));
            this.appidNode.runAction(action);
        } else {
            //呼吸动效
            let action = cc.repeatForever(cc.sequence(
                cc.scaleTo(0.8, 1),
                cc.scaleTo(1, 0.8)
            ));
            this.appidNode.runAction(action);
        }
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.onShow(res => {
                //计算花费的时间
                if (this._clickTime) {
                    let costTime = new Date().getTime() - this._clickTime;
                    this._clickTime = null;
                    if (this._qrcodeParmas) {
                        //向服务端汇报
                        this._qrcodeParmas.duration = costTime / 1000;
                        this._qrcodeParmas.is_up=1;
                        Global.api.appClickQrcodeReport(this._qrcodeParmas, (res) => {

                        })

                    }
                }
            })
        }
    },
    //goAppid
    goAppid(e) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            if (e.target.clickType == 1) {
                //二维码预览跳转
                wx.previewImage({
                    current: e.target.path,
                    urls: [e.target.path],
                    success: (res) => {
                        this.unlock.active = false;
                        this._clickTime = new Date().getTime();
                        if (Global.skeyid) {
                            //存储汇报参数
                            this._qrcodeParmas = {
                                id: e.target.id,
                                app_id: 'wxd519b1e4deaed039',
                                ad_id:e.target.adId,
                                open_id: Global.getLocalStorageSync('open_id'),
                                skeyid: Global.skeyid
                            }
                            Global.api.appClickQrcodeReport(this._qrcodeParmas, (res) => {

                            })
                        }

                    }
                })
            } else {
                //直接跳转
                wx.navigateToMiniProgram({
                    appId: e.target.app_id,
                    path: e.target.path,
                    extraData: {},
                    envVersion: 'release',
                    success: (res) => {
                        // 打开成功
                        this.aldStatistics(e, '成功');
                        this.unlock.active = false;
                        //kid存在才汇报
                        if (Global.skeyid) {
                            //向服务端汇报
                            let options = {
                                id: e.target.id,
                                app_id: 'wxd519b1e4deaed039',
                                ad_id:e.target.adId,
                                open_id: Global.getLocalStorageSync('open_id'),
                                skeyid: Global.skeyid
                            }
                            Global.api.appClickReport(options, (res) => {

                            })
                        }
                        //回调点击结果
                        // let CustomEvent = new cc.Event.EventCustom("adViewListener", true)
                        // CustomEvent.setUserData({
                        //     code: 1,
                        //     type: 'openAppid',
                        //     msg: '用户已完成预期操作',
                        //     result: {
                        //         propIndex: null
                        //     }
                        // });
                        // this.node.dispatchEvent(CustomEvent);
                    },
                    fail: err => {
                        this.aldStatistics(e, '失败');
                    }
                });
            }

        } else {
            console.log('小程序信息', e.target);
            this.unlock.active = false;
            // let CustomEvent = new cc.Event.EventCustom("adViewListener", true)
            // CustomEvent.setUserData({
            //     code: 1,
            //     type: 'openAppid',
            //     msg: '用户已完成预期操作',
            //     result: {
            //         propIndex: null
            //     }
            // });
            // this.node.dispatchEvent(CustomEvent);
        }
    },
    //阿拉丁统计事件
    aldStatistics(e, info) {
        let parentName = e.target.parent.name;
        let appName = e.target.appName;
        if (parentName == 'list') {
            wx.aldSendEvent('首页底部打开小程序' + appName + info);
        }
        if (parentName == 'content') {
            wx.aldSendEvent('首页猜你喜欢打开小程序' + appName + info);
        }
        if (parentName == 'friend-play-bg') {
            wx.aldSendEvent('游戏过关打开小程序' + appName + info);
        }
        if (parentName == 'spAppidList') {
            wx.aldSendEvent('游戏页顶部打开小程序' + appName + info);
        }
    }

});