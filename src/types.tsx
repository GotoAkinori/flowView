export type DataLinkView = {
    groups: DataGroup[],
    links: DataLinkGroup[]
};

export type DataGroup = {
    id: string,
    data: DataItem[]
}

export type DataItem = {
    id: string,
    data: any
}

export type DataLinkGroup = {
    from: string,
    to: string,
    links: DataLink[]
}

export type DataLink = {
    from: string,
    to: string
}

export type StyleLinkView = {
    common: StyleCommon,
    group: StyleGroup[]
}

export type StyleGroup = {
    groupWidth: number,
    headerCaption: string
}

export type StyleGroupEx = {
    left: number
}

export type StyleCommon = {
    groupMarginWidth: number,
    showHeader: boolean
}

export type StyleLinkEx = {}

