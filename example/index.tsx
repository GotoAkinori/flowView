import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { LinkView } from '../src/index';
import * as types from '../src/types';

const App = () => {
  return (
    <div>
      <LinkView data={{
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
        ] as types.DataGroup[],
        links: [{
          from: "1", to: "2",
          links: [
            { from: "1-1", to: "2-1" },
            { from: "1-1", to: "2-2" },
            { from: "1-2", to: "2-2" }
          ]
        }]
      }} style={{
        common: {
          groupMarginWidth: 100,
          showHeader: true
        },
        group: [
          { groupWidth: 200, headerCaption: "1" },
          { groupWidth: 200, headerCaption: "2" }
        ]
      }} />
    </div>
  );
};

// const root = createRoot(document.getElementById("root")!);
// root.render(<App />);

ReactDOM.render(<App />, document.getElementById("root")!)
