import { AdditionalPhonemeInfo } from '@inworld/web-core';
import { MathUtils, SkinnedMesh } from 'three';

import { AvatarFacialEmotionMap } from '../utils/avatar-facial-emotion-map';
import { AvatarEyes } from './avatar-eyes';
import { AvatarMouth } from './avatar-mouth';
import { azureBSs2AvatarBSs } from '../utils/azure-bs2avatar-bs';

export interface AvatarFacialProps {
    modelMesh: SkinnedMesh;
}

const MORPH_DURATION = 0.25;
const LERP_FACTOR = 0.6;

const BLENDSHAPE_TICK_DURATION = 1 / 60 - 0.005;

export class AvatarFacial {
    eye: AvatarEyes;
    emotion: string;
    emotionOld: string;
    modelMesh: SkinnedMesh;
    morphTime: number;
    mouth: AvatarMouth;

    blendshapes: number[][] = [];
    blendshapeIndex = -1;

    constructor(props: AvatarFacialProps) {
        this.modelMesh = props.modelMesh;
        this.emotion = 'Neutral';
        this.emotionOld = 'Neutral';
        this.morphTime = 0;
        this.eye = new AvatarEyes({ modelMesh: this.modelMesh });
        this.mouth = new AvatarMouth({ modelMesh: this.modelMesh });
    }

    getMorphIndex(name: string) {
        let nResult = -1;
        if (this.modelMesh) {
            for (let i = 0; i < this.modelMesh.userData['targetNames'].length; i++) {
                if (this.modelMesh.userData['targetNames'][i] === name) {
                    nResult = i;
                    break;
                }
            }
        }
        return nResult;
    }

    setEmotion(emotion: string) {
        if (emotion) {
            // this.emotionState = BehaviorToBody[emotion];
            this.emotion = emotion;
            // this.updateEmotion();
        }
    }

    setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
        this.mouth.setPhonemes(phonemes);
    }

    setFacialBlendshapes(blendshapes: number[][] = [], morphScaler = 1) {
        this.blendshapes = azureBSs2AvatarBSs(blendshapes, this.modelMesh.morphTargetDictionary!, morphScaler);
        if (this.blendshapes.length) {
            this.blendshapeIndex = 0;
        } else {
            this.resetFacialExpression();
        }
    }

    resetFacialExpression() {
        // 重置面部表情
        if (this.modelMesh) {
            for (const key in this.modelMesh.morphTargetDictionary) {
                if (this.modelMesh.morphTargetDictionary.hasOwnProperty(key)) {
                    this.modelMesh.morphTargetInfluences![this.modelMesh.morphTargetDictionary[key]] = 0;
                }
            }
        }
    }

    setVisemeIdScript(script: { visemeID: number; time: number }[]) {
        this.mouth.setVisemeIdScript(script);
    }

    updateFrame(delta: number) {
        // Facial emotional morphing
        if (this.emotion != this.emotionOld) {
            this.morphTime += delta;

            if (AvatarFacialEmotionMap[this.emotion]) {
                // Reset old emotion
                if (AvatarFacialEmotionMap[this.emotionOld]) {
                    for (const [key, _] of Object.entries(
                        AvatarFacialEmotionMap[this.emotionOld],
                    )) {
                        const targetVal = AvatarFacialEmotionMap[this.emotion][key] ?? 0;
                        const targetIndex = this.getMorphIndex(key);
                        if (targetIndex != -1) {
                            this.modelMesh.morphTargetInfluences![targetIndex] =
                                MathUtils.lerp(
                                    this.modelMesh.morphTargetInfluences![targetIndex],
                                    targetVal * 0.01,
                                    LERP_FACTOR,
                                );
                        }
                    }
                }
                // Add new emotion
                for (const [key, value] of Object.entries(
                    AvatarFacialEmotionMap[this.emotion],
                )) {
                    const targetIndex = this.getMorphIndex(key);
                    if (targetIndex != -1) {
                        this.modelMesh.morphTargetInfluences![targetIndex] = MathUtils.lerp(
                            this.modelMesh.morphTargetInfluences![targetIndex],
                            value * 0.01,
                            LERP_FACTOR,
                        );
                    }
                }
            }
            if (this.morphTime >= MORPH_DURATION) {
                this.morphTime = 0;
                this.emotionOld = this.emotion;
            }
        }

        if (this.blendshapes.length && this.blendshapeIndex >= 0) {
            this.morphTime += delta;

            const curBlendshape = this.blendshapes[this.blendshapeIndex];
            if (curBlendshape) {
                for (let i = 0; i < curBlendshape.length; i++) {
                    this.modelMesh.morphTargetInfluences![i] = MathUtils.lerp(
                        this.modelMesh.morphTargetInfluences![i],
                        curBlendshape[i],
                        LERP_FACTOR,
                    );
                }
            } else {
                this.blendshapeIndex = -1;
                this.blendshapes = [];
                this.modelMesh.morphTargetInfluences?.forEach((_, i) => {
                    this.modelMesh.morphTargetInfluences![i] = 0;
                });
            }

            if (this.morphTime >= BLENDSHAPE_TICK_DURATION) {
                this.blendshapeIndex += (this.morphTime / BLENDSHAPE_TICK_DURATION) | 0; // equil to Math.floor()
                this.morphTime = 0;
            }
        } else {
            if (this.modelMesh.morphTargetDictionary?.['mouthSmileLeft'] !== undefined) {
                this.modelMesh.morphTargetInfluences![this.modelMesh.morphTargetDictionary!['mouthSmileLeft']] = 0.35;
            }
            if (this.modelMesh.morphTargetDictionary?.['mouthSmileRight'] !== undefined) {
                this.modelMesh.morphTargetInfluences![this.modelMesh.morphTargetDictionary!['mouthSmileRight']] = 0.35;
            }
        }

        this.eye.updateFrame(delta);
        this.mouth.updateFrame(delta);
    }
}
