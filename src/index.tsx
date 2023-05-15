import * as React from 'react';
import * as types from './types';
import './index.scss';
// import { FaAngleDown, FaAngleRight, FaMinus } from 'react-icons/fa';

const DEFAULT_sideWidth = 20;

export class LinkView extends React.Component<{
  data: types.DataLinkView;
  style: types.StyleLinkView;
  event: types.EventLinkView;
}> {
  groups: React.RefObject<LinkViewGroup>[] = [];
  links: React.RefObject<LinkViewLinkGroup>[] = [];
  svg: React.RefObject<SVGSVGElement> = React.createRef<SVGSVGElement>();

  constructor(props: {
    data: types.DataLinkView;
    style: types.StyleLinkView;
    event: types.EventLinkView;
  }) {
    super(props);
    props.data.groups.forEach((_, index) => {
      this.groups[index] = React.createRef<LinkViewGroup>();
    });
    props.data.links.forEach((_, index) => {
      this.links[index] = React.createRef<LinkViewLinkGroup>();
    });
  }

  componentDidMount() {
    setTimeout(() => {
      this.links.forEach(v => v.current?.updateLinks());
      this.svg.current!.style.width =
        this.groups[this.groups.length - 1].current!.getRight() + 'px';
      this.svg.current!.style.height =
        Math.max(...this.groups.map(v => v.current!.getDivHeight())) + 'px';
    }, 1);
  }

  updateLinks(id: string) {
    this.links.forEach(element => {
      if (
        element.current?.props.data.from == id ||
        element.current?.props.data.to == id
      ) {
        element.current?.updateLinks();
      }
    });
  }

  clearHighlight() {
    this.svg.current?.classList.remove('highlight');
    for (let group of this.groups) {
      group.current?.clearHighlight();
    }
    for (let link of this.links) {
      link.current?.clearHighlight();
    }
  }

  setHighlight(
    groupId: string,
    itemId: string,
    side: 'from' | 'to' | 'both' = 'both',
    level: number = -1
  ) {
    let groups = this.groups.map(group => group.current!.props.data);
    let links = this.links.map(link => link.current!.props.data);

    // activeItemIds[<group index>] >> [<item id>]
    // activeLinkIds[<from group id>][<to group id>] >> [{from: <from item id>, to: <to item id>}]
    type _ActiveItemIds = { [groupId: string]: string[] };
    type _ActiveLinkIds = {
      [from: string]: { [to: string]: { from: string; to: string }[] };
    };
    type _ActiveILIds = {
      activeItemIds: _ActiveItemIds;
      activeLinkIds: _ActiveLinkIds;
    };

    function initGroupLinkIndexes(): _ActiveILIds {
      // activeItemIds[<group index>] >> [<item id>]
      let activeItemIds: _ActiveItemIds = {};
      // activeLinkIds[<from group id>][<to group id>] >> [{from: <from item id>, to: <to item id>}]
      let activeLinkIds: _ActiveLinkIds = {};

      groups.forEach(group => {
        activeItemIds[group.id] = [];
      });
      links.forEach(link => {
        if (!activeLinkIds[link.from]) {
          activeLinkIds[link.from] = { [link.to]: [] };
        } else if (!activeLinkIds[link.from][link.to]) {
          activeLinkIds[link.from][link.to] = [];
        }
      });

      return {
        activeItemIds: activeItemIds,
        activeLinkIds: activeLinkIds,
      };
    }

    function join(indexes: _ActiveILIds[]) {
      let { activeItemIds, activeLinkIds } = initGroupLinkIndexes();

      for (let ILIndexes of indexes) {
        // item
        for (let groupIndex in activeItemIds) {
          for (let item of ILIndexes.activeItemIds[groupIndex]) {
            if (activeItemIds[groupIndex].indexOf(item) == -1) {
              activeItemIds[groupIndex].push(item);
            }
          }
        }

        // link
        for (let linkFrom in activeLinkIds) {
          for (let linkTo in activeLinkIds[linkFrom]) {
            for (let link of ILIndexes.activeLinkIds[linkFrom][linkTo]) {
              if (
                activeLinkIds[linkFrom][linkTo].findIndex(
                  v => v.from == link.from && v.to == link.to
                ) == -1
              ) {
                activeLinkIds[linkFrom][linkTo].push({
                  from: link.from,
                  to: link.to,
                });
              }
            }
          }
        }
      }

      return { activeItemIds, activeLinkIds };
    }

    function chain(
      itemToChain: { groupId: string; itemId: string; level: number }[],
      side: 'from' | 'to'
    ) {
      let from: 'from' | 'to', to: 'from' | 'to';
      if (side == 'to') {
        from = 'from';
        to = 'to';
      } else {
        from = 'to';
        to = 'from';
      }

      let { activeItemIds, activeLinkIds } = initGroupLinkIndexes();
      let checkIndex = 0;

      while (checkIndex < itemToChain.length) {
        let item = itemToChain.shift()!;

        // Add item
        activeItemIds[item.groupId].push(item.itemId);

        // Check chain
        if (item.level != 0) {
          for (let linkGroup of links) {
            if (linkGroup[from] == item.groupId) {
              for (let linkItem of linkGroup.links) {
                if (linkItem[from] == item.itemId) {
                  // Add link
                  activeLinkIds[linkGroup.from][linkGroup.to].push({
                    from: linkItem.from,
                    to: linkItem.to,
                  });

                  let checkItemIndex = itemToChain.findIndex(
                    v => v.groupId == linkGroup[to] && v.itemId == linkItem[to]
                  );
                  if (checkItemIndex == -1) {
                    itemToChain.push({
                      groupId: linkGroup[to],
                      itemId: linkItem[to],
                      level: item.level - 1,
                    });
                  }
                }
              }
            }
          }
        }
      }

      return { activeItemIds, activeLinkIds };
    }

    let ILIndexes: _ActiveILIds;
    switch (side) {
      case 'from':
        {
          ILIndexes = chain(
            [{ groupId: groupId, itemId: itemId, level: level }],
            'from'
          );
        }
        break;
      case 'to':
        {
          ILIndexes = chain(
            [{ groupId: groupId, itemId: itemId, level: level }],
            'to'
          );
        }
        break;
      case 'both':
        {
          ILIndexes = join([
            chain([{ groupId: groupId, itemId: itemId, level: level }], 'from'),
            chain([{ groupId: groupId, itemId: itemId, level: level }], 'to'),
          ]);
        }
        break;
      default: {
        ILIndexes = initGroupLinkIndexes();
      }
    }

    // set styles
    this.svg.current?.classList.add('highlight');
    for (let group of this.groups) {
      group.current?.setHighlight(
        ILIndexes.activeItemIds[group.current.props.data.id]
      );
    }
    for (let link of this.links) {
      link.current?.setHighlight(
        ILIndexes.activeLinkIds[link.current.props.data.from][
          link.current.props.data.to
        ]
      );
    }
  }

  render() {
    let data = this.props.data;
    let styleCommon = this.props.style.common;
    let styleGroup = this.props.style.group;

    let sum = 0;
    let positions: { left: number; right: number }[] = [];
    for (let i = 0; i < styleGroup.length; i++) {
      positions.push({ left: sum, right: sum + styleGroup[i].groupWidth });
      sum += styleGroup[i].groupWidth + styleCommon.groupMarginWidth;
    }

    return (
      <div className="ooo-linkview">
        <svg
          ref={this.svg}
          onClick={ev => {
            if (
              this.props.event.onClickBack &&
              (ev.target == this.svg.current ||
                ev.target instanceof SVGForeignObjectElement)
            ) {
              this.props.event.onClickBack();
            }
          }}
        >
          <g>
            {data.links.map((v, i) => {
              let leftIndex = data.groups.findIndex(gp => gp.id == v.from);
              let rightIndex = data.groups.findIndex(gp => gp.id == v.to);
              return (
                <LinkViewLinkGroup
                  ref={this.links[i]}
                  key={i}
                  data={v}
                  elements={{
                    parent: this.svg,
                    left: this.groups[leftIndex],
                    right: this.groups[rightIndex],
                  }}
                  style={{ common: styleCommon, link: {} }}
                />
              );
            })}
          </g>
          <g>
            {data.groups.map((v, i) => {
              return (
                <LinkViewGroup
                  ref={this.groups[i]}
                  key={i}
                  style={{
                    common: styleCommon,
                    group: { ...styleGroup[i], left: positions[i].left },
                  }}
                  data={v}
                  event={{
                    onClickLeft: (id: string) => {
                      if (this.props.event.onClickLeft) {
                        this.props.event.onClickLeft(v.id, id);
                      }
                    },
                    onClickRight: (id: string) => {
                      if (this.props.event.onClickLeft) {
                        this.props.event.onClickLeft(v.id, id);
                      }
                    },
                    onClickBody: (id: string) => {
                      if (this.props.event.onClickBody) {
                        this.props.event.onClickBody(v.id, id);
                      }
                    },
                    onScroll: () => {
                      this.updateLinks(v.id);
                    },
                    onClose: itemId => {
                      this.groups[i].current!.setIcon(itemId, 'closed');
                      this.updateLinks(v.id);
                    },
                    onOpen: itemId => {
                      this.groups[i].current!.setIcon(itemId, 'open');
                      this.updateLinks(v.id);
                    },
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}

class LinkViewGroup extends React.Component<{
  data: types.DataGroup;
  style: {
    common: types.StyleCommon;
    group: types.StyleGroup & types.StyleGroupEx;
  };
  event: types.EventGroup;
}> {
  trs: React.RefObject<HTMLTableRowElement>[] = [];
  table: React.RefObject<HTMLTableElement> = React.createRef<
    HTMLTableElement
  >();
  foreignObject: React.RefObject<SVGForeignObjectElement> = React.createRef<
    SVGForeignObjectElement
  >();
  scrollDiv: React.RefObject<HTMLDivElement> = React.createRef<
    HTMLDivElement
  >();
  treeIcon: React.RefObject<HTMLButtonElement>[] = [];

  constructor(props: {
    data: types.DataGroup;
    style: { common: any; group: any; event: types.EventGroup };
    event: types.EventGroup;
  }) {
    super(props);
    props.data.data.forEach((_, index) => {
      this.trs[index] = React.createRef<HTMLTableRowElement>();
      this.treeIcon[index] = React.createRef<HTMLButtonElement>();
    });
  }

  componentDidMount() {
    let scrollDiv = this.scrollDiv.current!;
    let foreignObject = this.foreignObject.current!;
    let table = this.table.current!;

    let width =
      table.clientWidth + (scrollDiv.offsetWidth - scrollDiv.clientWidth);
    scrollDiv.style.width = width + 'px';
    foreignObject.setAttribute('width', width + 'px');
  }

  render() {
    let data = this.props.data;
    let styleCommon = this.props.style.common;
    let styleGroup = this.props.style.group;
    let styleHeaderSide = {
      width: (styleCommon.sideWidth ?? DEFAULT_sideWidth) + 'px',
    };
    let styleHeaderCenter = {
      width:
        styleGroup.groupWidth -
        (styleCommon.sideWidth ?? DEFAULT_sideWidth) * 2 -
        4 +
        'px',
    };

    let closeLevel = Number.MAX_SAFE_INTEGER;

    return (
      <foreignObject
        className="ooo-group"
        x={styleGroup.left}
        y="0"
        width={styleGroup.groupWidth}
        ref={this.foreignObject}
      >
        <div
          onScroll={() => {
            this.props.event.onScroll();
          }}
          ref={this.scrollDiv}
        >
          <table ref={this.table}>
            <thead>
              <tr>
                <td>
                  <div className="left" style={styleHeaderSide}></div>
                </td>
                <td>
                  <div style={styleHeaderCenter}>
                    {styleGroup.headerCaption}
                  </div>
                </td>
                <td>
                  <div className="right" style={styleHeaderSide}></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {data.data.map((v, n, list) => {
                if (v.icon) {
                  // dummy
                } else if (
                  n >= list.length - 1 ||
                  (v.level ?? 0) >= (list[n + 1].level ?? 0)
                ) {
                  v.icon = 'none';
                } else {
                  v.icon = 'open';
                }

                let hidden: boolean = false;
                if (closeLevel < (v.level ?? 0)) {
                  hidden = true;
                } else {
                  if (v.icon == 'closed') {
                    closeLevel = v.level ?? 0;
                  } else {
                    closeLevel = Number.MAX_SAFE_INTEGER;
                  }
                }

                return (
                  <tr key={n} ref={this.trs[n]} hidden={hidden}>
                    <td>
                      <div
                        className="left"
                        onClick={() => {
                          this.props.event.onClickLeft(v.id);
                        }}
                      ></div>
                    </td>
                    <td
                      onClick={ev => {
                        if (ev.target != this.treeIcon[n].current) {
                          this.props.event.onClickBody(v.id);
                        }
                      }}
                    >
                      <div
                        style={
                          {
                            '--item-level': v.level ?? 0,
                          } as React.CSSProperties
                        }
                      >
                        <button
                          ref={this.treeIcon[n]}
                          className={v.icon}
                          onClick={() => {
                            if (v.icon == 'closed') {
                              this.props.event.onOpen(v.id);
                            } else if (v.icon == 'open') {
                              this.props.event.onClose(v.id);
                            }
                          }}
                        ></button>
                        {v.data}
                      </div>
                    </td>
                    <td>
                      <div
                        className="right"
                        onClick={() => {
                          this.props.event.onClickRight(v.id);
                        }}
                      ></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </foreignObject>
    );
  }

  getYbyID(id: string): { y: number; child: boolean } {
    let index = this.props.data.data.findIndex(v => v.id == id);
    if (index == -1) {
      return {
        y: NaN,
        child: false,
      };
    }
    return this.getYbyIndex(index);
  }

  getYbyIndex(index: number): { y: number; child: boolean } {
    for (let i = index; i >= 0; i--) {
      let tr = this.trs[i].current!;
      if (!tr.hidden) {
        let rect = this.trs[i].current!.getBoundingClientRect();
        if (i == index) {
          return {
            y: rect.top + rect.height / 2,
            child: false,
          };
        } else {
          return {
            y: rect.bottom,
            child: true,
          };
        }
      }
    }
    return {
      y: NaN,
      child: false,
    };
  }

  getLeft(): number {
    if (this.table.current) {
      let rect = this.table.current.getBoundingClientRect();
      return rect.left;
    } else {
      return NaN;
    }
  }

  getRight(): number {
    if (this.table.current) {
      let rect = this.table.current.getBoundingClientRect();
      return rect.right;
    } else {
      return NaN;
    }
  }

  getTableHeight(): number {
    if (this.table.current) {
      let rect = this.table.current.getBoundingClientRect();
      return rect.height;
    } else {
      return NaN;
    }
  }

  getGroupHeight(): number {
    if (this.foreignObject.current) {
      let rect = this.foreignObject.current.getBoundingClientRect();
      return rect.height;
    } else {
      return NaN;
    }
  }

  getDivHeight(): number {
    if (this.scrollDiv.current) {
      let rect = this.scrollDiv.current.getBoundingClientRect();
      return rect.height;
    } else {
      return NaN;
    }
  }

  getWidth(): number {
    if (this.table.current) {
      let rect = this.table.current.getBoundingClientRect();
      return rect.width;
    } else {
      return NaN;
    }
  }

  clearHighlight() {
    for (let tr of this.trs) {
      tr.current!.classList.remove('active');
    }
  }

  setHighlight(ids: string[]) {
    for (let id of ids) {
      let index = this.props.data.data.findIndex(v => v.id == id);
      this.trs[index].current!.classList.add('active');
    }
  }

  setIcon(id: string, icon: 'open' | 'closed' | 'none') {
    let index = this.props.data.data.findIndex(v => v.id == id);
    let item = this.props.data.data[index];

    if (item) {
      item.icon = icon;
      this.treeIcon[index].current!.className = icon;

      let level = item.level ?? 0;

      if (icon == 'open') {
        let level_close = Number.MAX_SAFE_INTEGER;
        for (
          let i = index + 1;
          i < this.props.data.data.length &&
          (this.props.data.data[i].level ?? 0) > level;
          i++
        ) {
          if ((this.props.data.data[i].level ?? 0) > level_close) {
            this.trs[i].current!.hidden = true;
          } else {
            this.trs[i].current!.hidden = false;

            if (this.props.data.data[i].icon == 'closed') {
              level_close = this.props.data.data[i].level ?? 0;
            } else {
              level_close = Number.MAX_SAFE_INTEGER;
            }
          }
        }
      } else if (icon == 'closed') {
        for (
          let i = index + 1;
          i < this.props.data.data.length &&
          (this.props.data.data[i].level ?? 0) > level;
          i++
        ) {
          this.trs[i].current!.hidden = true;
        }
      }
    }
  }
}

class LinkViewLinkGroup extends React.Component<{
  data: types.DataLinkGroup;
  style: { common: types.StyleCommon; link: types.StyleLinkEx };
  elements: {
    parent: React.RefObject<SVGSVGElement>;
    left: React.RefObject<LinkViewGroup>;
    right: React.RefObject<LinkViewGroup>;
  };
}> {
  links: React.RefObject<SVGPathElement>[] = [];

  constructor(props: {
    data: types.DataLinkGroup;
    style: { common: types.StyleCommon; link: types.StyleLinkEx };
    elements: {
      parent: React.RefObject<SVGSVGElement>;
      left: React.RefObject<LinkViewGroup>;
      right: React.RefObject<LinkViewGroup>;
    };
  }) {
    super(props);
    props.data.links.forEach((_, index) => {
      this.links[index] = React.createRef<SVGPathElement>();
    });
  }

  render() {
    let links = this.props.data.links;

    return (
      <g>
        {links.map((_, i) => (
          <path className="link" key={i} ref={this.links[i]} d="" />
        ))}
      </g>
    );
  }

  updateLinks() {
    if (this.props.elements.left.current && this.props.elements.right.current) {
      let parentRect = this.props.elements.parent.current!.getBoundingClientRect();

      let leftX = this.props.elements.left.current.getRight() - parentRect.left;
      let rightX =
        this.props.elements.right.current.getLeft() - parentRect.left;
      let centerX = (leftX + rightX) / 2;

      this.links.forEach((link, index) => {
        let left = this.props.elements.left.current!.getYbyID(
          this.props.data.links[index].from
        );
        let right = this.props.elements.right.current!.getYbyID(
          this.props.data.links[index].to
        );

        let leftY = left.y - parentRect.top;
        let rightY = right.y - parentRect.top;
        link.current!.setAttribute(
          'd',
          `M ${leftX} ${leftY} C ${centerX} ${leftY} ${centerX} ${rightY} ${rightX} ${rightY}`
        );

        if (left.child || right.child) {
          link.current!.classList.add('child');
        } else {
          link.current!.classList.remove('child');
        }
      });
    }
  }

  clearHighlight() {
    for (let link of this.links) {
      link.current!.classList.remove('active');
    }
  }

  setHighlight(targets: { from: string; to: string }[]) {
    this.props.data.links.forEach((link, index) => {
      if (
        targets.find(target => link.from == target.from && link.to == target.to)
      ) {
        this.links[index].current!.classList.add('active');
      }
    });
  }
}
