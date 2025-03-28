export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/document/list": ["admin"],
  "/document/view": ["admin", "employee"],
  "/question/list": ["admin"],
  "/home": ["admin", "employee"],
};
