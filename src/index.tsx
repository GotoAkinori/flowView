import * as React from 'react';
import * as types from './types';

export class LinkView extends React.Component<{ data: types.DataLinkView, style: types.StyleLinkView }>{
  groups: React.RefObject<LinkViewGroup>[] = [];
  links: React.RefObject<LinkViewLinkGroup>[] = [];
  svg: React.RefObject<SVGSVGElement> = React.createRef<SVGSVGElement>();

  constructor(props: { data: types.DataLinkView, style: types.StyleLinkView }) {
    super(props);
    props.data.groups.forEach((_, index) => {
      this.groups[index] = React.createRef<LinkViewGroup>();
    });
    props.data.links.forEach((_, index) => {
      this.links[index] = React.createRef<LinkViewLinkGroup>();
    });
  }

  componentDidMount() {
    this.links.forEach(v => v.current?.updateLinks());
  }

  render() {
    let data = this.props.data;
    let styleCommon = this.props.style.common;
    let styleGroup = this.props.style.group;

    let sum = 0;
    let positions: { left: number, right: number }[] = [];
    for (let i = 0; i < styleGroup.length; i++) {
      positions.push({ left: sum, right: sum + styleGroup[i].groupWidth });
      sum += styleGroup[i].groupWidth + styleCommon.groupMarginWidth;
    }

    return (
      <div className='ooo-linkview' >
        <svg ref={this.svg}>
          <g>
            {data.links.map((v, i) => {
              let leftIndex = data.groups.findIndex(gp => gp.id == v.from);
              let rightIndex = data.groups.findIndex(gp => gp.id == v.to);
              return (
                <LinkViewLinkGroup
                  ref={this.links[i]}
                  key={i}
                  data={v}
                  elements={{ parent: this.svg, left: this.groups[leftIndex], right: this.groups[rightIndex] }}
                  style={{ common: styleCommon, link: {} }}
                />);
            })}
          </g>
          <g>
            {data.groups.map((v, i) => {
              return (
                <LinkViewGroup
                  ref={this.groups[i]}
                  key={i}
                  style={{ common: styleCommon, group: { ...styleGroup[i], left: positions[i].left } }}
                  data={v}
                />);
            })}
          </g>
        </svg>
      </div>
    );
  }
}

class LinkViewGroup extends React.Component<{ data: types.DataGroup, style: { common: types.StyleCommon, group: types.StyleGroup & types.StyleGroupEx } }>{
  trs: React.RefObject<HTMLTableRowElement>[] = [];
  table: React.RefObject<HTMLTableElement> = React.createRef<HTMLTableElement>();

  constructor(props: { data: types.DataGroup, style: { common: any, group: any } }) {
    super(props);
    props.data.data.forEach((_, index) => {
      this.trs[index] = React.createRef<HTMLTableRowElement>();
    });
  }

  render() {
    let data = this.props.data;
    let styleCommon = this.props.style.common;
    let styleGroup = this.props.style.group;

    return (
      <foreignObject className='ooo-group' x={styleGroup.left} width={styleGroup.groupWidth} height="100" > {/* TODO: height */}
        <table ref={this.table} >
          {styleCommon.showHeader ? (<thead>
            <tr><td ><div className='left'></div></td><td>{styleGroup.headerCaption}</td><td ><div className='right'></div></td></tr>
          </thead>) : ""}
          <tbody>
            {data.data.map((v, n) => (<tr key={n} ref={this.trs[n]}>
              <td>
                <div><div className='left'></div></div>
              </td>
              <td>
                <div><button>EX</button>{v.data}</div>
              </td>
              <td>
                <div><div className='right'></div></div>
              </td>
            </tr>))}
          </tbody>
        </table>
      </foreignObject>
    );
  }

  onClickLeft = (n: number) => {
    // TODO
    console.log(n);
  }

  onClickRight = (n: number) => {
    // TODO
    console.log(n);
  }

  onClickBody = (n: number) => {
    // TODO
    console.log(n);
  }

  onClickButton = (n: number) => {
    // TODO
    console.log(n);
  }

  getYbyID(id: string): number {
    let index = this.props.data.data.findIndex(v => v.id == id);
    if (index == -1) {
      return NaN;
    }
    return this.getYbyIndex(index);
  }

  getYbyIndex(index: number): number {
    let rect = this.trs[index].current!.getBoundingClientRect();
    return rect.top + rect.height / 2;
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
}

class LinkViewLinkGroup extends React.Component<{ data: types.DataLinkGroup, style: { common: types.StyleCommon, link: types.StyleLinkEx }, elements: { parent: React.RefObject<SVGSVGElement>, left: React.RefObject<LinkViewGroup>, right: React.RefObject<LinkViewGroup> } }>{
  links: React.RefObject<SVGPathElement>[] = [];

  constructor(props: { data: types.DataLinkGroup, style: { common: types.StyleCommon, link: types.StyleLinkEx }, elements: { parent: React.RefObject<SVGSVGElement>, left: React.RefObject<LinkViewGroup>, right: React.RefObject<LinkViewGroup> } }) {
    super(props);
    props.data.links.forEach((_, index) => {
      this.links[index] = React.createRef<SVGPathElement>();
    });
  }

  render() {
    let links = this.props.data.links;

    return (
      <g height="100" >
        {
          links.map((_, i) =>
            <path className="link" key={i} ref={this.links[i]} d="" />
          )
        }
      </g>
    );
  }

  updateLinks() {
    if (this.props.elements.left.current && this.props.elements.right.current) {
      let parentRect = this.props.elements.parent.current!.getBoundingClientRect();

      let leftX = this.props.elements.left.current.getRight() - parentRect.left;
      let rightX = this.props.elements.right.current.getLeft() - parentRect.left;
      let centerX = (leftX + rightX) / 2;

      this.links.forEach((link, index) => {
        let leftY = this.props.elements.left.current!.getYbyID(this.props.data.links[index].from) - parentRect.top;
        let rightY = this.props.elements.right.current!.getYbyID(this.props.data.links[index].to) - parentRect.top;

        link.current!.setAttribute("d", `M ${leftX} ${leftY} C ${centerX} ${leftY} ${centerX} ${rightY} ${rightX} ${rightY}`);
      });
    }
  }
}

