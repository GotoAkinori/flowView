export type DataLinkView = {
  groups: DataGroup[];
  links: DataLinkGroup[];
};

export type DataGroup = {
  id: string;
  data: DataItem[];
};

export type DataItem = {
  id: string;
  data: any;
  level?: number;
  icon?: 'open' | 'closed' | 'none';
};

export type DataLinkGroup = {
  from: string;
  to: string;
  links: DataLink[];
};

export type DataLink = {
  from: string;
  to: string;
};

export type StyleLinkView = {
  common: StyleCommon;
  group: StyleGroup[];
};

export type StyleGroup = {
  groupWidth: number;
  headerCaption: string;
};

export type StyleGroupEx = {
  left: number;
};

export type StyleCommon = {
  groupMarginWidth: number;
  sideWidth?: number;
  maxHeight?: number;
};

export type StyleLinkEx = {};

export type EventLinkView = {
  onClickLeft?: (groupId: string, itemId: string) => void;
  onClickRight?: (groupId: string, itemId: string) => void;
  onClickBody?: (groupId: string, itemId: string) => void;
  onClickBack?: () => void;
};

export type EventGroup = {
  onScroll: () => void;
  onClickLeft: (itemId: string) => void;
  onClickRight: (itemId: string) => void;
  onClickBody: (itemId: string) => void;
  onOpen: (itemId: string) => void;
  onClose: (itemId: string) => void;
};
