export function azureBS2AvatarBS(azureBS: number[], morphTargetDictionary?: { [key: string]: number }, morphScaler = 1): number[] {
    if (!morphTargetDictionary) {
        console.error('morphTargetDictionary is required');
        return azureBS;
    }

    const azureBSMap = [
        'eyeBlinkLeft',
        'eyeLookDownLeft',
        'eyeLookInLeft',
        'eyeLookOutLeft',
        'eyeLookUpLeft',
        'eyeSquintLeft',
        'eyeWideLeft',
        'eyeBlinkRight',
        'eyeLookDownRight',
        'eyeLookInRight',
        'eyeLookOutRight',
        'eyeLookUpRight',
        'eyeSquintRight',
        'eyeWideRight',
        'jawForward',
        'jawLeft',
        'jawRight',
        'jawOpen',
        'mouthClose',
        'mouthFunnel',
        'mouthPucker',
        'mouthLeft',
        'mouthRight',
        'mouthSmileLeft',
        'mouthSmileRight',
        'mouthFrownLeft',
        'mouthFrownRight',
        'mouthDimpleLeft',
        'mouthDimpleRight',
        'mouthStretchLeft',
        'mouthStretchRight',
        'mouthRollLower',
        'mouthRollUpper',
        'mouthShrugLower',
        'mouthShrugUpper',
        'mouthPressLeft',
        'mouthPressRight',
        'mouthLowerDownLeft',
        'mouthLowerDownRight',
        'mouthUpperUpLeft',
        'mouthUpperUpRight',
        'browDownLeft',
        'browDownRight',
        'browInnerUp',
        'browOuterUpLeft',
        'browOuterUpRight',
        'cheekPuff',
        'cheekSquintLeft',
        'cheekSquintRight',
        'noseSneerLeft',
        'noseSneerRight',
        'tongueOut',
        'headRoll',
        'leftEyeRoll',
        'rightEyeRoll',
    ];

    const avatarBS = new Array(Object.keys(morphTargetDictionary).length).fill(0);
    azureBS.forEach((value, index) => {
        const targetIndex = morphTargetDictionary[azureBSMap[index]];
        if (targetIndex !== undefined) {
            avatarBS[targetIndex] = value * morphScaler; // 
            if (targetIndex === 43 || targetIndex === 44) {
                avatarBS[targetIndex] = Math.max(value, 0.1);
            }
        }
    });

    return avatarBS;
}

export function azureBSs2AvatarBSs(azureBSs: number[][], morphTargetDictionary: { [key: string]: number }, morphScaler = 1): number[][] {
    return azureBSs.map(azureBS => azureBS2AvatarBS(azureBS, morphTargetDictionary, morphScaler));
}
