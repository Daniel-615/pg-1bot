export type ClientPlatform = "desktop" | "mobile";

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function detectClientPlatform(userAgent = navigator.userAgent): ClientPlatform {
  const navigatorWithUserAgentData = navigator as NavigatorWithUserAgentData;

  if (navigatorWithUserAgentData.userAgentData?.mobile) {
    return "mobile";
  }

  return MOBILE_USER_AGENT_PATTERN.test(userAgent) ? "mobile" : "desktop";
}
