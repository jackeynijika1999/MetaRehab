export function azureVisemeId2AvatarBSIdx(azureVisId: number, morphTargetDictionary?: { [key: string]: number }) {
    if (!morphTargetDictionary) {
        console.error('morphTargetDictionary is required');
        return -1;
    }

    // const azureVisemeMap = [
    //     'sil',
    //     'EE',
    //     'EE',
    //     'OH',
    //     'ss',
    //     'ss',
    //     'IH',
    //     'OU',
    //     'OU',
    //     'OH',
    //     'OH',
    //     'EE',
    //     'IH',
    //     'OU',
    //     'nn',
    //     'ss',
    //     'CH',
    //     'TH',
    //     'ff',
    //     'dd',
    //     'kk',
    //     'pp'
    // ];

    const azureVisemeMap = [
        'sil',
        'EE',
        'EE',
        'oh',
        'SS',
        'SS',
        'ih',
        'ou',
        'ou',
        'oh',
        'oh',
        'EE',
        'IH',
        'ou',
        'nn',
        'SS',
        'CH',
        'TH',
        'ff',
        'dd',
        'kk',
        'pp'
    ];

    return morphTargetDictionary[azureVisemeMap[azureVisId]] || -1;
}

export function azureVisScript2AvatarBSs(azureVisScript: { visemeID: number, time: number }[], morphTargetDictionary: { [key: string]: number }) {
    return azureVisScript.map((vis) => ({
        blendshapeIdx: azureVisemeId2AvatarBSIdx(vis.visemeID, morphTargetDictionary),
        time: (vis.time / 10000 / 1000) * 1.2
    }));
}
