/**
* 排行榜单例类
* @author WH
* @Time 2018-7-18
*
*/
import Global from '../controller/Global';
cc.Class({
    extends: cc.Component,

    properties: {
        mRankLabel: cc.Label,
        mUserHeadIcon: cc.Sprite,
        mUserName: cc.Label,
        mRankSprite:{
            default: [],
            type: cc.Sprite,
        },
        mScore: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    InitViewUI(obj,data, rank){
        this.RanlObj = obj;
        this.userid = data.user_id;
        this.mUserName.string = Global.GameModel.cutstr(data.nickname,10);
        this.mRankSprite[0].node.active = false;
        this.mRankSprite[1].node.active = false;
        this.mRankSprite[2].node.active = false;
        this.mRankLabel.node.active = false;

        if (rank < 3){
            this.mRankSprite[rank].node.active = true;
        }
        else
        {
            this.mRankLabel.node.active = true;
            this.mRankLabel.string = (rank + 1);
        }
        
        this.createImage(data.avatar_url);
        this.mScore.string = data.score;
    },
    
    createImage(avatarUrl) {
        if (window.wx !== undefined) 
        {
            try 
            {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.mUserHeadIcon.spriteFrame = new cc.SpriteFrame(texture);
                        this.mUserHeadIcon.node.width = 72;
                        this.mUserHeadIcon.node.height = 72;
            
                    } catch (e) {
                    cc.log(e);
                    //this.avatarImgSprite.node.active = false;
                }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
        //this.avatarImgSprite.node.active = false;
            }
        } else {
        cc.loader.load({
            url: avatarUrl, type: 'jpg'
        }, (err, texture) => {
                this.mUserHeadIcon.spriteFrame = new cc.SpriteFrame(texture);
                this.mUserHeadIcon.node.width = 72;
                this.mUserHeadIcon.node.height = 72;
            });
        }
    },

    // update (dt) {},
});
