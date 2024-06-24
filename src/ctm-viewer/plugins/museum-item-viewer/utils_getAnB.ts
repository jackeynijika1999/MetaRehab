export async function getAudioAndBlendshapes(audioFileUrl: string, blendshapeFileUrl: string): Promise<{ audioBase64: string, blendshapes: number[][] }> {
  try {
    const audioResponse = await fetch(audioFileUrl);
    const audioBlob = await audioResponse.blob();
    const audioBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(audioBlob);
    });

    const blendshapeResponse = await fetch(blendshapeFileUrl);
    const blendshapes = await blendshapeResponse.json(); // 自动解析为数组

    return {
      audioBase64: audioBase64.split(',')[1], // 移除 data URL 前缀
      blendshapes
    };
  } catch (error) {
    console.error("Error fetching audio or blendshapes: ", error);
    throw error;
  }
}

