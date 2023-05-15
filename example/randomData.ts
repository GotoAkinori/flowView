import * as types from '../src/types';

export function randomData(groupCount: number, itemCount: number): [types.DataLinkView, types.StyleLinkView] {
    let groups: types.DataGroup[] = [];
    let links: types.DataLinkGroup[] = [];
    let styles: types.StyleGroup[] = [];

    for (let gp = 0; gp < groupCount; gp++) {
        let maxLevel = 0;
        let items: types.DataItem[] = [];
        groups.push({
            data: items,
            id: gp.toString()
        });

        let itIds: number[] = [1];
        for (let it = 0; it < itemCount; it++) {

            itIds.push(1);
            while (itIds.length > 1) {
                if (Math.random() < (itIds.length - 1) * 0.2) {
                    itIds.pop();
                    continue;
                } else {
                    break;
                }
            }

            let id = itIds.join("-");
            items.push({
                data: id,
                id: id,
                level: itIds.length - 1
            });
            itIds[itIds.length - 1]++;

            if (items.length > maxLevel) {
                maxLevel = items.length;
            }
        }

        styles.push({
            groupWidth: maxLevel * 5 + 50,
            headerCaption: gp.toString()
        });
    }

    for (let from = 0; from < groupCount - 1; from++) {
        for (let to = from + 1; to < groupCount; to++) {
            if (from + 1 == to || Math.random() < 0.1) {
                let link: types.DataLink[] = [];

                for (let itemFrom = 0; itemFrom < itemCount; itemFrom++) {
                    for (let itemTo = 0; itemTo < itemCount; itemTo++) {
                        if (Math.random() < 0.01) {
                            link.push({
                                from: groups[from].data[itemFrom].id,
                                to: groups[to].data[itemTo].id
                            });
                        }
                    }
                }

                links.push({
                    from: groups[from].id,
                    to: groups[to].id,
                    links: link
                });
            }
        }
    }

    return [{
        groups: groups,
        links: links
    }, {
        common: {
            groupMarginWidth: 100
        }, group: styles
    }];
}
