export type InsurerKind = "life" | "nonlife";

export type Insurer = {
  id: string;
  name: string;
  kind: InsurerKind;
  callCenter: string;
  homepageUrl: string;
  termsUrl: string;
  claimsUrl: string;
};

// 샘플 데이터 (추후 실제 콜센터/약관/청구 URL로 교체 가능)
export const INSURERS: Insurer[] = [
  {
    id: "samsung-life",
    name: "삼성생명",
    kind: "life",
    callCenter: "1588-3114",
    homepageUrl: "https://www.samsunglife.com/",
    termsUrl: "https://www.samsunglife.com/",
    claimsUrl: "https://www.samsunglife.com/",
  },
  {
    id: "hanwha-life",
    name: "한화생명",
    kind: "life",
    callCenter: "1588-6363",
    homepageUrl: "https://www.hanwhalife.com/",
    termsUrl: "https://www.hanwhalife.com/",
    claimsUrl: "https://www.hanwhalife.com/",
  },
  {
    id: "kyobo-life",
    name: "교보생명",
    kind: "life",
    callCenter: "1588-1009",
    homepageUrl: "https://www.kyobolife.co.kr/",
    termsUrl: "https://www.kyobolife.co.kr/",
    claimsUrl: "https://www.kyobolife.co.kr/",
  },
  {
    id: "samsung-fire",
    name: "삼성화재",
    kind: "nonlife",
    callCenter: "1588-5114",
    homepageUrl: "https://www.samsungfire.com/",
    termsUrl: "https://www.samsungfire.com/",
    claimsUrl: "https://www.samsungfire.com/",
  },
  {
    id: "hyundai-marine",
    name: "현대해상",
    kind: "nonlife",
    callCenter: "1588-5656",
    homepageUrl: "https://www.hi.co.kr/",
    termsUrl: "https://www.hi.co.kr/",
    claimsUrl: "https://www.hi.co.kr/",
  },
  {
    id: "db-insurance",
    name: "DB손해보험",
    kind: "nonlife",
    callCenter: "1588-0100",
    homepageUrl: "https://www.db-insurance.com/",
    termsUrl: "https://www.db-insurance.com/",
    claimsUrl: "https://www.db-insurance.com/",
  },
];

