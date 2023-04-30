import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { LinkView } from '../src';
import * as types from '../src/types';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<LinkView  data={{
      groups: [
        {
          id: "1",
          data: [
            { id: "1-1", data: "1-1" },
            { id: "1-2", data: "1-2" }
          ]
        },
        {
          id: "2",
          data: [
            { id: "2-1", data: "2-1" },
            { id: "2-2", data: "2-2" }
          ]
        }
      ],
      links: [{
        from: "1", to: "1",
        links: [
          { from: "1-1", to: "2-1" },
          { from: "1-1", to: "2-2" },
          { from: "1-2", to: "2-2" }
        ]
      }]
    } as types.DataLinkView} style={{
      common: {
        groupMarginWidth: 100
      },
      group: [
        { groupWidth: 100 },
        { groupWidth: 100 }
      ]
    }} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
