import { OPENCV_API_TRIGGER_PASSWORD, OPENCV_API_URL } from "@/config"

export const triggerOpenCVProcessing = async (): Promise<{
  success: boolean
  status?: number
}> => {
  try {
    const response = await fetch(`${OPENCV_API_URL}/classify/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: OPENCV_API_TRIGGER_PASSWORD }),
    })

    if (!response.ok) {
      return { success: false, status: response.status }
    } else {
      return { success: true }
    }
  } catch (error) {
    return { success: false }
  }
}
