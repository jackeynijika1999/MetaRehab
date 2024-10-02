import { CTMViewerConfig } from "./ctm-viewer";
import { PluginModelViewerConfig } from "./ctm-viewer/plugins/model-viewer/plugin-model-viewer";
import { PluginShopItemViewerConfig } from "./ctm-viewer/plugins/shopitem-viewer/plugin-shopitem-viewer";
import { PluginMuseumItemViewerConfig } from "./ctm-viewer/plugins/museum-item-viewer/plugin-museumItem-viewer";

export function getModelViewerConfigs(sceneName: string): Promise<PluginModelViewerConfig[]> {
    const configs: { [key: string]: PluginModelViewerConfig[] } = {
        'tang-pottery-two-people-240125': [{
            selector: {
                box: {
                    position: [-0.6084118998156165, 0.2689453786948607, -6.0733041348199],
                    rotation: [0, 0, 0],
                    scale: [0.2, 0.9, 0.6],
                },
            },
            model: {
                source: 'assets/caima/scene.gltf',
                position: [0, 0, 1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            },
        },
        {
            selector: {
                box: {
                    position: [0.9435197755488771, 0.1931008758792957, -4.962901078761127],
                    rotation: [0, 0, 0],
                    scale: [0.6, 0.7, 0.2],
                },
            },
            model: {
                source: 'assets/caima/scene.gltf',
                position: [0, 0, 1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            },
        },
        {
            selector: {
                box: {
                    position: [1.4944304050745083, 0.1931008758792957, -4.4859242821527925],
                    rotation: [0, 0, 0],
                    scale: [0.2, 0.7, 0.6],
                },
            },
            model: {
                source: 'assets/caima/scene.gltf',
                position: [0, 0, 1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            },
        },
        {
            selector: {
                box: {
                    position: [0.3656413078938388, 0.37946666283527125, 0.37089631890733693],
                    rotation: [0, 0, 0],
                    scale: [0.2, 0.9, 0.2],
                },
            },
            model: {
                source: 'assets/tang_pottery/scene.gltf',
                position: [0, -0.3, 0],
                rotation: [0, 0, 0],
                scale: [0.04, 0.04, 0.04],
            },
        },
        {
            selector: {
                box: {
                    position: [-0.34366125363055644, 0.37946666283527125, -0.1975202005104919],
                    rotation: [0, 0, 0],
                    scale: [0.2, 0.9, 0.2],
                },
            },
            model: {
                source: 'assets/tang_pottery/scene.gltf',
                position: [0, -0.3, 0],
                rotation: [0, 0, 0],
                scale: [0.04, 0.04, 0.04],
            },
        },],
    };
    return Promise.resolve(configs[sceneName] || []);
}

export function getCTMViewerConfigs(sceneName: string): Promise<CTMViewerConfig> {
    // @ts-ignore
  const configs: { [key: string]: CTMViewerConfig } = {
        'polyu-clock-tower-240123': {
            camera: {
                posotion: [2, 0, 14],
                lookAt: [2, 0, 2],
            },
            gs: {
                source: 'https://lumalabs.ai/capture/90c3ccc5-6b6e-462c-88aa-9ff7989d68a7',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                scale: [5, 5, 5],
            },
            npc: [
                {
                    position: [1.5, -1.9, 7],
                    rotation: [0, 0, 0],
                    scale: [1.1, 1.1, 1.1],
                    avatarConfig: JSON.parse(JSON.stringify({
                        "avatar": {
                            "baseURIs": {
                                "ANIMATIONS": "assets/digital-human/metaperson/animations/",
                                "MODELS": "assets/digital-human/metaperson/"
                            },
                            "modelInfo": {
                                "avatarRootName": "AvatarRoot",
                                "avatarHeadName": "AvatarHead"
                            },
                            "defaults": {
                                "IDLE_ANIMATION": "Neutral_Idle",
                                "EMOTION": "NEUTRAL",
                                "MODEL": "metaperson-male.glb"
                            },
                            "animations": {
                                "Neutral_Idle": {
                                    "emotion": "neutral",
                                    "type": "idle",
                                    "file": "idle.fbx"
                                },
                                "Neutral_Talking_01": {
                                    "emotion": "neutral",
                                    "type": "talking",
                                    "file": "talking_01.fbx"
                                },
                                "Neutral_Talking_02": {
                                    "emotion": "neutral",
                                    "type": "talking",
                                    "file": "talking_02.fbx"
                                }
                            }
                        }
                    }))
                }
            ],
            agent: {
                avatarConfig: JSON.parse(JSON.stringify({
                    "avatar": {
                        "baseURIs": {
                            "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                            "MODELS": "assets/digital-human/girl-face-model3/"
                        },
                        "modelInfo": {
                            "avatarRootName": "root",
                            "avatarHeadName": "mesh"
                        },
                        "defaults": {
                            "IDLE_ANIMATION": "",
                            "EMOTION": "NEUTRAL",
                            "MODEL": "model.gltf"
                        },
                        "animations": {}
                    }
                })),
                position: [0, -0.02, 0.35],
                rotation: [Math.PI / 15, Math.PI / 100, 0],
                scale: [1, 1, 1],
                open: false
            }
        },
        'tang-pottery-two-people-240125': {
            camera: {
                posotion: [-1.8, 0.3, 3],
                lookAt: [-0.2, 0.3, 0.45]
            },
            gs: {
                source: 'https://lumalabs.ai/capture/607b5bb1-7bcd-4f34-a5af-347a10757533',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                scale: [1, 1, 1],
            },
            agent: {
                avatarConfig: JSON.parse(JSON.stringify({
                    "avatar": {
                        "baseURIs": {
                            "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                            "MODELS": "assets/digital-human/girl-face-model3/"
                        },
                        "modelInfo": {
                            "avatarRootName": "root",
                            "avatarHeadName": "mesh"
                        },
                        "defaults": {
                            "IDLE_ANIMATION": "",
                            "EMOTION": "NEUTRAL",
                            "MODEL": "model.gltf"
                        },
                        "animations": {}
                    }
                })),
                position: [0, -0.02, 0.35],
                rotation: [Math.PI / 15, Math.PI / 100, 0],
                scale: [1, 1, 1],
                open: false
            }
        },
        'clearwater-store': {
            camera: {
                posotion: [4.5, 0.3, -2],
                lookAt: [-1, 0.3, 0.45]
            },
            gs: {
                source: 'https://lumalabs.ai/capture/067b46c8-d737-42be-9112-a4654a506855',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                scale: [1, 1, 1],
            },
            agent: {
                avatarConfig: JSON.parse(JSON.stringify({
                    "avatar": {
                        "baseURIs": {
                            "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                            "MODELS": "assets/digital-human/girl-face-model3/"
                        },
                        "modelInfo": {
                            "avatarRootName": "root",
                            "avatarHeadName": "mesh"
                        },
                        "defaults": {
                            "IDLE_ANIMATION": "",
                            "EMOTION": "NEUTRAL",
                            "MODEL": "model.gltf"
                        },
                        "animations": {}
                    }
                })),
                position: [0, -0.02, 0.35],
                rotation: [Math.PI / 15, Math.PI / 100, 0],
                scale: [1, 1, 1],
                open: true
            }
        },
        'shenzhen-museum-240625': {
            camera: {
                posotion: [-4, 0, 0.78],
                lookAt: [0, 0, -1],
            },
            gs: {
                source: 'https://lumalabs.ai/capture/7173857f-4f82-48a6-83d0-2b4e16e124b7',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                scale: [1, 1, 1],
            },
            agent: {
                avatarConfig: JSON.parse(JSON.stringify({
                  "avatar": {
                    "baseURIs": {
                      "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                      "MODELS": "assets/digital-human/girl-face-model3/"
                    },
                    "modelInfo": {
                      "avatarRootName": "root",
                      "avatarHeadName": "mesh"
                    },
                    "defaults": {
                      "IDLE_ANIMATION": "",
                      "EMOTION": "NEUTRAL",
                      "MODEL": "model.gltf"
                    },
                    "animations": {}
                  }
              })),
                position: [0, -0.02, 0.35],
                rotation: [Math.PI / 15, Math.PI / 100, 0],
                scale: [1, 1, 1],
                open: false
          },
        },
        'polyu-st011': {
            camera: {
              posotion: [2.5, 0.125, 0.38],
              lookAt: [-10, 0, 1],
            },
            gs: {
              source: 'https://lumalabs.ai/capture/a680ac70-173e-4e07-87c9-b1f9d30760fa',
              position: [0, 0, 0],
              rotation: [0, Math.PI, 0],
              scale: [1, 1, 1],
            },
            agent: {
              avatarConfig: JSON.parse(JSON.stringify({
                "avatar": {
                  "baseURIs": {
                    "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                    "MODELS": "assets/digital-human/girl-face-model3/"
                  },
                  "modelInfo": {
                    "avatarRootName": "root",
                    "avatarHeadName": "mesh"
                  },
                  "defaults": {
                    "IDLE_ANIMATION": "",
                    "EMOTION": "NEUTRAL",
                    "MODEL": "model.gltf"
                  },
                  "animations": {}
                }
              })),
              position: [0, -0.02, 0.35],
              rotation: [Math.PI / 15, Math.PI / 100, 0],
              scale: [1, 1, 1],
              open: false
            },
          },
        'polyu-st816': {
            camera: {
              posotion: [-4, 0, 0.78],
              lookAt: [0, 0, -1],
            },
            gs: {
              source: 'https://lumalabs.ai/capture/a680ac70-173e-4e07-87c9-b1f9d30760fa',
              position: [0, 0, 0],
              rotation: [0, Math.PI, 0],
              scale: [1, 1, 1],
            },
            agent: {
              avatarConfig: JSON.parse(JSON.stringify({
                "avatar": {
                  "baseURIs": {
                    "ANIMATIONS": "assets/avatar/lz-face-model/animations/",
                    "MODELS": "assets/digital-human/girl-face-model3/"
                  },
                  "modelInfo": {
                    "avatarRootName": "root",
                    "avatarHeadName": "mesh"
                  },
                  "defaults": {
                    "IDLE_ANIMATION": "",
                    "EMOTION": "NEUTRAL",
                    "MODEL": "model.gltf"
                  },
                  "animations": {}
                }
              })),
              position: [0, -0.02, 0.35],
              rotation: [Math.PI / 15, Math.PI / 100, 0],
              scale: [1, 1, 1],
              open: false
            },
          },
        'shenzhen-museum-demo-2': {
            camera: {
                posotion: [-1.404010475375047, 0.08155294383508468, -0.23198189324992072],
                lookAt: [2, 0, 28],
            },
            gs: {
                source: 'https://lumalabs.ai/capture/95691450-25ee-46ef-8416-4b506874f101',
                position: [0, 0, 0],
                rotation: [-0.1, Math.PI, 0.0],
                scale: [1, 1, 1],
            },
        },
    };

    return Promise.resolve(configs[sceneName]);
}
export function getMuseumItemViewerConfigs(sceneName: string): Promise<PluginMuseumItemViewerConfig[]> {
    const configs: { [key: string]: PluginMuseumItemViewerConfig[] } = {
      'polyu-st011': [{
        // 'shenzhen-museum-240625': [{
          selector: {
            box: {
              position: [0.2487475276840469,-0.2685565519678386,-1.141785805462551],
              rotation: [0, 2.5, 0],
              scale: [1, 2, 1],
            },
          },
          model: {
            source: 'assets/bw porcelain bottle square/123654.gltf',
            videoSource: 'assets/leg1/leg1.MP4',  // 添加视频文件路径
            position: [0, -0.3, 0.1],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          },
          detail: {
            name: '坐式大腿伸展训练器',
            description: '该器械是一种专门用于锻炼大腿肌肉的器械，通过坐在器械上，将双腿放在器械上，然后用力将双腿向前伸展，从而锻炼大腿肌肉。\n 该器械的使用方法简单，锻炼效果明显，是一种非常适合家庭使用的器械。 ',
            category: '力量器械',
            era: '建议每组做15次，每天做3组。',
          },
          agentDescription: {
            audioFileName: './assets/agent_wave/leg1.wav',
            blendshapeFileName: './assets/agent_blendshape/bwSquare.json',

          }

        },
          {

            selector: {
              box: {
                position: [0.7276243147255687,-0.5027555556082945,-1.3092896296640506],
                rotation: [0, 2.5, 0],
                scale: [0.5, 0.5, 0.5],
              },
            },
            model: {
              source: 'assets/bw porcelain basin/scene.gltf',
              videoSource: 'assets/leg1/leg1.MP4',  // 添加视频文件路径
              position: [0, -0.17, 0],
              rotation: [0, 0, 0],
              scale: [0.00010, 0.00010, 0.00010],
            },
            detail: {
              name: '坐式大腿伸展训练器',
              description: '该器械是一种专门用于锻炼大腿肌肉的器械，通过坐在器械上，将双腿放在器械上，然后用力将双腿向前伸展，从而锻炼大腿肌肉。\n 该器械的使用方法简单，锻炼效果明显，是一种非常适合家庭使用的器械。',
              category: '力量器械',
              era: '建议每组做15次，每天做3组。',
            },
            agentDescription: {
              audioFileName: './assets/agent_wave/leg1.wav',
              blendshapeFileName: './assets/agent_blendshape/bwBasin.json',
            }
          },
          //   selector: {
          //     box: {
          //       position: [-1.6869010383024021, -0.21507744826588124, -1.1726073042536085],
          //       rotation: [0, 2.5, 0],
          //       scale: [0.5, 0.5, 0.5],
          //     },
          //   },
          //   model: {
          //     source: 'assets/bw porcelain basin/scene.gltf',
          //     position: [0, -0.17, 0],
          //     rotation: [0, 0, 0],
          //     scale: [0.00010, 0.00010, 0.00010],
          //   },
          //   detail: {
          //     name: '青花竹石纹碗',
          //     description: '青花竹石纹碗，明永乐，高7.1厘米，口径16.4厘米，足径5.8厘米。\n碗撇口，深弧腹，圈足。内光素无纹饰。外壁青花翠竹、怪石及花草纹装饰。圈足外墙绘回纹。圈足内施青白色釉。\n此碗形体秀美，胎体较薄，釉面光润，造型源自北宋汝窑淡天青釉碗。碗上画面大面积留白，给人以清新雅致之视觉感受，完全摆脱了元代和明代洪武时期青花瓷器装饰繁缛的典型风格的影响，堪称永乐一朝开创瓷器装饰新风格的标志性作品。',
          //     category: '青花瓷器',
          //     era: '北宋',
          //   },
          //   agentDescription: {
          //     audioFileName: './assets/agent_wave/bwBasin.wav',
          //     blendshapeFileName: './assets/agent_blendshape/bwBasin.json',
          //   }
          // },

          // 'shenzhen-museum-demo-2': [{
          //   selector: {
          //     box: {
          //       position: [-1.157786444000783,0.11181129193311846,-0.06529094691500803],
          //       rotation: [0, 2.5, 0],
          //       scale: [0.1,0.1, 0.1],
          //     },
          //   },
          //   model: {
          //     source: 'assets/porcelain_bottle/scene.gltf',
          //     position: [0, -0.4, 0],
          //     rotation: [0, 0, 0],
          //     scale: [1, 1, 1],
          //   },
          //   detail: {
          //     name: '青花折枝花卉纹瓶',
          //     description: '整器造型圓潤，恢宏俊伟，釉质肥厚润泽，青花色泽青翠。\n绘画工艺精湛，图案雍容华贵，系乾隆时期官窑青花的典型器物。乾隆-朝国力强盛，瓷业繁荣，尤其早期唐英督陶之时，所出之器工精料细、为后世难以企及。\n此六方瓶即为乾隆早期御瓷之尊贵造型，其形制肇始于雍正朝，流行于乾隆前期。传世雍正款者十分稀少，目前所知唯见法国吉美博物馆有藏。\n品种所见有青花、粉彩镂空、仿汝、冬青、天蓝诸般颜色釉，均为空前绝后之名品。',
          //     category: '青花瓷器',
          //     era: '春秋',
          //   },
          //  },
        ]
    }

    return Promise.resolve(configs[sceneName] || []);
}

export function getShopItemlViewerConfigs(sceneName: string): Promise<PluginShopItemViewerConfig[]> {
    const configs: { [key: string]: PluginShopItemViewerConfig[] } = {
        'clearwater-store': [{
            //blue life jacket
            selector: {
                box: {
                    position: [0.07461252732486531, 0, 0],
                    rotation: [0, 2, 0],
                    scale: [0.8, 1.4, 0.9],
                },
            },
            model: {
                source: 'assets/blue_lifejacket/scene.gltf',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [0.2, 0.2, 0.2],
            },
            detail: {
                name: 'NRS 新款救生衣',
                description: 'NRS Clearwater 网状背部 PFD 是水上划船安全和舒适的完美选择。采用前开拉链和高背浮力设计，适合大多数皮划艇座椅，低背网状设计，适合温暖天气通风',
                quantityInStock: 10,
                price: 100,
                soldQuantity: "500+",
            },
            images: ["./assets/images/NRS6.jpg", "./assets/images/NRS4.jpg", "./assets/images/NRS5.jpg", "./assets/images/NRS2.jpg", "./assets/images/NRS3.jpg", "./assets/images/NRS.jpg", "./assets/images/NRS1.jpg"],
            comments: [{ author: '刘*华', content: '这个产品真的很棒！我很喜欢！', date: '2024-05-01' }, { author: '张*', content: '非常安全！', date: '2024-05-02' }],
            modelLabel: [
                {
                    label: "400D防撕裂尼龙",
                    location: [0.5, 1.2, 0],
                    lineStartPoint: [0.5, 1.15, 0],
                    modelLocation: [0.3, 1, 0],
                },
                {
                    label: "便捷穿脱卡扣",
                    location: [-1.5, 0, 0.5],
                    lineStartPoint: [-1.1, 0, 0.5],
                    modelLocation: [0, -0.1, 0.5],
                },
            ],
        },
        {
            //orange helmet
            selector: {
                box: {
                    position: [-3.1778135161519048, 0.7434225472044291, 0.4043222454092669],
                    rotation: [0, 0, 0],
                    scale: [0.5, 0.5, 0.5],
                },
            },
            model: {
                source: 'assets/helmet_orange/scene.gltf',
                position: [0, 0, 0],
                rotation: [0, -0.8, 0],
                scale: [0.05, 0.05, 0.05],
            },
            detail: {
                name: '高端运动头盔',
                description: '后脑包裹性头盔，专业针对性保护。 高强度专业材质，安心训练不怕摔，多通风口散热设计佩戴更舒适，盔体12个通风口保持散热效率。\n头盔内衬采用高强度材料，有效吸收冲击力，保护头部安全',
                quantityInStock: 10,
                price: 50,
                soldQuantity: "600+",
                color: 'orange',
            },
            images: ["./assets/images/helmet1.jpg", "./assets/images/helmet2.jpg", "./assets/images/helmet3.jpg", "./assets/images/helmet4.jpg", "./assets/images/helmet5.jpg", "./assets/images/helmet6.jpg"],
            comments: [{ author: '刘*华', content: '这个产品真的很棒！我很喜欢！', date: '2024-05-01' }, { author: '张*', content: '非常安全！', date: '2024-05-02' }],
            modelLabel: [
                {
                    label: "PC材质外壳",
                    location: [0, 7, 0],
                    lineStartPoint: [0, 6.5, 0],
                    modelLocation: [0, 5, 0],
                },
                {
                    label: "便捷穿脱卡扣",
                    location: [-6, -4, 2],
                    lineStartPoint: [-5, -4, 2],
                    modelLocation: [0, -5, 2],
                },
            ],
        },
        {
            //black helmet
            selector: {
                box: {
                    position: [-3.702135151540858, 0.8177988254276359, -0.3275920291645096],
                    rotation: [0, -2, 0],
                    scale: [0.5, 0.5, 0.5],
                },
            },
            model: {
                source: 'assets/helmet_high_poly/scene.gltf',
                position: [0, 0, 0],
                rotation: [0, -0.8, 0],
                scale: [0.05, 0.05, 0.05],
            },
            detail: {
                name: '高端运动头盔',
                description: '后脑包裹性头盔，专业针对性保护。 高强度专业材质，安心训练不怕摔，多通风口散热设计佩戴更舒适，盔体12个通风口保持散热效率。\n头盔内衬采用高强度材料，有效吸收冲击力，保护头部安全',
                quantityInStock: 10,
                price: 50,
                soldQuantity: "500+",
                color: 'black',
            },
            images: ["./assets/images/helmet1.jpg", "./assets/images/helmet2.jpg", "./assets/images/helmet3.jpg", "./assets/images/helmet4.jpg", "./assets/images/helmet5.jpg", "./assets/images/helmet6.jpg"],
            comments: [{ author: '刘*华', content: '这个产品真的很棒！我很喜欢！', date: '2024-05-01' }, { author: '张*', content: '非常安全！', date: '2024-05-02' }],
            modelLabel: [
                {
                    label: "PC材质外壳",
                    location: [0, 7, 0],
                    lineStartPoint: [0, 6.5, 0],
                    modelLocation: [0, 5, 0],
                },
                {
                    label: "便捷穿脱卡扣",
                    location: [-6, -4, 2],
                    lineStartPoint: [-5, -4, 2],
                    modelLocation: [0, -5, 2],
                },
            ],

        },
        {
            //red helmet - (left)
            selector: {
                box: {
                    position: [-3.6732705313948024, 0.7633715063673605, 1.0967399461667986],
                    rotation: [0, 2, 0],
                    scale: [0.5, 0.5, 0.5],
                },
            },
            model: {
                source: 'assets/helmet_red/scene.gltf',
                position: [0, 0, 0],
                rotation: [0, -0.8, 0],
                scale: [0.05, 0.05, 0.05],
            },
            detail: {
                name: '高端运动头盔',
                description: '后脑包裹性头盔，专业针对性保护。 高强度专业材质，安心训练不怕摔，多通风口散热设计佩戴更舒适，盔体12个通风口保持散热效率。\n头盔内衬采用高强度材料，有效吸收冲击力，保护头部安全',
                quantityInStock: 10,
                price: 50,
                soldQuantity: "300+",
                color: 'red',
            },
            images: ["./assets/images/helmet1.jpg", "./assets/images/helmet2.jpg", "./assets/images/helmet3.jpg", "./assets/images/helmet4.jpg", "./assets/images/helmet5.jpg", "./assets/images/helmet6.jpg"],
            comments: [{ author: '刘*华', content: '这个产品真的很棒！我很喜欢！', date: '2024-05-01' }, { author: '张*', content: '非常安全！', date: '2024-05-02' }],
            modelLabel: [
                {
                    label: "PC材质外壳",
                    location: [0, 7, 0],
                    lineStartPoint: [0, 6.5, 0],
                    modelLocation: [0, 5, 0],
                },
                {
                    label: "便捷穿脱卡扣",
                    location: [-6, -4, 2],
                    lineStartPoint: [-5, -4, 2],
                    modelLocation: [0, -5, 2],
                },
            ],
        },
        {
            //yellow boat
            selector: {
                box: {
                    position: [-1.1057027895716331, 0, 3.9901817830198913],
                    rotation: [0, 2, 0],
                    scale: [1.5, 2.5, 2],
                },
            },
            model: {
                source: 'assets/kayak/scene.gltf',
                position: [0, -0.2, 0],
                rotation: [0, 1.2, 0],
                scale: [0.005, 0.005, 0.005],
            },
            detail: {
                name: '可拼接皮划艇',
                description: '探索水上世界的新选择——我们的可拼接皮划艇，为您提供无与伦比的灵活性和便利性。无论您是热衷于激流勇进的冒险者，还是喜欢在平静的湖面上悠闲划行的休闲爱好者，这款可拼接皮划艇都能满足您的需求。\n 产品特点：\n1.这款皮划艇采用创新的模块化设计，可以轻松拼接成不同长度，以适应不同的使用需求。无论是单人独享，还是与家人朋友共享，您都能找到合适的配置',
                quantityInStock: 10,
                price: 200,
                soldQuantity: "200+",
            },
            images: ["./assets/images/kayak1.jpg", "./assets/images/kayak2.jpg", "./assets/images/kayak3.jpg", "./assets/images/kayak4.jpg", "./assets/images/kayak5.jpg", "./assets/images/kayak6.jpg"],
            comments: [{ author: '刘*华', content: '这个产品真的很棒！我很喜欢！', date: '2024-05-01' }, { author: '张*', content: '一家老小都能玩！', date: '2024-05-02' }],
            modelLabel: [
                {
                    label: "可拼接设计",
                    location: [10, 25, 0],
                    lineStartPoint: [9, 24, 0],
                    modelLocation: [0, 0.1, 0],
                },
                {
                    label: "高强度材质",
                    location: [-20, 20, 30],
                    lineStartPoint: [-19, 19, 28],
                    modelLocation: [0, 5, 15],
                },
            ],
        },
        ]
    };
    return Promise.resolve(configs[sceneName] || []);
}


