import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { LinkView } from '../src/index';
import * as types from '../src/types';

const App = () => {
  let linkView: React.RefObject<LinkView> = React.createRef<LinkView>();

  return (
    <div className="top">
      <LinkView
        ref={linkView}
        data={{
          groups: [
            {
              id: '1',
              data: [
                { id: '1-1', data: '1-1' },
                { id: '1-2', data: '1-2' },
                { id: '1-3', data: '1-3' },
                { id: '1-4', data: '1-4' },
                { id: '1-5', data: '1-5' },
                { id: '1-6', data: '1-6' },
                { id: '1-7', data: '1-7' },
                { id: '1-8', data: '1-8' },
                { id: '1-9', data: '1-9' },
                { id: '1-10', data: '1-10' },
              ],
            },
            {
              id: '2',
              data: [
                { id: '2-1', data: '2-1' },
                { id: '2-2', data: '2-2' },
                { id: '2-3', data: '2-3' },
                { id: '2-3-1', data: '2-3-1', level: 1 },
                { id: '2-3-2', data: '2-3-2', level: 1 },
                { id: '2-3-3', data: '2-3-3', level: 1 },
                { id: '2-3-3-1', data: '2-3-3-1', level: 2 },
                { id: '2-3-3-2', data: '2-3-3-2', level: 2 },
                { id: '2-3-4', data: '2-3-4', level: 1 },
                { id: '2-4', data: '2-4' },
              ],
            },
            {
              id: '3',
              data: [
                { id: '3-1', data: '3-1' },
                { id: '3-2', data: '3-2' },
                { id: '3-3', data: '3-3' },
              ],
            },
          ] as types.DataGroup[],
          links: [
            {
              from: '1',
              to: '2',
              links: [
                { from: '1-1', to: '2-1' },
                { from: '1-1', to: '2-2' },
                { from: '1-2', to: '2-2' },
                { from: '1-2', to: '2-3' },
                { from: '1-3', to: '2-1' },
                { from: '1-4', to: '2-3' },
                { from: '1-5', to: '2-3' },
                { from: '1-6', to: '2-4' },
                { from: '1-7', to: '2-4' },
                { from: '1-8', to: '2-4' },
                { from: '1-9', to: '2-3' },
                { from: '1-10', to: '2-3' },
              ],
            },
            {
              from: '2',
              to: '3',
              links: [
                { from: '2-1', to: '3-1' },
                { from: '2-1', to: '3-3' },
                { from: '2-2', to: '3-1' },
                { from: '2-2', to: '3-3' },
                { from: '2-3', to: '3-2' },
                { from: '2-3-1', to: '3-3' },
                { from: '2-3-3-1', to: '3-3' },
              ],
            },
            {
              from: '1',
              to: '3',
              links: [
                { from: '1-1', to: '3-2' },
                { from: '1-2', to: '3-3' },
                { from: '1-3', to: '3-1' },
              ],
            },
          ],
        }}
        style={{
          common: {
            groupMarginWidth: 100,
            maxHeight: 250,
          },
          group: [
            { groupWidth: 200, headerCaption: '1' },
            { groupWidth: 200, headerCaption: '2' },
            { groupWidth: 300, headerCaption: '3' },
          ],
        }}
        event={{
          onClickLeft: (groupId, itemId) => {
            console.log(`onClickLeft ${groupId} ${itemId}`);
          },
          onClickRight: (groupId, itemId) => {
            console.log(`onClickRight ${groupId} ${itemId}`);
          },
          onClickBody: (groupId, itemId) => {
            linkView.current?.clearHighlight();
            linkView.current?.setHighlight(groupId, itemId);
          },
          onClickBack: () => {
            linkView.current!.clearHighlight();
          },
        }}
      />
    </div>
  );
};

// const root = createRoot(document.getElementById("root")!);
// root.render(<App />);

ReactDOM.render(<App />, document.getElementById('root')!);
